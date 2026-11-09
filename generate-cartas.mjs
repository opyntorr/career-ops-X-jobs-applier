import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidate = {
  name: "Christian Omar Payán Torróntegui",
  contact: "Zapopan, Jalisco | 669 100 3234 | omarpayant@gmail.com | linkedin.com/in/omarpayant | github.com/opyntorr",
  credentials: "Ingeniería en Robótica y Sistemas Digitales (9no Semestre) — Tecnológico de Monterrey"
};

const letters = [
  {
    num: "210",
    slug: "algonova-python",
    company: "Algonova IT School",
    role: "Profesor de TI (Python Online)",
    recipient: "Comité de Selección / Coordinación Académica — Algonova IT School",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de Algonova IT School,",
      "Les escribo con gran entusiasmo para presentar mi postulación a la posición de Profesor de TI enfocado en Python. Como estudiante de noveno semestre de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey, cuento con una sólida formación en programación estructurada y orientada a objetos en Python, respaldada por experiencia docente frente a grupo impartiendo pensamiento computacional, lógica algorítmica y robótica a niños y jóvenes en la escuela primaria Juan Rulfo.",
      "Mi metodología se basa en el aprendizaje activo y la gamificación, traduciendo conceptos abstractos como bucles, condicionales y estructuras de datos en proyectos visuales e intuitivos. Cuento con conectividad de alta velocidad, equipo de cómputo robusto y disponibilidad total los fines de semana en la zona horaria de México para guiar sesiones dinámicas e inspiradoras.",
      "Agradezco de antemano su atención y quedo a su entera disposición para conversar sobre cómo mi perfil puede enriquecer la experiencia formativa de sus alumnos."
    ]
  },
  {
    num: "211",
    slug: "morpaz-jewelry",
    company: "Morpaz Joyería",
    role: "3D Jewelry Designer",
    recipient: "Ulises Moreno / Dirección de Diseño — Morpaz Joyería",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de Morpaz Joyería,",
      "Me pongo en contacto con ustedes para manifestar mi interés en la vacante de Diseñador 3D de Joyería. Cursando el noveno semestre de Ingeniería en Robótica en el Tecnológico de Monterrey y habiendo acreditado la concentración profesional en Joyería Contemporánea, combino el rigor de la ingeniería con la sensibilidad artística del modelado fino.",
      "Cuento con dominio comprobable en Rhino 3D, MatrixGold, escultura digital en Blender y renderizado fotorrealista en KeyShot, así como experiencia práctica en la preparación y calibración de resinas calcinables mediante tecnologías SLA/DLP. Tuve el honor de ser seleccionado para exhibir piezas de diseño en New York City Jewelry Week (NYCJW 2025), lo cual respalda mi capacidad para desarrollar colecciones de alto valor estético, optimizadas para microfundición a la cera perdida y ensamble final.",
      "Resido en la Zona Metropolitana de Guadalajara con total disponibilidad presencial. Agradezco su tiempo y adjunto a mi CV el portafolio técnico para su revisión."
    ]
  },
  {
    num: "212",
    slug: "semper-altius-docente",
    company: "Red de Colegios Semper Altius",
    role: "Docente de Tecnología Educativa",
    recipient: "Dirección Académica / Coordinación de Innovación — Red de Colegios Semper Altius",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimadas autoridades académicas de Semper Altius,",
      "Por medio de la presente manifiesto mi interés en integrarme a su equipo docente como profesor de Tecnología Educativa. Mi formación en Ingeniería en Robótica y Sistemas Digitales en el Tec de Monterrey, aunada a mi experiencia impartiendo talleres de robótica y pensamiento computacional a nivel escolar, me permite vincular la vanguardia tecnológica con una pedagogía cercana, ética y orientada a valores.",
      "He diseñado e implementado proyectos educativos integradores basados en metodologías activas (PBL y Design Thinking), utilizando plataformas como Arduino, Scratch y modelado 3D para potenciar la curiosidad, el razonamiento lógico y el trabajo colaborativo en el aula. Domino la integración de herramientas como Google Workspace for Education y plataformas LMS para el seguimiento y evaluación formativa.",
      "Será un honor contribuir a la formación integral y tecnológica de sus estudiantes en Guadalajara. Quedo a su disposición para concertar una entrevista."
    ]
  },
  {
    num: "213",
    slug: "trendyjobs-diseno",
    company: "Trendyjobs de México",
    role: "Ingeniero de Diseño",
    recipient: "Departamento de Recursos Humanos y Operaciones — Trendyjobs de México",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de reclutamiento,",
      "Presento mi candidatura formal a la vacante de Ingeniero de Diseño para proyectos industriales en acero inoxidable y acabados sanitarios. Mi perfil como estudiante avanzado de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey integra un sólido conocimiento en diseño mecánico computarizado y procesos de transformación metalmecánica.",
      "Tengo amplia experiencia en modelado de piezas complejas y ensambles en SOLIDWORKS, generación de planos de fabricación 2D en AutoCAD bajo normativa GD&T, estructuración de listas de materiales (BOM) y acompañamiento directo en planta para procesos de corte láser, doblez y maquinado. Asimismo, manejo la documentación de cambios de ingeniería y planos As-Built, asegurando que cada desarrollo sea plenamente fabricable e instalable. Cuento con licencia de conducir vigente y disponibilidad inmediata para trabajar en La Calma.",
      "Agradezco su atención y quedo a su disposición para profundizar en los alcances de mi experiencia técnica."
    ]
  },
  {
    num: "214",
    slug: "trendyjobs-mecanico",
    company: "Trendyjobs de México",
    role: "Diseñador Mecánico",
    recipient: "Gerencia de Ingeniería — Trendyjobs de México",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de selección,",
      "Me dirijo a ustedes con el propósito de postularme a la posición de Diseñador Mecánico. Mi formación en ingeniería en el Tec de Monterrey me ha dotado de un perfil técnico enfocado en transformar requerimientos de producción y de clientes en soluciones mecánicas funcionales, robustas y debidamente estandarizadas.",
      "Dominio la suite de SOLIDWORKS para diseño paramétrico, análisis de interferencias y tolerancias geométricas (GD&T), así como AutoCAD para dibujo 2D y despiece de lámina metálica. Cuento con experiencia directa en taller y piso de manufactura, coordinando con técnicos de soldadura, dobladoras y centros de maquinado para asegurar el cumplimiento exacto de las especificaciones de diseño. Poseo licencia de manejo vigente y total disposición para integrarme de manera presencial en sus instalaciones de Zapopan.",
      "Agradezco la consideración de mi perfil y espero la oportunidad de presentarles proyectos previos desarrollados en mi trayectoria."
    ]
  },
  {
    num: "215",
    slug: "mtc-parts-ia",
    company: "MTC PARTS",
    role: "Desarrollador de Automatización e IA",
    recipient: "Célula de Inteligencia Artificial y TI — MTC PARTS",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de Sistemas de MTC PARTS,",
      "Es un placer presentar mi postulación para formar parte de su célula de Inteligencia Artificial y TI. Como estudiante de noveno semestre de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey, me he especializado en la automatización de procesos empresariales y la integración de arquitecturas de IA aplicada a la eficiencia operativa.",
      "Poseo experiencia en el desarrollo de flujos automatizados con Microsoft Power Automate, integrando Teams, Lists, Outlook y SharePoint con bases de datos SQL corporativas. Asimismo, desarrollo scripts en Python para extracción de texto estructurado de PDFs mediante modelos de lenguaje (APIs de OpenAI y Gemini), optimizando tareas manuales complejas y habilitando tableros analíticos en Power BI para la toma de decisiones.",
      "Me entusiasma colaborar en la digitalización y optimización de la cadena de suministro de refacciones de MTC PARTS en Guadalajara. Quedo atento a su llamada."
    ]
  },
  {
    num: "216",
    slug: "toka-datos",
    company: "Toka Internacional",
    role: "Ingeniero de Datos",
    recipient: "Gerencia de Ingeniería de Datos y Arquitectura TI — Toka Internacional",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de Recursos Humanos y Tecnología de Toka,",
      "Por medio de la presente expongo mi interés en unirme a Toka Internacional como Ingeniero de Datos en sus oficinas de Puerta de Hierro. Mi perfil de ingeniería en el Tec de Monterrey se complementa con un enfoque riguroso en el diseño, desarrollo e implementación de pipelines ETL/ELT para entornos transaccionales y de medios de pago.",
      "Cuento con experiencia en la construcción de flujos de datos distribuidos utilizando Apache Spark (PySpark) y entornos Databricks bajo arquitectura Medallion (Bronze, Silver, Gold). Domino el diseño de esquemas dimensionales, optimización de consultas complejas en SQL Server y PostgreSQL, y la incorporación de pruebas automatizadas de integridad y calidad de datos para garantizar la consistencia analítica requerida por el sector financiero.",
      "Me motiva aportar soluciones que refuercen la gobernanza y disponibilidad de sus datos a gran escala. Agradezco su tiempo y quedo a su disposición para una entrevista técnica."
    ]
  },
  {
    num: "217",
    slug: "smart-bamboo-bi",
    company: "Smart Bamboo",
    role: "Analista de Datos y BI",
    recipient: "Dirección de TI y Operaciones — Smart Bamboo",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de Smart Bamboo,",
      "Me pongo en contacto con ustedes para presentar mi candidatura a la posición de Analista de Datos y BI en Zapopan. Mi objetivo profesional es transformar datos operativos y comerciales en activos estratégicos confiables que faciliten la toma de decisiones directivas mediante modelos sólidos de Business Intelligence.",
      "Poseo experiencia en el diseño y mantenimiento de modelos dimensionales para Data Warehouses (esquemas estrella y copo de nieve), extracción y transformación de datos mediante SQL y Python, y desarrollo de dashboards ejecutivos interactivos en Metabase y Power BI. Asimismo, he desarrollado modelos de segmentación de clientes (RFM / LTV) y herramientas predictivas de demanda para retail, asegurando calidad, gobierno y veracidad de la información en todo momento.",
      "Será un gusto aportar mi visión analítica al crecimiento y rentabilidad de Smart Bamboo. Agradezco su consideración."
    ]
  },
  {
    num: "218",
    slug: "toka-negocio",
    company: "Toka Internacional",
    role: "Analista de Negocio (Tecnología)",
    recipient: "Coordinación de Gestión de Proyectos y Análisis TI — Toka Internacional",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de Toka Internacional,",
      "Les escribo para postularme al rol de Analista de Negocio enfocado en proyectos de tecnología en sus instalaciones de Zapopan. Gracias a mi formación en ingeniería en el Tecnológico de Monterrey, poseo una visión integral que me permite fungir como un puente efectivo entre los requerimientos estratégicos de negocio y los equipos de desarrollo de software.",
      "Cuento con experiencia en el levantamiento formal de requerimientos funcionales y no funcionales, modelado de procesos bajo estándar BPMN 2.0 (Bizagi y Draw.io), y redacción de historias de usuario con criterios de aceptación claros bajo marcos ágiles Scrum y Kanban. Domino la priorización de backlogs en Jira y la interlocución continua con stakeholders para garantizar entregas tecnológicas de alto impacto y en tiempo.",
      "Quedo a su disposición para conversar sobre cómo mi perfil técnico-analítico agregará valor a los proyectos de medios de pago de la compañía."
    ]
  },
  {
    num: "219",
    slug: "toka-analitica",
    company: "Toka Internacional",
    role: "Ingeniero de Analítica",
    recipient: "Gerencia de Analítica y Conciliación Financiera — Toka Internacional",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de Selección de Toka,",
      "Presento formalmente mi postulación para integrarme como Ingeniero de Analítica en su sede de Puerta de Hierro. Me apasiona resolver desafíos analíticos en entornos transaccionales de alto volumen, garantizando la cuadratura, reconciliación y trazabilidad de los flujos de dinero e información.",
      "Poseo un dominio avanzado de SQL para consultas de agregación analítica (funciones de ventana, CTEs y optimización de planes de ejecución), además del uso de Python para auditoría de datos y detección de patrones atípicos que puedan derivar en fugas financieras o inconsistencias operativas. Trabajo de forma metódica bajo estándares rigurosos de control interno para asegurar la veracidad de los reportes operativos de cara a la dirección.",
      "Agradezco su atención a esta postulación y espero la oportunidad de participar en el proceso de evaluación técnica."
    ]
  },
  {
    num: "220",
    slug: "betvip-fraude",
    company: "BetVIP",
    role: "Analista de Prevención de Fraude y KYC",
    recipient: "Jonathan Alvarado / Departamento de Riesgo y Cumplimiento — BetVIP",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado Jonathan y equipo de BetVIP,",
      "Me pongo en contacto con ustedes con el objetivo de postularme a la vacante de Analista de Prevención de Fraude y KYC en modalidad híbrida en Guadalajara. Mi sólida base matemática e ingenieril en el Tec de Monterrey me proporciona un agudo sentido de análisis crítico y atención meticulosa a patrones anómalos.",
      "Tengo experiencia en validación y cotejo de identidad digital (KYC) conforme a normativas de prevención de lavado de dinero (AML), análisis de historiales transaccionales sospechosos y auditoría de solicitudes de retiro. Utilizo SQL y Python para el filtrado masivo y correlación de eventos, identificando multicuentas, anomalías de geolocalización o uso indebido de bonos para salvaguardar la rentabilidad y reputación operativa de la plataforma.",
      "Agradezco de antemano la revisión de mi perfil y quedo disponible para coordinar una entrevista en cuanto lo estimen oportuno."
    ]
  },
  {
    num: "221",
    slug: "mepiel-comercial",
    company: "M.E. Piel",
    role: "Analista de Datos e Inteligencia Comercial",
    recipient: "Dirección Comercial y Operaciones — M.E. Piel",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de M.E. Piel,",
      "Es un gusto saludarles para manifestar mi interés en la posición de Analista de Datos e Inteligencia Comercial en sus oficinas de Providencia. Mi formación en ingeniería me capacita para transformar grandes volúmenes de datos comerciales y de ventas en diagnósticos claros que optimicen la rentabilidad y el posicionamiento de mercado.",
      "Cuento con experiencia en el desarrollo de tableros ejecutivos en Power BI utilizando modelos relacionales y fórmulas DAX avanzadas para el seguimiento de ventas, inventario y margen de utilidad. Además, poseo destreza en la extracción y limpieza de datos provenientes de sistemas ERP/CRM mediante SQL y Python, automatizando reportes semanales y mensuales para Dirección.",
      "Agradezco de antemano su atención a mi perfil y quedo a su disposición para agendar una entrevista presencial."
    ]
  },
  {
    num: "222",
    slug: "proissa-datos",
    company: "PROISSA",
    role: "Analista de Datos",
    recipient: "Gerencia de TI y Operaciones — PROISSA",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de Selección de PROISSA,",
      "Me dirijo a ustedes para presentar mi candidatura al puesto de Analista de Datos en Zapopan. Mi perfil analítico y formativo en el Tec de Monterrey está orientado al modelado de datos, la automatización de procesos de reporte y la entrega de información oportuna para áreas operativas y gerenciales.",
      "Poseo experiencia práctica en la extracción y limpieza de datos mediante consultas estructuradas en SQL (MySQL y SQL Server), análisis exploratorio con scripts en Python y visualización interactiva de indicadores clave (KPIs) en Power BI. Mi enfoque de trabajo garantiza la integridad, congruencia y consistencia de las fuentes de información, apoyando la toma de decisiones informada.",
      "Será muy grato colaborar en el fortalecimiento de la infraestructura analítica de PROISSA. Quedo a su disposición para coordinar una entrevista."
    ]
  },
  {
    num: "223",
    slug: "flex-diseno3d",
    company: "Flex LTD",
    role: "Técnico de Diseño 3D (Metalmecánica)",
    recipient: "Departamento de Ingeniería y Diseño — Flex LTD (Campus Guadalajara Norte)",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de Reclutamiento de Flex,",
      "Por medio de la presente pongo a su consideración mi candidatura a la posición de Técnico de Diseño 3D. Como estudiante de noveno semestre de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey, combino destrezas mecánicas con conocimientos sólidos en hardware y manufactura electrónica.",
      "Manejo fluidamente SOLIDWORKS para el modelado de componentes mecánicos, ensambles y diseño de fixtures para ensamble y prueba. Cuento con formación en lectura e interpretación de archivos Gerber, esquemáticos electrónicos, leyes de circuitos y análisis de logs de prueba de ingeniería. Adicionalmente, tengo amplia experiencia práctica en manufactura aditiva con plásticos de ingeniería y conocimientos en procesos de maquinado convencional y CNC.",
      "Me entusiasma integrarme al equipo de manufactura avanzada de Flex en Guadalajara. Agradezco la revisión de mi perfil."
    ]
  },
  {
    num: "224",
    slug: "laboratorio-dental",
    company: "Universidad Plantel Guadalajara",
    role: "Encargado(a) de Laboratorio Digital Dental",
    recipient: "Coordinación de Odontología / Dirección Académica — Universidad Plantel Guadalajara",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimadas autoridades de la Facultad de Odontología,",
      "Les escribo con gran entusiasmo para postularme a la posición de Encargado del Laboratorio Digital Dental. Como alumno de ingeniería en el Tec de Monterrey, cuento con una amplia trayectoria técnica en tecnologías CAD/CAM, modelado tridimensional y manufactura aditiva de alta precisión.",
      "Tengo experiencia directa en la calibración y operación de impresoras 3D de resina (SLA/DLP/LCD), procesamiento y reparación de archivos STL de escáneres intraorales y de mesa, y postprocesamiento químico y fotocurado de piezas anatómicas y guías de trabajo. Asimismo, domino el control de inventario de insumos (resinas biomédicas, alcohol isopropílico, refacciones), protocolos de mantenimiento preventivo y la asesoría técnica a profesores y alumnos en el entorno de laboratorio.",
      "Agradezco su atención y me pongo a su entera disposición para una entrevista presencial en el campus."
    ]
  },
  {
    num: "225",
    slug: "manufactura-aditiva-medica",
    company: "PowerBell / InMateriis / Prothesia",
    role: "Ingeniero de Diseño y Manufactura Aditiva Médica",
    recipient: "Dirección de Operaciones / Recursos Humanos — PowerBell / InMateriis / Prothesia",
    date: "5 de septiembre de 2026",
    paragraphs: [
      "Estimado equipo de Dirección e Innovación,",
      "Presento con gran entusiasmo mi candidatura para integrarme a sus proyectos de diseño biomecánico y manufactura aditiva especializada. Como estudiante de noveno semestre de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey, he enfocado mi desarrollo técnico en la convergencia entre diseño CAD avanzado, manufactura aditiva y aplicaciones clínicas.",
      "He liderado proyectos de ingeniería médica aplicada, como el diseño y fabricación de un simulador anatómico (phantom torácico) combinando polímeros de ingeniería (PETG-CF, TPU) y resinas biocompatibles bajo criterios de manufacturabilidad (DFM/DFA). Comprendo los fundamentos regulatorios bajo ISO 13485 y NOM-241, así como los requerimientos de trazabilidad y acabado superficial para implantes y dispositivos de uso médico.",
      "Me apasiona su liderazgo en tecnologías aditivas y biomateriales en Guadalajara. Agradezco su tiempo y quedo a su entera disposición para una reunión técnica."
    ]
  }
];

function generateHTML(letter) {
  const paragraphsHtml = letter.paragraphs.map(p => `    <p>${p}</p>`).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Carta de Presentacion — ${candidate.name} — ${letter.company}</title>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-variant-ligatures: none;
  }
  @page {
    size: letter;
    margin: 0.8in 0.8in 0.8in 0.8in;
  }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.5;
    color: #222222;
    background: #ffffff;
  }
  .header {
    border-bottom: 1.5pt solid #1a365d;
    padding-bottom: 8pt;
    margin-bottom: 16pt;
  }
  .name {
    font-size: 15pt;
    font-weight: 700;
    color: #1a365d;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    margin-bottom: 3pt;
  }
  .contact {
    font-size: 8.5pt;
    color: #4a5568;
    line-height: 1.3;
  }
  .meta-table {
    width: 100%;
    margin-bottom: 14pt;
    font-size: 9.5pt;
  }
  .meta-table td {
    padding: 2pt 0;
    vertical-align: top;
  }
  .meta-label {
    width: 70pt;
    font-weight: 700;
    color: #2d3748;
  }
  .meta-value {
    color: #1a202c;
  }
  .content {
    margin-bottom: 18pt;
    text-align: justify;
  }
  p {
    margin-bottom: 10pt;
  }
  .signature {
    margin-top: 18pt;
  }
  .sign-name {
    font-weight: 700;
    color: #1a365d;
  }
  .sign-title {
    font-size: 9pt;
    color: #4a5568;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="name">${candidate.name}</div>
    <div class="contact">${candidate.contact}</div>
    <div class="contact" style="margin-top: 2pt;">${candidate.credentials}</div>
  </div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Fecha:</td>
      <td class="meta-value">${letter.date}</td>
    </tr>
    <tr>
      <td class="meta-label">Para:</td>
      <td class="meta-value">${letter.recipient}</td>
    </tr>
    <tr>
      <td class="meta-label">Asunto:</td>
      <td class="meta-value"><strong>Candidatura — ${letter.role}</strong></td>
    </tr>
  </table>

  <div class="content">
${paragraphsHtml}
  </div>

  <div class="signature">
    <p style="margin-bottom: 4pt;">Atentamente,</p>
    <div class="sign-name">${candidate.name}</div>
    <div class="sign-title">Ingeniería en Robótica y Sistemas Digitales | Tecnológico de Monterrey</div>
  </div>
</body>
</html>`;
}

async function run() {
  console.log("Iniciando generación de cartas PDF...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (const letter of letters) {
    const filenameBase = `carta-${letter.num}-${letter.slug}`;
    const htmlPath = resolve(__dirname, 'output', 'cartas', `${filenameBase}.html`);
    const pdfPath = resolve(__dirname, 'output', 'cartas', `${filenameBase}.pdf`);

    const htmlContent = generateHTML(letter);
    writeFileSync(htmlPath, htmlContent, 'utf-8');

    const page = await context.newPage();
    await page.setContent(htmlContent, { waitUntil: 'load' });
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.8in',
        right: '0.8in',
        bottom: '0.8in',
        left: '0.8in'
      }
    });
    await page.close();
    console.log(`[OK] Generada: ${filenameBase}.pdf`);
  }

  await browser.close();
  console.log("Todas las cartas han sido generadas en PDF correctamente.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
