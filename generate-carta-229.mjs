import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidate = {
  name: "Christian Omar Payán Torróntegui",
  contact: "Zapopan, Jalisco / Mazatlán, Sinaloa | +52 669 100 3234 | omarpayant@gmail.com | linkedin.com/in/omarpayant | https://cara.app/opyntorr",
  credentials: "B.S. in Robotics & Digital Systems Engineering | Concentration in Jewelry Design, Production, and Commercialization — Tecnológico de Monterrey"
};

const letter = {
  num: "229",
  slug: "toms-diamonds-cad-en",
  company: "Tom's Diamonds",
  role: "Jewelry CAD Designer (Contract / Remote)",
  recipient: "Hiring Team & Design Management — Tom's Diamonds (Scottsdale, AZ)",
  date: "September 14, 2026",
  paragraphs: [
    "Dear Tom's Diamonds Team,",
    "I am writing to express my strong enthusiasm for the remote Jewelry CAD Designer position at Tom's Diamonds. As an advanced Robotics Engineering student at Tecnológico de Monterrey with an accredited concentration in Jewelry Design, Production, and Commercialization, I bridge an analytical engineering mindset with hands-on bench jewelry experience to deliver models that are genuinely viable for real-world manufacturing. I am a Mexican citizen based in Mexico, fully available and ready to collaborate as an international freelance independent contractor (1099 / W-8BEN contractor basis) with zero visa sponsorship or administrative burden on your end.",
    "My hands-on benchwork background allows me to design with the bench jeweler in mind: ensuring appropriate prong thicknesses, bearing depths, secure bezel/channel seats, and precise metal shrinkage compensation. I specialize in Gemvision MatrixGold, Rhinoceros 3D, and SOLIDWORKS, transforming 2D sketches and custom concepts into clean, watertight STLs ready for high-resolution 3D printing in both castable resins (SLA/DLP) and direct wax (having worked with the Solidscape S3Duo printer) for defect-free lost-wax casting. In addition to 3D modeling and photorealistic rendering (MatrixGold Render Studio and KeyShot), I manage end-to-end design administration including project charters, WBS, Excel costing spreadsheets, and manufacturing drawings. My fine jewelry collection Céruléen was fully produced and selected for exhibition at New York City Jewelry Week (NYCJW 2025).",
    "Operating remotely with professional CAD workstations and consistent turnaround times, I look forward to contributing to your custom design pipeline. You can review my jewelry portfolio at https://cara.app/opyntorr. Thank you for your time and consideration."
  ]
};

function generateHTML(letter) {
  const paragraphsHtml = letter.paragraphs.map(p => `    <p>${p}</p>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Cover Letter — ${candidate.name} — ${letter.company}</title>
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
    line-height: 1.45;
    color: #222222;
    background: #ffffff;
  }
  .header {
    border-bottom: 1.5pt solid #1a365d;
    padding-bottom: 7pt;
    margin-bottom: 14pt;
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
  .contact a {
    color: #1a365d;
    text-decoration: none;
  }
  .meta-table {
    width: 100%;
    margin-bottom: 12pt;
    font-size: 9.5pt;
  }
  .meta-table td {
    padding: 2pt 0;
    vertical-align: top;
  }
  .meta-label {
    width: 65pt;
    font-weight: 700;
    color: #2d3748;
  }
  .meta-value {
    color: #1a202c;
  }
  .content {
    margin-bottom: 16pt;
    text-align: justify;
  }
  p {
    margin-bottom: 9pt;
  }
  .content a {
    color: #1a365d;
    font-weight: 600;
  }
  .signature {
    margin-top: 14pt;
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
    <div class="contact">Zapopan, Jalisco / Mazatlán, Sinaloa | +52 669 100 3234 | omarpayant@gmail.com | <a href="https://linkedin.com/in/omarpayant/">linkedin.com/in/omarpayant</a> | <a href="https://cara.app/opyntorr">cara.app/opyntorr</a></div>
    <div class="contact" style="margin-top: 2pt;">${candidate.credentials}</div>
  </div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Date:</td>
      <td class="meta-value">${letter.date}</td>
    </tr>
    <tr>
      <td class="meta-label">To:</td>
      <td class="meta-value">${letter.recipient}</td>
    </tr>
    <tr>
      <td class="meta-label">Subject:</td>
      <td class="meta-value"><strong>Application — ${letter.role}</strong></td>
    </tr>
  </table>

  <div class="content">
${paragraphsHtml}
  </div>

  <div class="signature">
    <p style="margin-bottom: 4pt;">Sincerely,</p>
    <div class="sign-name">${candidate.name}</div>
    <div class="sign-title">Jewelry CAD Designer & 3D Modeler | Tecnológico de Monterrey</div>
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
      top: '0.75in',
      right: '0.8in',
      bottom: '0.75in',
      left: '0.8in'
    }
  });
  await page.close();
  await browser.close();
  console.log(`[OK] Generated updated cover letter PDF: ${filenameBase}.pdf`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
