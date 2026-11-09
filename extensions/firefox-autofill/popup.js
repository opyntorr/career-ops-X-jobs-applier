// Popup logic for Career-Ops FastApply

document.addEventListener('DOMContentLoaded', () => {
  const P = window.CAREER_OPS_PROFILE;
  const statusEl = document.getElementById('status');

  function setStatus(msg) {
    statusEl.innerText = msg;
    setTimeout(() => {
      statusEl.innerText = '';
    }, 2500);
  }

  function copyText(txt, label) {
    navigator.clipboard.writeText(txt).then(() => {
      setStatus(`Copiado: ${label}`);
    });
  }

  // Trigger autofill on active tab
  document.getElementById('btn-autofill').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'autofill' }, (response) => {
          setStatus('Formulario completado');
        });
      }
    });
  });

  // Copy password
  document.getElementById('btn-copy-pass').addEventListener('click', () => {
    copyText('CareerOps2026!Sec', 'Contraseña');
  });

  // Copy Snippets
  document.getElementById('btn-copy-omron').addEventListener('click', () => {
    copyText(P.snippets.systemIntegration, 'Sistema OMRON');
  });

  document.getElementById('btn-copy-mot').addEventListener('click', () => {
    copyText(P.snippets.motivationGeneric, 'Motivación');
  });

  document.getElementById('btn-copy-summary').addEventListener('click', () => {
    copyText(P.snippets.summaryEs, 'Resumen Profesional');
  });

  document.getElementById('btn-copy-linkedin').addEventListener('click', () => {
    copyText(P.contact.linkedin, 'LinkedIn');
  });
});
