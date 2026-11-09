import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidate = {
  name: "Christian Omar Payán Torróntegui",
  contact: "Mazatlán, Sinaloa | +52 669 100 3234 | omarpayant@gmail.com | linkedin.com/in/omarpayant | github.com/opyntorr",
  credentials: "B.S. in Robotics and Digital Systems Engineering (9th Semester) — Tecnológico de Monterrey"
};

const letter = {
  num: "233",
  slug: "nudesk-ai-builder",
  company: "nuDesk MX",
  role: "Junior AI Solutions Builder – Automation & Low-Code",
  recipient: "Hiring Team & AI Operations — Mazatlán, Sinaloa",
  date: "September 20, 2026",
  paragraphs: [
    "Dear Hiring Team at nuDesk,",
    "I am writing to express my strong interest in the Junior AI Solutions Builder position in Mazatlán. As an engineering senior at Tecnológico de Monterrey with a deep passion for practical AI implementation and process automation, I have focused my development on connecting LLMs, low-code platforms, and custom backend scripts to solve concrete business bottlenecks.",
    "Rather than treating AI as theoretical, I build operational solutions. My experience spans building automated document processing pipelines using LLM APIs (OpenAI and Gemini) and webhooks that parse unstructured data directly into PostgreSQL databases, reducing manual processing overhead by over 70%. Furthermore, I work comfortably across automation platforms such as n8n, Make, and Zapier, complemented by Python scripting, RESTful API integrations, and robust database design. In every project, I emphasize error handling, clean data structures, and intuitive workflows that empower teams to operate at 10x speed.",
    "As a resident of Mazatlán, I am thrilled by nuDesk's mission to power the next generation of financial operations with AI teams, and I offer full, immediate on-site availability. I would welcome the opportunity to discuss how my builder mindset and technical toolkit can create immediate value for your clients.",
    "Thank you for your time and consideration."
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
