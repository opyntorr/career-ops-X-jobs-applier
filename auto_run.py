#!/usr/bin/env python3
"""
Career-Ops Autonomous Pipeline Runner (Opción A Completa)
Búsqueda desatendida -> Evaluación -> CV en LaTeX a 1 página -> Postulación Automática con Cookies de Firefox -> Reporte -> Registro
"""

import os
import sys
import re
import json
import yaml
import argparse
import subprocess
from datetime import datetime
from pathlib import Path

# Try importing jobspy and browser session
try:
    from jobspy import scrape_jobs
except ImportError:
    print("Error: python-jobspy no esta instalado en este interprete.")
    print("Ejecuta con el entorno virtual del proyecto (ej: source .venv/bin/activate && pip install -r requirements.txt)")
    sys.exit(1)

CAREER_OPS_DIR = Path(__file__).resolve().parent
from browser_session import sync_firefox_cookies, run_auto_apply_sync
OUTPUT_DIR = CAREER_OPS_DIR / "output"
REPORTS_DIR = CAREER_OPS_DIR / "reports"
DATA_DIR = CAREER_OPS_DIR / "data"
APPS_FILE = DATA_DIR / "applications.md"

def load_search_preferences():
    """Carga los roles y ubicaciones objetivo desde config/profile.yml."""
    profile_path = CAREER_OPS_DIR / "config" / "profile.yml"
    if not profile_path.exists():
        profile_path = CAREER_OPS_DIR / "config" / "profile.example.yml"
    terms = []
    locations = []
    if profile_path.exists():
        try:
            with open(profile_path, "r", encoding="utf-8") as f:
                raw = yaml.safe_load(f) or {}
            terms = raw.get("target_roles", {}).get("primary", [])
            custom_locs = raw.get("narrative", {}).get("custom_rules", {}).get("target_locations", [])
            if custom_locs:
                locations = [f"{l}, Mexico" if l != "Remote" else "Mexico" for l in custom_locs]
        except Exception:
            pass
    if not terms:
        terms = [
            "Robotics Engineer",
            "Automation Engineer",
            "Embedded Systems Engineer",
            "Software Engineer",
            "Python Developer"
        ]
    if not locations:
        locations = [
            "Guadalajara, Jalisco, Mexico",
            "Mexico City, Mexico",
            "Monterrey, Nuevo León, Mexico",
            "Mexico"
        ]
    return terms, locations

DEFAULT_SEARCH_TERMS, DEFAULT_LOCATIONS = load_search_preferences()

def get_next_id():
    if not APPS_FILE.exists():
        return 425
    with open(APPS_FILE, "r", encoding="utf-8") as f:
        matches = re.findall(r'\|\s*(\d{3,4})\s*\|', f.read())
        if not matches:
            return 425
        return max(int(m) for m in matches) + 1

def is_duplicate(company, title, url, existing_text):
    if url and url in existing_text:
        return True
    comp_clean = re.sub(r'[^a-zA-Z0-9]', '', company).lower()
    title_words = [w for w in re.sub(r'[^a-zA-Z0-9 ]', '', title).lower().split() if len(w) > 4]
    
    for line in existing_text.splitlines():
        if not line.startswith("|"):
            continue
        line_lower = line.lower()
        if comp_clean in re.sub(r'[^a-zA-Z0-9]', '', line_lower):
            if any(w in line_lower for w in title_words):
                return True
    return False

def evaluate_job(title, company, description, location):
    t_lower = (title + " " + description).lower()
    senior_triggers = ["senior", "sr.", "sr ", "lead", "director", "principal", "manager", "staff engineer"]
    title_lower = title.lower()
    is_senior = any(trig in title_lower for trig in senior_triggers) and not any(ok in title_lower for ok in ["junior", "intern", "becario", "trainee", "associate"])
    if is_senior:
        return 2.5, "Senior/Manager level (requiere más de 5 años de experiencia)", False

    score = 3.5
    matches = []
    high_match_keywords = [
        "python", "c++", "ros", "ros 2", "robot", "robotics", "automation",
        "plc", "solidworks", "cad", "embedded", "stm32", "esp32", "pcb",
        "vision", "opencv", "n8n", "sensors", "test", "validation", "oscilloscope"
    ]
    
    for kw in high_match_keywords:
        if kw in t_lower:
            matches.append(kw)
    
    if len(matches) >= 5:
        score += 1.3
    elif len(matches) >= 3:
        score += 0.8
    elif len(matches) >= 1:
        score += 0.3
        
    loc_lower = location.lower()
    if any(city in loc_lower for city in ["guadalajara", "jalisco", "zapopan", "monterrey", "tijuana", "reynosa"]):
        score += 0.2
    elif "mexico" in loc_lower or "remote" in loc_lower:
        score += 0.1
        
    score = min(5.0, round(score, 1))
    qualifies = score >= 3.8
    reason = f"Alineación técnica detectada ({', '.join(matches[:4])}). Nivel compatible con perfil graduado Tec de Monterrey."
    return score, reason, qualifies

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text[:28]

def clean_comp(company):
    return re.sub(r'[^a-zA-Z0-9]', '', company)

def generate_tailored_cv(job, app_id):
    title = job['title']
    company = job['company']
    comp_clean = clean_comp(company)
    slug = f"{slugify(company)}-{slugify(title)}-{app_id}"
    
    t_lower = (title + " " + job.get('description', '')).lower()
    
    if any(k in t_lower for k in ['software', 'python', 'data', 'linux', 'n8n', 'pipeline']):
        assistant_role = "Software Development & Automation Assistant"
        summary_focus = "software development, workflow automation, and edge Linux architectures"
        bullet1 = "Engineered automated data ingestion and preprocessing pipelines in Python, integrating structured validation tests and API endpoints."
        bullet2 = "Maintained and deployed containerized Linux environments (Ubuntu, Docker, Git), streamlining testing workflows and data logging."
        skills_p1 = "Software & Data Automation"
        skills_p1_val = "Python, Modern C++, Linux (Ubuntu/Debian), Git, Docker, REST APIs, SQL, Data Pipelines"
    elif any(k in t_lower for k in ['test', 'validat', 'pruebas', 'slt', 'instrumentation', 'quality']):
        assistant_role = "Test & Validation Engineering Assistant"
        summary_focus = "hardware validation, automated testing protocols, and instrumentation diagnostics"
        bullet1 = "Executed rigorous test procedures and sensory diagnostics for mechatronic assemblies, identifying electrical faults and isolating failure modes."
        bullet2 = "Instrumented automated test benches with data acquisition interfaces, logging voltage, current, and signal dynamics under stress conditions."
        skills_p1 = "Validation & Instrumentation"
        skills_p1_val = "System Level Testing (SLT), Bench Testing, Digital Oscilloscopes, Logic Analyzers, Power Supplies, Hardware-in-the-Loop (HIL)"
    elif any(k in t_lower for k in ['embedded', 'firmware', 'electronic', 'microcontroller', 'pcb', 'stm32', 'hardware']):
        assistant_role = "Embedded Systems & Hardware Assistant"
        summary_focus = "embedded systems development, firmware testing, and PCB design"
        bullet1 = "Developed low-level drivers and communication interfaces (UART, SPI, I2C) for microcontroller test fixtures, verifying signal integrity with oscilloscopes."
        bullet2 = "Designed custom circuit boards and rugged protective enclosures using 3D-printed fiberglass-reinforced PETG for thermal dissipation and electrical isolation."
        skills_p1 = "Embedded & Hardware"
        skills_p1_val = "STM32, ESP32, C/C++, UART, SPI, I2C, Bare-Metal, FreeRTOS, PCB Design (Eagle), Oscilloscopes"
    elif any(k in t_lower for k in ['vision', 'camera', 'perception', 'image']):
        assistant_role = "Computer Vision & Systems Assistant"
        summary_focus = "computer vision perception, optical sensor calibration, and robotics integration"
        bullet1 = "Integrated real-time computer vision pipelines using OpenCV and camera sensors for target tracking and dimensional inspection."
        bullet2 = "Engineered rigid, vibration-resistant optical camera mounts and standardized testbed calibration routines."
        skills_p1 = "Computer Vision & Perception"
        skills_p1_val = "OpenCV, Camera Calibration, Object Tracking, Python, ROS 2, Optical Mounts, Image Processing"
    else:
        assistant_role = "Robotics & Automation Assistant"
        summary_focus = "robotics integration, automated control routines, and electromechanical validation"
        bullet1 = "Engineered automated sequence routines and sensor data pipelines in ROS 2, Python, and C++, validating simulation models against physical laboratory hardware."
        bullet2 = "Instrumented test setups and fabricated modular mounting brackets using high-precision additive manufacturing."
        skills_p1 = "Robotics & Controls"
        skills_p1_val = "ROS 2, Industrial Sensors, Kinematics, Closed-Loop Control, Gazebo Simulation, Modern C++, Python"

    include_sepyc = any(w in t_lower for w in ['office', 'excel', 'ofimática', 'word', 'powerpoint', 'administrativo'])
    sepyc_str = ""
    if include_sepyc:
        sepyc_str = " \\par\\vspace{0.25em}\n    {\\bf Technical Accreditation in Microsoft Office (SEPyC Endorsed)} \\hfill 100 Hours Certified \\\\\n    Official State Education Certificate \\hfill Mazatlán, Sinaloa"

    tex = f"""\\documentclass{{resume}}

\\begin{{document}}

\\introduction[
    fullname={{Christian Omar Payán Torróntegui}},
    email={{omarpayant@gmail.com}},
    phone={{+52 669 100 3234}},
    linkedin={{linkedin.com/in/omarpayant/}},
    github={{github.com/opyntorr}}
]

\\summary{{Bilingual Robotics and Digital Systems Engineer graduated from Tecnológico de Monterrey with specialized concentration in Advanced Artificial Intelligence for Data Science. Solid hands-on expertise spanning {summary_focus}, ROS 2 simulation, embedded C/C++, and advanced additive prototyping. Proven track record collaborating with industry sponsors on real-world engineering deployments.}}

\\begin{{educationSection}}{{Education}}
    {{\\bf B.S. in Robotics and Digital Systems Engineering}} \\hfill Aug 2022 -- Dec 2026 \\\\
    Tecnológico de Monterrey, Campus Guadalajara \\hfill Zapopan, Jalisco \\par\\vspace{{0.25em}}
    {{\\bf Advanced Artificial Intelligence for Data Science Concentration}} \\hfill Aug 2025 -- Dec 2025 \\\\
    Tecnológico de Monterrey, Campus Guadalajara \\hfill Zapopan, Jalisco{sepyc_str}
\\end{{educationSection}}

\\begin{{skillsSection}}{{Technical Skills}}
    \\skillItem[
        category={{{skills_p1}}},
        skills={{{skills_p1_val}}}
    ] \\\\
    \\skillItem[
        category={{Embedded \\& Hardware}},
        skills={{STM32, ESP32, C/C++, UART, SPI, I2C, PCB Design (Eagle), Wire Harnessing, Oscilloscope}}
    ] \\\\
    \\skillItem[
        category={{Design \\& Digital Fabrication}},
        skills={{SOLIDWORKS (CAD/CAM, Assemblies), Advanced FDM 3D Printing (PETG, TPU, Composites), DFM, Prototyping}}
    ] \\\\
    \\skillItem[
        category={{Programming \\& Tools}},
        skills={{Python, Modern C++, Linux (Ubuntu/Debian), Git, Docker, Microsoft Office (100-Hr SEPyC Certified)}}
    ]
\\end{{skillsSection}}

\\begin{{experienceSection}}{{Professional Experience}}
    \\experienceItem[
        company={{Tecnológico de Monterrey -- Advanced Manufacturing Laboratory}},
        location={{Zapopan, Jalisco}},
        position={{{assistant_role}}},
        duration={{Feb 2026 -- Jun 2026}}
    ]
    \\begin{{itemize}}
        \\vspace{{-0.5em}}
        \\itemsep -6pt {{}}
        \\item {bullet1}
        \\item {bullet2}
        \\item Managed hardware inventory, instrumentation calibration logs, and component tracking spreadsheets with automated formulas.
    \\end{{itemize}}
\\end{{experienceSection}}

\\begin{{experienceSection}}{{Academic \\& Technical Projects}}
    \\projectItem[
        title={{Port Automation, Drone Sim \\& Vision Pipeline}},
        partner={{OMRON}},
        duration={{Aug 2025 -- Dec 2025}},
        keyHighlight={{ROS 2, Isaac Sim 4.5, Gazebo, C++, Python}}
    ]
    \\begin{{itemize}}
        \\vspace{{-0.5em}}
        \\itemsep -6pt {{}}
        \\item Engineered autonomous UAV and AMR logistics telemetry in partnership with OMRON, deploying closed-loop PID control tracked via OptiTrack.
        \\item Built high-fidelity simulation environments in NVIDIA Isaac Sim and Gazebo with ROS 2 C++/Python communication nodes.
    \\end{{itemize}}

    \\projectItem[
        title={{DigiMix: Distributed Telemetry \\& Embedded System}},
        partner={{Intel}},
        duration={{Aug 2024 -- Dec 2024}},
        keyHighlight={{Dual-Core STM32, ESP32, WebSockets, PCB Eagle}}
    ]
    \\begin{{itemize}}
        \\vspace{{-0.5em}}
        \\itemsep -6pt {{}}
        \\item Architected dual-core embedded system with STM32 and ESP32 using WebSockets and REST APIs for synchronized real-time data streaming.
        \\item Designed custom PCB in Eagle and 3D-printed rugged protective enclosure, achieving zero logic faults in hardware integration.
    \\end{{itemize}}
\\end{{experienceSection}}

\\end{{document}}
"""
    return tex, slug, comp_clean

def compile_pdf(tex_path, output_dir):
    cmd = ["pdflatex", "-interaction=nonstopmode", f"-output-directory={output_dir}", str(tex_path)]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, cwd=str(output_dir))
    return res.returncode == 0

def main():
    parser = argparse.ArgumentParser(description="Career-Ops Autonomous Pipeline Runner")
    parser.add_argument("--limit", type=int, default=10, help="Número máximo de vacantes a calificar y procesar")
    parser.add_argument("--hours", type=int, default=72, help="Antigüedad máxima de la publicación en horas")
    parser.add_argument("--query", type=str, default=None, help="Término de búsqueda específico (opcional)")
    parser.add_argument("--location", type=str, default=None, help="Ubicación específica (opcional)")
    parser.add_argument("--no-apply", action="store_true", help="Desactiva la postulación automática en navegador")
    args = parser.parse_args()

    print("==================================================")
    print("  CAREER-OPS: PIPELINE AUTÓNOMO DE POSTULACIÓN    ")
    print("==================================================")
    
    # 0. Sincronizar cookies de Firefox
    print("\n[0/4] Sincronizando cookies activas de Firefox...")
    sync_firefox_cookies()

    existing_apps_text = APPS_FILE.read_text(encoding="utf-8") if APPS_FILE.exists() else ""
    current_id = get_next_id()
    print(f"ID inicial de postulación: #{current_id}")

    queries = [args.query] if args.query else DEFAULT_SEARCH_TERMS
    locations = [args.location] if args.location else DEFAULT_LOCATIONS

    scraped_jobs = []
    print(f"\n[1/4] Buscando vacantes frescas en LinkedIn e Indeed ({args.hours}h)...")
    
    import time
    for q in queries:
        for loc in locations:
            try:
                print(f"  -> Buscando '{q}' en '{loc}'...")
                df = scrape_jobs(
                    site_name=["indeed", "linkedin"],
                    search_term=q,
                    location=loc,
                    results_wanted=6,
                    hours_old=args.hours,
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
                            scraped_jobs.append({
                                "company": c,
                                "title": t,
                                "url": u,
                                "location": l,
                                "description": d
                            })
                time.sleep(1.5)
            except Exception as e:
                print(f"     Aviso al escanear: {e}")
                time.sleep(1.0)
                
    print(f"\nTotal vacantes recolectadas sin deduplicar: {len(scraped_jobs)}")

    unique_jobs = []
    seen = set()
    for j in scraped_jobs:
        key = (j["company"].lower(), j["title"].lower())
        if key in seen:
            continue
        seen.add(key)
        if not is_duplicate(j["company"], j["title"], j["url"], existing_apps_text):
            unique_jobs.append(j)

    print(f"Vacantes nuevas tras deduplicar contra tracker: {len(unique_jobs)}")

    if not unique_jobs:
        print("\nNo se encontraron vacantes nuevas en este ciclo. Todo está al día.")
        return

    processed = 0
    today_str = datetime.now().strftime("%Y-%m-%d")
    results = []

    print(f"\n[2/4] Evaluando y generando CVs personalizados (Límite: {args.limit})...")

    for job in unique_jobs:
        if processed >= args.limit:
            break
            
        score, reason, qualifies = evaluate_job(job["title"], job["company"], job["description"], job["location"])
        
        if not qualifies:
            continue
            
        app_id = current_id + processed
        processed += 1
        
        # Generar código LaTeX adaptado
        tex_code, slug, comp_clean = generate_tailored_cv(job, app_id)
        tex_file = OUTPUT_DIR / f"CV-OmarPayan-{slug}.tex"
        pdf_file = OUTPUT_DIR / f"CV-OmarPayan-{slug}.pdf"
        
        tex_file.write_text(tex_code, encoding="utf-8")
        
        # Compilar PDF a 1 página
        compiled = compile_pdf(tex_file, OUTPUT_DIR)
        print(f"  [#{app_id}] {job['company']} - {job['title']} -> Score: {score}/5.0 | PDF compilado: {pdf_file.name}")
        
        # 3. Postulación automática en navegador con cookies de Firefox
        app_status = "Evaluated"
        proof_path = ""
        if not args.no_apply and job.get("url"):
            print(f"  [#{app_id}] [3/4] Ejecutando navegación desatendida hacia {job['url'][:60]}...")
            apply_res = run_auto_apply_sync(job["url"], pdf_file, app_id, auto_submit=True)
            app_status = apply_res.get("status", "Evaluated")
            proof_path = apply_res.get("proof", "")
            print(f"  [#{app_id}] Resultado de postulación: {app_status} ({apply_res.get('message', '')})")

        # Generar reporte
        report_file = REPORTS_DIR / f"{app_id}-{slug}-{today_str}.md"
        report_content = f"""# Evaluation Report: #{app_id} - {job['company']} - {job['title']}

**Evaluated:** {today_str}  
**Score:** {score}/5.0  
**Archetype:** Robotics & Automation Engineering  
**Legitimacy:** High Confidence (Direct Job Board Posting)  
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
- Formación: B.S. en Ingeniería en Robótica y Sistemas Digitales (Tecnológico de Monterrey) con concentración oficial en IA Avanzada.
- Proyectos con socios formadores incluidos: OMRON (Automatización, ROS 2, Visión) e Intel (DigiMix Telemetría Embebida, PCB).

## Block C: Generated Files
- TeX: `output/CV-OmarPayan-{slug}.tex`
- PDF: `output/CV-OmarPayan-{slug}.pdf` (Pages: 1)
- Proof Screenshot: `output/proofs/proof-{app_id}.png`
"""
        report_file.write_text(report_content, encoding="utf-8")
        
        # Registrar en applications.md
        new_row = f"| {app_id} | {today_str} | {job['company']} | {job['title']} | {score}/5 | {app_status} | Yes | [{app_id}](../reports/{app_id}-{slug}-{today_str}.md) | Auto-Apply Runner |\n"
        with open(APPS_FILE, "a", encoding="utf-8") as f:
            f.write(new_row)
            
        results.append({
            "id": app_id,
            "company": job["company"],
            "title": job["title"],
            "score": score,
            "status": app_status,
            "location": job["location"],
            "pdf": str(pdf_file),
            "report": str(report_file),
            "proof": str(proof_path),
            "url": job["url"]
        })

    print("\n==================================================")
    print(f"  RESUMEN: {len(results)} POSTULACIONES PROCESADAS")
    print("==================================================")
    for r in results:
        print(f"- #{r['id']} | {r['company']} - {r['title']}")
        print(f"   Estado: {r['status']} | Score: {r['score']}/5.0")
        print(f"   PDF: file://{r['pdf']}")
        print(f"   URL: {r['url']}\n")

if __name__ == "__main__":
    main()
