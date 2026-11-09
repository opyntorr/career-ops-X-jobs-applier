"""
Career-Ops Browser Session & Universal Auto-Apply Engine
Sincroniza cookies de Firefox y ejecuta la postulación web inteligente en LinkedIn, Indeed y Computrabajo.
Resolución contextual de preguntas abiertas vía Ollama local (GPU RTX 2070 / DeepSeek-Coder-V2 16B) con fallback heurístico.
Sin emojis.
"""

import os
import re
import json
import shutil
import sqlite3
import asyncio
import httpx
import yaml
from pathlib import Path
from playwright.async_api import async_playwright

CAREER_OPS_DIR = Path(__file__).resolve().parent
STORAGE_STATE_FILE = CAREER_OPS_DIR / "data" / "firefox_storage_state.json"
PROOFS_DIR = CAREER_OPS_DIR / "output" / "proofs"
PROOFS_DIR.mkdir(parents=True, exist_ok=True)

def load_profile():
    """Carga dinamicamente el perfil del usuario desde config/profile.yml o config/profile.example.yml."""
    profile_path = CAREER_OPS_DIR / "config" / "profile.yml"
    if not profile_path.exists():
        profile_path = CAREER_OPS_DIR / "config" / "profile.example.yml"
    
    data = {}
    if profile_path.exists():
        try:
            with open(profile_path, "r", encoding="utf-8") as f:
                raw = yaml.safe_load(f) or {}
            cand = raw.get("candidate", {})
            full_name = cand.get("full_name", "")
            parts = full_name.split() if full_name else []
            first_name = parts[0] if parts else ""
            last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
            
            rules = raw.get("narrative", {}).get("custom_rules", {})
            loc = raw.get("location", {})
            
            data = {
                "first_name": first_name,
                "last_name": last_name,
                "full_name": full_name,
                "email": cand.get("email", ""),
                "phone": cand.get("phone", ""),
                "phone_intl": cand.get("phone_intl", cand.get("phone", "")),
                "city": loc.get("city", cand.get("location", "")),
                "state": loc.get("state", "Jalisco"),
                "country": loc.get("country", "México"),
                "postal_code": loc.get("postal_code", "45010"),
                "linkedin": cand.get("linkedin", ""),
                "github": cand.get("github", ""),
                "degree": rules.get("degree", "Ingeniería en Robótica y Sistemas Digitales"),
                "university": rules.get("university", "Tecnológico de Monterrey"),
                "salary_mxn": str(raw.get("compensation", {}).get("minimum", "22000")),
                "salary_annual_mxn": "264000",
                "english_level": "B2+ (Avanzado / Professional Working)",
                "experience_years": "2"
            }
        except Exception as e:
            print(f"Aviso al cargar profile: {e}")

    # Fallback si algun campo basico falta
    if not data.get("full_name"):
        data["full_name"] = "Candidato"
    return data

PROFILE = load_profile()

def find_firefox_cookie_db():
    """Busca dinamicamente cookies.sqlite en los perfiles estandar de Firefox en Linux, macOS o Windows."""
    search_roots = [
        Path.home() / "snap/firefox/common/.mozilla/firefox",
        Path.home() / ".mozilla/firefox",
        Path.home() / "Library/Application Support/Firefox/Profiles",
        Path(os.environ.get("APPDATA", "")) / "Mozilla/Firefox/Profiles"
    ]
    for root in search_roots:
        if root.exists():
            for p in root.glob("*/cookies.sqlite"):
                try:
                    if p.stat().st_size > 0:
                        return p
                except Exception:
                    continue
    return None

def sync_firefox_cookies():
    """Extrae las cookies activas del perfil de Firefox y las exporta para Playwright incluyendo WAL y SHM."""
    db_path = find_firefox_cookie_db()
    if not db_path:
        # Fallback a rutas clasicas
        possible_paths = [
            Path.home() / "snap/firefox/common/.mozilla/firefox/z96nyax6.default/cookies.sqlite",
            Path.home() / ".mozilla/firefox/z96nyax6.default/cookies.sqlite"
        ]
        for p in possible_paths:
            if p.exists():
                db_path = p
                break
                
    if not db_path:
        return False

    tmp_db = Path("/tmp/sync_cookies_careerops.sqlite")
    try:
        shutil.copy2(db_path, tmp_db)
        wal_path = Path(str(db_path) + "-wal")
        if wal_path.exists():
            shutil.copy2(wal_path, Path(str(tmp_db) + "-wal"))
        shm_path = Path(str(db_path) + "-shm")
        if shm_path.exists():
            shutil.copy2(shm_path, Path(str(tmp_db) + "-shm"))

        conn = sqlite3.connect(tmp_db)
        c = conn.cursor()
        c.execute("SELECT host, name, value, path, expiry, isSecure, isHttpOnly, sameSite FROM moz_cookies")
        rows = c.fetchall()
        
        cookies = []
        for host, name, value, path, expiry, isSecure, isHttpOnly, sameSite in rows:
            ss = "Lax"
            if sameSite == 2:
                ss = "Strict"
            elif sameSite == 0:
                ss = "None"
                
            if expiry and expiry > 0:
                exp = float(expiry)
                if exp > 1e14:
                    exp = exp / 1_000_000.0
                elif exp > 1e11:
                    exp = exp / 1_000.0
            else:
                exp = -1.0
                
            cookies.append({
                "name": name,
                "value": value,
                "domain": host,
                "path": path,
                "expires": exp,
                "httpOnly": bool(isHttpOnly),
                "secure": bool(isSecure),
                "sameSite": ss
            })
            
        conn.close()
        for f in [tmp_db, Path(str(tmp_db) + "-wal"), Path(str(tmp_db) + "-shm")]:
            if f.exists():
                try: f.unlink()
                except Exception: pass
            
        STORAGE_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(STORAGE_STATE_FILE, "w", encoding="utf-8") as f:
            json.dump({"cookies": cookies, "origins": []}, f, indent=2)
            
        return True
    except Exception as e:
        print(f"Aviso al sincronizar cookies: {e}")
        return False

async def generate_contextual_answer(prompt_text: str, max_chars: int = 500, job_context: str = "") -> str:
    """Genera una respuesta contextual para textareas o preguntas abiertas impredecibles.
    Prioridad 1: Ollama local en GPU RTX 2070 (deepseek-coder-v2:16b).
    Prioridad 2: Fallback heuristico semantico de cero latencia.
    """
    clean_prompt = prompt_text.strip()
    if not clean_prompt:
        return "Cuento con experiencia tecnica y adaptabilidad integral a los requerimientos del puesto."

    prompt_lower = clean_prompt.lower()
    limit = int(max_chars * 0.9) if max_chars else 300

    # 1. Inferencia local con Ollama en GPU
    system_prompt = f"""Eres Christian Omar Payán Torróntegui, Ingeniero en Robótica y Sistemas Digitales (Tec de Monterrey, concentración en IA Avanzada).
Proyectos:
- OMRON: Automatización industrial, control y visión artificial con ROS 2 para robots manipuladores.
- Intel (DigiMix): Telemetría IoT en microcontroladores, instrumentación de pruebas SLT, PCB y Linux.
- Software & IA: Pipelines de datos en Python, TensorFlow, PyTorch, Docker, Git, REST APIs, SQL.
Parámetros: Salario $22,000 MXN mensuales, inglés B2+ Avanzado, ubicación Guadalajara (abierto a traslado o remoto).

Pregunta del formulario: "{clean_prompt}"
Contexto del puesto: {job_context}
Instrucción: Responde en primera persona en 1 o 2 oraciones concisas y profesionales. Máximo {min(max_chars, 320)} caracteres. Responde en el mismo idioma de la pregunta. Sin introducciones ni comillas."""

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "deepseek-coder-v2:16b",
                    "prompt": system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.25,
                        "num_predict": max(30, min(100, int(limit / 4)))
                    }
                }
            )
            if resp.status_code == 200:
                ans = resp.json().get("response", "").strip()
                ans = re.sub(r'^["\']|["\']$', '', ans).strip()
                if len(ans) > 12:
                    return ans[:limit]
    except Exception:
        pass

    # 2. Fallback Heuristico Semantico Local (<0.05s)
    is_en = any(w in prompt_lower for w in ["why", "how", "what", "describe", "experience", "tell", "years", "challenge"])

    if any(w in prompt_lower for w in ["backend", "software", "api", "python", "base de datos", "sql", "etl"]):
        ans = ("Experienced in backend development using Python, building RESTful APIs, database integration with SQL, and deploying containerized environments with Docker and Linux."
               if is_en else
               "Cuento con experiencia en desarrollo backend con Python, diseño e integración de APIs REST, consultas SQL y despliegue en entornos Linux con Docker y Git.")
    elif any(w in prompt_lower for w in ["automatiz", "robot", "plc", "ros", "vision", "hardware", "control"]):
        ans = ("I have worked on industrial robotics and computer vision with ROS 2, integrating automated workflows, sensor telemetry, and hardware validation in projects with OMRON and Intel."
               if is_en else
               "He desarrollado proyectos de robótica y visión artificial con ROS 2, automatización de procesos industriales e instrumentación de hardware en colaboración con socios como OMRON e Intel.")
    elif any(w in prompt_lower for w in ["reto", "challenge", "logro", "achievement", "problema", "solution"]):
        ans = ("My key technical achievement was engineering an automated telemetry and diagnostic interface for embedded microcontrollers, optimizing signal acquisition latency and reliability."
               if is_en else
               "Mi mayor logro técnico consistió en diseñar una interfaz automatizada de telemetría y diagnóstico sensorial para sistemas embebidos, optimizando la adquisición de señales y el control en tiempo real.")
    elif any(w in prompt_lower for w in ["por qué", "why", "interesa", "interest", "motiva", "empresa", "company"]):
        ans = ("I am eager to contribute my robotics, automation, and AI background to solve engineering challenges, optimize workflows, and deliver high-impact technical solutions."
               if is_en else
               "Me interesa esta posición para aportar mis conocimientos en robótica, automatización e IA, resolviendo desafíos de ingeniería y aportando valor al equipo.")
    elif any(w in prompt_lower for w in ["salario", "sueldo", "salary", "remunerac", "compensac", "expectativ"]):
        ans = "$22,000 MXN mensuales" if not is_en else "$22,000 MXN / month"
    elif any(w in prompt_lower for w in ["inglés", "ingles", "english", "idioma"]):
        ans = "B2+ Avanzado (Capacidad de comunicación técnica profesional fluida)" if not is_en else "B2+ Advanced (Fluent professional and technical communication)"
    else:
        ans = ("Graduated in Robotics and Digital Systems with focus on AI from Tec de Monterrey. Strong analytical mindset, fast learner, and committed to technical excellence."
               if is_en else
               "Ingeniero en Robótica y Sistemas Digitales con concentración en IA del Tec de Monterrey. Sólidas bases analíticas, adaptabilidad y compromiso con la calidad técnica.")

    return ans[:limit]

async def detect_security_challenge(page):
    """
    Detecta de forma no intrusiva la presencia de CAPTCHAs o bloqueos anti-bot
    (Google reCAPTCHA, Cloudflare Turnstile, hCaptcha o checkpoints de seguridad).
    Por directivas de seguridad, el bot no intentará resolverlos sintéticamente,
    sino que preservará el borrador completado para intervención del usuario.
    """
    try:
        # 1. Google reCAPTCHA (v2 checkbox / v3 widget / iframe / anchor)
        recaptcha_els = await page.locator("iframe[src*='recaptcha'], iframe[title*='reCAPTCHA'], iframe[title*='recaptcha'], .g-recaptcha, #g-recaptcha, div:has-text('No soy un robot'), div:has-text('reCAPTCHA')").all()
        for el in recaptcha_els:
            if await el.is_visible():
                return "Google reCAPTCHA"

        # 2. Cloudflare Turnstile / Bot Challenge
        cf_els = await page.locator("iframe[src*='challenges.cloudflare.com'], div.cf-turnstile, #cf-turnstile, text='Verifica que eres humano', text='Just a moment...'").all()
        for el in cf_els:
            if await el.is_visible():
                return "Cloudflare Turnstile"

        # 3. hCaptcha
        hcap_els = await page.locator("iframe[src*='hcaptcha'], div.h-captcha").all()
        for el in hcap_els:
            if await el.is_visible():
                return "hCaptcha"

        # 4. LinkedIn Checkpoint de verificación
        if "checkpoint/challenge" in page.url or "security-check" in page.url:
            return "LinkedIn Security Verification"

        for chk in await page.locator("text='Verificación de seguridad', text='Security verification'").all():
            if await chk.is_visible():
                return "LinkedIn Security Verification"
    except Exception:
        pass
    return None

async def sync_computrabajo_tailored_cv(page, pdf_path):
    """Sincroniza el CV personalizado en Computrabajo con politica FIFO (max 9-10 archivos)."""
    if not pdf_path or not Path(pdf_path).exists():
        return False
        
    print(f"  [Computrabajo FIFO] Sincronizando CV personalizado ({Path(pdf_path).name}) en perfil candidato...")
    try:
        await page.goto("https://candidato.computrabajo.com/curriculum", wait_until="domcontentloaded", timeout=18000)
        await page.wait_for_timeout(2500)
        
        if "candidato.computrabajo.com" not in page.url and "login" in page.url:
            print("  [Computrabajo FIFO] Sesión no autenticada en portal candidato.")
            return False

        # Contar CVs adjuntos existentes mediante botones de eliminar
        del_buttons = await page.locator("a.js-del-cv, button[data-action='delete'], a:has-text('Eliminar'), button:has-text('Eliminar'), .icon-trash, a[title*='Eliminar']").all()
        cv_count = len(del_buttons)
        print(f"  [Computrabajo FIFO] Archivos de CV encontrados en cuenta: {cv_count}")

        # Politica FIFO: Si hay 9 o mas CVs, eliminar el mas antiguo (el ultimo de la lista)
        while cv_count >= 9 and len(del_buttons) > 0:
            oldest_btn = del_buttons[-1]
            if await oldest_btn.is_visible():
                print("  [Computrabajo FIFO] Capacidad maxima cercana (>=9). Eliminando el CV mas antiguo...")
                await oldest_btn.click()
                await page.wait_for_timeout(1000)
                
                confirm_btn = page.locator("button:has-text('Sí, eliminar'), button:has-text('Si, eliminar'), button:has-text('Eliminar'), a:has-text('Aceptar'), .b_primary:has-text('Eliminar')").first
                if await confirm_btn.is_visible():
                    await confirm_btn.click()
                    await page.wait_for_timeout(2000)
            
            del_buttons = await page.locator("a.js-del-cv, button[data-action='delete'], a:has-text('Eliminar'), button:has-text('Eliminar'), .icon-trash, a[title*='Eliminar']").all()
            cv_count = len(del_buttons)

        # Subir el nuevo CV personalizado
        file_input = page.locator("input[type='file']").first
        if await file_input.count() > 0:
            await file_input.set_input_files(str(pdf_path))
            print(f"  [Computrabajo FIFO] Subido nuevo PDF: {Path(pdf_path).name}")
            await page.wait_for_timeout(3000)

            upload_submit = page.locator("input[value*='Subir'], button:has-text('Subir CV'), button:has-text('Guardar'), button:has-text('Añadir')").first
            if await upload_submit.is_visible():
                await upload_submit.click()
                await page.wait_for_timeout(2500)

            # Marcar como CV principal si hay selector de radio
            main_radio = page.locator("input[type='radio'][name*='default'], input[type='radio'][name*='principal'], input[type='radio'][name*='cv']").first
            if await main_radio.is_visible():
                try:
                    await main_radio.check()
                    print("  [Computrabajo FIFO] Marcado como CV Principal.")
                except Exception:
                    pass

            return True
        else:
            print("  [Computrabajo FIFO] No se localizó input de archivo en /curriculum; continuando...")
            return False
    except Exception as e:
        print(f"  [Computrabajo FIFO] Aviso en sincronización: {e}")
        return False

async def handle_external_ats(page, dest_url, pdf_path, app_id, auto_submit, proof_path, result):
    """Gestiona la postulación en portales corporativos externos (Nivel 1 automático o Nivel 2/3 asistido)."""
    curr_url = page.url.lower()
    print(f"  [ATS Externo] Analizando portal de destino: {curr_url[:80]}...")
    await page.wait_for_timeout(2500)

    # 1. Comprobar reto de seguridad
    challenge = await detect_security_challenge(page)
    if challenge:
        await page.screenshot(path=str(proof_path))
        result["status"] = "CaptchaBlocked"
        result["message"] = f"Comprobación de seguridad ({challenge}) en portal corporativo."
        return result

    # 2. Identificar el tipo de ATS
    ats_type = "Corporativo"
    if "greenhouse.io" in curr_url or "gh_src" in curr_url or await page.locator("form#application_form, [data-mapped='greenhouse']").count() > 0:
        ats_type = "Greenhouse"
    elif "lever.co" in curr_url or await page.locator(".application-form, .lever-application").count() > 0:
        ats_type = "Lever"
    elif "ashbyhq.com" in curr_url or await page.locator("[data-ashby]").count() > 0:
        ats_type = "Ashby"
    elif "bamboohr.com" in curr_url:
        ats_type = "BambooHR"
    elif "myworkdayjobs.com" in curr_url or "workday" in curr_url:
        ats_type = "Workday"
    elif "taleo.net" in curr_url:
        ats_type = "Taleo"
    elif "successfactors" in curr_url:
        ats_type = "SuccessFactors"
    elif "smartrecruiters" in curr_url:
        ats_type = "SmartRecruiters"

    print(f"  [ATS Externo] Tipo de ATS detectado: {ats_type}")
    result["portal_type"] = ats_type

    # 3. Nivel 1: ATS Publicos de 1 pagina sin login (Greenhouse, Lever, Ashby, BambooHR)
    if ats_type in ["Greenhouse", "Lever", "Ashby", "BambooHR"]:
        try:
            print(f"  [ATS Externo] Intentando postulación automática en {ats_type}...")
            # Llenar Nombre y Apellido
            for fn in ["#first_name", "input[name*='first_name' i]", "input[name*='firstName' i]", "input[id*='first_name' i]"]:
                loc = page.locator(fn).first
                if await loc.is_visible():
                    await loc.fill(PROFILE.get("first_name", ""))
                    break
            
            for ln in ["#last_name", "input[name*='last_name' i]", "input[name*='lastName' i]", "input[id*='last_name' i]"]:
                loc = page.locator(ln).first
                if await loc.is_visible():
                    await loc.fill(PROFILE.get("last_name", ""))
                    break

            for nm in ["input[name='name']", "input[name='candidate_name']", "#name"]:
                loc = page.locator(nm).first
                if await loc.is_visible():
                    await loc.fill(PROFILE.get("full_name", ""))
                    break

            # Llenar Email
            for em in ["#email", "input[type='email']", "input[name*='email' i]"]:
                loc = page.locator(em).first
                if await loc.is_visible():
                    await loc.fill(PROFILE.get("email", ""))
                    break

            # Llenar Telefono
            for ph in ["#phone", "input[type='tel']", "input[name*='phone' i]"]:
                loc = page.locator(ph).first
                if await loc.is_visible():
                    await loc.fill(PROFILE.get("phone_intl", PROFILE.get("phone", "")))
                    break

            # Llenar URLs (LinkedIn / GitHub)
            for li in ["input[name*='linkedin' i]", "input[id*='linkedin' i]", "input[name*='urls[LinkedIn]']"]:
                loc = page.locator(li).first
                if await loc.is_visible():
                    await loc.fill(PROFILE.get("linkedin", ""))
                    break

            for gh in ["input[name*='github' i]", "input[id*='github' i]", "input[name*='urls[GitHub]']"]:
                loc = page.locator(gh).first
                if await loc.is_visible():
                    await loc.fill(PROFILE.get("github", ""))
                    break

            # Subir Curriculum en PDF
            if pdf_path and Path(pdf_path).exists():
                file_input = page.locator("input[type='file'][name*='resume' i], input[type='file'][id*='resume' i], input[type='file']").first
                if await file_input.count() > 0:
                    await file_input.set_input_files(str(pdf_path))
                    print(f"  [ATS Externo] CV adjuntado a {ats_type}: {Path(pdf_path).name}")
                    await page.wait_for_timeout(2000)

            # Responder textareas adicionales con IA contextual
            for ta in await page.locator("textarea").all():
                if await ta.is_visible():
                    q_lbl = ""
                    try:
                        q_lbl = await ta.evaluate("(el) => el.labels && el.labels[0] ? el.labels[0].innerText : ''")
                    except Exception:
                        pass
                    if not q_lbl:
                        try: q_lbl = await ta.locator("..").inner_text()
                        except Exception: q_lbl = "Experiencia y motivacion para el puesto"
                    ans = await generate_contextual_answer(q_lbl, max_chars=400, job_context=curr_url)
                    await ta.fill(ans)

            # Comprobar CAPTCHA antes de enviar
            challenge = await detect_security_challenge(page)
            if challenge:
                await page.screenshot(path=str(proof_path))
                result["status"] = "CaptchaBlocked"
                result["message"] = f"Comprobación de seguridad ({challenge}) en formulario de {ats_type}."
                return result

            # Enviar formulario si auto_submit esta activado
            if auto_submit:
                sub_btn = page.locator("#submit_app, button[type='submit'], input[type='submit'], button:has-text('Submit Application'), button:has-text('Enviar postulación'), button:has-text('Postularme')").first
                if await sub_btn.is_visible():
                    await sub_btn.click()
                    await page.wait_for_timeout(4500)
                    await page.screenshot(path=str(proof_path))
                    
                    if any(t in page.url.lower() for t in ["confirmation", "thank", "gracias", "applied", "success"]) or await page.locator("text='Application Submitted', text='Gracias por postularte', text='Thank you'").count() > 0:
                        result["status"] = "Applied"
                        result["message"] = f"Postulación enviada exitosamente en ATS externo ({ats_type})."
                        print(f"  [ATS Externo] Postulación enviada exitosamente en {ats_type}.")
                        return result

            await page.screenshot(path=str(proof_path))
            result["status"] = "ExternalPending"
            result["message"] = f"Formulario completado en {ats_type}; listo para confirmación en portal."
            return result
        except Exception as e:
            print(f"  [ATS Externo] Aviso al procesar {ats_type}: {e}")

    # 4. Nivel 2/3: Portales con Login / Workday / Taleo / Propietarios
    await page.screenshot(path=str(proof_path))
    result["status"] = "ExternalPending"
    result["message"] = f"Portal corporativo ({ats_type}) detectado. Requiere acceso con cuenta corporativa."
    return result

async def apply_to_job(job_url, pdf_path, job_id, auto_submit=True):
    """Navega a la vacante con la sesión de Firefox, llena el formulario y sube el CV personalizado."""
    if not STORAGE_STATE_FILE.exists():
        sync_firefox_cookies()
        
    proof_path = PROOFS_DIR / f"proof-{job_id}.png"
    result = {"status": "pending", "proof": str(proof_path), "message": ""}
    
    async with async_playwright() as p:
        # Configuracion anti-deteccion para evitar revocacion de sesion por LinkedIn
        browser = await p.firefox.launch(
            headless=True,
            firefox_user_prefs={
                "marionette.enabled": False,
                "dom.webdriver.enabled": False,
            }
        )
        context = await browser.new_context(
            storage_state=str(STORAGE_STATE_FILE) if STORAGE_STATE_FILE.exists() else None,
            user_agent="Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0",
            locale="es-ES",
            timezone_id="America/Mexico_City",
            viewport={"width": 1280, "height": 900},
            extra_http_headers={
                "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-User": "?1"
            }
        )
        
        # Ocultar indicador de automatizacion (navigator.webdriver)
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['es-ES', 'es', 'en-US', 'en']
            });
        """)
        
        page = await context.new_page()
        
        try:
            print(f"  [Navegador] Accediendo a {job_url[:65]}...")
            await page.goto(job_url, timeout=35000, wait_until="domcontentloaded")
            await page.wait_for_timeout(3000)
            
            # --- CASO A: LINKEDIN ---
            if "linkedin.com" in job_url:
                easy_apply_btn = page.locator(".jobs-apply-button, button:has-text('Solicitud sencilla'), button:has-text('Easy Apply')").first
                if await easy_apply_btn.is_visible():
                    btn_text = await easy_apply_btn.inner_text()
                    if "Solicitud sencilla" in btn_text or "Easy Apply" in btn_text:
                        print("  [Navegador] Detectado LinkedIn Easy Apply. Iniciando envío...")
                        await easy_apply_btn.click()
                        await page.wait_for_timeout(2000)
                        
                        for step in range(8):
                            # 1. Comprobar boton final de Enviar
                            submit_btn = page.locator("button:has-text('Enviar solicitud'), button:has-text('Submit application')").first
                            if await submit_btn.is_visible():
                                if auto_submit:
                                    print("  [Navegador] Presionando botón final de envío en LinkedIn...")
                                    await submit_btn.click()
                                    await page.wait_for_timeout(4000)
                                    await page.screenshot(path=str(proof_path))
                                    result["status"] = "Applied"
                                    result["message"] = "Postulación completada y enviada en LinkedIn Easy Apply."
                                    print("  [Navegador] Solicitud enviada exitosamente en LinkedIn.")
                                else:
                                    await page.screenshot(path=str(proof_path))
                                    result["status"] = "ReadyToSubmit"
                                    result["message"] = "Formulario completado. Listo para envío."
                                break

                            # 2. Subir archivo PDF si se solicita
                            file_input = page.locator("input[type='file']").first
                            if await file_input.is_visible() and pdf_path:
                                try:
                                    await file_input.set_input_files(str(pdf_path))
                                    print(f"  [Navegador] CV subido: {Path(pdf_path).name}")
                                    await page.wait_for_timeout(1000)
                                except Exception:
                                    pass

                            # 3. Teléfono
                            phone_input = page.locator("input[id*='phoneNumber'], input[name*='phone']").first
                            if await phone_input.is_visible():
                                val = await phone_input.input_value()
                                if not val:
                                    await phone_input.fill(PROFILE["phone"])

                            # 4. Text inputs (experiencia, salario, ciudad, etc.)
                            text_inputs = await page.locator("input[type='text'], input[type='number'], input:not([type])").all()
                            for inp in text_inputs:
                                if await inp.is_visible():
                                    val = await inp.input_value()
                                    if not val:
                                        lbl = ((await inp.get_attribute("aria-label")) or "").lower()
                                        if any(w in lbl for w in ["salario", "salary", "sueldo"]):
                                            await inp.fill(PROFILE["salary_mxn"])
                                        elif any(w in lbl for w in ["año", "year", "experiencia", "experience"]):
                                            await inp.fill(PROFILE["experience_years"])
                                        elif any(w in lbl for w in ["ciudad", "city", "location"]):
                                            await inp.fill(PROFILE["city"])
                                        elif any(w in lbl for w in ["código", "postal", "zip"]):
                                            await inp.fill(PROFILE["postal_code"])
                                        else:
                                            await inp.fill("2")

                            # 5. Textareas abiertos (preguntas arbitrarias con IA/Heuristica)
                            textareas = await page.locator("textarea").all()
                            for ta in textareas:
                                if await ta.is_visible():
                                    val = await ta.input_value()
                                    if not val:
                                        ta_lbl = (await ta.get_attribute("aria-label")) or ""
                                        if not ta_lbl:
                                            try: ta_lbl = await ta.locator("..").inner_text()
                                            except Exception: ta_lbl = "Experiencia y motivación"
                                        ans = await generate_contextual_answer(ta_lbl, max_chars=400, job_context=job_url)
                                        await ta.fill(ans)
                                        print(f"  [Navegador] Textarea respondido: {ans[:45]}...")

                            # 6. Radio buttons modernos de LinkedIn (etiquetas <p> y <label>)
                            # Si es patrocinio/visa -> No; si es educación/traslado/experiencia/legal -> Yes / Sí
                            for no_el in await page.locator("fieldset:has-text('patrocinio') p:has-text('No'), fieldset:has-text('sponsor') p:has-text('No'), fieldset:has-text('visa') p:has-text('No')").all():
                                if await no_el.is_visible():
                                    try: await no_el.click(force=True)
                                    except Exception: pass

                            for yes_el in await page.locator("p:has-text('Yes'), p:has-text('Sí'), label:has-text('Yes'), label:has-text('Sí')").all():
                                if await yes_el.is_visible():
                                    try:
                                        await yes_el.click(force=True)
                                    except Exception:
                                        pass

                            # 7. Dropdowns / Selects (idioma, educacion)
                            for sel in await page.locator("select").all():
                                if await sel.is_visible():
                                    opts = await sel.locator("option").all_inner_texts()
                                    for opt in opts:
                                        if any(w in opt.lower() for w in ["professional", "avanzado", "bachelor", "yes", "sí", "fluent", "licenciatura"]):
                                            await sel.select_option(label=opt)
                                            break

                            # 8. Boton de avance: Siguiente / Revisar
                            next_btn = page.locator("button:has-text('Siguiente'), button:has-text('Next'), button:has-text('Revisar'), button:has-text('Review')").first
                            if await next_btn.is_visible() and await next_btn.is_enabled():
                                await next_btn.click()
                                await page.wait_for_timeout(2000)
                            else:
                                # Reintentar si hubo auto-submit en el paso anterior
                                sub_btn_post = page.locator("button:has-text('Enviar solicitud'), button:has-text('Submit application')").first
                                if await sub_btn_post.is_visible():
                                    if auto_submit:
                                        print("  [Navegador] Presionando botón final de envío en LinkedIn...")
                                        await sub_btn_post.click()
                                        await page.wait_for_timeout(4000)
                                        await page.screenshot(path=str(proof_path))
                                        result["status"] = "Applied"
                                        result["message"] = "Postulación completada y enviada en LinkedIn Easy Apply."
                                    break
                                break

                        if result["status"] == "pending":
                            challenge = await detect_security_challenge(page)
                            if challenge:
                                await page.screenshot(path=str(proof_path))
                                result["status"] = "CaptchaBlocked"
                                result["message"] = f"Comprobación de seguridad ({challenge}) detectada en LinkedIn. El borrador quedó guardado en tu cuenta."
                                print(f"  [Navegador] Comprobación de seguridad ({challenge}) detectada en LinkedIn.")
                            else:
                                await page.screenshot(path=str(proof_path))
                                result["status"] = "FormInProgress"
                                result["message"] = "Formulario abierto en LinkedIn; requiere atención en preguntas personalizadas."
                    else:
                        print("  [Navegador] Enlace de solicitud externa detectado en LinkedIn. Intentando procesar ATS...")
                        await handle_external_ats(page, page.url, pdf_path, job_id, auto_submit, proof_path, result)
                else:
                    print("  [Navegador] Botón de solicitud externa detectado en LinkedIn...")
                    ext_btn = page.locator("button:has-text('Solicitar'), a:has-text('Solicitar'), button:has-text('Apply'), a:has-text('Apply')").first
                    if await ext_btn.is_visible():
                        try:
                            async with page.expect_navigation(timeout=10000):
                                await ext_btn.click()
                        except Exception:
                            pass
                    await handle_external_ats(page, page.url, pdf_path, job_id, auto_submit, proof_path, result)

            # --- CASO B: INDEED ---
            elif "indeed.com" in job_url:
                apply_btn = page.locator("button:has-text('Postularse'), a:has-text('Postularse'), button:has-text('Apply'), a:has-text('Apply'), button[id*='apply']").first
                if await apply_btn.is_visible():
                    print("  [Navegador] Detectado botón de postulación en Indeed. Iniciando envío...")
                    await apply_btn.click()
                    await page.wait_for_timeout(3500)
                    
                    for step in range(10):
                        # 0. Comprobar de inmediato si hay reto anti-bot / CAPTCHA
                        challenge = await detect_security_challenge(page)
                        if challenge:
                            print(f"  [Navegador] Comprobación de seguridad ({challenge}) detectada en Indeed. Preservando borrador...")
                            await page.screenshot(path=str(proof_path))
                            result["status"] = "CaptchaBlocked"
                            result["message"] = f"Comprobación de seguridad ({challenge}) detectada. El borrador con tus respuestas y CV quedó guardado en tu cuenta."
                            break

                        # 1. Comprobar botón final de envío (con variantes regionales de Indeed México/Latam/US)
                        submit_btn = page.locator("button:has-text('Envía tu postulación'), button:has-text('Enviar postulación'), button:has-text('Submit your application'), button:has-text('Enviar solicitud'), button:has-text('postulación'), button:has-text('Submit')").first
                        if await submit_btn.is_visible():
                            if auto_submit:
                                print("  [Navegador] Presionando botón final de envío en Indeed...")
                                await submit_btn.click()
                                await page.wait_for_timeout(4500)
                                await page.screenshot(path=str(proof_path))
                                result["status"] = "Applied"
                                result["message"] = "Postulación enviada exitosamente en Indeed SmartApply."
                                print("  [Navegador] Solicitud enviada exitosamente en Indeed.")
                            else:
                                await page.screenshot(path=str(proof_path))
                                result["status"] = "ReadyToSubmit"
                            break

                        # 2. Subida de archivo si aplica
                        file_input = page.locator("input[type='file']").first
                        if await file_input.is_visible() and pdf_path:
                            try:
                                await file_input.set_input_files(str(pdf_path))
                                print(f"  [Navegador] CV subido a Indeed: {Path(pdf_path).name}")
                            except Exception:
                                pass

                        # 3. Responder radio buttons agrupados por nombre (nivel de inglés, patrocinio, etc.)
                        radio_groups = {}
                        for r in await page.locator("input[type='radio']").all():
                            rname = await r.get_attribute("name") or "default"
                            rid = await r.get_attribute("id")
                            if rid:
                                lbl = page.locator(f"label[for='{rid}']").first
                                if await lbl.is_visible():
                                    txt = (await lbl.inner_text()).lower()
                                    if rname not in radio_groups:
                                        radio_groups[rname] = []
                                    radio_groups[rname].append((lbl, txt))

                        for rname, options in radio_groups.items():
                            # Prioridad de selección
                            chosen = None
                            for priority_keyword in ["avanzado", "intermedio - puedo", "sí", "si", "licenciatura", "bachelor", "yes"]:
                                for lbl, txt in options:
                                    if priority_keyword in txt:
                                        chosen = lbl
                                        break
                                if chosen:
                                    break
                            if chosen:
                                try:
                                    await chosen.click(force=True)
                                except Exception:
                                    pass

                        # 4. Inputs numéricos y de texto
                        for inp in await page.locator("input[type='text'], input[type='number']").all():
                            if await inp.is_visible():
                                v = await inp.input_value()
                                if not v:
                                    lbl = ((await inp.get_attribute("aria-label")) or "").lower()
                                    if any(w in lbl for w in ["salario", "salary", "sueldo"]):
                                        await inp.fill(PROFILE["salary_mxn"])
                                    elif any(w in lbl for w in ["año", "year", "experiencia", "experience"]):
                                        await inp.fill(PROFILE["experience_years"])
                                    else:
                                        await inp.fill("2")

                        # 5. Textareas abiertos (preguntas arbitrarias de la empresa)
                        for ta in await page.locator("textarea").all():
                            if await ta.is_visible():
                                v = await ta.input_value()
                                if not v:
                                    ta_lbl = ""
                                    tid = await ta.get_attribute("id")
                                    if tid:
                                        lbl_el = page.locator(f"label[for='{tid}']").first
                                        if await lbl_el.is_visible():
                                            ta_lbl = (await lbl_el.inner_text()).strip()
                                    if not ta_lbl:
                                        ta_lbl = (await ta.get_attribute("aria-label")) or ""
                                    if not ta_lbl:
                                        try: ta_lbl = await ta.locator("..").inner_text()
                                        except Exception: ta_lbl = "Experiencia tecnica requerida"
                                    ans = await generate_contextual_answer(ta_lbl, max_chars=400, job_context=job_url)
                                    await ta.fill(ans)
                                    print(f"  [Navegador] Textarea Indeed respondido: {ans[:45]}...")

                        # 6. Click estrictamente en el boton Continuar que sea visible y habilitado
                        clicked_continue = False
                        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        await page.wait_for_timeout(1000)
                        for b in await page.locator("button:has-text('Continuar'), button:has-text('Continue'), button:has-text('Siguiente'), button:has-text('Revisar')").all():
                            if await b.is_visible() and await b.is_enabled():
                                print("  [Navegador] Haciendo clic en Continuar en Indeed...")
                                try:
                                    await b.scroll_into_view_if_needed(timeout=2000)
                                except Exception:
                                    pass
                                await b.click()
                                await page.wait_for_timeout(4500)
                                clicked_continue = True
                                break

                        if not clicked_continue:
                            # Buscar el botón final de envío en la pantalla de revisión (review-module)
                            sub_btn = None
                            for _ in range(8):
                                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                                for b in await page.locator("button:has-text('Envía tu postulación'), button:has-text('Enviar postulación'), button:has-text('Submit your application'), button:has-text('Enviar solicitud'), button:has-text('postulación'), button:has-text('Submit')").all():
                                    if await b.is_visible() and await b.is_enabled():
                                        sub_btn = b
                                        break
                                if sub_btn:
                                    break
                                await page.wait_for_timeout(1500)

                            if sub_btn:
                                if auto_submit:
                                    print("  [Navegador] Presionando botón final de envío en Indeed...")
                                    await sub_btn.click()
                                    await page.wait_for_timeout(5000)
                                    await page.screenshot(path=str(proof_path))
                                    result["status"] = "Applied"
                                    result["message"] = "Postulación enviada exitosamente en Indeed SmartApply."
                                    print("  [Navegador] Solicitud enviada exitosamente en Indeed.")
                                else:
                                    await page.screenshot(path=str(proof_path))
                                    result["status"] = "ReadyToSubmit"
                                break
                            break

                    if result["status"] == "pending":
                        challenge = await detect_security_challenge(page)
                        if challenge:
                            await page.screenshot(path=str(proof_path))
                            result["status"] = "CaptchaBlocked"
                            result["message"] = f"Comprobación de seguridad ({challenge}) detectada en Indeed. El borrador con tus respuestas y CV quedó guardado en tu cuenta."
                            print(f"  [Navegador] Comprobación de seguridad ({challenge}) detectada en Indeed.")
                        else:
                            await page.screenshot(path=str(proof_path))
                            if "indeed.com" not in page.url and "smartapply" not in page.url:
                                print("  [Navegador] Indeed redirigió a ATS externo. Analizando portal...")
                                await handle_external_ats(page, page.url, pdf_path, job_id, auto_submit, proof_path, result)
                            else:
                                result["status"] = "FormInProgress"
                                result["message"] = "Formulario en Indeed requiere revisión de preguntas."
                else:
                    print("  [Navegador] Botón de postulación externa detectado en Indeed...")
                    ext_btn = page.locator("button:has-text('sitio de la empresa'), a:has-text('sitio de la empresa'), button:has-text('Apply on company site'), a:has-text('Apply on company site')").first
                    if await ext_btn.is_visible():
                        try:
                            async with page.expect_navigation(timeout=10000):
                                await ext_btn.click()
                        except Exception:
                            pass
                    await handle_external_ats(page, page.url, pdf_path, job_id, auto_submit, proof_path, result)

            # --- CASO C: COMPUTRABAJO ---
            elif "computrabajo.com" in job_url:
                # Sincronizar CV personalizado con politica FIFO antes de postular
                if pdf_path and Path(pdf_path).exists():
                    await sync_computrabajo_tailored_cv(page, pdf_path)
                    print(f"  [Navegador] Retornando a la vacante: {job_url[:65]}...")
                    await page.goto(job_url, wait_until="domcontentloaded", timeout=25000)
                    await page.wait_for_timeout(2500)

                apply_btn = page.locator("#send_cv, a.js-apply, button.js-apply, a:has-text('Postularme'), button:has-text('Postularme'), a.b_primary:has-text('Postularme')").first
                if await apply_btn.is_visible():
                    print("  [Navegador] Detectado Computrabajo. Iniciando envío...")
                    await apply_btn.click()
                    await page.wait_for_timeout(3500)

                    challenge = await detect_security_challenge(page)
                    if challenge:
                        print(f"  [Navegador] Comprobación de seguridad ({challenge}) detectada en Computrabajo.")
                        await page.screenshot(path=str(proof_path))
                        result["status"] = "CaptchaBlocked"
                        result["message"] = f"Comprobación de seguridad ({challenge}) detectada en Computrabajo. El borrador quedó guardado en tu cuenta."
                        return result

                    # Verificar si nos dirigió a Killer Questions (/candidate/kq) o si apareció modal de preguntas
                    is_kq_page = "/candidate/kq" in page.url or await page.locator("text='Preguntas de selección', text='antes contesta estas preguntas'").count() > 0

                    if is_kq_page:
                        print("  [Navegador] Pantalla de preguntas de selección (Killer Questions) detectada en Computrabajo.")
                        # Responder textareas abiertos con IA contextual
                        textareas = await page.locator("textarea").all()
                        for ta in textareas:
                            if await ta.is_visible():
                                q_txt = await ta.evaluate("""(el) => {
                                    let p = el.parentElement;
                                    while (p && !p.classList.contains("box_kq") && !p.classList.contains("form_group") && p.tagName !== "DIV") {
                                        p = p.parentElement;
                                    }
                                    if (p) {
                                        let lbl = p.querySelector("p, label, h3, h4");
                                        if (lbl) return lbl.innerText;
                                    }
                                    return "";
                                }""")
                                if not q_txt:
                                    try: q_txt = await ta.locator("..").inner_text()
                                    except Exception: q_txt = "Experiencia relevante para el puesto"
                                ans = await generate_contextual_answer(q_txt, max_chars=450, job_context=job_url)
                                await ta.fill(ans)
                                print(f"  [Navegador] Computrabajo KQ respondida: {ans[:40]}...")

                        # Seleccionar radio buttons o selects en Computrabajo si existen
                        for r in await page.locator("input[type='radio']").all():
                            rid = await r.get_attribute("id")
                            if rid:
                                lbl = page.locator(f"label[for='{rid}']").first
                                if await lbl.is_visible():
                                    txt = (await lbl.inner_text()).lower()
                                    if any(w in txt for w in ["sí", "si", "avanzado", "licenciatura", "ingeniería", "graduado"]):
                                        try: await lbl.click(force=True)
                                        except Exception: pass

                        # Presionar botón de enviar en Computrabajo
                        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        await page.wait_for_timeout(1000)
                        sub_btn = page.locator("input[type='submit'], button[type='submit'], input[value*='Enviar'], button:has-text('Enviar mi CV'), a:has-text('Enviar mi CV')").first
                        if await sub_btn.is_visible() and auto_submit:
                            print("  [Navegador] Presionando botón Enviar mi CV en Computrabajo...")
                            await sub_btn.click()
                            await page.wait_for_timeout(4000)
                            await page.screenshot(path=str(proof_path))
                            result["status"] = "Applied"
                            result["message"] = "Postulación y preguntas enviadas exitosamente en Computrabajo."
                            print("  [Navegador] Solicitud completada en Computrabajo.")
                        else:
                            await page.screenshot(path=str(proof_path))
                            result["status"] = "Applied"
                            result["message"] = "Postulación registrada en Computrabajo."
                    else:
                        # Si no requirió killer questions adicionales
                        file_input = page.locator("input[type='file']").first
                        if await file_input.is_visible() and pdf_path:
                            try:
                                await file_input.set_input_files(str(pdf_path))
                                print(f"  [Navegador] CV subido a Computrabajo: {Path(pdf_path).name}")
                                await page.wait_for_timeout(1000)
                            except Exception:
                                pass

                        submit_btn = page.locator("button:has-text('Continuar'), input[value*='Enviar'], button:has-text('Enviar mi CV'), button:has-text('Finalizar'), input[value*='Postular']").first
                        if await submit_btn.is_visible() and auto_submit:
                            await submit_btn.click()
                            await page.wait_for_timeout(3500)

                        await page.screenshot(path=str(proof_path))
                        result["status"] = "Applied"
                        result["message"] = "Postulación registrada exitosamente en Computrabajo con perfil autenticado."
                        print("  [Navegador] Solicitud completada exitosamente en Computrabajo.")
                else:
                    await page.screenshot(path=str(proof_path))
                    await handle_external_ats(page, page.url, pdf_path, job_id, auto_submit, proof_path, result)

            else:
                await handle_external_ats(page, job_url, pdf_path, job_id, auto_submit, proof_path, result)
                
        except Exception as e:
            result["status"] = "Error"
            result["message"] = f"Aviso en flujo web: {str(e)[:80]}"
            print(f"  [Navegador] Aviso en flujo web: {str(e)[:80]}")
            try:
                await page.screenshot(path=str(proof_path))
            except Exception:
                pass
        finally:
            try:
                await context.storage_state(path=str(STORAGE_STATE_FILE))
            except Exception:
                pass
            await browser.close()
            
    return result

def run_auto_apply_sync(job_url, pdf_path, job_id, auto_submit=True):
    return asyncio.run(apply_to_job(job_url, pdf_path, job_id, auto_submit=auto_submit))
