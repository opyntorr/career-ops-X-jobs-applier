import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const APIFY_TOKEN = process.env.APIFY_TOKEN;
if (!APIFY_TOKEN) {
  console.error("❌ Error: APIFY_TOKEN no está definido en el archivo .env");
  process.exit(1);
}

const QUERIES = [
  "Robotics Engineer Mexico",
  "Embedded Systems Engineer Zapopan",
  "3D Printing Engineer Remote Mexico",
  "Diseno Mecanico CAD Remoto Mexico",
  "Profesor Robotica Tecnologia Jalisco"
];

// Función para ejecutar un actor de Apify de manera asíncrona evitando timeouts HTTP
async function runApifyActorAsync(actorId, input) {
  console.log(`📡 Iniciando ejecución en Apify: ${actorId}...`);
  const startUrl = `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`;
  
  try {
    const startRes = await fetch(startUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!startRes.ok) {
      const errText = await startRes.text();
      console.error(`⚠️ Error al iniciar ${actorId} (${startRes.status}): ${errText.slice(0, 200)}`);
      return [];
    }

    const startData = await startRes.json();
    const runId = startData.data?.id;
    const datasetId = startData.data?.defaultDatasetId;

    if (!runId || !datasetId) {
      console.error(`⚠️ No se pudo obtener el ID de ejecución para ${actorId}`);
      return [];
    }

    console.log(`⏳ Ejecutando ${actorId} (ID: ${runId}). Esperando resultados...`);

    let status = 'RUNNING';
    const pollUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`;
    const startTime = Date.now();

    while (status === 'RUNNING' || status === 'READY') {
      await new Promise(r => setTimeout(r, 5000));
      const pollRes = await fetch(pollUrl);
      if (pollRes.ok) {
        const pollData = await pollRes.json();
        status = pollData.data?.status;
      }
      if (Date.now() - startTime > 120000) {
        console.warn(`⚠️ Tiempo límite alcanzado para ${actorId}`);
        break;
      }
    }

    if (status !== 'SUCCEEDED') {
      console.warn(`⚠️ La ejecución de ${actorId} terminó con estado: ${status}`);
    }

    const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`;
    const dataRes = await fetch(datasetUrl);
    if (dataRes.ok) {
      const items = await dataRes.json();
      if (Array.isArray(items)) {
        console.log(`✅ ${items.length} vacantes obtenidas de ${actorId}`);
        return items;
      }
    }
    return [];
  } catch (err) {
    console.error(`❌ Error al procesar ${actorId}:`, err.message);
    return [];
  }
}

async function main() {
  console.log("🚀 Iniciando extracción automatizada de vacantes en Google Jobs, LinkedIn y Glassdoor...");

  const allJobs = [];

  // 1. Scraping en Google Jobs
  const googleResults = await runApifyActorAsync("khadinakbar~google-jobs-scraper", {
    queries: QUERIES,
    maxPages: 1
  });

  for (const item of googleResults) {
    const title = item.title || item.job_title || item.position || "Sin titulo";
    const company = item.company || item.company_name || "Empresa Desconocida";
    const location = item.location || "Mexico / Remoto";
    const applyUrl = item.apply_url || item.url || item.link || "";
    const description = item.description || item.job_description || "";

    if (description && description.length > 30) {
      allJobs.push({ title, company, location, applyUrl, description, source: "Google Jobs" });
    }
  }

  // 2. Scraping en LinkedIn Jobs
  for (const query of QUERIES.slice(0, 3)) {
    const linkedinResults = await runApifyActorAsync("curious_coder~linkedin-jobs-scraper", {
      title: query,
      location: "Mexico",
      rows: 10
    });

    for (const item of linkedinResults) {
      const title = item.title || item.jobTitle || "Sin titulo";
      const company = item.companyName || item.company || "Empresa Desconocida";
      const location = item.location || "Mexico / Remoto";
      const applyUrl = item.link || item.jobUrl || item.url || "";
      const description = item.description || item.jobDescription || item.text || "";

      if (description && description.length > 30) {
        allJobs.push({ title, company, location, applyUrl, description, source: "LinkedIn Jobs" });
      }
    }
  }

  // 3. Scraping en Glassdoor Jobs
  for (const query of QUERIES.slice(0, 2)) {
    const glassdoorResults = await runApifyActorAsync("cheap_scraper~glassdoor-jobs-scraper-remove-duplicate-jobs", {
      query: query,
      location: "Mexico",
      limit: 10
    });

    for (const item of glassdoorResults) {
      const title = item.title || item.jobTitle || "Sin titulo";
      const company = item.companyName || item.company || "Empresa Desconocida";
      const location = item.location || "Mexico / Remoto";
      const applyUrl = item.url || item.jobUrl || item.link || "";
      const description = item.description || item.jobDescription || "";

      if (description && description.length > 30) {
        allJobs.push({ title, company, location, applyUrl, description, source: "Glassdoor" });
      }
    }
  }

  if (allJobs.length === 0) {
    console.log("⚠️ No se obtuvieron nuevas vacantes en esta ejecución.");
    return;
  }

  const jdsDir = path.resolve('jds');
  if (!fs.existsSync(jdsDir)) {
    fs.mkdirSync(jdsDir, { recursive: true });
  }

  let savedCount = 0;

  for (const job of allJobs) {
    const slugCompany = (job.company || "empresa").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slugTitle = (job.title || "rol").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const filename = `${slugCompany}-${slugTitle}`.slice(0, 60) + '.txt';
    const filePath = path.join(jdsDir, filename);

    if (fs.existsSync(filePath)) continue;

    const content = `COMPANY: ${job.company}
ROLE: ${job.title}
LOCATION: ${job.location}
SOURCE: ${job.source}
URL: ${job.applyUrl}

JOB DESCRIPTION:
${job.description}
`;

    fs.writeFileSync(filePath, content, 'utf-8');
    savedCount++;
  }

  console.log(`🎉 Se guardaron ${savedCount} vacantes nuevas en la carpeta jds/`);
}

main();
