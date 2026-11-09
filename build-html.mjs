import fs from 'fs';

const template = fs.readFileSync('templates/cv-template.html', 'utf8');

// We need to reorder the sections to match cv.md: Summary, Education, Skills, Experience, Projects
const parts = template.split(/(<!-- (?:PROFESSIONAL SUMMARY|CORE COMPETENCIES|WORK EXPERIENCE|PROJECTS|EDUCATION|CERTIFICATIONS|SKILLS) -->\s*<div class="section">[\s\S]*?<\/div>)/g);

let newTemplate = template;
if (parts.length > 1) {
  const getPart = (name) => parts.find(p => p.includes(`<!-- ${name} -->`));
  const summary = getPart('PROFESSIONAL SUMMARY');
  const education = getPart('EDUCATION');
  const skills = getPart('SKILLS');
  const exp = getPart('WORK EXPERIENCE');
  const projects = getPart('PROJECTS');
  const certs = getPart('CERTIFICATIONS');
  const comps = getPart('CORE COMPETENCIES');
  
  // Assemble the body back
  const prefix = template.substring(0, template.indexOf('<!-- PROFESSIONAL SUMMARY -->'));
  const suffix = template.substring(template.lastIndexOf('</div>\n</body>'));
  
  newTemplate = prefix + summary + education + skills + exp + projects + suffix;
}

const html = newTemplate
  .replace('{{LANG}}', 'en')
  .replace('{{PAGE_WIDTH}}', '8.5in')
  .replace('{{PHOTO}}', '')
  .replace(/{{NAME}}/g, 'Christian Omar Payán Torróntegui')
  .replace(/{{PHONE}}/g, '669 100 3234')
  .replace(/{{EMAIL}}/g, 'omarpayant@gmail.com')
  .replace(/{{LINKEDIN_URL}}/g, 'https://linkedin.com/in/omarpayant/')
  .replace(/{{LINKEDIN_DISPLAY}}/g, 'linkedin.com/in/omarpayant/')
  .replace(/{{PORTFOLIO_URL}}/g, 'https://github.com/opyntorr')
  .replace(/{{PORTFOLIO_DISPLAY}}/g, 'github.com/opyntorr')
  .replace(/{{LOCATION}}/g, 'Zapopan, Jalisco / Mazatlán, Sinaloa')
  .replace('{{SECTION_SUMMARY}}', 'Summary')
  .replace('{{SUMMARY_TEXT}}', 'Robotics & Digital Systems Engineering student focused on product design, advanced manufacturing, and robotics. Proven experience in 3D modeling, additive manufacturing, and embedded systems. Seeking to leverage mechanical design to bridge creative design with technical feasibility within the Specializing Master in Design Engineering and Innovation.')
  .replace('{{SECTION_EXPERIENCE}}', 'Professional Experience')
  .replace('{{EXPERIENCE}}', `
  <div class="job">
    <div class="job-header">
      <div class="job-company">Industrial Mounts & Robotic Support Interfaces</div>
      <div class="job-period">Feb-Jun 2026</div>
    </div>
    <div class="job-role">Mechanical & Product Designer</div>
    <div class="job-location">Zapopan, Jalisco</div>
    <ul>
      <li>Engineered mechanical interfaces for VR controllers (Meta Quest 3), developing a 3-DOF system that reduced fabrication costs by 95% vs commercial alternatives.</li>
      <li>Designed and prototyped a custom mini PC enclosure for robust deployment in industrial environments, utilizing 3D-printed fiberglass-reinforced PETG for its ideal thermal and mechanical properties.</li>
    </ul>
  </div>
  `)
  .replace('{{SECTION_PROJECTS}}', 'Academic & Technical Projects')
  .replace('{{PROJECTS}}', `
  <div class="project">
    <div class="project-title">Port Automation & Drone Sim<span class="project-badge">C++, Python, ROS 2, Jetson</span></div>
    <div class="project-desc">Developed a port simulation environment utilizing ROS 2 and Gazebo in partnership with OMRON. Engineered URDF models and C++/Python ROS 2 nodes for kinematic control and reliable flight telemetry. Designed & 3D-printed custom hardware: drone mirror/lens mounts, and an AMR bracket (LiDAR, ArUco, Jetson).</div>
  </div>
  <div class="project">
    <div class="project-title">DigiMix<span class="project-badge">Embedded Systems, C++, STM32, ESP32</span></div>
    <div class="project-desc">Designed an embedded system integrating custom hardware and digital interfaces with Intel. Designed custom PCB and 3D-printed casing; engineered hardware using dual-core STM32 and ESP32 (WebSockets). Applied Scrum to manage lifecycle, integrating hardware and software architectures with zero logic faults.</div>
  </div>
  <div class="project">
    <div class="project-title">Open-Source Gastrointestinal Medical Phantom<span class="project-badge">FDM 3D Printing, Prototyping</span></div>
    <div class="project-desc">Designed an open-source medical phantom for endoscopy training. Engineered phantom via advanced FDM 3D printing (TPU/PETG), reducing prototyping costs by 80% vs commercial alternatives. Managed development using Agile methodologies to iterate rapidly on anatomical accuracy and material constraints.</div>
  </div>
  `)
  .replace('{{SECTION_EDUCATION}}', 'Education')
  .replace('{{EDUCATION}}', `
  <div class="edu-item">
    <div class="edu-header">
      <div class="edu-title">B.S. Robotics and Digital Systems</div>
      <div class="edu-year">Expected Dec 2026</div>
    </div>
    <div class="edu-org">Tecnológico de Monterrey, Zapopan, Jalisco</div>
  </div>
  `)
  .replace('{{SECTION_SKILLS}}', 'Technical Skills')
  .replace('{{SKILLS}}', `
  <div class="skills-grid">
    <div class="skill-item"><span class="skill-category">Programming & Languages:</span> Python, C++, Spanish (Native), English (B2)</div>
    <div class="skill-item"><span class="skill-category">Robotics & Simulation:</span> ROS 2, Gazebo, URDF</div>
    <div class="skill-item"><span class="skill-category">Design & Electronics:</span> SOLIDWORKS, Fusion 360, Rhino 3D, Eagle</div>
    <div class="skill-item"><span class="skill-category">Tools & Methodologies:</span> Git, Agile, Scrum, Advanced FDM 3D Printing, Linux (Ubuntu), Docker</div>
  </div>
  `);

const companySlug = process.argv[2] || 'nxp-semiconductors';
if (!fs.existsSync('output')) fs.mkdirSync('output');
fs.writeFileSync(`output/cv-christian-omar-payan-torrontegui-${companySlug}.html`, html);
console.log('HTML written.');
