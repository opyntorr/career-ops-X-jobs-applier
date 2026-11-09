import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidate = {
  name: "Christian Omar Payán Torróntegui",
  contact: "Guadalajara, Jalisco, Mexico | +52 669 100 3234 | omarpayant@gmail.com | linkedin.com/in/omarpayant | github.com/opyntorr",
  credentials: "B.S. in Robotics and Digital Systems Engineering (Senior / 9th Semester) — Tecnológico de Monterrey"
};

const letter = {
  num: "239",
  slug: "neumo-dotnet",
  company: "Neumo Holdings LLC",
  role: "Jr. Software Engineer (.NET / C#)",
  recipient: "Software Engineering Hiring Team — Neumo Holdings LLC",
  date: "September 20, 2026",
  paragraphs: [
    "Dear Neumo Hiring Team,",
    "I am writing to express my strong interest in the Jr. Software Engineer (.NET / Remote-Mexico) role at Neumo Holdings LLC. With a solid academic and practical foundation in software engineering from Tecnológico de Monterrey, combined with hands-on development in C#, ASP.NET Core, and Microsoft SQL Server, I am eager to contribute to Neumo's mission of delivering scalable, high-performance technology for the public sector.",
    "Throughout my coursework and engineering projects, I have focused on designing robust backend services, RESTful APIs, and database-intensive systems. Notably, in the DigiMix project developed in collaboration with Intel, I built distributed backend communication services in C# utilizing WebSockets and ASP.NET Web APIs, alongside structured database tables and stored procedures in Microsoft SQL Server to record high-rate telemetry with zero logic faults. I place strong emphasis on writing clean code, executing automated unit tests, and adhering to SOLID and Clean Architecture principles.",
    "Additionally, I work comfortably with frontend fundamentals (HTML, CSS, JavaScript), Git version control, Docker containers, and Agile/Scrum collaboration. As a remote-ready engineer based in Guadalajara with fluent English proficiency (B2+), I am prepared to collaborate seamlessly with your senior developers, QA engineers, and product teams to deliver impactful solutions.",
    "Thank you very much for your time and consideration. I welcome the opportunity to discuss my qualifications during an interview."
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
