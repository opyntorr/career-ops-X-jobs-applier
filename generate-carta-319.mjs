import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidate = {
  name: "Christian Omar Payán Torróntegui",
  contact: "Zapopan, Jalisco | 669 100 3234 | omarpayant@gmail.com | linkedin.com/in/omarpayant | github.com/opyntorr",
  credentials: "Ingeniería en Robótica y Sistemas Digitales (9no Semestre) — Tecnológico de Monterrey Campus Guadalajara"
};

const letter = {
  num: "319",
  slug: "nestle-becario-desarrollo-renovacion-productos",
  company: "Nestlé México",
  role: "Becario de Desarrollo y Renovación de Productos",
  recipient: "Equipo de Atracción de Talento y Family Nutrition — Nestlé México (Operaciones Jalisco)",
  date: "22 de octubre de 2026",
  paragraphs: [
    "Hola, equipo de Nestlé:",
    "Les escribo para postularme a la posición de <strong>Becario de Desarrollo y Renovación de Productos</strong> en el equipo de Family Nutrition en Jalisco. Como estudiante de noveno semestre de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey Campus Guadalajara, combino rigor analítico, metodología experimental y capacidad práctica de taller para llevar prototipos del diseño a pruebas funcionales.",
    "En mi trabajo como asistente en el <strong>Laboratorio de Manufactura Avanzada del Tec de Monterrey</strong>, me encargo del acondicionamiento de estaciones de trabajo, la calibración de instrumentos de medición y el seguimiento de ensayos de caracterización de materiales físicos, manteniendo más del 98.5% de disponibilidad operativa. Asimismo, desarrollo formatos y modelos analíticos automatizados en <strong>Microsoft Excel</strong> para registrar variables de proceso, análisis de mermas e indicadores de calidad, respaldado por una <strong>certificación especializada de 100 horas de Microsoft Office</strong>.",
    "A nivel de proyectos, he diseñado matrices experimentales para evaluar resistencia térmica, estabilidad física y vida útil de prototipos bajo distintas condiciones de procesamiento, además de coordinar proyectos complejos de validación como la integración de plataformas autónomas AMR + UAV con OMRON, donde la disciplina de pruebas, repetibilidad y documentación técnica fueron decisivas.",
    "Vivo en Jalisco, cuento con inglés profesional B2+ y tengo disponibilidad inmediata para sumarme al equipo, colaborar en planta o laboratorio y aportar valor práctico desde el primer día al desarrollo y renovación de sus productos."
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
    <div class="sign-title">Ingeniería en Robótica y Sistemas Digitales | Tecnológico de Monterrey Campus Guadalajara</div>
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
  const conveniencePdf1 = resolve(__dirname, 'output', 'CV-OmarPayan-Producto-CartaPresentacion.pdf');
  const conveniencePdf2 = resolve(__dirname, 'output', 'Carta-OmarPayan-Producto.pdf');
  copyFileSync(pdfPath, conveniencePdf1);
  copyFileSync(pdfPath, conveniencePdf2);

  console.log(`[OK] Generada carta PDF: ${filenameBase}.pdf`);
  console.log(`[OK] Copia creada en: output/CV-OmarPayan-Producto-CartaPresentacion.pdf`);
  console.log(`[OK] Copia creada en: output/Carta-OmarPayan-Producto.pdf`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
