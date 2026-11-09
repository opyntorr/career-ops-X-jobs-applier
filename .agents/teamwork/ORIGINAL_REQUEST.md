# Original User Request

## 2026-10-16T05:21:36Z

Evaluar 5 ofertas laborales en Mazatlán analizando su compatibilidad técnica con el perfil del candidato, generar reportes de evaluación en Markdown y compilar CVs especializados en LaTeX (formato Harvard, 1 página estricta) para los roles viables, registrando todo en el tracker de postulaciones.

Working directory: /home/opyntorr/career-ops
Integrity mode: development

## Job Postings to Process

1. **Promotor Temporal de Tecnología** (Liverpool Mazatlán) - Grupo Cosmic ($9,400/mes)
2. **Promotor de Telefonía** - Atento Servicios SA de CV ($9,583/mes + comisiones)
3. **Auxiliar de Taller Laboratorio Óptico** - Ópticas Ver de Verdad (Zona Dorada, Mazatlán)
4. **Técnico de Impresoras** (A domicilio) - Tintec ($9,600/mes + comisiones)
5. **Técnico Promotor Máquinas Vending** - Grupo Cosmic ($14,024/mes + viáticos)

## Requirements

### R1. Evaluación y Reporte de Ajuste Técnico
Evaluar cada una de las 5 ofertas laborales contra `cv.md`, `config/profile.yml` y `modes/_profile.md`.
- Priorizar y profundizar en los roles técnicos: Técnico de Impresoras (Tintec), Técnico Promotor Vending (Grupo Cosmic) y Auxiliar de Taller Óptico (Ver de Verdad).
- Evaluar también los roles de promotoría y ventas retail (Liverpool y Atento) señalando la discrepancia con el perfil de ingeniería.
- Reservar números de reporte válidos con `node reserve-report-num.mjs --count 5` y redactar cada reporte en `reports/{###}-{company-slug}-{date}.md` con bloques de análisis, score y legitimidad.

### R2. Generación de CVs Personalizados en LaTeX / PDF
Para los puestos técnicos viables (y los que resulten procedentes tras la evaluación):
- Generar archivos `.tex` en español basados en la plantilla Harvard de `resume.cls` (o redefiniendo macros para evitar textos en inglés como Summary, Graduating o Relevant coursework).
- Incluir únicamente experiencias y proyectos 100% verídicos respaldados por `cv.md` (como el soporte y mantenimiento en el Laboratorio de Manufactura Avanzada, ensamble de mini PCs, inventario en Excel, y el proyecto de replicación de red de Campus Cuernavaca en Cisco Packet Tracer). Prohibido inventar puestos o atribuirse proyectos ajenos.
- Si la vacante requiere Excel u ofimática, incluir explícitamente el curso de 100 horas acreditado en bachillerato.
- Compilar cada PDF utilizando `node generate-latex.mjs <tex> <pdf>`.

### R3. Actualización del Tracker
Actualizar `data/applications.md` agregando las filas correspondientes con número de reporte, fecha, empresa, rol, puntuación obtenida, status (`Evaluated`), ruta del PDF, ruta del reporte y notas clave.

### R4. Restricciones Críticas del Sistema
- Prohibido el uso de emojis en cualquier archivo de código, reporte, log o mensaje.
- Prohibido ejecutar `colcon build`.
- Todo el trabajo debe confinarse al workspace `/home/opyntorr/career-ops`.

## Acceptance Criteria

### Verificación y Entregables
- [ ] Existen los 5 reportes de evaluación en `reports/` con sus secciones completas y puntajes justificados.
- [ ] Los CVs generados en `output/*.tex` compilan con salida exitosa (`node generate-latex.mjs`) sin errores de LaTeX.
- [ ] Cada PDF generado (`output/*.pdf`) tiene estrictamente 1 página (verificado con `pdfinfo <archivo.pdf> | grep Pages`).
- [ ] No existen textos en inglés provenientes de macros residuales (`Summary`, `Graduating`, `Relevant coursework:`) en los CVs en español.
- [ ] Ningún archivo generado contiene emojis.
- [ ] Las 5 entradas están registradas con enlaces válidos en `data/applications.md`.


## 2026-10-16T06:16:15Z

Procesar y evaluar las 30 ofertas laborales contenidas en `/home/opyntorr/Downloads/puestosIndeed.pdf`. El candidato está dispuesto a reubicarse en cualquier parte del país ante una oferta laboral, por lo que NO se debe descartar ningún puesto por ubicación geográfica. Calificar todas las vacantes, generar reportes de evaluación en `reports/` y compilar CVs en LaTeX/PDF (1 página Harvard estricta) para los roles viables, respetando el idioma de cada vacante (inglés para las publicadas en inglés, español para las publicadas en español).

Working directory: /home/opyntorr/career-ops
Integrity mode: development

## Scope: 30 Job Postings from puestosIndeed.pdf

1. **Video Processor** — Emerge (Remote / Mexico)
2. **Auxiliar Mecatrónico** — CONSTRUOBRA (Mazatlán, Sin. $3,000/sem)
3. **AI Vision Specialist Jr** — TotalEnergies (Remote / Mexico)
4. **Ingeniero/a de Visión por Computadora Junior** — OMNIA SECURITA (Polanco, CDMX $15k-$18k)
5. **AI/ML Engineer – Computer Vision & Robotics** — Nurvai (Guadalajara, Jal. $40k-$45k)
6. **Remote Robot Operator (Teleoperation)** — Sunscreen Inc. (Remote / Mexico)
7. **Programador de robot** — KATCON (Santa Catarina, N.L. — $17k-$21k/mes)
8. **Ingeniero Electrónico Jr. / Desarrollo IoT** — WASSER CONTROL (Morelos — $9k-$9.2k/mes)
9. **Practicante de IoT** — Denso México (Guanajuato / México)
10. **Ingeniero Mecatrónico** — SOLMIN TECH (Coahuila — $15k-$20.7k/mes)
11. **Soporte Técnico Especializado** — Pegasus Control (Guadalajara / Tlaquepaque)
12. **Ingeniero/a de Industria 4.0** — Bosch Group (Guadalajara)
13. **Industrial IoT (IIoT) Engineer** — Mattel (Nuevo León)
14. **Embedded Software Engineer (Edge Platform)** — Aptiv plc (México / Remoto)
15. **Analista en Inteligencia Artificial Junior** — Master Loyalty Group (Home Office)
16. **Jr. Software Engineer - MX** — Neumo Holdings LLC (Guadalajara / Home Office)
17. **Data Scientist (AI)** — Acute Talent (Home Office)
18. **AI Developer** — Datamatic Software (Home Office)
19. **Arquitecto de pruebas automatizadas** — CONTPAQi (Guadalajara)
20. **Becario de Automatización (Excel)** — CONSEDE (Home Office)
21. **Analista de Datos / BI Analyst** — Master Loyalty Group (Home Office)
22. **(DBO) Desarrollador en BBDD** — Master Loyalty Group (Home Office)
23. **DevOps Engineer** — MojoHire (Guadalajara / Remote)
24. **Jr. Software Engineer** — Neumo Holdings LLC (Guadalajara / Remote)
25. **Body Design and Release Engineer Jr** — ALTEN MÉXICO (Automotriz)
26. **Data Analyst** — Amwest Funding México (Mazatlán)
27. **Staff en Desarrollo y Automatización con IA** — KPMG México (Medio tiempo)
28. **Desarrollador de Escritorio** — Grupo Panamá (Mazatlán, $20,000/mes)
29. **Backend Developer** — Amwest Funding México (Marina Mazatlán, $22k-$25k/mes)
30. **Técnico de Soporte en Campo** — GRUPO PISSA (Sinaloa, $500-$900/día)

## Requirements

### R1. Extracción y Evaluación Técnica Exhaustiva
- Evaluar y calificar cada una de las 30 vacantes contra el Master CV consolidado (`cv.md`) y el perfil técnico de `config/profile.yml`.
- **Política de Reubicación Total:** NO descartar ninguna vacante por ubicación geográfica; el candidato está 100% abierto a mudarse a cualquier estado/ciudad de la República Mexicana por trabajo. Calificar cada vacante en base a su ajuste técnico, retos de ingeniería y compensación.
- Para cada vacante evaluada, redactar un reporte completo en `reports/{###}-{company-slug}-{date}.md` con bloques A-G, puntuación justificada y legitimidad.
- Reservar rangos de reportes oficiales de manera ordenada con `node reserve-report-num.mjs --count N`.

### R2. Regla Estricta de Idioma y Generación de CVs Especializados
- **Vacantes publicadas en inglés:** Generar CV en inglés técnico/profesional con formato Harvard.
- **Vacantes publicadas en español:** Generar CV en español sin textos residuales de macros en inglés (`Summary`, `Graduating`, `Relevant coursework:`).
- Generar archivos `.tex` y compilar a `.pdf` en `output/` para todos los roles con score viable (>= 3.0) o de interés técnico.
- Cada PDF debe cumplir estrictamente con el formato Harvard de **1 sola página** (verificado con `pdfinfo`).
- Veracidad absoluta: solo experiencias y proyectos reales del Master CV (`cv.md`), sin fabricar información.

### R3. Sincronización en el Tracker
- Actualizar `data/applications.md` con las nuevas filas de postulaciones evaluadas, registrando número de reporte, fecha, empresa, rol, score, status, ruta de PDF y notas clave.

### R4. Restricciones del Sistema
- Prohibido el uso de emojis en cualquier archivo de reporte, código, salida o log.
- Prohibido ejecutar `colcon build`.
- Confinar operaciones al workspace `/home/opyntorr/career-ops`.

## Acceptance Criteria

### Entregables y Verificación
- [ ] Reportes generados en `reports/` para cada una de las 30 vacantes del documento.
- [ ] Para cada rol viable (score >= 3.0), existe un archivo `.tex` y un `.pdf` en `output/` compilado sin errores con `node generate-latex.mjs`.
- [ ] Cada PDF generado tiene exactamente 1 página (verificado con `pdfinfo <archivo> | grep Pages`).
- [ ] Se respeta el idioma: ofertas en inglés tienen CV en inglés, ofertas en español tienen CV en español.
- [ ] Ningún archivo generado contiene emojis.
- [ ] Todas las oportunidades procesadas están registradas en `data/applications.md` con enlaces válidos.


## 2026-10-18T05:29:39Z

Evaluar y procesar las 14 ofertas laborales provenientes de la bolsa de trabajo del Tecnológico de Monterrey, analizar la compatibilidad técnica de cada rol frente al perfil del candidato (`cv.md`), redactar reportes de evaluación en `reports/` y compilar CVs especializados en LaTeX/PDF (formato Harvard, 1 página estricta) para todas las vacantes viables, registrando cada postulación en `data/applications.md`.

Working directory: /home/opyntorr/career-ops
Integrity mode: development

## Scope: 14 Job Postings (Bolsa de Trabajo Tec de Monterrey)

1. **Analista de Datos** — GC CORPORATIVO (Guadalajara, JAL. ID: 149201. Python, SQL, Power BI DAX, automatización)
2. **Analista Jr. de Innovación, Procesos e IA** — HayCash (CDMX. $25k-$30k/mes. ID: 149172. Python, SQL, Power BI, Make, Zapier, IA)
3. **Product Operation Analyst - Junior | Remote** — Abril Barrientos / Talento (Remoto México. $35k-$40k/mes. ID: 149069. Jira, SaaS B2B, AI/automatización, inglés avanzado)
4. **Ingeniero de diseño de máquinas CNC** — Insofos/Daptta (Guadalajara, JAL. $25k-$27k/mes. ID: 148915. Mecatrónica, CAD 3D, gabinetes eléctricos, simulación)
5. **AI Product Engineer** — Baltra (CDMX. $30k-$60k/mes. ID: 148877. Agentes de voz y texto IA, LLMs, reclutamiento automatizado)
6. **Ingeniero Mecatrónico de Procesos** — Empresa de Cuidado Personal (Tlaxcala / Varias. $25k-$30k/mes. ID: 148853. Mecatrónica/electrónica, recién egresados)
7. **Desarrollador de código con Inteligencia Artificial** — Empleador Confidencial (Monterrey, NLE. $25k-$30k/mes. ID: 148762. Agentes IA, Python, LLMs, RAG, ERP)
8. **Digital Power Engineer (Fresh Graduate)** — Huawei (Querétaro. $22k-$25k/mes. ID: 148702. UPS, CRAC, baterías, centros de datos, inglés fluido)
9. **Computer Science Intern** — Caterpillar (Ciénega de Flores, NLE. ID: 148409. Gemelos digitales, IA aplicada, Python, C++, React, PyTorch, RAG)
10. **Core Network Support Engineer (Fresh Graduate)** — Huawei (Querétaro. $20k-$25k/mes. ID: 148341. 4G, 5G, telecomunicaciones, redes, soporte técnico)
11. **Wireless Support Engineer (Fresh Graduate)** — Huawei (Querétaro. $20k-$25k/mes. ID: 148340. Redes inalámbricas, GSM, LTE, 5G, telecomunicaciones)
12. **Revenue Systems Lead (Automation & Data)** — Empleador Confidencial (CDMX. $90k-$115k/mes. ID: 148204. CRM Zoho/Salesforce, SQL, SaaS, e-commerce)
13. **Ingeniero en Sistemas** — Greenprint (Santa Catarina, NLE. $20k-$25k/mes. ID: 148009. Automatización de procesos, IA, integración ERP/APIs, scripts)
14. **Consultor de Operaciones y Transformación Digital** — London Consulting Group (México / Campus Monterrey. ID: 148314. IA Generativa, agentes LLMs, n8n/Make, Power Automate, Python, APIs REST, Power BI)

## Requirements

### R1. Extracción y Evaluación Técnica Exhaustiva
- Evaluar cada una de las 14 vacantes contra el Master CV consolidado (`cv.md`) y el perfil técnico en `config/profile.yml`.
- Calificar el ajuste técnico, la competitividad salarial y los requerimientos formativos de cada posición.
- Para cada vacante evaluada, redactar un reporte completo en `reports/{###}-{company-slug}-{date}.md` con bloques A-G, puntuación justificada y legitimidad.
- Reservar los números oficiales de reporte de forma ordenada usando `node reserve-report-num.mjs --count 14`.

### R2. Regla Estricta de Idioma y Generación de CVs Especializados
- **Vacantes publicadas en inglés** (e.g. Caterpillar, Huawei, Baltra, Abril Barrientos, Insofos): Generar CV en inglés técnico/profesional con formato Harvard.
- **Vacantes publicadas en español** (e.g. GC Corporativo, HayCash, Greenprint, Desarrollador IA Mty, Ing. Procesos, London Consulting Group): Generar CV en español sin textos residuales de macros en inglés (`Summary`, `Graduating`, `Relevant coursework:`).
- Generar archivos `.tex` y compilar a `.pdf` en `output/` para todos los roles con score viable (>= 3.0) o de interés técnico.
- Cada PDF debe cumplir estrictamente con el formato Harvard de **1 sola página** (verificado con `pdfinfo <archivo.pdf> | grep Pages`).
- Veracidad absoluta: solo experiencias y proyectos reales del Master CV (`cv.md`), sin fabricar información.

### R3. Sincronización en el Tracker
- Actualizar `data/applications.md` agregando las nuevas filas evaluadas, registrando número de reporte, fecha, empresa, rol, puntuación obtenida, status (`Evaluated`), ruta del PDF, ruta del reporte y notas clave.

### R4. Restricciones Críticas del Sistema
- Prohibido el uso de emojis en cualquier archivo de reporte, código, salida, log o mensaje.
- Prohibido ejecutar `colcon build`.
- Confinar operaciones al workspace `/home/opyntorr/career-ops`.

## Acceptance Criteria

### Entregables y Verificación
- [ ] Existen los reportes de evaluación en `reports/` para cada una de las 14 vacantes.
- [ ] Para cada rol viable (score >= 3.0), existe un archivo `.tex` y un `.pdf` en `output/` compilado sin errores con `node generate-latex.mjs`.
- [ ] Cada PDF generado tiene exactamente 1 página (verificado con `pdfinfo <archivo.pdf> | grep Pages`).
- [ ] Se respeta el idioma: ofertas en inglés tienen CV en inglés, ofertas en español tienen CV en español.
- [ ] Ningún archivo generado contiene emojis.
- [ ] Todas las 14 oportunidades procesadas están registradas en `data/applications.md` con enlaces válidos.
