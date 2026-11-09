import fs from 'fs';
import path from 'path';

// Common contact header
const contactHeader = `\\introduction[
    fullname={Christian Omar Payán Torróntegui},
    email={omarpayant@gmail.com},
    phone={+52 669 100 3234},
    linkedin={linkedin.com/in/omarpayant/},
    github={github.com/opyntorr}
]`;

// Spanish macro overrides
const spanishPreamble = `\\documentclass{resume}

% Redefinir summary para usar titulo en espanol
\\renewcommand{\\summary}[1]{%
    \\sectionTitle{Resumen Profesional}%
    #1
}

% Definir educationItemEs para evitar macros residuales en ingles (Graduating, Relevant coursework)
\\newkeycommand{\\educationItemEs}[
    university,
    college,
    program,
    graduation,
    grade,
    coursework
]{%
    {%
        \\bf \\commandkey{program}%
    } \\hfill {%
        \\commandkey{graduation}%
    } \\\\
    {%
        \\commandkey{university}%
    } \\hfill \\ifcommandkey{grade}{%
        \\commandkey{grade}%
    }{} \\\\
    {%
        \\commandkey{college}%
    } \\\\
    \\ifcommandkey{coursework}{%
        Materias relevantes: \\commandkey{coursework}%
    }{}%
}

\\begin{document}
`;

const englishPreamble = `\\documentclass{resume}

\\begin{document}
`;

const cvs = [
  // 1. Job 2 (258): CONSTRUOBRA — Auxiliar Mecatronico (Spanish)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-construobra-258-es.tex",
    content: `${spanishPreamble}
${contactHeader}

\\summary{Estudiante avanzado de Ingeniería en Robótica y Sistemas Digitales radicado en Mazatlán, Sinaloa. Experiencia práctica en montaje electromecánico, integración de actuadores, ensamble de cableados y mantenimiento de equipo de cómputo en el Laboratorio de Manufactura Avanzada. Familiaridad directa con hardware interactivo inmersivo y mecanismos de control cinemático mediante el desarrollo de interfaces para controladores de realidad virtual (Meta Quest 3). Manejo intermedio de Microsoft Excel (acreditado con curso de 100 horas) para control de inventarios y bitácoras. Disponibilidad presencial inmediata en Mazatlán.}

\\begin{educationSection}{Educacion}
    \\educationItemEs[
        program={Ingeniería en Robótica y Sistemas Digitales (9no Semestre)},
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Zapopan, Jalisco},
        graduation={Ago 2022 -- Dic 2026},
        coursework={Sistemas Mecatrónicos, Instrumentación, Control Digital, Cinemática, Máquinas Eléctricas}
    ] \\vspace{0.2em}

    \\educationItemEs[
        program={Curso de 100 Horas en Microsoft Office (Excel Intermedio, Word, PowerPoint)},
        university={Bachillerato General},
        college={Mazatlán, Sinaloa},
        graduation={Certificado Acreditado},
        coursework={Fórmulas, Filtros, Tablas Dinámicas, Control de Inventario de Refacciones y Reportes}
    ]
\\end{educationSection}

\\begin{skillsSection}{Habilidades Tecnicas}
    \\skillItem[
        category={Montaje Electromecanico},
        skills={Ensamble de Gabinetes Industriales, Motores a Pasos y Servomotores, Actuadores Lineales, Rieles y Bandas, Impresión 3D FDM (PETG/ABS)}
    ] \\\\
    \\skillItem[
        category={Diagnostico e Instrumentacion},
        skills={Multímetro Digital (Voltaje, Continuidad, Resistencia), Confección de Arnés Eléctrico, Soldadura con Estaño, Diagnóstico de Hardware y Sensores}
    ] \\\\
    \\skillItem[
        category={Software y Gestion},
        skills={SOLIDWORKS (CAD), Microsoft Excel Intermedio (Bitácoras y Stock), Linux CLI, Soporte Técnico en Sitio, Movilidad Local en Mazatlán}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Experiencia Laboral}
    \\experienceItem[
        company={Tecnológico de Monterrey — Laboratorio de Manufactura Avanzada},
        location={Zapopan, Jalisco},
        position={Asistente de Laboratorio y Soporte Técnico},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Realicé mantenimiento preventivo y correctivo a equipos de cómputo y terminales del taller, diagnosticando fallas de hardware y conexiones eléctricas.
        \\item Diseñé y ensamblé gabinetes protectores para mini PCs en filamento PETG reforzado, optimizando la disipación térmica y la organización de cableado interno.
        \\item Administré el inventario de herramientas, refacciones electrónicas y consumibles de taller utilizando hojas de cálculo en Excel.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Proyectos Tecnicos}
    \\projectItem[
        title={Diseño de Interfaces Mecatrónicas para Controladores VR (Meta Quest 3)},
        duration={Feb 2026 -- Jun 2026},
        keyHighlight={SOLIDWORKS, Mecanismos de 3 GDL, Prototipado Rápido, Ergonomía}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Diseñé y fabriqué interfaces mecánicas de 3 grados de libertad para interacción inmersiva con controladores de realidad virtual, reduciendo costos un 95\\%.
        \\item Validé la fijación cinemática y la resistencia estructural de los componentes ante movimientos bruscos y uso rudo continuo.
    \\end{itemize}

    \\projectItem[
        title={Tarjeta Embebida y Telemetría Distribuida DigiMix (con Intel)},
        duration={Ago 2024 -- Dic 2024},
        keyHighlight={Microcontroladores STM32/ESP32, Eagle PCB, Sensores, Cableado Eléctrico}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Diseñé el circuito esquemático y layout en Eagle PCB para un sistema distribuido, verificando pistas y aislamiento de señales con multímetro.
        \\item Ensamblé componentes superficiales y terminales de conexión, garantizando una operación estable sin caídas de tensión ni cortocircuitos.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 2. Job 3 (259): TotalEnergies — AI Vision Specialist Jr (Spanish)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-totalenergies-259-es.tex",
    content: `${spanishPreamble}
${contactHeader}

\\summary{Estudiante de 9no semestre de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey. Especializado en visión artificial y procesamiento en borde utilizando OpenCV, EfficientSAM y plataformas NVIDIA Jetson Orin Nano con cámaras RGB-D. Experiencia en desarrollo de firmware en C/C++, sistemas operativos Linux y protocolos de comunicación industrial (TCP/IP, Modbus, WebSockets). Enfoque analítico para inspección automatizada y control de calidad en líneas de producción. Disponibilidad absoluta e inmediata para reubicación en Celaya, Guanajuato.}

\\begin{educationSection}{Educacion}
    \\educationItemEs[
        program={Ingeniería en Robótica y Sistemas Digitales (9no Semestre)},
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Zapopan, Jalisco},
        graduation={Ago 2022 -- Dic 2026},
        coursework={Visión por Computadora e Inteligencia Artificial, Sistemas Embebidos, Redes de Computadoras y Protocolos, Control Digital}
    ]
\\end{educationSection}

\\begin{skillsSection}{Habilidades Tecnicas}
    \\skillItem[
        category={Vision Artificial y Edge AI},
        skills={OpenCV, PyTorch, EfficientSAM, NVIDIA Jetson Orin Nano, Cámaras RGB-D Intel RealSense, Segmentación y Detección en Tiempo Real}
    ] \\\\
    \\skillItem[
        category={Sistemas Embebidos y Linux},
        skills={Linux CLI (Ubuntu/Debian), C/C++, Python, Microcontroladores STM32/ESP32, Protocolos TCP/IP, Modbus, UART, SPI, I2C, WebSockets}
    ] \\\\
    \\skillItem[
        category={Herramientas y Automatizacion},
        skills={Docker, Git/GitHub, Eagle PCB, Multímetro y Osciloscopio, Impresión 3D FDM (PETG/ABS), Inglés B2+ Profesional}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Experiencia Laboral}
    \\experienceItem[
        company={Tecnológico de Monterrey — Laboratorio de Manufactura Avanzada},
        location={Zapopan, Jalisco},
        position={Asistente de Laboratorio y Soporte Técnico},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Desplegué y configuré terminales de cómputo en Linux y estaciones de procesamiento para tareas de visión y manufactura avanzada.
        \\item Diseñé y fabriqué gabinetes térmicos para mini PCs industriales utilizando filamento PETG reforzado, garantizando protección electromecánica.
        \\item Ejecuté mantenimiento preventivo y diagnóstico con multímetro en fuentes de alimentación e instrumentación de laboratorio.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Proyectos Tecnicos}
    \\projectItem[
        title={ORB-SAM-E: Visual SLAM y Segmentación Semántica en Borde},
        duration={Feb 2026 -- Jun 2026},
        keyHighlight={NVIDIA Jetson Orin Nano, Intel RealSense, ROS 2, Python, C++, EfficientSAM}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Implementé un pipeline de visión artificial en tiempo real combinando ORB-SLAM y EfficientSAM sobre plataforma NVIDIA Jetson Orin Nano.
        \\item Procesé transmisiones continuas de profundidad y color desde cámaras RealSense para generar mapas volumétricos y detección de características.
        \\item Optimicé algoritmos de emparejamiento de descriptores y transformadas espaciales TF2 para lograr inferencia fluida en sistemas embebidos.
    \\end{itemize}

    \\projectItem[
        title={DigiMix: Sistema Embebido y Telemetría Distribuida (con Intel)},
        duration={Ago 2024 -- Dic 2024},
        keyHighlight={Dual-Core STM32, ESP32, WebSockets, APIs REST, Modbus/TCP, PCB Eagle}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Desarrollé firmware en C/C++ para adquisición y transmisión de variables de proceso mediante protocolos de red en tiempo real.
        \\item Diseñé PCB esquemático y de pistas en Eagle, validando niveles lógicos y alimentación eléctrica sin fallas de integración.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 3. Job 4 (260): OMNIA SECURITA — Ingeniero/a de Vision por Computadora Junior (Spanish)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-omnia-securita-260-es.tex",
    content: `${spanishPreamble}
${contactHeader}

\\summary{Estudiante avanzado de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey (graduación Dic 2026). Sólida formación práctica en visión por computadora, procesamiento de video en tiempo real y aprendizaje profundo utilizando Python, OpenCV y PyTorch. Experiencia comprobada en adquisición de video con cámaras RGB-D, segmentación en el borde con EfficientSAM sobre NVIDIA Jetson Orin Nano, contenedorización con Docker y manejo de métricas (IoU, mAP). Portafolio técnico verificable en GitHub. Plena disponibilidad para radicar en Ciudad de México (Polanco).}

\\begin{educationSection}{Educacion}
    \\educationItemEs[
        program={Ingeniería en Robótica y Sistemas Digitales (9no Semestre)},
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Zapopan, Jalisco},
        graduation={Ago 2022 -- Dic 2026},
        coursework={Visión por Computadora e Inteligencia Artificial, Arquitectura de Software, Sistemas Embebidos, Matemáticas para Computación}
    ]
\\end{educationSection}

\\begin{skillsSection}{Habilidades Tecnicas}
    \\skillItem[
        category={Vision por Computadora},
        skills={OpenCV, PyTorch, EfficientSAM, Detección y Segmentación de Objetos, Rastreo en Video, Métricas de Evaluación (IoU, mAP, F1)}
    ] \\\\
    \\skillItem[
        category={Plataformas y Entornos},
        skills={NVIDIA Jetson Orin Nano, Cámaras RGB-D Intel RealSense, Linux CLI (Ubuntu), Docker, Git/GitHub, Python, C++, NumPy, Pandas}
    ] \\\\
    \\skillItem[
        category={Desarrollo y Datos},
        skills={FastAPI, Consumo de APIs REST, Bases de Datos SQL (PostgreSQL, MySQL), Depuración de Datasets, Inglés B2+ Profesional}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Experiencia Laboral}
    \\experienceItem[
        company={Tecnológico de Monterrey — Laboratorio de Manufactura Avanzada},
        location={Zapopan, Jalisco},
        position={Asistente de Laboratorio y Soporte Técnico},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Instalé y configuré entornos de desarrollo Linux con aceleración gráfica y drivers de captura de video para proyectos de investigación.
        \\item Diseñé gabinetes industriales para mini PCs con gestión de ventilación y soporte físico para periféricos de captura y sensores.
        \\item Brindé soporte correctivo a estaciones de cómputo, verificando integridad de conexiones de red y controladores periféricos.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Proyectos Tecnicos}
    \\projectItem[
        title={ORB-SAM-E: Visual SLAM y Segmentación Semántica en Borde},
        duration={Feb 2026 -- Jun 2026},
        keyHighlight={NVIDIA Jetson Orin Nano, Intel RealSense, Python, EfficientSAM, OpenCV, Docker}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Implementé un pipeline en Python para detección y segmentación semántica de objetos en video en tiempo real usando EfficientSAM y OpenCV.
        \\item Ingerí y sincronicé flujos RGB y de profundidad desde cámaras Intel RealSense sobre hardware NVIDIA Jetson Orin Nano.
        \\item Evalué el rendimiento del modelo mediante métricas de solapamiento IoU y latencia de inferencia por fotograma.
    \\end{itemize}

    \\projectItem[
        title={Automatización Portuaria y Pipeline de Visión Aérea (OMRON)},
        duration={Ago 2025 -- Dic 2025},
        keyHighlight={Python, OpenCV, ROS 2, NVIDIA Isaac Sim, Fusión de Cámaras}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Desarrollé algoritmos de visión por computadora en OpenCV para costura y procesamiento de imágenes aéreas desde drones DJI Tello.
        \\item Generé panoramas continuos de alta resolución para inspección logística y monitoreo automatizado de áreas de maniobra.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 4. Job 5 (261): Nurvai — AI/ML Engineer – Computer Vision & Robotics (Spanish)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-nurvai-261-es.tex",
    content: `${spanishPreamble}
${contactHeader}

\\summary{Ingeniero en Robótica y Sistemas Digitales (9no semestre en el Tecnológico de Monterrey, graduación Dic 2026) especializado en odometría visual-inercial (VIO), SLAM y percepción para robótica. Experiencia directa desplegando ORB-SLAM y segmentación EfficientSAM en NVIDIA Jetson Orin Nano con cámaras RGB-D y sensores inerciales. Dominio de ROS 2, simulación en NVIDIA Isaac Sim 4.5, transformadas cinemáticas TF2, contenedores Docker y procesamiento de datasets robóticos (.bag/.mcap). Radicado en Zapopan/Guadalajara con disponibilidad técnica inmediata.}

\\begin{educationSection}{Educacion}
    \\educationItemEs[
        program={Ingeniería en Robótica y Sistemas Digitales (9no Semestre)},
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Zapopan, Jalisco},
        graduation={Ago 2022 -- Dic 2026},
        coursework={Robótica y Cinemática, Visión por Computadora e Inteligencia Artificial, Sistemas Embebidos, Control Digital}
    ]
\\end{educationSection}

\\begin{skillsSection}{Habilidades Tecnicas}
    \\skillItem[
        category={Percepcion Robotica y VIO},
        skills={Visual SLAM (ORB-SLAM), Visual-Inertial Odometry (VIO), Cámaras Intel RealSense RGB-D, Transformadas Espaciales TF2, Nubes de Puntos}
    ] \\\\
    \\skillItem[
        category={Frameworks y Edge Computing},
        skills={ROS 2 (Humble/Iron), NVIDIA Isaac Sim 4.5, Gazebo, NVIDIA Jetson Orin Nano, PyTorch, OpenCV, Docker, FastAPI}
    ] \\\\
    \\skillItem[
        category={Lenguajes y Herramientas},
        skills={Python (NumPy, SciPy), C++ Moderno (C++17/20), Linux CLI (Ubuntu), Git/GitHub, Formatos de Datos (.bag, .mcap), Inglés B2+}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Experiencia Laboral}
    \\experienceItem[
        company={Tecnológico de Monterrey — Laboratorio de Manufactura Avanzada},
        location={Zapopan, Jalisco},
        position={Asistente de Laboratorio y Simulación Robótica},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Desarrollé interfaces mecánicas de 3 GDL para controladores VR (Meta Quest 3), reduciendo costos un 95\\% mediante prototipado CAD/DFM.
        \\item Prototipé gabinetes en PETG reforzado para mini PCs de cómputo embebido, garantizando integridad física y refrigeración pasiva.
        \\item Realicé pruebas y calibración de estaciones de trabajo dedicadas a simulación física y modelos de aprendizaje automático.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Proyectos Tecnicos}
    \\projectItem[
        title={ORB-SAM-E: Visual SLAM y Segmentación Semántica en Borde},
        duration={Feb 2026 -- Jun 2026},
        keyHighlight={NVIDIA Jetson Orin Nano, Intel RealSense, ROS 2, Python, C++, EfficientSAM, TF2}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Desplegué ORB-SLAM junto con segmentación semántica EfficientSAM sobre NVIDIA Jetson Orin Nano para generación de mapas 3D.
        \\item Procesé flujos de imágenes RGB-D y datos de IMU para estimación de trayectoria y corrección de deriva espacial en tiempo real.
        \\item Optimicé las transformaciones de coordenadas en TF2 y la sincronización de tópicos ROS 2 para entornos dinámicos.
    \\end{itemize}

    \\projectItem[
        title={Automatización Portuaria y Simulación de Robots Móviles (OMRON)},
        duration={Ago 2025 -- Dic 2025},
        keyHighlight={ROS 2, NVIDIA Isaac Sim 4.5, Gazebo, C++, Python, OptiTrack, URDF}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Desarrollé gemelos digitales y entornos de simulación física en Isaac Sim y Gazebo para flotas de robots móviles y drones.
        \\item Implementé control de trayectoria en lazo cerrado PID y seguimiento de movimiento milimétrico mediante OptiTrack.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 5. Job 6 (262): Sunscreen Inc. — Remote Robot Operator (English)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-sunscreen-262-en.tex",
    content: `${englishPreamble}
${contactHeader}

\\summary{Bilingual Robotics and Digital Systems Engineering student (Senior standing at Tecnológico de Monterrey, graduating Dec 2026) with direct hands-on experience operating physical robots, developing 3-DOF VR teleoperation interfaces (Meta Quest 3), and tracking robotic systems via ROS 2 and OptiTrack motion capture. Strong technical foundation in low-latency network routing, packet diagnostics (Cisco Packet Tracer), and disciplined incident logging. Proven track record executing strict standard operating procedures and hardware safety protocols. Fluent English (B2+).}

\\begin{educationSection}{Education}
    \\educationItem[
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Mexico},
        graduation={Aug 2022 -- Dec 2026},
        program={B.S. in Robotics and Digital Systems Engineering (Senior Standing, 9th Semester)},
        coursework={Robotics \\& Kinematics, Digital Control Systems, Computer Networks \\& Protocols, Embedded Systems, Linux Operating Systems}
    ]
\\end{educationSection}

\\begin{skillsSection}{Technical Skills}
    \\skillItem[
        category={Robotics \\& Teleoperation},
        skills={ROS 2 (Humble/Iron), NVIDIA Isaac Sim 4.5, Gazebo, OptiTrack Motion Capture, VR Controller Interfaces, URDF Kinematic Modeling}
    ] \\\\
    \\skillItem[
        category={Networking \\& Diagnostics},
        skills={Cisco Packet Tracer, TCP/IP, UDP, Packet Flow Analysis, Latency Monitoring, Linux CLI, Bash Scripting, Hardware Diagnostics}
    ] \\\\
    \\skillItem[
        category={Software \\& Operations},
        skills={Python, C++, WebSockets, RESTful APIs, Git/GitHub, Incident Escalation, SOP Compliance, Professional English (B2+)}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Professional Experience}
    \\experienceItem[
        company={Tecnológico de Monterrey — Advanced Manufacturing Lab},
        location={Zapopan, Jalisco},
        position={Lab Assistant \\& Technical Support},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Engineered custom 3-DOF mechanical interfaces for Meta Quest 3 VR controllers, optimizing spatial tracking and cutting costs by 95\\%.
        \\item Monitored workstation health, performed preventive maintenance on simulation terminals, and resolved hardware and peripheral faults.
        \\item Maintained equipment status logs and inventory records in Excel, adhering strictly to laboratory safety and escalation protocols.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Selected Technical Projects}
    \\projectItem[
        title={Port Automation, Drone Teleop \\& Simulation (OMRON)},
        duration={Aug 2025 -- Dec 2025},
        keyHighlight={ROS 2, NVIDIA Isaac Sim 4.5, OptiTrack, C++, Python, DJI Tello, JetAuto}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Operated mobile robots and drones in real time using closed-loop PID control and Kalman filter state estimation tracked by OptiTrack.
        \\item Developed simulation environments in Isaac Sim and Gazebo with ROS 2 communication nodes bridging teleoperation commands.
    \\end{itemize}

    \\projectItem[
        title={Campus Network Simulation \\& Latency Analysis (Campus Cuernavaca)},
        duration={Aug 2023 -- Dec 2023},
        keyHighlight={Cisco Packet Tracer, Routing, Switching, VLANs, Subnetting, IPv4/IPv6}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Replicated multi-building campus network topology, configuring managed switches, VLAN segmentation, and routing protocols.
        \\item Executed packet flow, ping, and traceroute connectivity tests to analyze latency bottlenecks and verify robust telemetry transmission.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 6. Job 7 (263): KATCON — Programador de robot (Spanish)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-katcon-263-es.tex",
    content: `${spanishPreamble}
${contactHeader}

\\summary{Estudiante avanzado de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey (graduación Dic 2026). Sólidos fundamentos en cinemática directa e inversa de manipuladores, trayectorias de control articular y seguridad en celdas automatizadas. Experiencia práctica en mantenimiento de maquinaria, diagnóstico electromecánico y ensamble en el Laboratorio de Manufactura Avanzada. Capacidad comprobada para asimilar rápidamente consolas de programación (teach pendants de robots industriales Fanuc/ABB) y optimizar tiempos de ciclo. Disponibilidad total para reubicación en Santa Catarina / Monterrey.}

\\begin{educationSection}{Educacion}
    \\educationItemEs[
        program={Ingeniería en Robótica y Sistemas Digitales (9no Semestre)},
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Zapopan, Jalisco},
        graduation={Ago 2022 -- Dic 2026},
        coursework={Robótica y Cinemática, Control Digital, Máquinas Eléctricas, Sistemas Mecatrónicos, Instrumentación}
    ]
\\end{educationSection}

\\begin{skillsSection}{Habilidades Tecnicas}
    \\skillItem[
        category={Robotica y Cinematica},
        skills={Cinemática Directa e Inversa, Modelado URDF, Planificación de Trayectorias, Celdas Automatizadas, Motores y Reductores}
    ] \\\\
    \\skillItem[
        category={Mantenimiento y Taller},
        skills={Diagnóstico con Multímetro, Fuentes de Poder, Confección de Arnés Eléctrico, Mantenimiento Preventivo, Sensores Industriales}
    ] \\\\
    \\skillItem[
        category={Software y Herramientas},
        skills={ROS 2, SOLIDWORKS (CAD), Gazebo, Linux CLI, Microsoft Excel (Control de Taller), Seguridad Industrial, Inglés B2+}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Experiencia Laboral}
    \\experienceItem[
        company={Tecnológico de Monterrey — Laboratorio de Manufactura Avanzada},
        location={Zapopan, Jalisco},
        position={Asistente de Laboratorio y Mantenimiento},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Ejecuté mantenimiento preventivo y correctivo a equipos de taller y terminales industriales, reemplazando componentes dañados.
        \\item Diseñé y fabriqué gabinetes protectores para mini PCs industriales utilizando filamento PETG reforzado para resistir polvo y calor.
        \\item Supervisé el cumplimiento de protocolos de seguridad en áreas de trabajo electromecánico y controlé bitácoras de servicio.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Proyectos Tecnicos}
    \\projectItem[
        title={Automatización y Cinemática de Robots Móviles (OMRON)},
        duration={Ago 2025 -- Dic 2025},
        keyHighlight={ROS 2, Cinemática URDF, Control PID, NVIDIA Isaac Sim, Gazebo, C++}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Desarrollé modelos cinemáticos URDF y calibré lazos de control PID para navegación y seguimiento de trayectorias precisas.
        \\item Diseñé en SOLIDWORKS y fabriqué mediante impresión 3D soportes estructurales en PETG para sensores y actuadores.
    \\end{itemize}

    \\projectItem[
        title={Tarjeta Embebida y Diagnóstico DigiMix (con Intel)},
        duration={Ago 2024 -- Dic 2024},
        keyHighlight={Eagle PCB, Microcontroladores STM32/ESP32, Multímetro, Análisis de Continuidad}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Diseñé esquemáticos en Eagle PCB y realicé pruebas de continuidad y voltajes con multímetro para etapas de potencia y lógica.
        \\item Ensamblé conectores industriales y validé comunicación de datos sin cortocircuitos ni interferencias electromagnéticas.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 7. Job 8 (264): WASSER CONTROL — Ingeniero Electronico Jr. / Desarrollo IoT (Spanish)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-wasser-control-264-es.tex",
    content: `${spanishPreamble}
${contactHeader}

\\summary{Estudiante avanzado de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey (graduación Dic 2026). Especializado en desarrollo de firmware embebido en C/C++ para microcontroladores STM32 y ESP32, diseño de circuitos esquemáticos y layout en Autodesk Eagle, y protocolos de comunicación IoT (MQTT, Modbus, WebSockets, Wi-Fi). Experiencia práctica en acondicionamiento de sensores analógicos (presión, corriente, voltaje), pruebas de laboratorio con multímetro y prototipado físico. Compromiso total de reubicación en Cuernavaca, Morelos.}

\\begin{educationSection}{Educacion}
    \\educationItemEs[
        program={Ingeniería en Robótica y Sistemas Digitales (9no Semestre)},
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Zapopan, Jalisco},
        graduation={Ago 2022 -- Dic 2026},
        coursework={Sistemas Embebidos, Redes de Computadoras, Circuitos Electrónicos, Instrumentación, Control Digital}
    ]
\\end{educationSection}

\\begin{skillsSection}{Habilidades Tecnicas}
    \\skillItem[
        category={Sistemas Embebidos y Firmware},
        skills={ESP32, STM32 (ARM Cortex), Arduino, C/C++ Embebido, FreeRTOS, Protocolos UART, SPI, I2C, MQTT, Modbus, WebSockets}
    ] \\\\
    \\skillItem[
        category={Diseno de Hardware y Taller},
        skills={Diseño de PCB en Eagle, Integración de Sensores de Presión y Flujo, Soldadura SMD/THT, Multímetro Digital, Osciloscopio}
    ] \\\\
    \\skillItem[
        category={Fabricacion y Software},
        skills={SOLIDWORKS (CAD Gabinetes), Impresión 3D FDM (PETG/ABS), Linux CLI, Git, Consumo de APIs REST, Inglés B2+}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Experiencia Laboral}
    \\experienceItem[
        company={Tecnológico de Monterrey — Laboratorio de Manufactura Avanzada},
        location={Zapopan, Jalisco},
        position={Asistente de Laboratorio y Soporte Técnico},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Prototipé gabinetes industriales en filamento PETG reforzado para equipos mini PC, optimizando la ventilación y la robustez mecánica.
        \\item Realicé pruebas eléctricas de continuidad y medición de fuentes con multímetro digital en estaciones de trabajo e instrumentación.
        \\item Mantuve el control de refacciones electrónicas, herramientas y consumibles de taller utilizando hojas de cálculo en Excel.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Proyectos Tecnicos}
    \\projectItem[
        title={DigiMix: Sistema Embebido y Telemetría Distribuida (con Intel)},
        duration={Ago 2024 -- Dic 2024},
        keyHighlight={Dual-Core STM32, ESP32, Eagle PCB, WebSockets, APIs REST, C/C++}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Diseñé y construí un sistema embebido dual (STM32 y ESP32) con comunicación inalámbrica para telemetría de variables en tiempo real.
        \\item Diseñé el circuito esquemático y layout en Eagle PCB, validando líneas de 3.3V y 5V con multímetro y osciloscopio sin cortos.
        \\item Implementé protocolos de transmisión mediante WebSockets y REST APIs para sincronización continua de datos hacia la nube.
    \\end{itemize}

    \\projectItem[
        title={Simulación de Infraestructura de Red (Campus Cuernavaca)},
        duration={Ago 2023 -- Dic 2023},
        keyHighlight={Cisco Packet Tracer, Switcheo, Enrutamiento, VLANs, Subredes, Diagnóstico}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Repliqué la topología de red institucional multi-edificio de Tec Campus Cuernavaca, configurando switches y routers administrados.
        \\item Verifiqué el aislamiento de subredes y la transmisión confiable de paquetes de datos mediante pruebas de ping y traceroute.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 8. Job 9 (265): Denso Mexico — Practicante de IoT (Spanish)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-denso-265-es.tex",
    content: `${spanishPreamble}
${contactHeader}

\\summary{Estudiante activo de 9no semestre de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey (graduación Dic 2026). Perfil enfocado en Industrial IoT, telemetría y conexión de variables de producción con plataformas de software mediante APIs REST y bases de datos relacionales (SQL). Experiencia en programación en Python y C/C++, integración de sensores embebidos y diagnóstico de datos. Nivel de inglés conversacional avanzado (B2+). Disponibilidad inmediata y compromiso total de reubicación en Apodaca / Monterrey para residencia profesional.}

\\begin{educationSection}{Educacion}
    \\educationItemEs[
        program={Ingeniería en Robótica y Sistemas Digitales (Estudiante Activo, 9no Semestre)},
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Zapopan, Jalisco},
        graduation={Ago 2022 -- Dic 2026},
        coursework={Sistemas Embebidos, Redes de Computadoras y Protocolos, Bases de Datos, Visión por Computadora, Control Digital}
    ]
\\end{educationSection}

\\begin{skillsSection}{Habilidades Tecnicas}
    \\skillItem[
        category={IoT Industrial y Telemetria},
        skills={Conexión Máquina-Sensor, Arquitecturas IoT, APIs REST, WebSockets, Modbus, MQTT, Plataformas Edge (Ignition/Gateways)}
    ] \\\\
    \\skillItem[
        category={Bases de Datos y Software},
        skills={PostgreSQL, MySQL, SQL Queries, Python (Pandas/Scripts de Limpieza), C/C++, Linux CLI, Git/GitHub, Docker}
    ] \\\\
    \\skillItem[
        category={Hardware y Fabricacion},
        skills={Microcontroladores ESP32/STM32, Multímetro Digital, Cableado Estructurado, Impresión 3D (PETG), Inglés B2+ Avanzado}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Experiencia Laboral}
    \\experienceItem[
        company={Tecnológico de Monterrey — Laboratorio de Manufactura Avanzada},
        location={Zapopan, Jalisco},
        position={Asistente de Laboratorio y Soporte Técnico},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Prototipé gabinetes para mini PCs en manufactura aditiva y aseguré la conectividad física de sensores y terminales de cómputo.
        \\item Ejecuté soporte preventivo a estaciones de trabajo de laboratorio, resolviendo fallas de hardware y enlace a la red interna.
        \\item Gestioné registros de inventario y consumibles técnicos en Excel para optimizar disponibilidad de materiales.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Proyectos Tecnicos}
    \\projectItem[
        title={DigiMix: Telemetría Distribuida y Plataforma IoT (con Intel)},
        duration={Ago 2024 -- Dic 2024},
        keyHighlight={STM32, ESP32, APIs REST, WebSockets, Adquisición de Datos, C/C++}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Implementé la adquisición de variables de sensores y su transmisión síncrona hacia plataformas remotas mediante APIs REST y WebSockets.
        \\item Validé la integridad de las tramas de datos transmitidas, eliminando discrepancias e inconsistencias de lectura en tiempo real.
    \\end{itemize}

    \\projectItem[
        title={Extracción Inteligente de Datos y Pipeline Automatizado},
        duration={Feb 2025 -- May 2025},
        keyHighlight={Python, APIs REST, Webhooks, PostgreSQL, Procesamiento Automatizado}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Desarrollé scripts en Python para ingesta, limpieza y estructuración automática de registros hacia bases de datos relacionales PostgreSQL.
        \\item Reduje en un 70\\% la carga manual de captura de información garantizando esquemas limpios y sanitizados.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 9. Job 10 (266): SOLMIN TECH — Ingeniero Mecatronico (Spanish)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-solmin-tech-266-es.tex",
    content: `${spanishPreamble}
${contactHeader}

\\summary{Estudiante de Ingeniería en Robótica y Sistemas Digitales (Tec de Monterrey, graduación Dic 2026). Perfil integral de prototipado mecatrónico: modelado CAD en SOLIDWORKS con DFM, impresión 3D FDM en PETG/ABS, acondicionamiento de galgas extensiométricas y celdas de carga, y firmware C/C++ en ESP32/STM32. Telemetría IoT hacia bases de datos y hojas de cálculo (acreditado con curso de 100 horas en Excel). Disponibilidad total de reubicación en Torreón.}

\\begin{educationSection}{Educacion}
    \\educationItemEs[
        program={Ingeniería en Robótica y Sistemas Digitales (9no Semestre)},
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Zapopan, Jalisco},
        graduation={Ago 2022 -- Dic 2026},
        coursework={Sistemas Mecatrónicos, Instrumentación, Sistemas Embebidos, Control Digital}
    ]

    \\educationItemEs[
        program={Curso de 100 Horas en Microsoft Office (Excel Intermedio, Fórmulas y Reportes)},
        university={Bachillerato General},
        college={Mazatlán, Sinaloa},
        graduation={Certificado Acreditado},
        coursework={Fórmulas Avanzadas, Tablas Dinámicas, Control de Inventarios y Bitácoras}
    ]
\\end{educationSection}

\\begin{skillsSection}{Habilidades Tecnicas}
    \\skillItem[
        category={CAD y Fabricacion Aditiva},
        skills={SOLIDWORKS (Modelado Paramétrico, Ensambles, DFM), Orca Slicer/Cura, Impresión 3D FDM en PETG, ABS y TPU, Acabados y Ajustes}
    ] \\\\
    \\skillItem[
        category={Instrumentacion y Sensores},
        skills={Acondicionamiento de Galgas Extensiométricas, Celdas de Carga, Amplificadores de Instrumentación, Multímetro, Osciloscopio}
    ] \\\\
    \\skillItem[
        category={Firmware y Telemetria},
        skills={ESP32, STM32, C/C++ Embebido, Wi-Fi/Bluetooth, APIs REST, Envío de Telemetría a Hojas de Cálculo (Sheets/Excel) y SQL}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Experiencia Laboral}
    \\experienceItem[
        company={Tecnológico de Monterrey — Laboratorio de Manufactura Avanzada},
        location={Zapopan, Jalisco},
        position={Asistente de Laboratorio y Prototipado},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Diseñé en CAD y fabriqué gabinetes industriales en PETG reforzado para mini PCs, optimizando ventilación y rigidez estructural.
        \\item Realicé pruebas eléctricas y mediciones con multímetro en fuentes e instrumentación de taller, diagnosticando fallas de hardware.
        \\item Gestioné inventarios de piezas, refacciones y filamentos de impresión utilizando tablas automatizadas en Microsoft Excel.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Proyectos Tecnicos}
    \\projectItem[
        title={DigiMix: Sistema Embebido y Telemetría Distribuida (con Intel)},
        duration={Ago 2024 -- Dic 2024},
        keyHighlight={ESP32, STM32, C/C++, Sensores, Eagle PCB, Telemetría Inalámbrica}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Desarrollé firmware en C/C++ para adquisición analógica de sensores y transmisión inalámbrica hacia servidores y registros en tiempo real.
        \\item Diseñé el layout de la placa PCB en Eagle y validé la estabilidad de alimentación de sensores y etapas de amplificación.
    \\end{itemize}

    \\projectItem[
        title={Fantasma Médico Endoscópico de Código Abierto},
        duration={Ago 2025 -- Jun 2026},
        keyHighlight={SOLIDWORKS, Impresión 3D FDM Multi-Material (PETG/TPU), Tolerancias DFM}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Diseñé y fabriqué prototipos funcionales multi-material combinando PETG estructural y TPU flexible con tolerancias milimétricas.
        \\item Reduje costos de desarrollo un 80\\% respecto a alternativas comerciales mediante optimización de ensamblajes en SOLIDWORKS.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 10. Job 11 (267): Pegasus Control — Soporte Tecnico Especializado (Spanish)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-pegasus-control-267-es.tex",
    content: `${spanishPreamble}
${contactHeader}

\\summary{Estudiante avanzado de Ingeniería en Robótica y Sistemas Digitales radicado en Zapopan, Jalisco (graduación Dic 2026). Sólidos conocimientos en redes TCP/IP, enrutamiento, diagnóstico de paquetes de datos y troubleshooting de hardware en sistemas de cómputo y control. Experiencia en validación de peticiones HTTP, respuestas JSON, APIs REST y logs en entornos Linux y Windows. Metodología rigurosa para descarte de fallas entre capas física, firmware y software. Disponibilidad presencial inmediata en Technology Park Zapopan.}

\\begin{educationSection}{Educacion}
    \\educationItemEs[
        program={Ingeniería en Robótica y Sistemas Digitales (9no Semestre)},
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Zapopan, Jalisco},
        graduation={Ago 2022 -- Dic 2026},
        coursework={Redes de Computadoras y Protocolos, Sistemas Operativos, Sistemas Embebidos, Arquitectura de Software}
    ] \\vspace{0.2em}

    \\educationItemEs[
        program={Curso de 100 Horas en Microsoft Office (Excel Intermedio, Word, Outlook)},
        university={Bachillerato General},
        college={Mazatlán, Sinaloa},
        graduation={Certificado Acreditado},
        coursework={Bitácoras de Servicio, Fórmulas de Búsqueda, Control de Registros y Reportes de Soporte}
    ]
\\end{educationSection}

\\begin{skillsSection}{Habilidades Tecnicas}
    \\skillItem[
        category={Redes y Protocolos},
        skills={Cisco Packet Tracer, Topologías de Red, VLANs, Direccionamiento IP, Subredes, Enrutamiento, TCP/IP, Wireshark}
    ] \\\\
    \\skillItem[
        category={Diagnostico y Troubleshooting},
        skills={Validación HTTP/JSON, APIs REST, Análisis de Logs, Linux CLI, Windows Server/Desktop, Multímetro Digital, Cableado UTP}
    ] \\\\
    \\skillItem[
        category={Herramientas y Gestion},
        skills={Bases de Datos SQL (PostgreSQL, MySQL), Microsoft Excel Intermedio, Bitácoras de Tickets, Radicación en Zapopan}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Experiencia Laboral}
    \\experienceItem[
        company={Tecnológico de Monterrey — Laboratorio de Manufactura Avanzada},
        location={Zapopan, Jalisco},
        position={Asistente de Laboratorio y Soporte Técnico},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Atendí y resolví incidencias de conectividad y hardware en terminales de trabajo y equipos de cómputo de laboratorio.
        \\item Diagnostiqué fallas en fuentes de poder, tarjetas periféricas y cableado de red mediante pruebas de continuidad e inspección de logs.
        \\item Gestioné reportes de servicio e inventario técnico en Excel para control de incidencias y mantenimiento preventivo.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Proyectos Tecnicos}
    \\projectItem[
        title={Simulación y Diagnóstico de Red Institucional (Campus Cuernavaca)},
        duration={Ago 2023 -- Dic 2023},
        keyHighlight={Cisco Packet Tracer, Switcheo, Enrutamiento, VLANs, Diagnóstico de Tráfico}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Repliqué la topología multi-edificio en Cisco Packet Tracer configurando VLANs para aislamiento de tráfico institucional.
        \\item Ejecuté pruebas de conectividad de extremo a extremo (ping, traceroute) y análisis de flujo de paquetes para descartar cuellos de botella.
    \\end{itemize}

    \\projectItem[
        title={DigiMix: Telemetría y Validación de APIs REST (con Intel)},
        duration={Ago 2024 -- Dic 2024},
        keyHighlight={WebSockets, APIs REST, JSON, ESP32, STM32, Diagnóstico de Tramas}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Implementé comunicación cliente-servidor mediante peticiones REST y WebSockets con paquetes formateados en JSON.
        \\item Depuré anomalías en la transmisión de datos analizando respuestas HTTP y tiempos de respuesta bajo condiciones de alta carga.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 11. Job 12 (268): Bosch Group — Ingeniero/a de Industria 4.0 (English)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-bosch-268-en.tex",
    content: `${englishPreamble}
${contactHeader}

\\summary{Robotics and Digital Systems Engineering student (Senior standing at Tecnológico de Monterrey, graduating Dec 2026) specializing in edge AI architectures, Industrial IoT systems, and automated data pipelines. Demonstrated experience deploying computer vision models on NVIDIA Jetson Orin Nano, developing embedded telemetry firmware in C/C++ on STM32/ESP32, and executing robotic simulations in Isaac Sim and Gazebo. Strong foundations in industrial protocols (Modbus, TCP/IP, WebSockets), Linux OS, and CAD/DFM. 100\\% committed to relocating to Celaya, Guanajuato. Fluent English (B2+).}

\\begin{educationSection}{Education}
    \\educationItem[
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Mexico},
        graduation={Aug 2022 -- Dec 2026},
        program={B.S. in Robotics and Digital Systems Engineering (Senior Standing, 9th Semester)},
        coursework={Computer Vision \\& AI, Embedded Systems, Computer Networks \\& Protocols, Digital Control, Robotics \\& Kinematics}
    ]
\\end{educationSection}

\\begin{skillsSection}{Technical Skills}
    \\skillItem[
        category={Industry 4.0 \\& Edge Systems},
        skills={NVIDIA Jetson Orin Nano, Edge AI Deployment, Docker, Linux CLI (Ubuntu), EfficientSAM, OpenCV, Python, PyTorch}
    ] \\\\
    \\skillItem[
        category={Embedded IoT \\& Telemetry},
        skills={STM32 (ARM Cortex), ESP32, C/C++ Firmware, Modbus, TCP/IP, MQTT, WebSockets, RESTful APIs, Eagle PCB Design}
    ] \\\\
    \\skillItem[
        category={Prototyping \\& Tools},
        skills={SOLIDWORKS (CAD/DFM), FDM 3D Printing (PETG/ABS), Hardware Diagnostics, Git/GitHub, Fluent English (B2+)}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Professional Experience}
    \\experienceItem[
        company={Tecnológico de Monterrey — Advanced Manufacturing Lab},
        location={Zapopan, Jalisco},
        position={Lab Assistant \\& Simulation Support},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Designed and fabricated industrial mini PC enclosures in fiberglass-reinforced PETG, ensuring thermal efficiency and component durability.
        \\item Performed hardware diagnostics and preventative maintenance on workshop computer workstations and electronic testing equipment.
        \\item Tracked laboratory inventories, maintenance schedules, and replacement parts using structured Excel databases.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Selected Technical Projects}
    \\projectItem[
        title={ORB-SAM-E: Edge Perception \\& Semantic Voxel Mapping},
        duration={Feb 2026 -- Jun 2026},
        keyHighlight={NVIDIA Jetson Orin Nano, Intel RealSense, ROS 2, Python, C++, EfficientSAM}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Deployed real-time edge computer vision combining ORB-SLAM with EfficientSAM semantic segmentation on NVIDIA Jetson Orin Nano.
        \\item Processed live RGB-D camera streams to build 3D spatial voxel representations, optimizing TF2 spatial coordinate transformations.
    \\end{itemize}

    \\projectItem[
        title={DigiMix: Distributed Telemetry \\& Embedded System (with Intel)},
        duration={Aug 2024 -- Dic 2024},
        keyHighlight={Dual-Core STM32, ESP32, WebSockets, REST APIs, Eagle PCB, C/C++}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Built a dual-core embedded system for real-time telemetry streaming over WebSockets and REST APIs with zero logic integration faults.
        \\item Designed custom PCB in Eagle, validating power distribution and communication lines with multimeters and oscilloscopes.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 12. Job 13 (269): Mattel — Industrial IoT Engineer (English)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-mattel-269-en.tex",
    content: `${englishPreamble}
${contactHeader}

\\summary{Multidisciplinary Robotics and Digital Systems Engineering student (Senior standing at Tecnológico de Monterrey, graduating Dec 2026) with deep expertise in embedded systems, industrial IoT telemetry, and smart factory hardware integration. Experienced in connecting sensors and microcontrollers (STM32, ESP32) to edge/cloud platforms via REST APIs and WebSockets. Proven hands-on capability in industrial enclosure prototyping, PCB design, and shop-floor hardware maintenance. Full relocation commitment to Escobedo / Monterrey area. Fluent English (B2+).}

\\begin{educationSection}{Education}
    \\educationItem[
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Mexico},
        graduation={Aug 2022 -- Dec 2026},
        program={B.S. in Robotics and Digital Systems Engineering (Senior Standing, 9th Semester)},
        coursework={Embedded Systems, Computer Networks \\& Protocols, Digital Control, Operating Systems, Mechatronic Systems}
    ]
\\end{educationSection}

\\begin{skillsSection}{Technical Skills}
    \\skillItem[
        category={Industrial IoT \\& Connectivity},
        skills={ESP32, STM32 (ARM Cortex), Sensor Integration, MQTT, Modbus, WebSockets, RESTful APIs, C/C++, Python}
    ] \\\\
    \\skillItem[
        category={Hardware \\& Electronics},
        skills={PCB Design (Eagle), Oscilloscope \\& Multimeter Diagnostics, Wire Harness Assembly, NVIDIA Jetson Orin Nano, Linux CLI}
    ] \\\\
    \\skillItem[
        category={Prototyping \\& Operations},
        skills={SOLIDWORKS (CAD, DFM), Industrial FDM 3D Printing (PETG/ABS), Git/GitHub, Excel Data Tracking, Fluent English (B2+)}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Professional Experience}
    \\experienceItem[
        company={Tecnológico de Monterrey — Advanced Manufacturing Lab},
        location={Zapopan, Jalisco},
        position={Lab Assistant \\& Technical Support},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Prototyped and fabricated industrial mini PC enclosures in fiberglass-reinforced PETG, ensuring robust thermal management.
        \\item Conducted preventative and corrective maintenance on high-precision laboratory workstations, power supplies, and wiring.
        \\item Managed inventory logs for tools, electronic spare parts, and consumables using intermediate Excel spreadsheets.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Selected Technical Projects}
    \\projectItem[
        title={DigiMix: Distributed Telemetry \\& Embedded System (with Intel)},
        duration={Aug 2024 -- Dic 2024},
        keyHighlight={STM32, ESP32, WebSockets, REST APIs, PCB Eagle, Real-Time Sensor Ingestion}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Built dual-core embedded telemetry platform with WebSockets and REST APIs for synchronized sensor acquisition and remote monitoring.
        \\item Designed custom PCB in Eagle and additive enclosure, validating signal integrity and verifying zero electrical shorts.
    \\end{itemize}

    \\projectItem[
        title={Port Automation \\& Mobile Robotics Platform (OMRON)},
        duration={Aug 2025 -- Dic 2025},
        keyHighlight={ROS 2, Isaac Sim 4.5, Sensor Integration, C++, Python, PETG Brackets}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Implemented closed-loop control and telemetry ingestion on mobile platforms, designing custom sensor brackets and mounts in PETG.
        \\item Programmed communication nodes bridging real-time sensor streams and supervisory control platforms.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  },

  // 13. Job 15 (271): Master Loyalty Group — Analista en Inteligencia Artificial Junior (Spanish)
  {
    filename: "output/cv-christian-omar-payan-torrontegui-master-loyalty-group-271-es.tex",
    content: `${spanishPreamble}
${contactHeader}

\\summary{Estudiante avanzado de Ingeniería en Robótica y Sistemas Digitales en el Tecnológico de Monterrey (graduación Dic 2026). Especializado en la integración de modelos de lenguaje e inteligencia artificial mediante APIs (OpenAI, Gemini), ingeniería de prompts avanzada y orquestación de flujos de trabajo automatizados con Python, webhooks y bases de datos SQL (PostgreSQL). Experiencia comprobada en transformación y sanitización de datos, reduciendo tiempos de captura manual en un 70\\%. Certificación acreditada de 100 horas en Microsoft Office (Excel intermedio). Disponibilidad remota inmediata a nivel nacional.}

\\begin{educationSection}{Educacion}
    \\educationItemEs[
        program={Ingeniería en Robótica y Sistemas Digitales (9no Semestre)},
        university={Tecnológico de Monterrey, Campus Guadalajara},
        college={Zapopan, Jalisco},
        graduation={Ago 2022 -- Dic 2026},
        coursework={Inteligencia Artificial y Visión por Computadora, Bases de Datos, Arquitectura de Software, Sistemas Embebidos}
    ] \\vspace{0.2em}

    \\educationItemEs[
        program={Curso de 100 Horas en Microsoft Office (Excel Intermedio, Word, PowerPoint)},
        university={Bachillerato General},
        college={Mazatlán, Sinaloa},
        graduation={Certificado Acreditado},
        coursework={Fórmulas Avanzadas, Tablas Dinámicas, Filtrado y Normalización de Registros}
    ]
\\end{educationSection}

\\begin{skillsSection}{Habilidades Tecnicas}
    \\skillItem[
        category={Inteligencia Artificial y LLMs},
        skills={APIs de LLM (OpenAI, Gemini, Claude), Prompt Engineering, Agentes Inteligentes, Flujos Automatizados, LangChain basics}
    ] \\\\
    \\skillItem[
        category={Programacion y Datos},
        skills={Python (FastAPI, Pandas, Requests), SQL (PostgreSQL, MySQL), Webhooks, n8n, Make/Zapier, Postman, JSON Parsing}
    ] \\\\
    \\skillItem[
        category={Herramientas y Analisis},
        skills={Microsoft Excel Intermedio (Fórmulas, Tablas Dinámicas), Git/GitHub, Docker, Linux CLI, Inglés B2+ Profesional}
    ]
\\end{skillsSection}

\\begin{experienceSection}{Experiencia Laboral}
    \\experienceItem[
        company={Tecnológico de Monterrey — Laboratorio de Manufactura Avanzada},
        location={Zapopan, Jalisco},
        position={Asistente de Laboratorio y Automatización},
        duration={Feb 2026 -- Jun 2026}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Implementé hojas de cálculo automatizadas en Excel con fórmulas y validaciones para control de inventarios y consumibles de taller.
        \\item Prototipé gabinetes industriales para mini PCs y brindé soporte técnico a estaciones de cómputo dedicadas a procesamiento de datos.
        \\item Documenté bitácoras de servicio y asistí a usuarios en la configuración de entornos de software y conexión a red.
    \\end{itemize}
\\end{experienceSection}

\\begin{experienceSection}{Proyectos Tecnicos}
    \\projectItem[
        title={Extracción Inteligente de Documentos y Pipeline Automatizado},
        duration={Feb 2025 -- May 2025},
        keyHighlight={Python, APIs LLM (OpenAI/Gemini), Webhooks, n8n, PostgreSQL, JSON}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Desarrollé un motor automatizado en Python utilizando APIs de LLMs para extraer y estructurar registros JSON desde documentos no estructurados.
        \\item Diseñé prompts optimizados para minimizar alucinaciones y normalizar datos heterogéneos antes de la inserción en base de datos.
        \\item Orquesté flujos dirigidos por eventos con webhooks y n8n, sincronizando datos en PostgreSQL y recortando el ingreso manual un 70\\%.
    \\end{itemize}

    \\projectItem[
        title={DigiMix: Telemetría y Consumo de APIs REST (con Intel)},
        duration={Ago 2024 -- Dic 2024},
        keyHighlight={APIs REST, WebSockets, Python, C++, Microcontroladores, Adquisición de Datos}
    ]
    \\begin{itemize}
        \\vspace{-0.5em}
        \\itemsep -9pt {}
        \\item Programé endpoints y flujos de transmisión para captura de datos en tiempo real mediante protocolos REST y WebSockets.
        \\item Aseguré la consistencia de tramas de información y gestioné almacenamiento estructurado de mediciones.
    \\end{itemize}
\\end{experienceSection}

\\end{document}
`
  }
];

for (const cv of cvs) {
  fs.writeFileSync(cv.filename, cv.content, 'utf8');
  console.log(`Generated LaTeX file: ${cv.filename}`);
}

console.log("All 13 LaTeX CVs successfully written.");
