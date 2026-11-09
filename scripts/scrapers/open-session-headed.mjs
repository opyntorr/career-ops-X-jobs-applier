import { chromium } from 'playwright';

const PROFILE_DIR = '/home/opyntorr/.gemini/antigravity-cli/brain/59daa672-f2d4-47a6-8357-c99e075218c6/scratch/browser-profile';

async function openInteractiveSession() {
  console.log('======================================================');
  console.log('   SESIÓN INTERACTIVA DE NAVEGACIÓN — MAZATLÁN        ');
  console.log('======================================================\n');
  console.log('Abriendo navegador Chromium con perfil persistente...');
  console.log('Ruta de perfil:', PROFILE_DIR);
  console.log('\nPuedes iniciar sesión en Facebook o resolver captchas de Indeed.');
  console.log('Todas las cookies y sesiones quedarán guardadas para los scrapers.');
  console.log('El navegador permanecerá abierto hasta que cierres la ventana.\n');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1366, height: 868 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page1 = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  await page1.goto('https://mx.indeed.com/jobs?q=ingeniero&l=Mazatl%C3%A1n%2C+Sin.');

  const page2 = await context.newPage();
  await page2.goto('https://www.facebook.com/groups/1083163351740685/');

  const page3 = await context.newPage();
  await page3.goto('https://www.occ.com.mx/empleos/en-sinaloa/en-mazatlan/');

  console.log('Ventana lista con pestañas de Indeed, Facebook y OCC Mundial.');
  console.log('Presiona Ctrl+C en la terminal o cierra la ventana cuando termines.');

  // Mantener abierto esperando a que el usuario cierre todas las páginas
  await new Promise((resolve) => {
    context.on('close', resolve);
    page1.on('close', () => {
      if (context.pages().length === 0) resolve();
    });
  });

  console.log('\nSesión guardada exitosamente.');
}

openInteractiveSession().catch(console.error);
