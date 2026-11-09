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
  num: "238",
  slug: "rpmglobal-cv-ml",
  company: "RPMGlobal",
  role: "Software Engineer (Computer Vision and Machine Learning)",
  recipient: "Engineering Hiring Team & Computer Vision Group — Guadalajara, Jalisco",
  date: "September 20, 2026",
  paragraphs: [
    "Dear RPMGlobal Hiring Team,",
    "I am writing to express my strong enthusiasm for the Software Engineer (Computer Vision and Machine Learning) position in Guadalajara. As a senior in Robotics and Digital Systems Engineering at Tecnológico de Monterrey with focused hands-on experience in 3D perception, point clouds, visual SLAM, and edge AI deployment, I am deeply inspired by RPMGlobal's mission to transform imagery, LiDAR, and sensor data into actionable spatial intelligence for industrial and mining environments.",
    "My background directly bridges 3D computer vision algorithms and production-grade edge deployment. Notably, I implemented a real-time edge perception system coupling visual SLAM with zero-shot instance segmentation on an NVIDIA Jetson Orin Nano, integrating depth streams from RGB-D cameras (Intel RealSense) with ORB-SLAM and EfficientSAM to generate dense semantic 3D point representations running in real time (<a href=\"https://github.com/CodingMaster8/ORB-SAM-E\" target=\"_blank\">github.com/CodingMaster8/ORB-SAM-E</a>). Furthermore, in partnership with OMRON, I architected autonomous multi-sensor platforms utilizing ROS 2, modern C++, and Python, integrating 2D/3D LiDAR, optical markers, and Jetson compute across Gazebo and NVIDIA Isaac Sim 4.5 (<a href=\"https://github.com/opyntorr/port_bot_sim_ws\" target=\"_blank\">github.com/opyntorr/port_bot_sim_ws</a>). To ensure end-to-end reliability, I also designed in SOLIDWORKS and 3D-printed custom mechanical mounts and brackets for the LiDAR sensors, optical mirrors, and compute units.",
    "Additionally, during my research at Tec de Monterrey's Advanced Manufacturing Lab, I developed interactive 3D simulation and geometric collision detection pipelines coupled with Python data science workflows for spatial kinematics. I possess solid proficiency in C++ (memory management, data structures, algorithms) and Python (NumPy, SciPy, OpenCV, PyTorch), containerized deployments with Docker, Linux environments, and Git-driven Agile/Scrum workflows.",
    "Being based in Guadalajara and legally entitled to work in Mexico, I offer immediate dedication, bilingual communication (English and Spanish), and a relentless builder mindset to help advance RPM's computer vision and point-cloud solutions. Thank you very much for your time and consideration."
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
    font-size: 9.8pt;
    line-height: 1.48;
    color: #222222;
    background: #ffffff;
  }
  a {
    color: #1a365d;
    text-decoration: underline;
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
  .meta-table {
    width: 100%;
    margin-bottom: 12pt;
    font-size: 9.2pt;
  }
  .meta-table td {
    padding: 1.5pt 0;
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
    margin-bottom: 8pt;
  }
  .signature {
    margin-top: 14pt;
  }
  .sign-name {
    font-weight: 700;
    color: #1a365d;
  }
  .sign-title {
    font-size: 8.8pt;
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
  console.log(`[OK] Generated updated cover letter PDF: ${filenameBase}.pdf`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
