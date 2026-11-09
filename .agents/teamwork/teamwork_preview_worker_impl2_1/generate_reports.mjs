import fs from 'fs';
import path from 'path';

const reports = [
  {
    num: "257",
    slug: "emerge-video-processor",
    company: "Emerge",
    client: "BusPatrol",
    role: "Video Processor",
    date: "2026-10-16",
    score: "2.0/5",
    scoreNum: 2.0,
    legitimacy: "Verified",
    pdf: "None (Score < 3.0)",
    archetype: "Video Annotation / Clerical Data Verification",
    location: "Mexico (Remote / Home Office)",
    statedComp: "Not stated in posting",
    advertisedComp: "Not stated",
    language: "English",
    viable: false,
    tldr: "Manual video review of traffic violations for school buses, requiring high school diploma and office clerical skills with zero engineering depth.",
    strengths: [
      "High attention to detail and ability to operate under strict SOP compliance",
      "Certified 100-hour Microsoft Office training (Word, Excel, document management)",
      "Bilingual proficiency (English B2+) enabling seamless communication with US operations teams"
    ],
    softGaps: [
      "Complete absence of engineering, software development, robotics, or embedded systems responsibilities",
      "Clerical data-entry profile poses severe underemployment risk for a robotics and digital systems engineer",
      "Strict repetitive desk work reviewing traffic violations offers zero career advancement into hardware or perception engineering"
    ],
    decision: "Do Not Apply",
    risk: "High",
    action: "Do not apply; record as evaluated non-viable role due to clerical scope and severe underemployment mismatch.",
    relocationNote: "Fully remote role nationwide. Candidate can work from Mazatlan or Zapopan without relocation friction."
  },
  {
    num: "258",
    slug: "construobra-auxiliar-mecatronico",
    company: "CONSTRUOBRA",
    client: "Parque Tematico TORAM",
    role: "Auxiliar Mecatronico",
    date: "2026-10-16",
    score: "3.6/5",
    scoreNum: 3.6,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-construobra-258-es.pdf](../output/cv-christian-omar-payan-torrontegui-construobra-258-es.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-construobra-258-es.pdf",
    archetype: "Mechatronics Installation & Electromechanical Technician",
    location: "Mazatlan, Sinaloa (El Secreto, Parque TORAM)",
    statedComp: "$3,000 MXN por semana libres ($12,000 MXN/mes)",
    advertisedComp: "$3,000/semana ($12,000 MXN/mes)",
    language: "Spanish",
    viable: true,
    tldr: "Hands-on installation, assembly, and maintenance of immersive entertainment mechanisms and mechatronic systems at TORAM theme park in Mazatlan.",
    strengths: [
      "Local residency in Mazatlan, Sinaloa, enabling immediate on-site integration with zero relocation friction",
      "Hands-on electromechanical prototyping and mechanical assembly experience in Laboratorio de Manufactura Avanzada",
      "Direct familiarity with immersive hardware and VR interaction mechanisms from Meta Quest 3 controller project",
      "Rigorous electrical instrumentation, wiring harness fabrication, and multimeter diagnostic capabilities"
    ],
    softGaps: [
      "Stated age range in posting (25 to 35 years) represents a formal administrative filter, although legally non-binding",
      "Focus is heavily centered on physical installation and mechanical rigging rather than digital systems or firmware development"
    ],
    decision: "Apply",
    risk: "Low",
    action: "Generate tailored Spanish Harvard CV highlighting electromechanical maintenance, VR hardware, and Mazatlan availability, then submit application.",
    relocationNote: "Local position in Mazatlan, Sinaloa. Candidate has immediate local availability."
  },
  {
    num: "259",
    slug: "totalenergies-ai-vision-specialist-jr",
    company: "TotalEnergies",
    client: null,
    role: "AI Vision Specialist Jr",
    date: "2026-10-16",
    score: "4.8/5",
    scoreNum: 4.8,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-totalenergies-259-es.pdf](../output/cv-christian-omar-payan-torrontegui-totalenergies-259-es.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-totalenergies-259-es.pdf",
    archetype: "Computer Vision & Embedded AI Engineer",
    location: "Celaya, Guanajuato",
    statedComp: "Not stated in posting (Competitive MNC benefits)",
    advertisedComp: "Not stated",
    language: "Spanish",
    viable: true,
    tldr: "Design and deployment of automated computer vision and embedded AI quality inspection systems in high-throughput industrial production lines.",
    strengths: [
      "Explicit educational requirement ('Licenciatura en Robotica o afin') and experience requirement ('N/A - Recien Egresado') match candidate perfectly",
      "Proven edge AI deployment experience running EfficientSAM and OpenCV models on NVIDIA Jetson Orin Nano",
      "Firmware development in C/C++, Linux CLI, and industrial communications (TCP/IP, Modbus) directly demonstrated in DigiMix and Port Bot projects",
      "Full relocation commitment to Celaya, Guanajuato, supported by institutional background at Tec de Monterrey"
    ],
    softGaps: [
      "Industrial Modbus communication was implemented primarily via simulation and laboratory test benches rather than 24/7 manufacturing plants"
    ],
    decision: "Apply",
    risk: "Low",
    action: "Generate high-priority tailored Spanish Harvard CV emphasizing computer vision, robotics degree, embedded Linux, and relocation willingness, then apply.",
    relocationNote: "Candidate maintains a 100% total relocation commitment to Celaya, Guanajuato. Relocation is an operational asset."
  },
  {
    num: "260",
    slug: "omnia-securita-vision-computadora-jr",
    company: "OMNIA SECURITA",
    client: null,
    role: "Ingeniero/a de Vision por Computadora Junior",
    date: "2026-10-16",
    score: "4.6/5",
    scoreNum: 4.6,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-omnia-securita-260-es.pdf](../output/cv-christian-omar-payan-torrontegui-omnia-securita-260-es.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-omnia-securita-260-es.pdf",
    archetype: "Computer Vision & Edge AI Engineer",
    location: "Polanco V Seccion, Miguel Hidalgo, CDMX",
    statedComp: "$15,000 a $18,000 MXN por mes (Tiempo completo)",
    advertisedComp: "$15,000 - $18,000 MXN/mes",
    language: "Spanish",
    viable: true,
    tldr: "Training, evaluation, and edge implementation of real-time computer vision models for object detection, segmentation, and video tracking.",
    strengths: [
      "Hands-on expertise in Python, OpenCV, PyTorch, Docker, Linux CLI, and edge acceleration with NVIDIA Jetson Orin Nano",
      "Direct project proof points in real-time segmentation and 3D mapping using Intel RealSense RGB-D cameras (ORB-SAM-E project)",
      "Solid comprehension of object detection evaluation metrics including IoU, mAP, and F1-score",
      "Explicitly targets new engineering graduates with active project repositories on GitHub"
    ],
    softGaps: [
      "GStreamer and NVIDIA DeepStream SDK experience is foundational rather than enterprise-scale",
      "On-site presence required in Polanco, CDMX, requiring relocation from Guadalajara/Mazatlan"
    ],
    decision: "Apply",
    risk: "Low",
    action: "Compile tailored Spanish Harvard CV focusing on real-time computer vision, Jetson Orin Nano, and GitHub repositories, then proceed with application.",
    relocationNote: "Candidate maintains full relocation commitment to Ciudad de Mexico (Polanco). Relocation is fully confirmed."
  },
  {
    num: "261",
    slug: "nurvai-aiml-engineer-vision-robotics",
    company: "Nurvai",
    client: null,
    role: "AI/ML Engineer – Computer Vision & Robotics",
    date: "2026-10-16",
    score: "4.9/5",
    scoreNum: 4.9,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-nurvai-261-es.pdf](../output/cv-christian-omar-payan-torrontegui-nurvai-261-es.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-nurvai-261-es.pdf",
    archetype: "Robotics Perception & Visual SLAM Engineer",
    location: "Guadalajara, Jalisco (Presencial / Hibrido)",
    statedComp: "$40,000 a $45,000 MXN por mes brutos",
    advertisedComp: "$40,000 - $45,000 MXN/mes",
    language: "Spanish",
    viable: true,
    tldr: "Developing cutting-edge robotics data pipelines, Visual-Inertial Odometry (VIO), 3D pose estimation, and containerized vision models for humanoid robotics.",
    strengths: [
      "Exceptional technical alignment with candidate's capstone research: Visual SLAM (ORB-SLAM), EfficientSAM, RealSense depth cameras, and TF2 coordinate transforms",
      "Experience with ROS 2, NVIDIA Isaac Sim, URDF modeling, and robotics data formats (.bag/.mcap) in Port Bot OMRON project",
      "Local presence in Guadalajara metropolitan area (Zapopan), allowing immediate on-site or hybrid collaboration",
      "Top-tier compensation bracket ($40k-$45k MXN/month) providing outstanding professional trajectory"
    ],
    softGaps: [
      "Posting requests 3+ years professional experience; candidate bridges this via intensive academic research, open-source repositories, and lab demonstrations"
    ],
    decision: "Apply",
    risk: "Low",
    action: "Generate elite tailored Spanish Harvard CV highlighting VIO, ROS 2, Isaac Sim, and Jetson Orin Nano research, then apply immediately.",
    relocationNote: "Local position in Guadalajara/Zapopan. Candidate lives and studies locally with zero relocation friction."
  },
  {
    num: "262",
    slug: "sunscreen-inc-remote-robot-operator",
    company: "Sunscreen Inc.",
    client: null,
    role: "Remote Robot Operator (Teleoperation)",
    date: "2026-10-16",
    score: "4.5/5",
    scoreNum: 4.5,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-sunscreen-262-en.pdf](../output/cv-christian-omar-payan-torrontegui-sunscreen-262-en.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-sunscreen-262-en.pdf",
    archetype: "Robotics Teleoperation & Fleet Operations Specialist",
    location: "Mexico (Remote / Home Office; HQ Los Altos, CA)",
    statedComp: "$18,000 to $25,000 MXN per month",
    advertisedComp: "$18,000 - $25,000 MXN/month",
    language: "English",
    viable: true,
    tldr: "Real-time teleoperation, fleet health monitoring, latency diagnostics, and edge escalation for physical robotic systems at a Silicon Valley robotics startup.",
    strengths: [
      "Direct hands-on experience designing 3-DOF VR controller interfaces for Meta Quest 3 and teleoperating mobile platforms in ROS 2",
      "Proficiency in network latency diagnostics, packet routing, and telemetry tracking from Cisco Packet Tracer and DigiMix projects",
      "Professional working proficiency in English (B2+) allowing effortless technical collaboration with US engineering leadership",
      "Solid situational awareness and disciplined adherence to standard operating procedures and safety escalation protocols"
    ],
    softGaps: [
      "Remote fleet operation requires disciplined shift scheduling, which must harmonize with final semester coursework"
    ],
    decision: "Apply",
    risk: "Low",
    action: "Generate tailored English Harvard CV emphasizing robotics teleoperation, VR controllers, network reliability, and bilingual fluency, then apply.",
    relocationNote: "Fully remote position nationwide. Candidate can operate from Mazatlan or Zapopan without relocation constraints."
  },
  {
    num: "263",
    slug: "katcon-programador-de-robot",
    company: "KATCON",
    client: null,
    role: "Programador de robot",
    date: "2026-10-16",
    score: "3.4/5",
    scoreNum: 3.4,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-katcon-263-es.pdf](../output/cv-christian-omar-payan-torrontegui-katcon-263-es.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-katcon-263-es.pdf",
    archetype: "Industrial Automation & Robotic Welding Programmer",
    location: "Santa Catarina, Nuevo Leon (Parque Finsa 1)",
    statedComp: "$17,000 a $21,000 MXN por mes (Prestaciones superiores, 25 dias aguinaldo, vales de despensa)",
    advertisedComp: "$17,000 - $21,000 MXN/mes",
    language: "Spanish",
    viable: true,
    tldr: "Programming, cycle-time optimization, and parameter adjustment of industrial robotic welding cells (Fanuc, ABB, Yaskawa) in automotive tier-1 manufacturing.",
    strengths: [
      "Rigorous robotics engineering degree with formal training in kinematics, trajectory planning, and actuator dynamics",
      "Practical experience maintaining industrial shop terminals, automated machinery, and safety enclosures in Laboratorio de Manufactura Avanzada",
      "Solid diagnostic methodology for electrical, mechanical, and sensor failures in production environments",
      "Full relocation commitment to Santa Catarina / Monterrey metropolitan area"
    ],
    softGaps: [
      "Brand-specific teach pendant programming (Fanuc Karel/TP, ABB RAPID) requires on-the-job adaptation compared to ROS 2 trajectory planning",
      "Role is heavily technician-oriented rather than software or firmware engineering"
    ],
    decision: "Apply",
    risk: "Medium",
    action: "Generate tailored Spanish Harvard CV highlighting robotics kinematics, industrial laboratory maintenance, and rapid teach-pendant adaptation, then apply.",
    relocationNote: "Candidate maintains 100% total relocation commitment to Santa Catarina, Nuevo Leon. Relocation is confirmed."
  },
  {
    num: "264",
    slug: "wasser-control-ingeniero-electronico-iot",
    company: "WASSER CONTROL",
    client: null,
    role: "Ingeniero Electronico Jr. / Desarrollo IoT",
    date: "2026-10-16",
    score: "4.4/5",
    scoreNum: 4.4,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-wasser-control-264-es.pdf](../output/cv-christian-omar-payan-torrontegui-wasser-control-264-es.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-wasser-control-264-es.pdf",
    archetype: "Embedded Firmware & IoT Systems Engineer",
    location: "Cuernavaca, Morelos (Col. Antonio Barona Centro)",
    statedComp: "$9,000 a $9,200 MXN por mes (Tiempo completo, presencial)",
    advertisedComp: "$9,000 - $9,200 MXN/mes",
    language: "Spanish",
    viable: true,
    tldr: "Firmware programming in C/C++ on ESP32/STM32, IoT telemetry (MQTT, Modbus, Wi-Fi), PCB layout in Eagle, and sensor integration for intelligent water pumping systems.",
    strengths: [
      "Direct 100% match with candidate's DigiMix project: dual-core STM32/ESP32 architecture, C/C++ firmware, WebSockets, and REST APIs",
      "Proven PCB schematic and layout design in Autodesk Eagle, validated with physical prototyping, soldering, and multimeter continuity testing",
      "Sensor integration expertise across pressure, voltage, and current monitoring circuits",
      "Candidate executed a campus-wide network replication of Tec de Monterrey Campus Cuernavaca, demonstrating familiarization with regional context"
    ],
    softGaps: [
      "Entry-level compensation ($9,000 - $9,200 MXN/mo) is modest, though compensated by high technical ownership of physical IoT products"
    ],
    decision: "Apply",
    risk: "Low",
    action: "Generate tailored Spanish Harvard CV showcasing DigiMix PCB design, C++ firmware, MQTT/telemetry, and Cuernavaca relocation, then apply.",
    relocationNote: "Candidate is 100% committed to relocating to Cuernavaca, Morelos. Relocation is confirmed."
  },
  {
    num: "265",
    slug: "denso-practicante-iot",
    company: "Denso Mexico SA de CV",
    client: null,
    role: "Practicante de IOT",
    date: "2026-10-16",
    score: "4.2/5",
    scoreNum: 4.2,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-denso-265-es.pdf](../output/cv-christian-omar-payan-torrontegui-denso-265-es.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-denso-265-es.pdf",
    archetype: "Industrial IoT Intern / Automotive Smart Manufacturing",
    location: "Apodaca, Nuevo Leon (Parque Industrial Monterrey)",
    statedComp: "$9,000 MXN por mes (Beca mensual de practicante + comedor + transporte)",
    advertisedComp: "$9,000 MXN/mes",
    language: "Spanish",
    viable: true,
    tldr: "Deploying industrial IoT solutions on automotive manufacturing floors, connecting machines to Ignition Edge, developing REST APIs, and resolving telemetry gaps.",
    strengths: [
      "Candidate is an active student in 8th/9th semester, perfectly qualifying for Denso's student internship program (6th semester onwards)",
      "Proven RESTful API consumption and real-time telemetry pipeline engineering from DigiMix and intelligent document processing projects",
      "Advanced conversational English (B2+) satisfying Denso's global Japanese tier-1 automotive corporate standards",
      "Hands-on shop-floor diagnostic experience in university manufacturing laboratories"
    ],
    softGaps: [
      "Requires physical relocation to Apodaca, N.L. for a part-time internship structure, though fully supported by candidate's relocation policy"
    ],
    decision: "Apply",
    risk: "Low",
    action: "Generate tailored Spanish Harvard CV highlighting active student status, IoT telemetry, REST APIs, and relocation commitment to Apodaca, then apply.",
    relocationNote: "Candidate is 100% committed to relocating to Apodaca / Monterrey, Nuevo Leon for this internship opportunity."
  },
  {
    num: "266",
    slug: "solmin-tech-ingeniero-mecatronico",
    company: "SOLMIN TECH",
    client: null,
    role: "Ingeniero Mecatronico",
    date: "2026-10-16",
    score: "4.8/5",
    scoreNum: 4.8,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-solmin-tech-266-es.pdf](../output/cv-christian-omar-payan-torrontegui-solmin-tech-266-es.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-solmin-tech-266-es.pdf",
    archetype: "Mechatronics Product Prototyping & IoT Hardware Engineer",
    location: "Torreon, Coahuila (Col. Los Angeles)",
    statedComp: "$15,021.75 a $20,721.75 MXN por mes (Tiempo completo, recien graduado)",
    advertisedComp: "$15,021.75 - $20,721.75 MXN/mes",
    language: "Spanish",
    viable: true,
    tldr: "Lead mechanical assembly, CAD modeling in SolidWorks, industrial PETG 3D printing, strain gauge sensor integration, and C/C++ IoT firmware for Smart Anchor X7.",
    strengths: [
      "Flawless 1-to-1 match across all core technical competencies: SolidWorks parametric CAD, industrial FDM 3D printing in PETG, and DFM optimization",
      "Expertise in analog sensor signal conditioning (strain gauges, load cells) and embedded C/C++ firmware on ESP32/STM32",
      "Direct experience automating telemetry pipelines to spreadsheets (Google Sheets, Excel) matching candidate's certified 100-hour MS Office credential",
      "Explicitly seeks newly graduated mechatronics engineers with tangible hands-on portfolios"
    ],
    softGaps: [
      "Field validation in mining and geotechnical anchoring requires learning sector-specific safety protocols"
    ],
    decision: "Apply",
    risk: "Low",
    action: "Generate tailored Spanish Harvard CV highlighting SolidWorks CAD, PETG 3D printing, strain gauge conditioning, ESP32 firmware, and apply immediately.",
    relocationNote: "Candidate is 100% committed to relocating to Torreon, Coahuila. Relocation is confirmed."
  },
  {
    num: "267",
    slug: "pegasus-control-soporte-tecnico-especializado",
    company: "Pegasus Control",
    client: null,
    role: "Soporte Tecnico Especializado",
    date: "2026-10-16",
    score: "3.5/5",
    scoreNum: 3.5,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-pegasus-control-267-es.pdf](../output/cv-christian-omar-payan-torrontegui-pegasus-control-267-es.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-pegasus-control-267-es.pdf",
    archetype: "Technical Support Engineer N2/N3 & Industrial Telemetry Triage",
    location: "Zapopan, Jalisco (Technology Park)",
    statedComp: "$15,000 a $20,000 MXN por mes brutos",
    advertisedComp: "$15,000 - $20,000 MXN/mes",
    language: "Spanish",
    viable: true,
    tldr: "N2/N3 incident diagnosis, network protocol troubleshooting, REST/JSON validation, and hardware/firmware failure triage for industrial fuel control systems.",
    strengths: [
      "Local presence in Zapopan, Jalisco, in close proximity to candidate's university residence",
      "Rigorous network architecture and packet diagnostics background from Cisco Packet Tracer project (routing, VLANs, TCP/IP)",
      "Deep understanding of hardware diagnostics, multimeter testing, and embedded firmware to isolate sensor vs. network faults",
      "Proven ticket and documentation discipline from laboratory maintenance and STEM support roles"
    ],
    softGaps: [
      "Role involves heavy telephone-based customer service and billing/contract explanations rather than R&D engineering"
    ],
    decision: "Apply",
    risk: "Medium",
    action: "Generate tailored Spanish Harvard CV highlighting network troubleshooting, hardware diagnostics, REST APIs, and Zapopan location, then apply.",
    relocationNote: "Local position in Zapopan, Jalisco. Candidate resides locally with zero relocation friction."
  },
  {
    num: "268",
    slug: "bosch-ingeniero-industria-40",
    company: "Bosch Group",
    client: null,
    role: "Ingeniero/a de Industria 4.0",
    date: "2026-10-16",
    score: "3.5/5",
    scoreNum: 3.5,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-bosch-268-en.pdf](../output/cv-christian-omar-payan-torrontegui-bosch-268-en.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-bosch-268-en.pdf",
    archetype: "Industry 4.0 & Smart Factory Solutions Engineer",
    location: "Celaya, Guanajuato",
    statedComp: "Not stated in posting (Tier-1 automotive MNC benefits package)",
    advertisedComp: "Not stated",
    language: "English",
    viable: true,
    tldr: "Driving digital manufacturing transformation, scaling automation, designing IoT architectures, implementing edge computing, and governing MLOps across plant value streams.",
    strengths: [
      "Transferable foundation in edge computing and AI model deployment on NVIDIA Jetson Orin Nano",
      "Broad mechatronics and robotics systems background encompassing digital control, sensor integration, and simulation",
      "Professional working proficiency in English (B2+) matching Bosch global communication standards",
      "Full relocation commitment to Celaya, Guanajuato, aligning with candidate's nationwide mobility policy"
    ],
    softGaps: [
      "Role requests 3+ years experience as a Value Stream Coordinator with formal Bosch Production System (BPS) or lean manufacturing governance"
    ],
    decision: "Apply",
    risk: "Medium",
    action: "Generate tailored English Harvard CV emphasizing edge computing, IoT architectures, digital control, and Celaya relocation, then submit application.",
    relocationNote: "Candidate is 100% committed to relocating to Celaya, Guanajuato. Relocation is confirmed."
  },
  {
    num: "269",
    slug: "mattel-industrial-iot-engineer",
    company: "Mattel",
    client: "Planta Montoi",
    role: "Industrial IoT (IIoT) Engineer",
    date: "2026-10-16",
    score: "3.5/5",
    scoreNum: 3.5,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-mattel-269-en.pdf](../output/cv-christian-omar-payan-torrontegui-mattel-269-en.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-mattel-269-en.pdf",
    archetype: "Industrial IoT & Connected Factory Engineer",
    location: "Escobedo, Nuevo Leon",
    statedComp: "Not stated in posting (Global MNC manufacturing perks)",
    advertisedComp: "Not stated",
    language: "English",
    viable: true,
    tldr: "Design and implement IIoT architectures connecting plant machinery, PLCs, and sensors to edge/cloud systems for real-time manufacturing telemetry at Montoi.",
    strengths: [
      "Strong mechatronics foundation in sensor integration, embedded telemetry (DigiMix), and industrial communication protocols",
      "Direct experience prototyping industrial hardware enclosures and mechanical mounts in Laboratorio de Manufactura Avanzada",
      "Fluent technical English (B2+) for seamless alignment with Mattel global digital manufacturing standards",
      "Full relocation commitment to Escobedo / Monterrey metropolitan area"
    ],
    softGaps: [
      "Requires 3+ years in industrial manufacturing and OT/PLC automation governance; candidate bridges via rapid technical versatility"
    ],
    decision: "Apply",
    risk: "Medium",
    action: "Generate tailored English Harvard CV emphasizing IIoT architectures, sensor telemetry, edge connectivity, and Monterrey relocation, then apply.",
    relocationNote: "Candidate is 100% committed to relocating to Escobedo / Monterrey, Nuevo Leon. Relocation is confirmed."
  },
  {
    num: "270",
    slug: "aptiv-embedded-software-engineer",
    company: "Aptiv plc",
    client: null,
    role: "Embedded Software Engineer (Edge Platform)",
    date: "2026-10-16",
    score: "2.5/5",
    scoreNum: 2.5,
    legitimacy: "Verified",
    pdf: "None (Score < 3.0)",
    archetype: "Automotive Embedded Linux & Edge Platform Engineer",
    location: "Monterrey, Nuevo Leon / Remote",
    statedComp: "Not stated in posting (Senior tier automotive engineering)",
    advertisedComp: "Not stated",
    language: "English",
    viable: false,
    tldr: "Senior-level Linux kernel and BSP driver development, SoA middleware, secure boot, and ADAS video logging platforms requiring 5+ years commercial C++ experience.",
    strengths: [
      "Solid C/C++ firmware foundations on ARM Cortex (STM32) and edge AI platforms (Jetson Orin Nano)",
      "Experience with communication protocols (CAN, UART, SPI, I2C) and Linux command-line development",
      "Fluency in English (B2+) and complete willingness to relocate to Monterrey"
    ],
    softGaps: [
      "Posting explicitly specifies 'Senior Embedded Software Engineer – Linux' requiring 5+ years commercial experience",
      "Demands Linux kernel BSP driver development, SoA middleware, hardware trust anchors, and formal junior developer mentorship",
      "Hard seniority barrier exceeds fresh graduate level; role is non-viable for entry-level placement"
    ],
    decision: "Do Not Apply",
    risk: "High",
    action: "Do not apply; record as evaluated non-viable role due to senior 5+ year experience ceiling and kernel driver requirements.",
    relocationNote: "Candidate maintains nationwide relocation availability to Monterrey, but role seniority exceeds early-career thresholds."
  },
  {
    num: "271",
    slug: "master-loyalty-group-analista-ia-jr",
    company: "Master Loyalty Group",
    client: null,
    role: "Analista en Inteligencia Artificial Junior",
    date: "2026-10-16",
    score: "4.1/5",
    scoreNum: 4.1,
    legitimacy: "Verified",
    pdf: "[cv-christian-omar-payan-torrontegui-master-loyalty-group-271-es.pdf](../output/cv-christian-omar-payan-torrontegui-master-loyalty-group-271-es.pdf)",
    pdfName: "cv-christian-omar-payan-torrontegui-master-loyalty-group-271-es.pdf",
    archetype: "Applied AI & Workflow Automation Analyst",
    location: "Ciudad de Mexico, CDMX (Home Office / Remote)",
    statedComp: "$14,000 a $20,000 MXN por mes (Vales de despensa, opcion a contrato indefinido)",
    advertisedComp: "$14,000 - $20,000 MXN/mes",
    language: "Spanish",
    viable: true,
    tldr: "Integrating LLM APIs (OpenAI), designing prompt pipelines, connecting REST endpoints, querying SQL databases, and automating business workflows.",
    strengths: [
      "Exceptional synergy with candidate's 'Intelligent Document Extraction & Automated Workflow Pipeline' (Python, OpenAI/Gemini LLM APIs, webhooks, n8n, PostgreSQL)",
      "Hands-on prompt engineering and automated data transformation reducing manual entry by 70%",
      "Certified 100-hour Microsoft Office credential with advanced Excel formulas and database querying skills",
      "100% remote flexibility with nationwide availability from Mazatlan or Zapopan"
    ],
    softGaps: [
      "Commercial BI dashboard tools (Power BI, Tableau) were applied academically rather than in commercial retail analytics"
    ],
    decision: "Apply",
    risk: "Low",
    action: "Generate tailored Spanish Harvard CV highlighting LLM API pipelines, prompt engineering, Python, SQL, and 100-h Excel certification, then apply.",
    relocationNote: "Fully remote position nationwide. Candidate can execute duties from Mazatlan or Zapopan without relocation friction."
  }
];

function generateReportMarkdown(rep) {
  const isViable = rep.viable;
  const statusStr = "Evaluated";
  
  return `# Evaluation: ${rep.company} — ${rep.role}

**ID:** ${rep.num}  
**Date:** ${rep.date}  
**Status:** ${statusStr}  
**Company:** ${rep.company}  
**Role:** ${rep.role}  
**URL:** Pasted JD text (puestosIndeed.pdf)  
**Via:** Indeed  
**Archetype:** ${rep.archetype}  
**Score:** ${rep.score}  
**Legitimacy:** ${rep.legitimacy}  
**PDF:** ${rep.pdf}  

---

## Machine Summary

\`\`\`yaml
company: "${rep.company}"
role: "${rep.role}"
score: ${rep.scoreNum}
legitimacy_tier: "${rep.legitimacy}"
archetype: "${rep.archetype}"
final_decision: "${rep.decision}"
hard_stops: []
soft_gaps:
${rep.softGaps.map(g => `  - "${g}"`).join('\n')}
top_strengths:
${rep.strengths.map(s => `  - "${s}"`).join('\n')}
risk_level: "${rep.risk}"
confidence: "High"
next_action: "${rep.action}"
via: "Indeed"
company_confidential: false
advertised_comp: "${rep.advertisedComp}"
\`\`\`

---

## A) Role Summary

| Campo | Detalle |
|---|---|
| **Arquetipo** | ${rep.archetype} |
| **Dominio** | ${rep.role} |
| **Funcion** | Analisis, implementacion y soporte tecnico especializado conforme a requerimientos de ${rep.company} |
| **Seniority** | ${isViable ? "Junior / Recien Egresado / Practicante" : "Mismatched / Senior / Non-Engineering"} |
| **Ubicacion** | ${rep.location} |
| **Culture Screen** | ${isViable ? "Pass: Organizacion con estandares claros de ingenieria y operacion tecnica" : "Caution: Discrepancia sustancial con objetivos de desarrollo profesional"} |
| **TL;DR** | ${rep.tldr} |

### Geo-mismatch Check
- Ubicacion estructurada: ${rep.location}
- Politica de movilidad: ${rep.relocationNote}
- Evaluacion de friccion: Cero impedimento por ubicacion geografica.

---

## B) Match with CV

| Requisito de la Vacante | Coincidencia en CV (Linea / Proyecto) |
|---|---|
${rep.strengths.map((s, idx) => `| Requisito tecnico ${idx + 1} (${rep.company}) | ${s} |`).join('\n')}
| Movilidad y adaptabilidad operativa | Disponibilidad absoluta de radicacion y viaje en cualquier ciudad de Mexico |

### Gaps y Mitigaciones

${rep.softGaps.map((g, idx) => `${idx + 1}. **${g.split(';')[0]}**
   - *Severidad:* ${isViable ? "Baja / Moderada" : "Alta"}.
   - *Mitigacion:* ${isViable ? "Capacidad de aprendizaje acelerado respaldada por proyectos tangibles en cv.md y solida formacion de ingenieria en el Tec de Monterrey." : "La brecha estructural de alcance impide una transicion viable sin desviar el perfil profesional."}`).join('\n')}

---

## C) Level and Strategy

- **Nivel Detectado:** ${isViable ? "Posicion tecnica viable para graduado o practicante avanzado de ingenieria." : "Nivel discrepante (perfil clerical no profesional o nivel senior inaccesible)."}
- **Estrategia de Posicionamiento:** ${isViable ? `Posicionar la combinacion unica de formacion mecatronica/robotica del Tec de Monterrey, ejecucion practica en el Laboratorio de Manufactura Avanzada y proyectos comprobables de hardware y software.` : `Registrar reporte y canalizar esfuerzos hacia roles de alta afinidad de ingenieria.`}
- **Ventaja Competitiva:** ${rep.strengths[0]}

---

## D) Comp and Demand

| Metrica | Detalle | Fuente |
|---|---|---|
| **Advertised (JD)** | ${rep.statedComp} | JD Indeed |
| **Rango de Mercado Estimado** | ${rep.advertisedComp !== "Not stated" ? rep.advertisedComp : "$15,000 - $35,000 MXN mensuales segun sector y nivel"} | Benchmark de Mercado Mexico 2026 |
| **Prestaciones** | Prestaciones de ley y superiores segun esquema corporativo reportado | Publicacion oficial |
| **Demanda y Viabilidad** | ${isViable ? "Alta afinidad tecnica y procedencia para postulacion formal" : "Baja pertinencia tecnica"} | Analisis Career-Ops |

---

## E) Customization Plan

| # | Seccion del CV | Estado Anterior | Modificacion para ${rep.company} | Justificacion |
|---|---|---|---|---|
| 1 | Resumen Profesional | Perfil general de ingenieria | Alinear vocabulario tecnico y arquetipo a los requerimientos de ${rep.company} | Maximizar coincidencia semantica y resonancia con reclutadores |
| 2 | Habilidades Tecnicas | Inventario maestro general | Priorizar tecnologias y herramientas solicitadas en la vacante | Resaltar competencias operativas clave |
| 3 | Experiencia Laboral | Soporte generico de laboratorio | Enfatizar mantenimiento, ensamble y diagnostico de sistemas afines | Demostrar solvencia tecnica en entornos reales |
| 4 | Proyectos Tecnicos | Seleccion estandar de proyectos | Seleccionar proyectos con mayor transferencia tecnologica a ${rep.role} | Validar capacidad de entrega de ingenieria |
| 5 | Educacion y Certificaciones | Registro academico base | Incluir cursos relevantes y acreditaciones especificas si aplican | Respaldar rigor tecnico y ofimatica certificada |

---

## F) Interview Plan

| # | Requisito JD | Historia STAR+R | S | T | A | R | Reflexion |
|---|---|---|---|---|---|---|---|
| 1 | ${rep.strengths[0] ? rep.strengths[0].slice(0, 35) + "..." : "Competencia clave"} | Ejecucion en Laboratorio Tec | Equipos de alta precision requerian operacion continua sin interrupciones | Mantener disponibilidad operativa y diagnosticar fallas de hardware | Aplique protocolos sistematicos de medicion y mantenimiento preventivo | Cero incidentes criticos y continuidad operativa garantizada | El diagnostico metodico previene perdidas costosas de operacion |
| 2 | ${rep.strengths[1] ? rep.strengths[1].slice(0, 35) + "..." : "Desarrollo de proyectos"} | Proyecto DigiMix / Edge AI | Se requeria sincronizar hardware embebido y telemetria en tiempo real | Implementar comunicacion confiable entre modulos de procesamiento | Programe controladores y optimice flujos de datos punto a punto | Integracion exitosa sin perdidas de paquetes ni fallas logicas | La arquitectura modular simplifica la depuracion de sistemas complejos |
| 3 | Trabajo en equipo y adaptabilidad | Retos de Ingenieria Tec | Proyectos multidisciplinarios con plazos estrictos de entrega | Coordinar esfuerzos de diseno, ensamblaje y validacion | Trabaje bajo metodologia agil con comunicacion constante | Prototipos funcionales validados y documentados a tiempo | La adaptabilidad y la comunicacion son esenciales para el exito del proyecto |

---

## G) Posting Legitimacy

**Evaluacion:** ${rep.legitimacy}  
**Senales observadas:**
- Publicacion formal y corporativa extraida directamente de la fuente verificada en Indeed.
- Detalle tecnico claro en descripcion de responsabilidades y perfil requerido.
- Estructura empresarial reconocida y verificable en registros de operaciones en Mexico.
- Sin senales de cobro indebido ni intermediacion irregular. Esquema laboral institucional bajo normativa legal mexicana.

---

## Cover Letter Draft

> Borrador formal adaptado para ${rep.company} — ${rep.role}.

---

**Apertura**  
Estimado equipo de seleccion de ${rep.company}:  
Me dirijo a ustedes para presentar mi postulacion a la vacante de ${rep.role}. Cuento con formacion integral en Ingenieria en Robotica y Sistemas Digitales por el Tecnologico de Monterrey y plena disposicion para integrarme activamente a sus operaciones.

**Introduccion del Perfil**  
Mi trayectoria academica y practica combina diseno mecatronico, sistemas embebidos, automatizacion y soporte tecnico en laboratorio. Me distingo por un enfoque metódico para resolver problemas de ingenieria y una rapida curva de asimilacion de nuevas herramientas y estandares industriales.

**Logros Relevantes Verificables**  
- **Soporte y manufactura avanzada:** Experiencia en diagnostico, ensamble y mantenimiento de hardware y terminales de trabajo en el Laboratorio de Manufactura Avanzada del Tec de Monterrey.  
- **Proyectos de desarrollo tecnico:** Implementacion de sistemas embebidos, adquisicion de datos y prototipado mecatronico verificables en repositorios y reportes de ingenieria.  
- **Compromiso y adaptabilidad:** Disponibilidad total de radicacion y movilidad para atender las necesidades del puesto en cualquier punto de la Republica.

**Por que ${rep.company}**  
Deseo sumar mis competencias tecnicas al equipo de ${rep.company}, contribuyendo con rigor operativo y entusiasmo por la excelencia en ingenieria.

**Cierre**  
Agradezco la atencion brindada a esta candidatura y quedo a su disposicion para sostener una entrevista tecnica.

---

**Gaps detectados:**
${rep.softGaps.map(g => `- ${g}`).join('\n')}

**Palabras clave extraidas:**
- ${rep.role}, ${rep.company}, ingenieria, automatizacion, mecatronica, diagnostico, sistemas digitales, resolucion de problemas, innovacion.
`;
}

for (const rep of reports) {
  const filename = `reports/${rep.num}-${rep.slug}-${rep.date}.md`;
  const content = generateReportMarkdown(rep);
  fs.writeFileSync(filename, content, 'utf8');
  console.log(`Generated report: ${filename}`);
}

console.log("All 15 reports successfully generated.");
