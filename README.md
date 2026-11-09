# Career-Ops X Jobs Applier

Sistema autónomo e inteligente de búsqueda, evaluación y postulación masiva de empleo con control remoto vía Telegram y automatización web en **LinkedIn Easy Apply**, **Indeed SmartApply** y **Computrabajo**.

Integra evaluación por ajuste curricular, síntesis contextual de preguntas abiertas mediante IA local (Ollama / DeepSeek), detección inteligente de CAPTCHAs y guardado de borradores directos.

---

## Características Principales

- **Postulación Autónoma Multi-Portal:**
  - **LinkedIn:** Detección de botones *Easy Apply*, llenado de teléfono, carga de CV y envío.
  - **Indeed:** Detección de *SmartApply* / *Postularse desde el móvil*, respuesta a Killer Questions y textareas abiertos con LLM contextual, y confirmación de envío.
  - **Computrabajo:** Postulación directa, adjunto de currículum y resolución de filtros iniciales.
- **Centro de Control por Telegram:**
  - Envía comandos (`/batch 5`, `/scan 10`, `/pendientes`, `/stats`, `/cookies`) o usa la botonera interactiva en tiempo real.
  - Recibe en tu chat reportes de evaluación, PDFs a 1 página y capturas de pantalla como evidencia de cada postulación exitosa.
- **Detección de Retos de Seguridad y Borradores (Anti-Bloqueo):**
  - Si un portal presenta reCAPTCHA o Cloudflare Turnstile, el bot no se bloquea ni satura la página: registra la vacante en `data/pending-drafts.md` con su enlace directo y te envía un botón a Telegram para completarla en 1 clic.
- **100% Privado y Seguro:**
  - No requiere subir contraseñas ni enviar cookies a servidores de terceros. Lee las cookies locales de tu propia sesión de Firefox y se ejecuta en tu propia máquina.

---

## Guía Rápida de Configuración (Quick Start)

Cualquiera puede poner en marcha este sistema siguiendo estos 5 pasos:

### 1. Requisitos Previos e Instalación

- **Python 3.10+** y **Node.js 18+**
- Navegador **Firefox** instalado
- (Recomendado) **Ollama** con modelo local para responder preguntas abiertas complejas (`ollama run deepseek-coder-v2:16b` u otro)

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/opyntorr/career-ops-X-jobs-applier.git
cd career-ops-X-jobs-applier

# Crear entorno virtual de Python
python3 -m venv .venv
source .venv/bin/activate

# Instalar librerias de Python y navegadores de Playwright
pip install -r requirements.txt
playwright install firefox

# Instalar dependencias de Node.js
npm install
```

---

### 2. Configura tu CV Maestro (`cv.md`)

Copia la plantilla `cv.template.md` a la raíz del proyecto como `cv.md`:

```bash
cp cv.template.md cv.md
```

Edita `cv.md` con tu información real:
- Resumen profesional / perfil
- Educación y certificaciones
- Experiencia laboral con logros cuantificables
- Proyectos clave y tecnologías dominadas

*Nota: `cv.md` está protegido en `.gitignore` para que tu información personal nunca se suba a repositorios públicos.*

---

### 3. Configura tu Perfil y Preferencias de Búsqueda (`config/profile.yml`)

Copia la plantilla de perfil:

```bash
cp config/profile.example.yml config/profile.yml
```

Abre `config/profile.yml` y ajusta:
- **`candidate`**: Tu nombre completo, email, teléfono, ciudad y enlaces a LinkedIn/GitHub.
- **`target_roles`**: Los puestos que buscas (ej. *Software Engineer*, *Robotics Engineer*, *Data Analyst*).
- **`compensation`**: Tu expectativa salarial mínima y rango objetivo.

---

### 4. Configura tu Centro de Comando (Discord o Telegram)

Puedes controlar y monitorear el sistema tanto desde **Discord** (recomendado por su organizacion multicanal) como desde **Telegram**.

#### Opcion A: Centro de Comando en Discord (Recomendado)

Discord permite separar las conversaciones y acciones en 4 canales dedicados bajo la categoria `CAREER-OPS COMMAND CENTER`:
1. `#control-y-batches`: Panel interactivo persistente con botones, ejecucion de lotes y comprobantes de envio con PDF.
2. `#finalizacion-manual`: Vacantes retenidas por reCAPTCHA o portales corporativos complejos (Workday/Taleo) con boton directo `[Abrir Portal]` y `[Marcar como Enviada]`.
3. `#chat-antigravity`: Chat interactivo directo con Antigravity CLI (`agy`) para ajustar reglas, consultar metricas o pedir analisis desde el movil.
4. `#generador-cvs`: Pegas cualquier enlace o descripcion de empleo y genera al instante el CV adaptado a 1 pagina en PDF.

**Pasos de Configuracion:**
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications) y crea una aplicacion.
2. En la pestana **Bot**, crea el bot, activa el intent **Message Content Intent** y copia el **Bot Token**.
3. En **OAuth2 -> URL Generator**, selecciona el scope `bot` con permisos `Manage Channels`, `Send Messages`, `Attach Files`, `Embed Links` e invitalo a tu servidor.
4. Copia la plantilla y coloca tu token:
   ```bash
   cp config/discord.example.yml config/discord.yml
   ```
5. Al iniciar el bot por primera vez, creara automaticamente la categoria y los canales en tu servidor.

#### Opcion B: Bot de Telegram

Para monitorear y controlar las postulaciones desde tu chat de Telegram:

1. Abre Telegram y busca a **`@BotFather`**.
2. Envía `/newbot`, asigna un nombre y un usuario a tu bot.
3. Copia el **HTTP API Token** generado (ej: `1234567890:ABCdef...`).
4. Abre Telegram y escribe a **`@userinfobot`** para conocer tu **Id numérico de usuario**.
5. Copia la plantilla y coloca tus datos:

```bash
cp config/telegram.example.yml config/telegram.yml
```

Edita `config/telegram.yml`:
```yaml
bot_token: "TU_HTTP_API_TOKEN_DE_BOTFATHER"
allowed_chat_ids:
  - TU_ID_NUMERICO_AQUI
default_batch_limit: 5
hours_old: 72
min_score: 3.8
send_pdf: true
send_proof: true
```

*Nota: `config/telegram.yml` está en `.gitignore` para evitar filtraciones de tokens.*

---

### 5. Sincroniza tus Sesiones de Portales (Cookies de Firefox)

El bot utiliza tu sesión activa de Firefox para navegar y postularse sin pedir contraseñas:

1. Abre tu navegador Firefox normal.
2. Inicia sesión en tus cuentas de **LinkedIn**, **Indeed** y **Computrabajo**.
3. Cierra o mantén abierta la ventana del navegador.
4. El sistema extraerá automáticamente las cookies al iniciar el bot o puedes sincronizarlas manualmente cuando quieras ejecutando:
   ```bash
   python3 -c "from browser_session import sync_firefox_cookies; print('Sincronizacion:', sync_firefox_cookies())"
   ```

---

## Modo de Uso

### Iniciar el Centro de Comando de Discord

Para iniciar el bot de Discord en segundo plano:

```bash
./launch-discord-bot.sh
```

Comandos de gestion:
```bash
./launch-discord-bot.sh status   # Ver si esta activo
./launch-discord-bot.sh logs     # Ver logs en tiempo real
./launch-discord-bot.sh stop     # Detener el servicio
```

### Iniciar el Bot de Telegram (Opcional)

Para encender el bot de Telegram en segundo plano:

```bash
./launch-telegram-bot.sh start
```

Para ver el estado o los logs:
```bash
./launch-telegram-bot.sh status
./launch-telegram-bot.sh logs
```

Para detenerlo:
```bash
./launch-telegram-bot.sh stop
```

### Comandos de Telegram

Una vez encendido, abre el chat con tu bot en Telegram:

- **`/batch 5`**: Busca, evalúa contra tu CV y postula automáticamente a las 5 mejores ofertas de las últimas 72 horas.
- **`/scan 10`**: Extrae vacantes frescas de LinkedIn, Indeed y Computrabajo y las evalúa sin postularse de inmediato.
- **`/pendientes`**: Muestra las vacantes que requieren verificación de CAPTCHA o revisión manual con botón directo para abrir y finalizar.
- **`/aplicada <ID>`**: Marca una vacante pendiente como enviada manualmente en el registro central.
- **`/cookies`**: Re-sincroniza las cookies desde Firefox al instante.
- **`/stats`**: Muestra el total de postulaciones enviadas, tasa de éxito y métricas generales.

### Ejecución Directa por Terminal (CLI)

También puedes correr el pipeline de postulación de forma autónoma desde la terminal:

```bash
./auto_run.sh --batch 5 --hours 72 --min-score 3.8
```

Opciones:
- `--batch N`: Límite máximo de ofertas a postular en la sesión.
- `--hours H`: Antigüedad máxima de las ofertas publicadas (ej: 72 horas).
- `--min-score S`: Calificación mínima de afinidad con tu CV (de 1.0 a 5.0) para autorizar la postulación automática.

---

## Estructura de Archivos

```
career-ops-X-jobs-applier/
├── browser_session.py        # Motor de automatizacion Playwright y resolucion de formularios
├── telegram_bot.py           # Centro de comando de Telegram con polling y botones interactivos
├── auto_run.py               # Orquestador del pipeline: busqueda -> evaluacion -> postulacion
├── launch-telegram-bot.sh    # Script de gestion del servicio de Telegram (start/stop/logs)
├── auto_run.sh               # Acceso rapido de terminal con deteccion automatica de virtualenv
├── requirements.txt          # Dependencias de Python
├── cv.template.md            # Plantilla para crear tu CV maestro (cv.md)
├── config/
│   ├── profile.example.yml   # Plantilla para datos personales y expectativas (profile.yml)
│   └── telegram.example.yml  # Plantilla para tokens y IDs de Telegram (telegram.yml)
├── data/
│   ├── applications.md       # Bitacora consolidada de postulaciones realizadas (local)
│   └── pending-drafts.md     # Registro de borradores con enlace directo (local)
├── output/
│   └── proofs/               # Capturas de pantalla de confirmacion de envio (local)
└── reports/                  # Reportes de afinidad curricular y desgloses de vacantes
```

---

## Seguridad y Privacidad

- **Tus credenciales nunca se suben a Git:** Los archivos `.env`, `telegram.yml`, `profile.yml`, `cv.md` y `data/firefox_storage_state.json` están excluidos explícitamente en `.gitignore`.
- **Ejecución 100% Local:** Ningún dato confidencial sale de tu máquina a APIs de terceros salvo las peticiones de postulación dirigidas a los portales oficiales de empleo.
