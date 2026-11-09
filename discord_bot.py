#!/usr/bin/env python3
"""
Career-Ops Discord Command Center
Centro de Comando multicanal para gestion autonoma de postulaciones y CVs.
Canales dedicados:
- #control-y-batches: Panel interactivo persistente, ejecucion de lotes y feed de exitos.
- #finalizacion-manual: Vacantes con CAPTCHA o portales corporativos complejos con boton de confirmacion.
- #chat-antigravity: Chat directo con Antigravity CLI con controles de modelo, nivel de esfuerzo y comando /plan.
- #generador-cvs: Generador on-demand de CVs personalizados a 1 pagina por enlace o descripcion.
Sin emojis.
"""

import os
import sys
import re
import json
import yaml
import asyncio
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

import discord
from discord.ext import commands

CAREER_OPS_DIR = Path(__file__).resolve().parent
CONFIG_FILE = CAREER_OPS_DIR / "config" / "discord.yml"
APPS_FILE = CAREER_OPS_DIR / "data" / "applications.md"
OUTPUT_DIR = CAREER_OPS_DIR / "output"
PROOFS_DIR = OUTPUT_DIR / "proofs"
REPORTS_DIR = CAREER_OPS_DIR / "reports"
PENDING_DRAFTS_FILE = CAREER_OPS_DIR / "data" / "pending-drafts.md"
AGY_SETTINGS_FILE = CAREER_OPS_DIR / "data" / "antigravity-settings.json"

sys.path.insert(0, str(CAREER_OPS_DIR))

from auto_run import (
    get_next_id, is_duplicate, evaluate_job,
    generate_tailored_cv, compile_pdf,
    DEFAULT_SEARCH_TERMS, DEFAULT_LOCATIONS
)
from browser_session import sync_firefox_cookies, run_auto_apply_sync, PROFILE
from telegram_bot import (
    get_stats, get_pending_drafts, add_pending_draft,
    mark_draft_applied, collect_multi_platform_jobs
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("discord_bot")

DEFAULT_AGY_SETTINGS = {
    "model": "gemini-3.8-flash",
    "effort": "high",
    "mode": "auto"
}

VALID_MODELS = [
    "gemini-3.8-flash",
    "claude-sonnet-4-6",
    "claude-opus-4-6-thinking",
    "gpt-oss-120b-medium"
]

VALID_EFFORTS = ["low", "medium", "high", "xhigh", "max"]


def load_config() -> dict:
    if not CONFIG_FILE.exists():
        return {}
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def save_config(cfg: dict):
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        yaml.safe_dump(cfg, f, default_flow_style=False)


def load_antigravity_settings() -> dict:
    """Carga la configuracion activa de Antigravity (modelo, esfuerzo, modo)."""
    if not AGY_SETTINGS_FILE.exists():
        save_antigravity_settings(DEFAULT_AGY_SETTINGS)
        return dict(DEFAULT_AGY_SETTINGS)
    try:
        with open(AGY_SETTINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            for k, v in DEFAULT_AGY_SETTINGS.items():
                if k not in data:
                    data[k] = v
            return data
    except Exception as e:
        logger.warning(f"Error al leer antigravity-settings.json: {e}")
        return dict(DEFAULT_AGY_SETTINGS)


def save_antigravity_settings(settings: dict):
    """Guarda la configuracion activa de Antigravity en disco."""
    AGY_SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(AGY_SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings, f, indent=2)


def build_agy_args(prompt: str, is_plan: bool = False, settings: dict = None) -> list[str]:
    """Construye los argumentos seguros de la CLI de Antigravity respetando compatibilidad de flags."""
    if settings is None:
        settings = load_antigravity_settings()

    cmd = ["agy"]

    # Modo de ejecucion (auto o plan)
    if is_plan or settings.get("mode") == "plan":
        cmd.extend(["--mode", "plan"])
    else:
        cmd.extend(["--mode", "auto"])

    # Seleccion de modelo
    model = settings.get("model", "gemini-3.8-flash")
    if model:
        cmd.extend(["--model", model])

    # Nivel de esfuerzo (Thinking budget / razonamiento)
    # Solo modelos que no fijan su presupuesto internamente
    effort = settings.get("effort", "high")
    if effort and model not in ["claude-sonnet-4-6", "claude-opus-4-6-thinking"]:
        cmd.extend(["--effort", effort])

    cmd.append(f"--print={prompt}")
    return cmd


def split_message_chunks(text: str, max_len: int = 1900) -> list[str]:
    """Divide un texto largo en bloques seguros para Discord respetando saltos de linea."""
    if len(text) <= max_len:
        return [text]

    chunks = []
    lines = text.splitlines(keepends=True)
    current = ""
    for line in lines:
        if len(current) + len(line) > max_len:
            if current:
                chunks.append(current)
                current = ""
            if len(line) > max_len:
                for i in range(0, len(line), max_len):
                    chunks.append(line[i:i + max_len])
            else:
                current = line
        else:
            current += line

    if current:
        chunks.append(current)
    return chunks


def render_antigravity_panel_embed(settings: dict) -> discord.Embed:
    """Genera el Embed informativo con el estado activo de Antigravity."""
    model = settings.get("model", "gemini-3.8-flash")
    effort = settings.get("effort", "high")
    mode = settings.get("mode", "auto")

    effort_desc = {
        "low": "Bajo (Baja latencia, respuestas directas y rapidas)",
        "medium": "Medio (Equilibrio estandar entre tiempo y analisis)",
        "high": "Alto (Analisis profundo, verificacion paso a paso)",
        "xhigh": "Muy Alto (Razonamiento extendido para tareas complejas)",
        "max": "Maximo (Presupuesto maximo de pensamiento cognitivo)"
    }.get(effort, effort)

    model_desc = {
        "gemini-3.8-flash": "Gemini 3.8 Flash (Velocidad y calidad, soporta ajuste dinamico de esfuerzo)",
        "claude-sonnet-4-6": "Claude Sonnet 4.6 (Pensamiento avanzado de Anthropic)",
        "claude-opus-4-6-thinking": "Claude Opus 4.6 (Maxima capacidad cognitiva)",
        "gpt-oss-120b-medium": "GPT-OSS 120B (Modelo abierto balanceado)"
    }.get(model, model)

    embed = discord.Embed(
        title="[ANTIGRAVITY AI CONTROL CENTER] Ajustes de Modelo y Razonamiento",
        description=(
            "Control interactivo para el motor de Inteligencia Artificial de Antigravity CLI.\n\n"
            f"**Modelo Activo:** `{model}`\n"
            f"*{model_desc}*\n\n"
            f"**Nivel de Esfuerzo (Thinking Effort):** `{effort}`\n"
            f"*{effort_desc}*\n\n"
            f"**Modo por Defecto:** `{mode}`\n\n"
            "**Comandos Rapidos en Este Canal:**\n"
            "- `/plan <instrucciones>` - Activa planificacion profunda con analisis y preguntas clave antes de ejecutar\n"
            "- `/modelo <nombre>` - Cambia el modelo activo\n"
            "- `/esfuerzo <low|medium|high|xhigh|max>` - Ajusta el nivel de razonamiento\n"
            "- O utiliza los selectores desplegables y botones inferiores para cambiar parametros en 1 clic."
        ),
        color=discord.Color.teal(),
        timestamp=datetime.now()
    )
    embed.set_footer(text="Antigravity CLI v2.0 | Control Remoto Career-Ops")
    return embed


class PlanModal(discord.ui.Modal, title="Planificar Tarea con Antigravity"):
    task_input = discord.ui.TextInput(
        label="Instrucciones o Tarea para el Plan",
        style=discord.TextStyle.paragraph,
        placeholder="Ej: Planifica la estrategia de postulacion para puestos de mecatronica en Jalisco...",
        required=True,
        max_length=2000
    )

    def __init__(self, bot_instance, channel):
        super().__init__()
        self.bot_instance = bot_instance
        self.channel = channel

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        await interaction.followup.send("[OK] Ejecutando planificacion con Antigravity CLI...", ephemeral=True)
        asyncio.create_task(
            self.bot_instance.execute_antigravity_query(
                self.channel,
                self.task_input.value,
                is_plan=True,
                user=interaction.user
            )
        )


class ModelSelect(discord.ui.Select):
    """Selector desplegable de modelos para Antigravity."""

    def __init__(self, current_model: str):
        options = [
            discord.SelectOption(
                label="Gemini 3.8 Flash",
                value="gemini-3.8-flash",
                description="Velocidad y calidad, soporta ajuste de esfuerzo",
                default=(current_model == "gemini-3.8-flash")
            ),
            discord.SelectOption(
                label="Claude Sonnet 4.6",
                value="claude-sonnet-4-6",
                description="Pensamiento avanzado de Anthropic",
                default=(current_model == "claude-sonnet-4-6")
            ),
            discord.SelectOption(
                label="Claude Opus 4.6",
                value="claude-opus-4-6-thinking",
                description="Maxima capacidad cognitiva",
                default=(current_model == "claude-opus-4-6-thinking")
            ),
            discord.SelectOption(
                label="GPT-OSS 120B",
                value="gpt-oss-120b-medium",
                description="Modelo abierto balanceado",
                default=(current_model == "gpt-oss-120b-medium")
            ),
        ]
        super().__init__(
            placeholder="Seleccionar Modelo de Lenguaje...",
            min_values=1,
            max_values=1,
            options=options,
            custom_id="select_agy_model",
            row=0
        )

    async def callback(self, interaction: discord.Interaction):
        selected_model = self.values[0]
        settings = load_antigravity_settings()
        settings["model"] = selected_model
        save_antigravity_settings(settings)

        embed = render_antigravity_panel_embed(settings)
        new_view = AntigravityControlView(self.view.bot_instance)
        await interaction.response.edit_message(embed=embed, view=new_view)
        await interaction.followup.send(
            f"[OK] Modelo actualizado a '{selected_model}'.",
            ephemeral=True
        )


class EffortSelect(discord.ui.Select):
    """Selector desplegable de esfuerzo de razonamiento para Antigravity."""

    def __init__(self, current_effort: str):
        options = [
            discord.SelectOption(
                label="Esfuerzo: Bajo (low)",
                value="low",
                description="Baja latencia, respuestas directas",
                default=(current_effort == "low")
            ),
            discord.SelectOption(
                label="Esfuerzo: Medio (medium)",
                value="medium",
                description="Equilibrio estandar para consultas generales",
                default=(current_effort == "medium")
            ),
            discord.SelectOption(
                label="Esfuerzo: Alto (high)",
                value="high",
                description="Analisis profundo y verificacion",
                default=(current_effort == "high")
            ),
            discord.SelectOption(
                label="Esfuerzo: Muy Alto (xhigh)",
                value="xhigh",
                description="Razonamiento extendido para tareas complejas",
                default=(current_effort == "xhigh")
            ),
            discord.SelectOption(
                label="Esfuerzo: Maximo (max)",
                value="max",
                description="Presupuesto maximo de pensamiento analitico",
                default=(current_effort == "max")
            ),
        ]
        super().__init__(
            placeholder="Seleccionar Nivel de Esfuerzo...",
            min_values=1,
            max_values=1,
            options=options,
            custom_id="select_agy_effort",
            row=1
        )

    async def callback(self, interaction: discord.Interaction):
        selected_effort = self.values[0]
        settings = load_antigravity_settings()
        settings["effort"] = selected_effort
        save_antigravity_settings(settings)

        embed = render_antigravity_panel_embed(settings)
        new_view = AntigravityControlView(self.view.bot_instance)
        await interaction.response.edit_message(embed=embed, view=new_view)
        await interaction.followup.send(
            f"[OK] Nivel de esfuerzo actualizado a '{selected_effort}'.",
            ephemeral=True
        )


class AntigravityControlView(discord.ui.View):
    """Panel de control persistente en #chat-antigravity."""

    def __init__(self, bot_instance):
        super().__init__(timeout=None)
        self.bot_instance = bot_instance
        settings = load_antigravity_settings()
        self.add_item(ModelSelect(settings.get("model", "gemini-3.8-flash")))
        self.add_item(EffortSelect(settings.get("effort", "high")))

    @discord.ui.button(label="Planificar con /plan", style=discord.ButtonStyle.primary, custom_id="btn_agy_plan", row=2)
    async def plan_button_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(PlanModal(self.bot_instance, interaction.channel))

    @discord.ui.button(label="Restablecer Defaults", style=discord.ButtonStyle.secondary, custom_id="btn_agy_reset", row=2)
    async def reset_button_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        settings = dict(DEFAULT_AGY_SETTINGS)
        save_antigravity_settings(settings)
        embed = render_antigravity_panel_embed(settings)
        new_view = AntigravityControlView(self.bot_instance)
        await interaction.response.edit_message(embed=embed, view=new_view)
        await interaction.followup.send("[OK] Ajustes restablecidos a los valores predeterminados.", ephemeral=True)

    @discord.ui.button(label="Actualizar Panel", style=discord.ButtonStyle.secondary, custom_id="btn_agy_refresh", row=2)
    async def refresh_button_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        settings = load_antigravity_settings()
        embed = render_antigravity_panel_embed(settings)
        new_view = AntigravityControlView(self.bot_instance)
        await interaction.response.edit_message(embed=embed, view=new_view)


class ManualDraftView(discord.ui.View):
    """View persistente para vacantes con accion manual en #finalizacion-manual."""

    def __init__(self, app_id: int, url: str):
        super().__init__(timeout=None)
        self.app_id = app_id
        if url:
            self.add_item(discord.ui.Button(label="Abrir Portal", url=url, style=discord.ButtonStyle.link))

        btn_done = discord.ui.Button(
            label="Marcar como Enviada",
            style=discord.ButtonStyle.success,
            custom_id=f"manual_done_{app_id}"
        )
        btn_done.callback = self.done_callback
        self.add_item(btn_done)

    async def done_callback(self, interaction: discord.Interaction):
        mark_draft_applied(self.app_id)
        for item in self.children:
            if isinstance(item, discord.ui.Button) and item.custom_id == f"manual_done_{self.app_id}":
                item.disabled = True
                item.label = "Enviada y Registrada"

        embed = interaction.message.embeds[0] if interaction.message.embeds else None
        if embed:
            embed.color = discord.Color.green()
            embed.add_field(
                name="Estado Actual",
                value="[Confirmada] Marcada como Applied por el usuario y archivada del registro de pendientes.",
                inline=False
            )
            await interaction.response.edit_message(embed=embed, view=self)
        else:
            await interaction.response.edit_message(view=self)

        await interaction.followup.send(
            f"[OK] Vacante #{self.app_id} actualizada a estado 'Applied' en applications.md.",
            ephemeral=True
        )


class ControlPanelView(discord.ui.View):
    """Panel de control persistente en #control-y-batches."""

    def __init__(self, bot_instance):
        super().__init__(timeout=None)
        self.bot = bot_instance

    @discord.ui.button(label="Postular 3", style=discord.ButtonStyle.primary, custom_id="panel_run_3", row=0)
    async def run_3_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer()
        asyncio.create_task(self.bot.run_batch_task(interaction.channel, limit=3))

    @discord.ui.button(label="Postular 5", style=discord.ButtonStyle.primary, custom_id="panel_run_5", row=0)
    async def run_5_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer()
        asyncio.create_task(self.bot.run_batch_task(interaction.channel, limit=5))

    @discord.ui.button(label="Postular 10", style=discord.ButtonStyle.primary, custom_id="panel_run_10", row=0)
    async def run_10_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer()
        asyncio.create_task(self.bot.run_batch_task(interaction.channel, limit=10))

    @discord.ui.button(label="Escanear 10", style=discord.ButtonStyle.secondary, custom_id="panel_scan_10", row=1)
    async def scan_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer()
        asyncio.create_task(self.bot.run_scan_task(interaction.channel, limit=10))

    @discord.ui.button(label="Sincronizar Cookies", style=discord.ButtonStyle.secondary, custom_id="panel_cookies", row=1)
    async def cookies_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer(ephemeral=True)
        ok = await asyncio.to_thread(sync_firefox_cookies)
        if ok:
            await interaction.followup.send("[OK] Cookies sincronizadas con exito desde Firefox.", ephemeral=True)
        else:
            await interaction.followup.send("[Error] No se pudo sincronizar el archivo de cookies de Firefox.", ephemeral=True)

    @discord.ui.button(label="Estado del Pipeline", style=discord.ButtonStyle.secondary, custom_id="panel_status", row=1)
    async def status_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer(ephemeral=True)
        stats = get_stats()
        pending = get_pending_drafts()
        breakdown = "\n".join([f"- {st}: {cnt}" for st, cnt in stats["counts"].items()])
        embed = discord.Embed(
            title="[Estado del Pipeline]",
            color=discord.Color.blue(),
            timestamp=datetime.now()
        )
        embed.add_field(name="Total Procesadas", value=str(stats["total"]), inline=True)
        embed.add_field(name="Borradores Pendientes", value=str(len(pending)), inline=True)
        embed.add_field(name="Ultimo ID", value=f"#{stats['last_id']}", inline=True)
        embed.add_field(name="Ultima Postulacion", value=f"{stats['last_comp']} - {stats['last_role']}", inline=False)
        embed.add_field(name="Desglose por Estado", value=breakdown if breakdown else "Sin datos", inline=False)
        await interaction.followup.send(embed=embed, ephemeral=True)

    @discord.ui.button(label="Ver Ultimo CV", style=discord.ButtonStyle.secondary, custom_id="panel_last_cv", row=2)
    async def last_cv_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer(ephemeral=True)
        stats = get_stats()
        last_id = stats["last_id"]
        if last_id == 0:
            await interaction.followup.send("[Info] No hay postulaciones registradas en applications.md.", ephemeral=True)
            return

        pdfs = list(OUTPUT_DIR.glob(f"*{last_id}*.pdf"))
        proofs = list(PROOFS_DIR.glob(f"*{last_id}*.png"))

        embed = discord.Embed(
            title=f"[Ultima Postulacion #{last_id}]",
            description=f"Empresa: {stats['last_comp']}\nPuesto: {stats['last_role']}",
            color=discord.Color.purple()
        )
        files = []
        if pdfs and pdfs[0].exists():
            files.append(discord.File(str(pdfs[0]), filename=pdfs[0].name))
        if proofs and proofs[0].exists():
            files.append(discord.File(str(proofs[0]), filename=proofs[0].name))

        await interaction.followup.send(embed=embed, files=files, ephemeral=True)

    @discord.ui.button(label="Refrescar Panel", style=discord.ButtonStyle.secondary, custom_id="panel_refresh", row=2)
    async def refresh_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer()
        await self.bot.post_control_panel(interaction.channel)


class CareerOpsDiscordBot(commands.Bot):
    """Cliente principal del bot de Discord."""

    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.guilds = True
        intents.messages = True
        super().__init__(command_prefix="!", intents=intents)

        self.cfg = load_config()
        self.control_channel: Optional[discord.TextChannel] = None
        self.manual_channel: Optional[discord.TextChannel] = None
        self.antigravity_channel: Optional[discord.TextChannel] = None
        self.cv_generator_channel: Optional[discord.TextChannel] = None

    async def setup_hook(self):
        # Registrar views persistentes
        self.add_view(ControlPanelView(self))
        self.add_view(AntigravityControlView(self))

    async def on_ready(self):
        logger.info(f"Conectado como {self.user.name}#{self.user.discriminator} (ID: {self.user.id})")
        for guild in self.guilds:
            logger.info(f"Servidor conectado: {guild.name} (ID: {guild.id})")
            await self.provision_server_channels(guild)

    async def provision_server_channels(self, guild: discord.Guild):
        """Verifica o crea la categoria CAREER-OPS COMMAND CENTER y los 4 canales requeridos."""
        cat_name = self.cfg.get("category_name", "CAREER-OPS COMMAND CENTER")
        category = discord.utils.get(guild.categories, name=cat_name)
        if not category:
            category = await guild.create_category(cat_name)
            logger.info(f"Categoria creada: {cat_name}")

        channel_map = {
            "control": ("control-y-batches", "Panel interactivo de control, ejecucion de lotes y feed de postulaciones exitosas"),
            "manual": ("finalizacion-manual", "Vacantes pendientes de resolucion de CAPTCHA o portales corporativos complejos"),
            "antigravity": ("chat-antigravity", "Canal directo con Antigravity CLI para consultas tecnicas, configuracion y planificacion"),
            "cv_generator": ("generador-cvs", "Pega aqui el enlace o descripcion de una vacante para generar su CV personalizado en 1 pagina")
        }

        created_channels = {}
        for key, (ch_name, topic) in channel_map.items():
            ch = discord.utils.get(guild.text_channels, name=ch_name, category=category)
            if not ch:
                ch = await guild.create_text_channel(name=ch_name, category=category, topic=topic)
                logger.info(f"Canal creado: #{ch_name}")
            created_channels[key] = ch

        self.control_channel = created_channels["control"]
        self.manual_channel = created_channels["manual"]
        self.antigravity_channel = created_channels["antigravity"]
        self.cv_generator_channel = created_channels["cv_generator"]

        # Publicar panel de control en #control-y-batches si no existe
        has_control_panel = False
        async for m in self.control_channel.history(limit=10):
            if m.author.id == self.user.id and m.embeds and "[CAREER-OPS COMMAND CENTER]" in (m.embeds[0].title or ""):
                has_control_panel = True
                break
        if not has_control_panel:
            await self.post_control_panel(self.control_channel)

        # Publicar panel de configuracion en #chat-antigravity si no existe
        has_agy_panel = False
        async for m in self.antigravity_channel.history(limit=10):
            if m.author.id == self.user.id and m.embeds and "[ANTIGRAVITY AI CONTROL CENTER]" in (m.embeds[0].title or ""):
                has_agy_panel = True
                break
        if not has_agy_panel:
            await self.post_antigravity_panel(self.antigravity_channel)

    async def post_control_panel(self, channel: discord.TextChannel):
        """Publica el mensaje de panel de control interactivo en #control-y-batches."""
        stats = get_stats()
        pending = get_pending_drafts()

        embed = discord.Embed(
            title="[CAREER-OPS COMMAND CENTER] Panel de Control Autonomo",
            description=(
                "Bienvenido al Centro de Comando de Postulaciones Autonomas.\n\n"
                f"**Total Postulaciones Procesadas:** {stats['total']}\n"
                f"**Borradores Pendientes de Accion Manual:** {len(pending)}\n"
                f"**Ultimo Registro:** #{stats['last_id']} ({stats['last_comp']} - {stats['last_role']})\n\n"
                "Selecciona una accion para ejecutar lotes de postulacion, escanear o sincronizar credenciales:"
            ),
            color=discord.Color.dark_teal(),
            timestamp=datetime.now()
        )
        embed.set_footer(text="Fuentes activas: LinkedIn + Indeed + Computrabajo | Motor: Playwright + JobSpy + agy")

        view = ControlPanelView(self)
        await channel.send(embed=embed, view=view)

    async def post_antigravity_panel(self, channel: discord.TextChannel):
        """Publica el panel interactivo de configuracion de Antigravity en #chat-antigravity."""
        settings = load_antigravity_settings()
        embed = render_antigravity_panel_embed(settings)
        view = AntigravityControlView(self)
        await channel.send(embed=embed, view=view)

    async def run_scan_task(self, channel: discord.TextChannel, limit: int = 10):
        """Escanea vacantes y muestra el resultado en #control-y-batches."""
        await channel.send(f"[Info] Escaneando oportunidades en LinkedIn, Indeed y Computrabajo (Meta: {limit})...")
        found_jobs = await asyncio.to_thread(collect_multi_platform_jobs, limit)

        if not found_jobs:
            await channel.send("[Info] Escaneo completado. No se detectaron vacantes nuevas sin postular.")
            return

        embed = discord.Embed(
            title=f"[Escaneo Completado] {len(found_jobs)} Vacantes Cualificadas",
            description=f"Mostrando hasta {min(len(found_jobs), limit)} mejores coincidencias:",
            color=discord.Color.gold(),
            timestamp=datetime.now()
        )
        for j in found_jobs[:limit]:
            embed.add_field(
                name=f"[{j.get('score', 4.0)}/5.0] {j['company']} - {j['title']}",
                value=f"Portal: {j.get('site', 'Web')} | Ubicacion: {j['location']}\n[Ver Vacante]({j['url']})",
                inline=False
            )

        class QuickApplyView(discord.ui.View):
            def __init__(self, bot_inst, qty):
                super().__init__(timeout=120)
                self.bot_inst = bot_inst
                self.qty = qty

            @discord.ui.button(label="Postular a Estas Vacantes", style=discord.ButtonStyle.success)
            async def apply_now(self, interaction: discord.Interaction, button: discord.ui.Button):
                await interaction.response.defer()
                asyncio.create_task(self.bot_inst.run_batch_task(interaction.channel, limit=self.qty))

        await channel.send(embed=embed, view=QuickApplyView(self, min(len(found_jobs), limit)))

    async def run_batch_task(self, channel: discord.TextChannel, limit: int = 5, query_term: str = None):
        """Ejecuta un lote completo de postulacion autonoma distribuyendo resultados segun su estado."""
        q_str = f" para '{query_term}'" if query_term else ""
        await channel.send(f"[Inicio de Lote] Ejecutando pipeline autonomo{q_str} (Meta solicitada: {limit} vacantes)...")

        await asyncio.to_thread(sync_firefox_cookies)
        current_id = get_next_id()

        unique_jobs = await asyncio.to_thread(collect_multi_platform_jobs, limit, query_term)
        if not unique_jobs:
            await channel.send("[Info] No se detectaron vacantes nuevas que cumplan los requisitos en este ciclo.")
            return

        await channel.send(f"[Info] Se detectaron {len(unique_jobs)} oportunidades cualificadas. Procesando hasta {limit}...")

        processed = 0
        applied_count = 0
        manual_count = 0
        today_str = datetime.now().strftime("%Y-%m-%d")

        for job in unique_jobs:
            if processed >= limit:
                break

            score = job.get("score", 4.0)
            reason = job.get("reason", "Alineacion tecnica detectada.")
            app_id = current_id + processed
            processed += 1

            tex_code, slug, _ = generate_tailored_cv(job, app_id)
            cand_slug = re.sub(r'[^a-zA-Z0-9]', '', PROFILE.get("full_name", "Candidate"))
            tex_file = OUTPUT_DIR / f"CV-{cand_slug}-{slug}.tex"
            pdf_file = OUTPUT_DIR / f"CV-{cand_slug}-{slug}.pdf"
            tex_file.write_text(tex_code, encoding="utf-8")

            await asyncio.to_thread(compile_pdf, tex_file, OUTPUT_DIR)

            app_status = "Evaluated"
            proof_path = ""
            portal_type = "Corporativo"
            if job.get("url"):
                apply_res = await asyncio.to_thread(run_auto_apply_sync, job["url"], pdf_file, app_id, True)
                app_status = apply_res.get("status", "Evaluated")
                proof_path = apply_res.get("proof", "")
                portal_type = apply_res.get("portal_type", "Corporativo")

            report_file = REPORTS_DIR / f"{app_id}-{slug}-{today_str}.md"
            report_content = f"""# Evaluation Report: #{app_id} - {job['company']} - {job['title']}

**Evaluated:** {today_str}  
**Score:** {score}/5.0  
**Archetype:** Robotics & Automation Engineering  
**Legitimacy:** High Confidence (Direct Posting: {job.get('site', 'Web')})  
**Recommendation:** APPLY  
**Status:** {app_status}  
**Location:** {job['location']}  
**PDF:** [CV-{cand_slug}-{slug}.pdf](../output/CV-{cand_slug}-{slug}.pdf)  

---

## Block A: Job Overview & Key Alignment
- **Company:** {job['company']}
- **Role:** {job['title']}
- **Location:** {job['location']}
- **Posting URL:** {job['url']}
- **Auto-Apply Status:** {app_status}

## Block B: Match Analysis
- {reason}
- Formacion adaptada al perfil del candidato y experiencia registrada.

## Block C: Generated Files
- TeX: `output/CV-{cand_slug}-{slug}.tex`
- PDF: `output/CV-{cand_slug}-{slug}.pdf` (Pages: 1)
- Proof Screenshot: `output/proofs/proof-{app_id}.png`
"""
            report_file.write_text(report_content, encoding="utf-8")

            new_row = f"| {app_id} | {today_str} | {job['company']} | {job['title']} | {score}/5 | {app_status} | Yes | [{app_id}](../reports/{app_id}-{slug}-{today_str}.md) | Discord Command Center ({job.get('site', 'Web')}) |\n"
            with open(APPS_FILE, "a", encoding="utf-8") as f:
                f.write(new_row)

            portal_name = "Indeed" if "indeed.com" in job.get("url", "") else ("LinkedIn" if "linkedin.com" in job.get("url", "") else ("Computrabajo" if "computrabajo.com" in job.get("url", "") else "Web"))

            if app_status == "Applied":
                applied_count += 1
                embed = discord.Embed(
                    title=f"[Postulacion Exitosa #{app_id}] {job['company']} - {job['title']}",
                    description="Postulacion directa completada exitosamente en el portal con comprobante de envio.",
                    color=discord.Color.green(),
                    timestamp=datetime.now()
                )
                embed.add_field(name="Portal", value=portal_name, inline=True)
                embed.add_field(name="Ubicacion", value=job['location'], inline=True)
                embed.add_field(name="Puntuacion", value=f"{score}/5.0", inline=True)
                embed.add_field(name="Alineacion Tecnica", value=reason, inline=False)
                if job.get("url"):
                    embed.add_field(name="Enlace de la Vacante", value=f"[Abrir Oferta]({job['url']})", inline=False)

                files = []
                if pdf_file.exists():
                    files.append(discord.File(str(pdf_file), filename=pdf_file.name))
                proof_obj = Path(proof_path) if proof_path else None
                if proof_obj and proof_obj.exists():
                    files.append(discord.File(str(proof_obj), filename=proof_obj.name))

                await channel.send(embed=embed, files=files)

            elif app_status in ["CaptchaBlocked", "ExternalATS", "ExternalPending", "FormInProgress"]:
                manual_count += 1
                if app_status == "CaptchaBlocked":
                    motivo = "Google reCAPTCHA / Cloudflare detectado. Tus respuestas y CV ya estan precargados; solo requiere resolver el reto en 1 clic y enviar."
                    action_txt = "Resolver reCAPTCHA en 1 clic y enviar"
                elif app_status in ["ExternalATS", "ExternalPending"]:
                    motivo = f"Portal corporativo externo ({portal_type}). Se ha generado tu CV personalizado en PDF adjunto. Completa la postulacion en 1 minuto con el archivo adjunto."
                    action_txt = f"Completar en portal {portal_type} con CV generado"
                else:
                    motivo = "Formulario con preguntas personalizadas pendientes de validacion manual."
                    action_txt = "Revisar preguntas y enviar"

                add_pending_draft(app_id, today_str, portal_name, job["company"], job["title"], motivo, job.get("url", ""), action_txt)

                embed = discord.Embed(
                    title=f"[Accion Requerida #{app_id}] {job['company']} - {job['title']}",
                    description=motivo,
                    color=discord.Color.orange(),
                    timestamp=datetime.now()
                )
                embed.add_field(name="Portal", value=f"{portal_name} ({portal_type})", inline=True)
                embed.add_field(name="Ubicacion", value=job['location'], inline=True)
                embed.add_field(name="Puntuacion", value=f"{score}/5.0", inline=True)
                embed.add_field(name="Alineacion Tecnica", value=reason, inline=False)

                files = []
                if pdf_file.exists():
                    files.append(discord.File(str(pdf_file), filename=pdf_file.name))

                draft_view = ManualDraftView(app_id, job.get("url", ""))

                target_manual_ch = self.manual_channel or channel
                await target_manual_ch.send(embed=embed, files=files, view=draft_view)

                await channel.send(
                    f"[Accion Manual #{app_id}] {job['company']} - {job['title']} enviada al canal #{target_manual_ch.name} para completar."
                )

            else:
                embed = discord.Embed(
                    title=f"[Evaluada #{app_id}] {job['company']} - {job['title']}",
                    description=f"Estado resultante: {app_status}. Registro guardado en base de datos local.",
                    color=discord.Color.light_grey()
                )
                await channel.send(embed=embed)

            await asyncio.sleep(3.5)

        summary_embed = discord.Embed(
            title="[Lote Completado]",
            description=(
                f"**Total Procesadas:** {processed}\n"
                f"**Postulaciones Directas Exitosas:** {applied_count}\n"
                f"**Borradores en Accion Manual:** {manual_count}\n\n"
                "Revisa el canal `#finalizacion-manual` para completar las vacantes pendientes en 1 clic."
            ),
            color=discord.Color.blue(),
            timestamp=datetime.now()
        )
        await channel.send(embed=summary_embed)

    async def execute_antigravity_query(self, channel: discord.TextChannel, prompt: str, is_plan: bool = False, user: Optional[discord.User] = None):
        """Ejecuta una consulta contra Antigravity CLI con la configuracion activa y envia la respuesta."""
        settings = load_antigravity_settings()
        cmd = build_agy_args(prompt, is_plan=is_plan, settings=settings)

        mode_label = "PLANIFICACION (/plan)" if is_plan else "CONSULTA"
        header = f"[{mode_label} ANTIGRAVITY | Modelo: {settings.get('model')} | Esfuerzo: {settings.get('effort')}]"

        async with channel.typing():
            try:
                proc = await asyncio.create_subprocess_exec(
                    *cmd,
                    cwd=str(CAREER_OPS_DIR),
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=180.0)
                out_text = stdout.decode("utf-8", errors="replace").strip()
                err_text = stderr.decode("utf-8", errors="replace").strip()
                response = out_text if out_text else (err_text if err_text else "[Sin respuesta de agy]")
            except asyncio.TimeoutError:
                response = "[Timeout] La ejecucion de Antigravity supero el limite de 180 segundos."
            except Exception as e:
                response = f"[Error al ejecutar agy]: {e}"

        prefix = f"**{header}**\n\n"
        full_text = prefix + response
        chunks = split_message_chunks(full_text, max_len=1900)
        for chunk in chunks:
            await channel.send(chunk)

    async def on_message(self, message: discord.Message):
        if message.author.bot:
            return

        # 1. Canal #chat-antigravity
        if self.antigravity_channel and message.channel.id == self.antigravity_channel.id:
            await self.handle_antigravity_chat(message)
            return

        # 2. Canal #generador-cvs
        if self.cv_generator_channel and message.channel.id == self.cv_generator_channel.id:
            await self.handle_cv_generation(message)
            return

        await self.process_commands(message)

    async def handle_antigravity_chat(self, message: discord.Message):
        """Maneja mensajes, comandos de modelo/esfuerzo y /plan en #chat-antigravity."""
        content = message.content.strip()
        if not content:
            return

        # Comando /plan o !plan
        if content.startswith(("/plan", "!plan")):
            parts = content.split(maxsplit=1)
            if len(parts) < 2:
                await message.reply(
                    "**[Uso del comando /plan]**\n"
                    "Debes indicar la tarea o instruccion a planificar detalladamente.\n\n"
                    "Ejemplo: `/plan Disenar estrategia para vacantes de vision computacional en Jalisco`\n"
                    "Tambien puedes pulsar el boton `[Planificar con /plan]` del panel superior."
                )
                return
            plan_prompt = parts[1].strip()
            await self.execute_antigravity_query(message.channel, plan_prompt, is_plan=True, user=message.author)
            return

        # Comando /modelo o /model
        if content.startswith(("/modelo", "!modelo", "/model", "!model")):
            parts = content.split(maxsplit=1)
            if len(parts) < 2:
                m_list = "\n".join([f"- `{m}`" for m in VALID_MODELS])
                await message.reply(f"**Modelos disponibles:**\n{m_list}\n\nUso: `/modelo <nombre_del_modelo>`")
                return
            new_model = parts[1].strip()
            if new_model not in VALID_MODELS:
                await message.reply(f"[Error] Modelo no reconocido. Opciones: {', '.join(VALID_MODELS)}")
                return
            settings = load_antigravity_settings()
            settings["model"] = new_model
            save_antigravity_settings(settings)
            await message.reply(f"[OK] Modelo cambiado exitosamente a `{new_model}`.")
            return

        # Comando /esfuerzo o /effort
        if content.startswith(("/esfuerzo", "!esfuerzo", "/effort", "!effort")):
            parts = content.split(maxsplit=1)
            if len(parts) < 2:
                await message.reply(f"**Niveles de esfuerzo:**\n{', '.join(VALID_EFFORTS)}\n\nUso: `/esfuerzo <nivel>`")
                return
            new_effort = parts[1].strip().lower()
            if new_effort not in VALID_EFFORTS:
                await message.reply(f"[Error] Nivel no reconocido. Opciones: {', '.join(VALID_EFFORTS)}")
                return
            settings = load_antigravity_settings()
            settings["effort"] = new_effort
            save_antigravity_settings(settings)
            await message.reply(f"[OK] Nivel de esfuerzo cambiado exitosamente a `{new_effort}`.")
            return

        # Comando /panel o /ajustes o /config
        if content in ("/panel", "!panel", "/ajustes", "!ajustes", "/config", "!config"):
            await self.post_antigravity_panel(message.channel)
            return

        # Consulta conversacional regular
        await self.execute_antigravity_query(message.channel, content, is_plan=False, user=message.author)

    async def handle_cv_generation(self, message: discord.Message):
        """Genera un CV adaptado de 1 pagina a partir de un enlace o texto de oferta."""
        text = message.content.strip()
        if not text:
            return

        async with message.channel.typing():
            url_match = re.search(r'https?://[^\s]+', text)
            job_url = url_match.group(0) if url_match else ""

            company = "Empresa Confidencial"
            title = "Ingeniero de Automatizacion / Robotica"
            description = text
            location = "Mexico"

            if job_url:
                await message.reply(f"[Info] Extrayendo y analizando requisitos desde la vacante:\n{job_url}")
                try:
                    import httpx
                    headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0"}
                    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                        resp = await client.get(job_url, headers=headers)
                        if resp.status_code == 200:
                            from bs4 import BeautifulSoup
                            soup = BeautifulSoup(resp.text, "html.parser")
                            h1 = soup.select_one("h1")
                            if h1:
                                title = h1.get_text(strip=True)
                            description = soup.get_text(separator="\n", strip=True)[:4000]
                except Exception as e:
                    logger.warning(f"Extraccion web de URL: {e}")

            score, reason, qualifies = evaluate_job(title, company, description, location)

            job_dict = {
                "company": company,
                "title": title,
                "description": description,
                "location": location,
                "url": job_url
            }
            app_id = get_next_id()
            tex_code, slug, _ = generate_tailored_cv(job_dict, app_id)
            cand_slug = re.sub(r'[^a-zA-Z0-9]', '', PROFILE.get("full_name", "Candidate"))
            tex_file = OUTPUT_DIR / f"CV-{cand_slug}-{slug}.tex"
            pdf_file = OUTPUT_DIR / f"CV-{cand_slug}-{slug}.pdf"
            tex_file.write_text(tex_code, encoding="utf-8")

            compiled = await asyncio.to_thread(compile_pdf, tex_file, OUTPUT_DIR)

            embed = discord.Embed(
                title=f"[CV Personalizado Generado] {company} - {title}",
                description="Se ha generado el curriculum adaptado a 1 pagina optimizado para sistemas ATS.",
                color=discord.Color.teal(),
                timestamp=datetime.now()
            )
            embed.add_field(name="Puntuacion de Afinidad", value=f"{score}/5.0", inline=True)
            embed.add_field(name="Alineacion Detectada", value=reason, inline=False)
            if job_url:
                embed.add_field(name="Oferta Analizada", value=f"[Abrir Enlace]({job_url})", inline=False)

            files = []
            if pdf_file.exists():
                files.append(discord.File(str(pdf_file), filename=pdf_file.name))

            await message.reply(embed=embed, files=files)


def main():
    cfg = load_config()
    token = cfg.get("bot_token")
    if not token or token == "TU_DISCORD_BOT_TOKEN_AQUI":
        print("[Error] No se ha configurado un bot_token valido en config/discord.yml.")
        sys.exit(1)

    bot = CareerOpsDiscordBot()
    bot.run(token)


if __name__ == "__main__":
    main()
