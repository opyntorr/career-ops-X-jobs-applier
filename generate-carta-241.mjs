import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidate = {
  name: "Christian Omar Payán Torróntegui",
  contact: "Mexico (Home Office) | +52 669 100 3234 | omarpayant@gmail.com | linkedin.com/in/omarpayant | github.com/opyntorr",
  credentials: "B.S. in Robotics and Digital Systems Engineering (Senior / 9th Semester) — Tecnológico de Monterrey"
};

const letter = {
  num: "241",
  slug: "northware-powerbi",
  company: "NORTHWARE SA DE CV",
  role: "Power BI and Microsoft Fabric Analyst (Remote)",
  recipient: "Business Intelligence & Analytics Recruitment Team — NORTHWARE",
  date: "September 20, 2026",
  paragraphs: [
    "Dear NORTHWARE Hiring Team,",
    "I am writing to express my strong enthusiasm for the Power BI and Microsoft Fabric Analyst remote position. With an engineering background from Tecnológico de Monterrey centered on database architectures, automated data pipelines, and analytical reporting, I possess the technical skills and business communication required to translate complex stakeholder needs into high-impact Business Intelligence solutions within the Microsoft Fabric ecosystem.",
    "Throughout my engineering research and technical projects, I have specialized in transforming raw operational data into clear business intelligence. At Tec de Monterrey's Advanced Manufacturing & Robotics Lab, I developed interactive 3D simulation environments in Unreal Engine coupled with physical device telemetry, engineering Python data pipelines and Power BI reporting dashboards to evaluate quantitative performance and spatial benchmarks. Furthermore, in projects such as DigiMix (with Intel) and network infrastructure modeling, I architected relational and dimensional database schemas in SQL Server and PostgreSQL, building automated Python ETL workflows that guarantee data cleanliness, referential integrity, and rapid query performance.",
    "I communicate fluently in English (conversational and written C1/B2+ level), enabling direct, seamless collaboration with business stakeholders for requirements elicitation and iterative user support. I am fully available for your remote schedule (6:30 am to 4:30 pm CST) and eager to bring my analytical mindset to NORTHWARE's BI team.",
    "Thank you for your time and consideration. I welcome the opportunity to discuss my qualifications during an interview."
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
    <div class="sign-title">Robotics & Digital Systems Engineering | Tecnológico de Monterrey</div>
  </div>
</body>
</html>`;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const filenameBase = `carta-${letter.num}-${letter.slug}-en`;
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
  console.log(`[OK] Generated cover letter PDF: ${filenameBase}.pdf`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
