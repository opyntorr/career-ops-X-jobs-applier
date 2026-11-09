import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidate = {
  name: "Christian Omar Payán Torróntegui",
  contact: "Mazatlán, Sinaloa | 669 100 3234 | omarpayant@gmail.com | linkedin.com/in/omarpayant | github.com/opyntorr",
  credentials: "Ingeniería en Robótica y Sistemas Digitales (9no Semestre) — Tecnológico de Monterrey"
};

const letter = {
  num: "304",
  slug: "grupo-dportenis-analista-aplicaciones",
  company: "Grupo Dportenis",
  role: "Analista de Aplicaciones Empresariales",
  recipient: "Equipo de Atracción de Talento y Tecnología — Grupo Dportenis (Corporativo Mazatlán)",
  date: "24 de octubre de 2026",
  paragraphs: [
    "Hola, equipo de Grupo Dportenis:",
    "Les escribo para postularme a la posición de <strong>Analista de Aplicaciones Empresariales</strong> en su corporativo en Mazatlán. Radico aquí en la ciudad, cuento con disponibilidad presencial inmediata y tengo la flexibilidad para rolar turnos conforme lo demande la operación.",
    "Mi formación técnica y proyectos se centran en conectar las necesidades del negocio con soluciones de software que funcionen sin fricciones. Diseñé y desarrollé <strong>nuDesk Operations Studio</strong> (<em>github.com/opyntorr/nudesk-ai-ops-pipeline</em>), una plataforma de triage y originación de crédito financiero donde modelé reglas de negocio, validé capacidad de endeudamiento y sincronicé datos mediante Web APIs REST (FastAPI) y bases de datos SQL, reduciendo el ciclo de procesamiento operativo de 40 a menos de 5 minutos por solicitud con monitoreo estricto de SLAs.",
    "En el día a día manejo consultas avanzadas en SQL (SQL Server, MariaDB, PostgreSQL), pruebas de integración de APIs en Postman, diagnóstico de incidencias de 2do nivel bajo esquemas ITSM y análisis en Excel respaldado por una <strong>certificación técnica de 100 horas en Microsoft Office</strong>. Además, mi nivel de inglés profesional B2+ me permite interactuar con documentación técnica y herramientas internacionales sin problema.",
    "Me entusiasma la oportunidad de sumar valor a la continuidad y rendimiento de sus aplicaciones de crédito y retail desde el primer día. Quedo a su disposición para conversar en una entrevista."
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
    margin: 0.85in 0.9in 0.85in 0.9in;
  }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.55;
    color: #2d3748;
    background: #ffffff;
  }
  .header {
    border-bottom: 2pt solid #2b6cb0;
    padding-bottom: 8pt;
    margin-bottom: 16pt;
  }
  .name {
    font-size: 16pt;
    font-weight: 700;
    color: #1a365d;
    letter-spacing: 0.3pt;
    margin-bottom: 4pt;
  }
  .contact {
    font-size: 8.8pt;
    color: #4a5568;
    line-height: 1.35;
  }
  .meta-table {
    width: 100%;
    margin-bottom: 16pt;
    font-size: 9.5pt;
  }
  .meta-table td {
    padding: 2.5pt 0;
    vertical-align: top;
  }
  .meta-label {
    width: 65pt;
    font-weight: 700;
    color: #1a202c;
  }
  .meta-value {
    color: #2d3748;
  }
  .content {
    margin-bottom: 18pt;
    text-align: justify;
  }
  p {
    margin-bottom: 11pt;
  }
  p strong {
    color: #1a202c;
  }
  .signature {
    margin-top: 18pt;
  }
  .sign-saludo {
    margin-bottom: 4pt;
    color: #4a5568;
  }
  .sign-name {
    font-size: 11pt;
    font-weight: 700;
    color: #1a365d;
  }
  .sign-title {
    font-size: 9pt;
    color: #718096;
    margin-top: 2pt;
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
    <p class="sign-saludo">Saludos cordiales,</p>
    <div class="sign-name">${candidate.name}</div>
    <div class="sign-title">Ingeniería en Robótica y Sistemas Digitales | Tecnológico de Monterrey</div>
  </div>
</body>
</html>`;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const filenameBase = `Carta-OmarPayan-${letter.slug}-${letter.num}-es`;
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
      top: '0.85in',
      right: '0.9in',
      bottom: '0.85in',
      left: '0.9in'
    }
  });
  await page.close();
  await browser.close();

  // Convenience copies in output/
  const conveniencePdf1 = resolve(__dirname, 'output', 'CV-OmarPayan-AnalistaOps-CartaPresentacion.pdf');
  const conveniencePdf2 = resolve(__dirname, 'output', 'Carta-OmarPayan-AnalistaOps.pdf');
  copyFileSync(pdfPath, conveniencePdf1);
  copyFileSync(pdfPath, conveniencePdf2);

  console.log(`[OK] Generada carta PDF: ${filenameBase}.pdf`);
  console.log(`[OK] Copia creada en: output/CV-OmarPayan-AnalistaOps-CartaPresentacion.pdf`);
  console.log(`[OK] Copia creada en: output/Carta-OmarPayan-AnalistaOps.pdf`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
