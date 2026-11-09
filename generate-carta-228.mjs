import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidate = {
  name: "Christian Omar Payán Torróntegui",
  contact: "Zapopan, Jalisco / Mazatlán, Sinaloa | 669 100 3234 | omarpayant@gmail.com | linkedin.com/in/omarpayant | github.com/opyntorr",
  credentials: "Ingeniería en Robótica y Sistemas Digitales (9no Semestre) — Tecnológico de Monterrey"
};

const letter = {
  num: "228",
  slug: "jewelry-3d-remoto",
  company: "Estudio / Marca de Joyería",
  role: "3D Jewelry CAD Designer / Modelador de Joyería 3D (Remoto)",
  recipient: "Dirección Creativa / Gerencia de Producción — Diseño de Joyería 3D",
  date: "14 de septiembre de 2026",
  paragraphs: [
    "Estimado equipo de Selección y Diseño,",
    "Por medio de la presente pongo a su consideración mi perfil para colaborar como Diseñador y Modelador de Joyería 3D en modalidad remota. Cursando el noveno semestre de Ingeniería en Robótica en el Tecnológico de Monterrey y habiendo acreditado la concentración profesional en Joyería Contemporánea y Micro-Manufactura, integro el rigor dimensional y la ergonomía de la ingeniería con la sensibilidad formal del diseño fino.",
    "Cuento con dominio comprobable en Rhino 3D, MatrixGold y escultura orgánica en Blender, transformando conceptos y bocetos 2D en modelos paramétricos y mallas STL cerradas, perfectamente preparadas para impresión 3D en resinas calcinables y microfundición a la cera perdida. Asimismo, manejo tolerancias exactas de engaste (pavé, bisel y garras), cálculo de volumen y peso en oro/plata, y renderizado comercial fotorrealista en KeyShot para catálogos digitales de preventa. Mi trabajo de modelado fue Seleccionado Oficial en la New York City Jewelry Week (NYCJW 2025).",
    "Trabajo de manera 100% remota con estaciones de trabajo de alto rendimiento, comunicación fluida y entregas puntuales. Agradezco su atención y pongo a su disposición mi portafolio digital de piezas y renders."
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
    <div class="sign-title">Diseñador y Modelador CAD de Joyería 3D | Tecnológico de Monterrey</div>
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
