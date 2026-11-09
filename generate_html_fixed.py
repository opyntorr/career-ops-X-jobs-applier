import os

html_template = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Christian Omar Payán Torróntegui — CV</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-variant-ligatures: none; font-feature-settings: "liga" 0, "clig" 0, "dlig" 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Liberation Sans', 'Helvetica Neue', Arial, 'DejaVu Sans', sans-serif; font-size: 11px; line-height: 1.5; color: #1a1a2e; background: #ffffff; padding: 0; margin: 0; font-variant-ligatures: none; font-feature-settings: "liga" 0, "clig" 0, "dlig" 0; }
  .page { width: 100%; max-width: 8.5in; margin: 0 auto; padding: 2px 0; }
  .header { margin-bottom: 20px; }
  .header h1 { font-size: 28px; font-weight: 700; color: #1a1a2e; letter-spacing: -0.02em; margin-bottom: 6px; line-height: 1.1; }
  .header-gradient { height: 2px; background: linear-gradient(to right, hsl(187, 74%, 32%), hsl(270, 70%, 45%)); border-radius: 1px; margin-bottom: 10px; }
  .contact-row { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 10.5px; line-height: 1.4; color: #555; }
  .contact-row a { color: #555; text-decoration: none; }
  .contact-row .separator { color: #ccc; }
  .section { margin-bottom: 18px; }
  .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: hsl(187, 74%, 32%); border-bottom: 1.5px solid #e2e2e2; padding-bottom: 4px; margin-bottom: 10px; line-height: 1.2; }
  .summary-text { font-size: 11px; line-height: 1.7; color: #2f2f2f; }
  a { white-space: nowrap; }
  .job { margin-bottom: 14px; }
  .job-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 4px; }
  .job-company { font-size: 12.5px; font-weight: 600; color: hsl(270, 70%, 45%); }
  .job-period { font-size: 10.5px; color: #777; white-space: nowrap; }
  .job-role { font-size: 11px; font-weight: 600; color: #333; margin-bottom: 6px; }
  .job-location { font-size: 10px; color: #888; }
  .job ul { padding-left: 18px; margin-top: 6px; }
  .job li { font-size: 10.5px; line-height: 1.6; color: #333; margin-bottom: 4px; }
  .job li strong { font-weight: 600; }
  .project { margin-bottom: 12px; }
  .project-title { font-size: 11.5px; font-weight: 600; color: hsl(270, 70%, 45%); }
  .project-badge { font-size: 9px; font-weight: 500; color: hsl(187, 74%, 32%); background: hsl(187, 40%, 95%); padding: 1px 6px; border-radius: 2px; margin-left: 6px; }
  .project-desc { font-size: 10.5px; color: #444; margin-top: 3px; line-height: 1.55; }
  .project-tech { font-size: 9.5px; color: #888; margin-top: 3px; }
  .edu-item { margin-bottom: 8px; }
  .edu-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .edu-title { font-weight: 600; font-size: 11px; color: #333; }
  .edu-org { color: hsl(270, 70%, 45%); font-weight: 500; }
  .edu-year { font-size: 10px; color: #777; white-space: nowrap; }
  .edu-desc { font-size: 10px; color: #666; margin-top: 2px; line-height: 1.5; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 6px 14px; }
  .skill-item { font-size: 10.5px; color: #444; }
  .skill-category { font-weight: 600; color: #333; font-size: 10.5px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page { padding: 0 0.18in 0 0; } }
  .header, .edu-item, .skill-item { break-inside: avoid; page-break-inside: avoid; }
  .section-title, .job-company, .job-role, .project-title { break-after: avoid; page-break-after: avoid; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>Christian Omar Payán Torróntegui</h1>
    <div class="header-gradient"></div>
    <div class="contact-row">
      <a href="mailto:omarpayant@gmail.com">omarpayant@gmail.com</a>
      <span class="separator">|</span>
      <a href="tel:669 100 3234">669 100 3234</a>
      <span class="separator">|</span>
      <a href="https://linkedin.com/in/omarpayant/">linkedin.com/in/omarpayant/</a>
      <span class="separator">|</span>
      <a href="https://github.com/opyntorr">github.com/opyntorr</a>
      <span class="separator">|</span>
      <span>Zapopan, Jalisco</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Summary</div>
    <div class="summary-text">Robotics & Digital Systems Engineering student focused on product design, advanced manufacturing, and robotics. Proven experience in 3D modeling, additive manufacturing, and embedded systems. Seeking to leverage mechanical design to bridge creative design with technical feasibility within the Specializing Master in Design Engineering and Innovation.</div>
  </div>

  <div class="section">
    <div class="section-title">Education</div>
    <div class="edu-item">
      <div class="edu-header">
        <div class="edu-title">B.S. Robotics and Digital Systems</div>
        <div class="edu-year">Expected December 2026</div>
      </div>
      <div class="edu-org">Tecnológico de Monterrey, Zapopan, Jalisco</div>
      <div class="edu-desc">Coursework: Jewelry Concentration: Advanced 3D modeling and product design using Rhino 3D</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skills-grid">
      <div class="skill-category">Programming & Languages:</div>
      <div class="skill-item">Python, C++, Spanish (Native), English (B2)</div>
      <div class="skill-category">Robotics & Simulation:</div>
      <div class="skill-item">ROS 2, Gazebo, URDF</div>
      <div class="skill-category">Design & Electronics:</div>
      <div class="skill-item">SOLIDWORKS, Fusion 360, Rhino 3D, Eagle</div>
      <div class="skill-category">Tools & Methodologies:</div>
      <div class="skill-item">Git, Agile, Scrum, Advanced FDM 3D Printing, Linux (Ubuntu), Docker</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Professional Experience</div>
    
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
  </div>

  <div class="section">
    <div class="section-title">Academic & Technical Projects</div>
    
    <div class="project">
      <div class="project-title">Céruléen</div>
      <div class="project-desc">Directed product design as part of the "Diseño, Producción y Comercialización de Joyería" concentration at Tec de Monterrey. Directed 3D modeling (Rhino 3D) for 2 collections; exhibited "The Perverse Beauty" at NYCJW 2025 ("Echoes of Nature"). Integrated digital fabrication with artisanal processes, optimizing product life cycle and reducing production time by 20%.</div>
      <div class="project-tech">Ago-Dic 2025</div>
    </div>
    
    <div class="project">
      <div class="project-title">Open-Source Gastrointestinal Medical Phantom</div>
      <div class="project-desc">Designed an open-source medical phantom for endoscopy training. Engineered phantom via advanced FDM 3D printing (TPU/PETG), reducing prototyping costs by 80% vs commercial alternatives. Managed development using Agile methodologies to iterate rapidly on anatomical accuracy and material constraints.</div>
      <div class="project-tech">Ago-Dic 2025 – Feb-Jun 2026</div>
    </div>

    <div class="project">
      <div class="project-title">Port Automation & Drone Sim</div>
      <div class="project-desc">Developed a port simulation environment utilizing ROS 2 and Gazebo in partnership with OMRON. Engineered URDF models and C++/Python ROS 2 nodes for kinematic control and reliable flight telemetry. Designed & 3D-printed custom hardware: drone mirror/lens mounts, and an AMR bracket (LiDAR, ArUco, Jetson).</div>
      <div class="project-tech">Ago-Dic 2025</div>
    </div>

    <div class="project">
      <div class="project-title">DigiMix</div>
      <div class="project-desc">Designed an embedded system integrating custom hardware and digital interfaces with Intel. Designed custom PCB and 3D-printed casing; engineered hardware using dual-core STM32 and ESP32 (WebSockets). Applied Scrum to manage lifecycle, integrating hardware and software architectures with zero logic faults.</div>
      <div class="project-tech">Ago-Dic 2024</div>
    </div>
  </div>

</div>
</body>
</html>
"""

with open("/home/opyntorr/career-ops/output/cv-christian-omar-payan-torrontegui-intel.html", "w") as f:
    f.write(html_template)
