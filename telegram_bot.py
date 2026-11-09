#!/usr/bin/env python3
"""
Career-Ops Telegram Autonomous Command Center
Permite monitorear, consultar y ejecutar el pipeline autonomo de postulacion desde Telegram.
Soporte para volumenes variables de vacantes (/run N, /scan N, /buscar),
extraccion multi-plataforma (LinkedIn, Indeed, Computrabajo) y envio de PDFs de 1 pagina.
Sin emojis.
"""

import os
import sys
import re
import yaml
import asyncio
import logging
import httpx
from bs4 import BeautifulSoup
from pathlib import Path
from datetime import datetime

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

CAREER_OPS_DIR = Path(__file__).resolve().parent
CONFIG_FILE = CAREER_OPS_DIR / "config" / "telegram.yml"
APPS_FILE = CAREER_OPS_DIR / "data" / "applications.md"
OUTPUT_DIR = CAREER_OPS_DIR / "output"
PROOFS_DIR = OUTPUT_DIR / "proofs"
REPORTS_DIR = CAREER_OPS_DIR / "reports"
PENDING_DRAFTS_FILE = CAREER_OPS_DIR / "data" / "pending-drafts.md"

sys.path.insert(0, str(CAREER_OPS_DIR))

from auto_run import (
    get_next_id, is_duplicate, evaluate_job,
    generate_tailored_cv, compile_pdf,
    DEFAULT_SEARCH_TERMS, DEFAULT_LOCATIONS
)
from browser_session import sync_firefox_cookies, run_auto_apply_sync
from jobspy import scrape_jobs

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("telegram_bot")

def load_config():
    if not CONFIG_FILE.exists():
        return {}
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}

def save_config(cfg):
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        yaml.safe_dump(cfg, f, default_flow_style=False)

def is_authorized(user_id):
    cfg = load_config()
    allowed = cfg.get("allowed_chat_ids", [])
    if not allowed:
        cfg["allowed_chat_ids"] = [user_id]
        save_config(cfg)
        logger.info(f"Usuario {user_id} registrado como administrador.")
        return True
    return user_id in allowed

def get_stats():
    if not APPS_FILE.exists():
        return {"total": 0, "last_id": 0, "counts": {}}
    lines = APPS_FILE.read_text(encoding="utf-8").splitlines()
    total = 0
    counts = {}
    last_id = 0
    last_role = ""
    last_comp = ""
    for line in lines:
        if not line.startswith("|") or "Date | Company" in line or "---" in line:
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) >= 8:
            try:
                aid = int(parts[1])
                if aid > last_id:
                    last_id = aid
                    last_comp = parts[3]
                    last_role = parts[4]
                status = parts[6]
                counts[status] = counts.get(status, 0) + 1
                total += 1
            except ValueError:
                continue
    return {
        "total": total,
        "last_id": last_id,
        "last_comp": last_comp,
        "last_role": last_role,
        "counts": counts
    }

def get_pending_drafts():
    """Retorna las vacantes pendientes registradas en data/pending-drafts.md."""
    if not PENDING_DRAFTS_FILE.exists():
        return []
    content = PENDING_DRAFTS_FILE.read_text(encoding="utf-8")
    items = []
    for line in content.splitlines():
        parts = [p.strip() for p in line.split("|")]
        if len(parts) >= 8 and parts[1].isdigit():
            aid = int(parts[1])
            date = parts[2]
            portal = parts[3]
            company = parts[4]
            role = parts[5]
            reason = parts[6]
            raw_link = parts[7]
            m = re.search(r'\((https?://[^\)]+)\)', raw_link)
            url = m.group(1) if m else ""
            action = parts[8] if len(parts) > 8 else "Completar y enviar"
            items.append({
                "id": aid,
                "date": date,
                "portal": portal,
                "company": company,
                "role": role,
                "reason": reason,
                "url": url,
                "action": action
            })
    return items

def add_pending_draft(app_id, date, portal, company, role, reason, url, action="Resolver y enviar"):
    """Agrega o actualiza una vacante en data/pending-drafts.md asegurando enlaces directos."""
    items = get_pending_drafts()
    filtered = [it for it in items if it["id"] != app_id]
    link = f"[Abrir #{app_id}]({url})" if url else "No disponible"

    header = """# Borradores y Vacantes Pendientes de Envío Manual

Este registro contiene las vacantes donde el bot completó el perfil, adaptó el CV y preparó las respuestas técnicas, pero el envío final requiere confirmación del usuario (por ejemplo, resolución de un reto anti-bot reCAPTCHA, portal ATS corporativo o validación manual). Al estar autenticado en tu navegador, las respuestas y el CV ya se encuentran precargados en el portal.

| # | Fecha | Portal | Empresa | Puesto | Motivo / Estado | Enlace Directo al Borrador | Acción Requerida |
|---|-------|--------|---------|--------|-----------------|----------------------------|------------------|
"""
    rows = [f"| {app_id} | {date} | {portal} | {company} | {role} | {reason} | {link} | {action} |"]
    for it in filtered:
        l = f"[Abrir #{it['id']}]({it['url']})" if it["url"] else "No disponible"
        rows.append(f"| {it['id']} | {it['date']} | {it['portal']} | {it['company']} | {it['role']} | {it['reason']} | {l} | {it['action']} |")

    PENDING_DRAFTS_FILE.write_text(header + "\n".join(rows) + "\n", encoding="utf-8")

def mark_draft_applied(app_id):
    """Marca una vacante como Applied en applications.md, reportes y remueve de pending-drafts.md."""
    # 1. Actualizar applications.md
    if APPS_FILE.exists():
        content = APPS_FILE.read_text(encoding="utf-8")
        lines = []
        for line in content.splitlines():
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 8 and parts[1].isdigit() and int(parts[1]) == app_id:
                parts[6] = "Applied"
                if len(parts) > 9:
                    parts[9] += " ; Confirmado manualmente por usuario"
                line = " | ".join(parts)
            lines.append(line)
        APPS_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")

    # 2. Actualizar reporte individual
    reports = list(REPORTS_DIR.glob(f"{app_id}-*.md"))
    if reports:
        rep_content = reports[0].read_text(encoding="utf-8")
        rep_content = re.sub(r'\*\*Status:\*\*\s*\w+', '**Status:** Applied', rep_content)
        rep_content = re.sub(r'- \*\*Auto-Apply Status:\*\*\s*[^\n]+', '- **Auto-Apply Status:** Applied (Confirmado por usuario)', rep_content)
        reports[0].write_text(rep_content, encoding="utf-8")

    # 3. Remover de pending-drafts.md
    items = get_pending_drafts()
    remaining = [it for it in items if it["id"] != app_id]
    header = """# Borradores y Vacantes Pendientes de Envío Manual

Este registro contiene las vacantes donde el bot completó el perfil, adaptó el CV y preparó las respuestas técnicas, pero el envío final requiere confirmación del usuario (por ejemplo, resolución de un reto anti-bot reCAPTCHA, portal ATS corporativo o validación manual). Al estar autenticado en tu navegador, las respuestas y el CV ya se encuentran precargados en el portal.

| # | Fecha | Portal | Empresa | Puesto | Motivo / Estado | Enlace Directo al Borrador | Acción Requerida |
|---|-------|--------|---------|--------|-----------------|----------------------------|------------------|
"""
    rows = []
    for it in remaining:
        l = f"[Abrir #{it['id']}]({it['url']})" if it["url"] else "No disponible"
        rows.append(f"| {it['id']} | {it['date']} | {it['portal']} | {it['company']} | {it['role']} | {it['reason']} | {l} | {it['action']} |")
    PENDING_DRAFTS_FILE.write_text(header + "\n".join(rows) + "\n", encoding="utf-8")

def scrape_computrabajo(terms, max_items=20):
    """Extrae vacantes directamente de Computrabajo Mexico para terminos tecnicos."""
    jobs = []
    slugs = []
    for t in terms:
        s = re.sub(r'[^a-zA-Z0-9]+', '-', t.lower()).strip('-')
        slugs.append(f"trabajo-de-{s}")
        slugs.append(f"trabajo-de-{s}-en-jalisco")
        slugs.append(f"trabajo-de-{s}-en-nuevo-leon")

    headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0"}
    for slug in set(slugs):
        if len(jobs) >= max_items:
            break
        try:
            url = f"https://mx.computrabajo.com/{slug}"
            r = httpx.get(url, headers=headers, follow_redirects=True, timeout=8.0)
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, "html.parser")
                boxes = soup.select("article.box_offer")
                for b in boxes:
                    t_el = b.select_one("h2.title a, a.js-o-link")
                    c_el = b.select_one("p.fs16, a.fc_base")
                    l_el = b.select_one("p.fs13 span")
                    d_el = b.select_one("p.d-none, p.fc_aux")
                    if t_el and c_el:
                        title = t_el.get_text(strip=True)
                        comp = c_el.get_text(strip=True)
                        loc = l_el.get_text(strip=True) if l_el else "Mexico"
                        desc = d_el.get_text(strip=True) if d_el else title
                        link = t_el.get("href", "")
                        if link and not link.startswith("http"):
                            link = "https://mx.computrabajo.com" + link
                        if comp and title:
                            jobs.append({
                                "company": comp,
                                "title": title,
                                "url": link,
                                "location": loc,
                                "description": desc,
                                "site": "computrabajo"
                            })
        except Exception as e:
            logger.warning(f"Aviso Computrabajo ({slug}): {e}")
    return jobs

def collect_multi_platform_jobs(limit: int, query_term: str = None, hours_old: int = 72):
    """Recolecta vacantes de LinkedIn, Indeed y Computrabajo a gran escala segun el volumen solicitado."""
    existing_text = APPS_FILE.read_text(encoding="utf-8") if APPS_FILE.exists() else ""
    queries = [query_term] if query_term else DEFAULT_SEARCH_TERMS
    locations = DEFAULT_LOCATIONS

    results_wanted = max(5, min(20, (limit // 2) + 3))
    raw_jobs = []

    # 1. JobSpy: LinkedIn + Indeed (Filtrar por Easy Apply para postulacion directa real)
    import time
    for q in queries:
        for loc in locations:
            try:
                df = scrape_jobs(
                    site_name=["indeed", "linkedin"],
                    search_term=q,
                    location=loc,
                    results_wanted=results_wanted,
                    hours_old=hours_old,
                    country_indeed="mexico",
                    easy_apply=True
                )
                if df is not None and not df.empty:
                    for _, row in df.iterrows():
                        c = str(row.get("company", "")).strip()
                        t = str(row.get("title", "")).strip()
                        u = str(row.get("job_url", "")).strip()
                        l = str(row.get("location", "")).strip()
                        d = str(row.get("description", "")).strip()
                        if c and t and c.lower() != "nan" and t.lower() != "nan":
                            raw_jobs.append({
                                "company": c,
                                "title": t,
                                "url": u,
                                "location": l,
                                "description": d,
                                "site": str(row.get("site", "jobspy"))
                            })
                time.sleep(1.2)
            except Exception as e:
                logger.warning(f"Aviso JobSpy ({q} - {loc}): {e}")

    # 2. Computrabajo directo
    ct_terms = [query_term] if query_term else ["automatizacion", "mecatronica", "robotica", "control", "embebidos"]
    ct_jobs = scrape_computrabajo(ct_terms, max_items=limit * 2)
    raw_jobs.extend(ct_jobs)

    # 3. Deduplicar y calificar
    qualifying_jobs = []
    seen = set()
    for j in raw_jobs:
        k = (j["company"].lower(), j["title"].lower())
        if k in seen:
            continue
        seen.add(k)

        if not is_duplicate(j["company"], j["title"], j["url"], existing_text):
            score, reason, qualifies = evaluate_job(j["title"], j["company"], j["description"], j["location"])
            if qualifies:
                j["score"] = score
                j["reason"] = reason
                qualifying_jobs.append(j)

    return qualifying_jobs

async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not is_authorized(user_id):
        await update.message.reply_text("[Acceso denegado] Este bot es privado para postulaciones.")
        return

    stats = get_stats()
    pending = get_pending_drafts()
    text = (
        "=== Career-Ops: Centro de Control Autonomo ===\n\n"
        f"Usuario conectado: {user_id}\n"
        f"Total de vacantes registradas: {stats['total']}\n"
        f"Borradores pendientes de envio manual: {len(pending)}\n"
        f"Ultima vacante procesada: #{stats['last_id']} ({stats['last_comp']} - {stats['last_role']})\n\n"
        "Comandos con volumen variable:\n"
        "/run [n] - Postular a N vacantes (ej: /run 10, /run 25)\n"
        "/scan [n] - Escanear N vacantes sin postular (ej: /scan 20)\n"
        "/buscar <termino> [n] - Buscar y postular a un rol especifico (ej: /buscar robotica 10)\n"
        "/pendientes - Listar borradores guardados para completar en 1 clic\n"
        "/aplicada <id> - Marcar vacante como enviada (ej: /aplicada 481)\n"
        "/status - Metricas del tracker y desglose de estados\n"
        "/last - Ver y enviar documentos de la ultima vacante\n"
        "/cookies - Validar y sincronizar sesion de Firefox\n\n"
        "Fuentes activas: LinkedIn + Indeed + Computrabajo"
    )
    keyboard = [
        [InlineKeyboardButton("Postular 5", callback_data="cmd_run_5"),
         InlineKeyboardButton("Postular 10", callback_data="cmd_run_10"),
         InlineKeyboardButton("Postular 20", callback_data="cmd_run_20")],
        [InlineKeyboardButton("Postular 35", callback_data="cmd_run_35"),
         InlineKeyboardButton("Postular 50", callback_data="cmd_run_50")],
        [InlineKeyboardButton(f"Borradores ({len(pending)})", callback_data="cmd_pendientes"),
         InlineKeyboardButton("Estado", callback_data="cmd_status"),
         InlineKeyboardButton("Ultimo CV", callback_data="cmd_last")]
    ]
    await update.message.reply_text(text, reply_markup=InlineKeyboardMarkup(keyboard))

async def status_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not is_authorized(user_id):
        return

    stats = get_stats()
    pending = get_pending_drafts()
    breakdown = "\n".join([f"  - {st}: {cnt}" for st, cnt in stats["counts"].items()])
    text = (
        "=== Estado del Pipeline ===\n\n"
        f"Total procesadas: {stats['total']}\n"
        f"Borradores pendientes de envio: {len(pending)}\n"
        f"Ultimo ID asignado: #{stats['last_id']}\n"
        f"Ultima empresa: {stats['last_comp']}\n"
        f"Ultimo puesto: {stats['last_role']}\n\n"
        "Desglose por estado:\n"
        f"{breakdown}\n"
    )
    keyboard = [
        [InlineKeyboardButton("Postular 5", callback_data="cmd_run_5"),
         InlineKeyboardButton("Postular 10", callback_data="cmd_run_10"),
         InlineKeyboardButton("Postular 20", callback_data="cmd_run_20")],
        [InlineKeyboardButton(f"Borradores ({len(pending)})", callback_data="cmd_pendientes"),
         InlineKeyboardButton("Ver Ultimo CV", callback_data="cmd_last")]
    ]
    target = update.callback_query if update.callback_query else update.message
    if update.callback_query:
        await target.answer()
        await target.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard))
    else:
        await target.reply_text(text, reply_markup=InlineKeyboardMarkup(keyboard))

async def cookies_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not is_authorized(user_id):
        return

    await update.message.reply_text("[Info] Sincronizando cookies desde perfil de Firefox...")
    ok = sync_firefox_cookies()
    if ok:
        await update.message.reply_text("[OK] Cookies sincronizadas con exito hacia data/firefox_storage_state.json.")
    else:
        await update.message.reply_text("[Error] No se pudo sincronizar el archivo cookies.sqlite de Firefox.")

async def pendientes_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not is_authorized(user_id):
        return

    items = get_pending_drafts()
    target = update.callback_query if update.callback_query else update.message
    if update.callback_query:
        await target.answer()

    if not items:
        msg = "[Borradores] No hay vacantes pendientes. Todas las candidaturas evaluadas han sido enviadas con éxito."
        if update.callback_query:
            await target.edit_message_text(msg)
        else:
            await target.reply_text(msg)
        return

    text = f"=== Borradores Pendientes ({len(items)}) ===\n\n"
    text += "Tus respuestas tecnicas y CV ya estan precargados en tu sesion. Abre el enlace para resolver el captcha en 1 clic y enviar:\n\n"

    keyboard = []
    for it in items[:6]:
        text += (
            f"#{it['id']} - {it['company']} ({it['portal']})\n"
            f"Puesto: {it['role']}\n"
            f"Motivo: {it['reason']}\n"
            f"Enlace: {it['url']}\n"
            f"Confirmar envio: /aplicada {it['id']}\n\n"
        )
        row_btns = []
        if it['url']:
            row_btns.append(InlineKeyboardButton(f"Abrir #{it['id']}", url=it['url']))
        row_btns.append(InlineKeyboardButton(f"Marcar #{it['id']}", callback_data=f"done_{it['id']}"))
        keyboard.append(row_btns)

    keyboard.append([InlineKeyboardButton("Actualizar Lista", callback_data="cmd_pendientes")])

    if update.callback_query:
        await target.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard), disable_web_page_preview=True)
    else:
        await target.reply_text(text, reply_markup=InlineKeyboardMarkup(keyboard), disable_web_page_preview=True)

async def aplicada_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not is_authorized(user_id):
        return

    if not context.args:
        await update.message.reply_text("Uso: /aplicada <id> (ejemplo: /aplicada 481)")
        return

    try:
        aid = int(context.args[0])
    except ValueError:
        await update.message.reply_text("Error: El ID debe ser un numero entero.")
        return

    mark_draft_applied(aid)
    await update.message.reply_text(f"[OK] Vacante #{aid} actualizada a estado 'Applied'. Se ha archivado de la lista de borradores pendientes.")

async def last_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not is_authorized(user_id):
        return

    stats = get_stats()
    last_id = stats["last_id"]
    if last_id == 0:
        msg = "No hay registros disponibles en applications.md."
        if update.callback_query:
            await update.callback_query.answer()
            await update.callback_query.message.reply_text(msg)
        else:
            await update.message.reply_text(msg)
        return

    pdfs = list(OUTPUT_DIR.glob(f"*{last_id}*.pdf"))
    proofs = list(PROOFS_DIR.glob(f"*{last_id}*.png"))
    
    chat_id = update.effective_chat.id
    target = update.callback_query.message if update.callback_query else update.message
    if update.callback_query:
        await update.callback_query.answer()

    await target.reply_text(f"[Postulacion #{last_id}]\nEmpresa: {stats['last_comp']}\nPuesto: {stats['last_role']}")

    if pdfs and pdfs[0].exists():
        with open(pdfs[0], "rb") as f:
            await context.bot.send_document(
                chat_id=chat_id,
                document=f,
                caption=f"CV Adaptado a 1 pagina: {pdfs[0].name}"
            )

    if proofs and proofs[0].exists():
        with open(proofs[0], "rb") as f:
            await context.bot.send_photo(
                chat_id=chat_id,
                photo=f,
                caption=f"Comprobante de navegacion: {proofs[0].name}"
            )

async def scan_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not is_authorized(user_id):
        return

    limit = 10
    if context.args:
        try:
            limit = int(context.args[0])
        except ValueError:
            pass

    status_msg = await update.message.reply_text(f"[Info] Escaneando vacantes en LinkedIn, Indeed y Computrabajo (Solicitadas: {limit})...")
    found_jobs = await asyncio.to_thread(collect_multi_platform_jobs, limit)

    if not found_jobs:
        await status_msg.edit_text("[Info] Escaneo completado. No se encontraron vacantes nuevas sin postular.")
        return

    text = f"=== Escaneo Multi-Plataforma ===\nNuevas vacantes cualificadas detectadas: {len(found_jobs)}\nMostrando hasta {min(len(found_jobs), limit)}:\n\n"
    for j in found_jobs[:limit]:
        text += f"- [{j['score']}/5.0] ({j.get('site', 'web')}) {j['company']} | {j['title']} ({j['location']})\n"
    
    run_qty = min(len(found_jobs), limit)
    keyboard = [
        [InlineKeyboardButton(f"Postular a Estas {run_qty}", callback_data=f"cmd_run_{run_qty}")]
    ]
    await status_msg.edit_text(text, reply_markup=InlineKeyboardMarkup(keyboard))

async def buscar_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not is_authorized(user_id):
        return

    if not context.args:
        await update.message.reply_text("Uso: /buscar <termino> [cantidad]\nEjemplo: /buscar robotica 10")
        return

    query_term = context.args[0]
    limit = 5
    if len(context.args) > 1:
        try:
            limit = int(context.args[1])
        except ValueError:
            pass

    chat_id = update.effective_chat.id
    await update.message.reply_text(f"[Busqueda Dirigida] Buscando '{query_term}' (Meta: {limit} vacantes)...")
    asyncio.create_task(run_pipeline_task(chat_id, context, limit, query_term=query_term))

async def run_pipeline_task(chat_id, context: ContextTypes.DEFAULT_TYPE, limit: int, query_term: str = None):
    bot = context.bot
    q_str = f" para '{query_term}'" if query_term else ""
    await bot.send_message(chat_id, f"[Inicio] Ejecutando pipeline autonomo{q_str} (Meta solicitada: {limit} vacantes)...")

    sync_firefox_cookies()
    current_id = get_next_id()

    # Recolectar en hilo
    unique_jobs = await asyncio.to_thread(collect_multi_platform_jobs, limit, query_term)
    if not unique_jobs:
        await bot.send_message(chat_id, "[Info] No se detectaron vacantes nuevas en este ciclo. Todo esta al dia.")
        return

    await bot.send_message(chat_id, f"[Info] Se detectaron {len(unique_jobs)} oportunidades cualificadas. Procesando hasta {limit}...")

    processed = 0
    today_str = datetime.now().strftime("%Y-%m-%d")

    for job in unique_jobs:
        if processed >= limit:
            break

        score = job.get("score", 4.0)
        reason = job.get("reason", "Alineacion tecnica detectada.")
        app_id = current_id + processed
        processed += 1

        # Generar CV en LaTeX a 1 pagina
        tex_code, slug, _ = generate_tailored_cv(job, app_id)
        tex_file = OUTPUT_DIR / f"CV-OmarPayan-{slug}.tex"
        pdf_file = OUTPUT_DIR / f"CV-OmarPayan-{slug}.pdf"
        tex_file.write_text(tex_code, encoding="utf-8")
        
        compiled = await asyncio.to_thread(compile_pdf, tex_file, OUTPUT_DIR)

        # Postular con navegador Playwright usando cookies activas
        app_status = "Evaluated"
        proof_path = ""
        if job.get("url"):
            apply_res = await asyncio.to_thread(run_auto_apply_sync, job["url"], pdf_file, app_id, True)
            app_status = apply_res.get("status", "Evaluated")
            proof_path = apply_res.get("proof", "")

        # Guardar reporte
        report_file = REPORTS_DIR / f"{app_id}-{slug}-{today_str}.md"
        report_content = f"""# Evaluation Report: #{app_id} - {job['company']} - {job['title']}

**Evaluated:** {today_str}  
**Score:** {score}/5.0  
**Archetype:** Robotics & Automation Engineering  
**Legitimacy:** High Confidence (Direct Posting: {job.get('site', 'Web')})  
**Recommendation:** APPLY  
**Status:** {app_status}  
**Location:** {job['location']}  
**PDF:** [CV-OmarPayan-{slug}.pdf](../output/CV-OmarPayan-{slug}.pdf)  

---

## Block A: Job Overview & Key Alignment
- **Company:** {job['company']}
- **Role:** {job['title']}
- **Location:** {job['location']}
- **Posting URL:** {job['url']}
- **Auto-Apply Status:** {app_status}

## Block B: Match Analysis
- {reason}
- Formacion: B.S. en Ingenieria en Robotica y Sistemas Digitales (Tecnologico de Monterrey) con concentracion oficial en IA Avanzada.
- Proyectos con socios formadores incluidos: OMRON (Automatizacion, ROS 2, Vision) e Intel (DigiMix Telemetria Embebida, PCB).

## Block C: Generated Files
- TeX: `output/CV-OmarPayan-{slug}.tex`
- PDF: `output/CV-OmarPayan-{slug}.pdf` (Pages: 1)
- Proof Screenshot: `output/proofs/proof-{app_id}.png`
"""
        report_file.write_text(report_content, encoding="utf-8")

        # Registrar en applications.md
        new_row = f"| {app_id} | {today_str} | {job['company']} | {job['title']} | {score}/5 | {app_status} | Yes | [{app_id}](../reports/{app_id}-{slug}-{today_str}.md) | Telegram Auto-Runner ({job.get('site', 'Web')}) |\n"
        with open(APPS_FILE, "a", encoding="utf-8") as f:
            f.write(new_row)

        # Enviar actualizacion detallada y transparente al chat
        reply_markup = None
        portal_name = "Indeed" if "indeed.com" in job.get("url", "") else ("LinkedIn" if "linkedin.com" in job.get("url", "") else ("Computrabajo" if "computrabajo.com" in job.get("url", "") else "Web"))

        if app_status == "Applied":
            header_status = f"[#{app_id} Postulacion Enviada con Exito]"
            action_desc = "Postulacion directa completada. Deberas recibir correo de confirmacion y verla en la seccion de 'Solicitados'."
        elif app_status == "CaptchaBlocked":
            header_status = f"[#{app_id} Comprobacion Anti-Bot Detectada - Borrador Guardado]"
            action_desc = "Tus respuestas tecnicas y CV fueron cargados exitosamente, pero el portal exige resolver un CAPTCHA humano (reCAPTCHA/Cloudflare). Tu borrador quedo guardado en tu sesion; solo necesitas resolverlo en 1 clic y confirmar el envio."
            add_pending_draft(app_id, today_str, portal_name, job["company"], job["title"], "Google reCAPTCHA / Anti-Bot", job.get("url", ""), "Resolver reCAPTCHA en 1 clic y enviar")
            if job.get("url"):
                reply_markup = InlineKeyboardMarkup([
                    [InlineKeyboardButton("Completar en 1 Clic", url=job["url"]),
                     InlineKeyboardButton("Marcar Enviada", callback_data=f"done_{app_id}")]
                ])
        elif app_status == "ExternalATS":
            header_status = f"[#{app_id} ATS Corporativo - Requiere Envio Externo]"
            action_desc = "Esta vacante no cuenta con Easy Apply; redirige a portal corporativo. Se genero el CV en PDF adjunto para aplicar en el portal."
            add_pending_draft(app_id, today_str, portal_name, job["company"], job["title"], "Portal corporativo externo", job.get("url", ""), "Aplicar con CV generado")
            if job.get("url"):
                reply_markup = InlineKeyboardMarkup([
                    [InlineKeyboardButton("Abrir Portal", url=job["url"]),
                     InlineKeyboardButton("Marcar Enviada", callback_data=f"done_{app_id}")]
                ])
        elif app_status == "FormInProgress":
            header_status = f"[#{app_id} Formulario Iniciado - Preguntas Pendientes]"
            action_desc = "Se abrio el formulario en el portal, pero la empresa requiere preguntas personalizadas que requieren revision."
            add_pending_draft(app_id, today_str, portal_name, job["company"], job["title"], "Preguntas personalizadas", job.get("url", ""), "Revisar preguntas y enviar")
            if job.get("url"):
                reply_markup = InlineKeyboardMarkup([
                    [InlineKeyboardButton("Revisar Formulario", url=job["url"]),
                     InlineKeyboardButton("Marcar Enviada", callback_data=f"done_{app_id}")]
                ])
        else:
            header_status = f"[#{app_id} Evaluada / Estado: {app_status}]"
            action_desc = "Registro completado en base de datos local."

        msg_text = (
            f"{header_status}\n\n"
            f"Portal: {portal_name}\n"
            f"Empresa: {job['company']}\n"
            f"Puesto: {job['title']}\n"
            f"Ubicacion: {job['location']}\n"
            f"Puntuacion: {score}/5.0\n"
            f"Estado: {app_status}\n"
            f"Detalle: {action_desc}\n"
            f"Enlace: {job['url']}"
        )
        if app_status in ["CaptchaBlocked", "FormInProgress", "ExternalATS"]:
            msg_text += f"\n\nPara confirmarla una vez enviada:\n/aplicada {app_id}"

        await bot.send_message(chat_id, msg_text, reply_markup=reply_markup)

        # Enviar PDF
        if pdf_file.exists():
            with open(pdf_file, "rb") as pf:
                await bot.send_document(
                    chat_id,
                    document=pf,
                    caption=f"CV 1 Pagina: {pdf_file.name}"
                )

        # Enviar foto del comprobante
        proof_obj = Path(proof_path) if proof_path else None
        if proof_obj and proof_obj.exists():
            with open(proof_obj, "rb") as img:
                await bot.send_photo(
                    chat_id,
                    photo=img,
                    caption=f"Evidencia Navegador: proof-{app_id}.png"
                )

        # Pausa humana preventiva entre postulaciones para proteger sesion
        await asyncio.sleep(3.5)

    await bot.send_message(chat_id, f"=== Lote Completado ===\nTotal de vacantes procesadas en este ciclo: {processed}")

async def run_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not is_authorized(user_id):
        return

    limit = 5
    if context.args:
        try:
            limit = int(context.args[0])
        except ValueError:
            pass

    chat_id = update.effective_chat.id
    asyncio.create_task(run_pipeline_task(chat_id, context, limit))

async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    data = query.data
    user_id = update.effective_user.id
    if not is_authorized(user_id):
        await query.answer("No autorizado.")
        return

    if data == "cmd_status":
        await status_handler(update, context)
    elif data == "cmd_last":
        await last_handler(update, context)
    elif data == "cmd_pendientes":
        await pendientes_handler(update, context)
    elif data.startswith("done_"):
        aid = int(data.split("_")[-1])
        mark_draft_applied(aid)
        await query.answer(f"Vacante #{aid} marcada como enviada.")
        await query.message.reply_text(f"[OK] Vacante #{aid} confirmada como 'Applied' en base de datos y reporte.")
    elif data.startswith("cmd_run_"):
        n = int(data.split("_")[-1])
        await query.answer(f"Iniciando ejecucion de {n} vacantes...")
        asyncio.create_task(run_pipeline_task(query.message.chat_id, context, n))
    elif data.startswith("cmd_scan_"):
        n = int(data.split("_")[-1])
        await query.answer(f"Escaneando {n} vacantes...")
        context.args = [str(n)]
        await scan_handler(update, context)

def main():
    cfg = load_config()
    token = os.environ.get("TELEGRAM_BOT_TOKEN") or cfg.get("bot_token")
    if not token or token == "TU_TOKEN_AQUI":
        print("Error: No se ha configurado el bot_token.")
        sys.exit(1)

    app = Application.builder().token(token).build()

    app.add_handler(CommandHandler("start", start_handler))
    app.add_handler(CommandHandler("help", start_handler))
    app.add_handler(CommandHandler("status", status_handler))
    app.add_handler(CommandHandler("scan", scan_handler))
    app.add_handler(CommandHandler("buscar", buscar_handler))
    app.add_handler(CommandHandler("last", last_handler))
    app.add_handler(CommandHandler("cookies", cookies_handler))
    app.add_handler(CommandHandler("pendientes", pendientes_handler))
    app.add_handler(CommandHandler("borradores", pendientes_handler))
    app.add_handler(CommandHandler("aplicada", aplicada_handler))
    app.add_handler(CommandHandler("run", run_handler))
    app.add_handler(CommandHandler("auto", run_handler))
    app.add_handler(CallbackQueryHandler(callback_handler))

    print("[OK] Bot de Telegram iniciado con soporte variable y multi-plataforma...")
    app.run_polling()

if __name__ == "__main__":
    main()
