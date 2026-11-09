import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidate = {
  name: "Christian Omar Payán Torróntegui",
  contact: "Mazatlán, Sinaloa | 669 100 3234 | omarpayant@gmail.com | linkedin.com/in/omarpayant | github.com/opyntorr",
  credentials: "Ingeniería en Robótica y Sistemas Digitales (9no Semestre) — Tecnológico de Monterrey"
};

const letter = {
  num: "232",
  slug: "desarrollador-ia-mazatlan",
  company: "Departamento de Tecnologías de la Información",
  role: "Desarrollador(a) de Software e Integración de Inteligencia Artificial",
  recipient: "Comité de Selección / Dirección de TI — Mazatlán, Sinaloa",
  date: "14 de septiembre de 2026",
  paragraphs: [
    "Estimado equipo de Tecnologías de la Información y Reclutamiento,",
    "Por medio de la presente expongo mi postulación para el puesto de Desarrollador de Software e Inteligencia Artificial en Mazatlán. Como estudiante de noveno semestre de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey, cuento con una formación sólida en computación y desarrollo de software, combinada con un enfoque activo en la adopción de herramientas de IA generativa para maximizar la velocidad de entrega y la inteligencia operativa de las aplicaciones.",
    "Poseo dominio práctico en lenguajes como Python, C# (.NET) y TypeScript/JavaScript, complementado con experiencia en la integración de modelos de lenguaje (LLMs vía APIs de OpenAI y Gemini), prompt engineering y el uso intensivo de herramientas de asistencia como GitHub Copilot para acelerar el ciclo de desarrollo. Asimismo, tengo experiencia trabajando con bases de datos relacionales y NoSQL (PostgreSQL, MySQL y MongoDB), diseño de APIs REST, depuración metódica de bugs y control de versiones con Git bajo metodologías ágiles Scrum. Mi nivel de inglés avanzado (B2+ profesional) me permite interactuar con documentación técnica compleja y proveedores internacionales sin barreras.",
    "Siendo originario y residente en Mazatlán, cuento con total disponibilidad presencial e inmediata para sumarme a su equipo y liderar iniciativas de innovación tecnológica interna. Agradezco su atención y quedo a su disposición para coordinar una entrevista técnica."
  ]
};

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
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

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
  await browser.close();
  console.log(`[OK] Generada carta PDF: ${filenameBase}.pdf`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
