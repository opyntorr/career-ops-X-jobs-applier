// Career-Ops Autofill Content Script (Workday VPS-Safe Version)
// Built for Christian Omar Payán Torróntegui

(function() {
  if (window.__CAREER_OPS_AUTOFILL_LOADED__) return;
  window.__CAREER_OPS_AUTOFILL_LOADED__ = true;

  const P = window.CAREER_OPS_PROFILE;

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // Safe setter that doesn't corrupt Workday's VPS session
  async function setNativeValueSafe(element, value) {
    if (!element) return;
    if (element.readOnly || element.disabled || element.getAttribute('aria-readonly') === 'true') {
      return; // Skip read-only/modal-backed fields to prevent VPS crash
    }

    try {
      element.focus();
      const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
      if (descriptor && descriptor.set) {
        descriptor.set.call(element, value);
      } else {
        element.value = value;
      }
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(30);
      element.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(20);
      element.dispatchEvent(new Event('blur', { bubbles: true }));
      await sleep(40); // Staggering delay so server AJAX calls don't collide
    } catch (e) {
      console.warn('[Career-Ops] Error setting value on', element, e);
    }
  }

  function cleanText(str) {
    return (str || '').toLowerCase().replace(/[\*\:\?\_\-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function getFieldLabel(el) {
    let label = '';
    if (el.id) {
      const lbl = document.querySelector(`label[for="${el.id}"]`);
      if (lbl) label += ' ' + lbl.innerText;
    }
    const parentLabel = el.closest('label');
    if (parentLabel) label += ' ' + parentLabel.innerText;
    
    const ariaLabel = el.getAttribute('aria-label') || '';
    const ariaLabelledBy = el.getAttribute('aria-labelledby') || '';
    if (ariaLabel) label += ' ' + ariaLabel;
    if (ariaLabelledBy) {
      const lEl = document.getElementById(ariaLabelledBy);
      if (lEl) label += ' ' + lEl.innerText;
    }

    // Workday and custom ATS parent question containers
    const formGroup = el.closest('[data-automation-id], .form-group, .field, [class*="form-item"], [class*="question"], [class*="formField"], div[id*="field"], div[class*="field"]');
    if (formGroup) {
      const gLabel = formGroup.querySelector('label, [class*="label"], [data-automation-id*="label"], legend, span, h3, h4');
      if (gLabel) label += ' ' + gLabel.innerText;
    }

    const placeholder = el.getAttribute('placeholder') || '';
    const name = el.getAttribute('name') || '';
    const id = el.getAttribute('id') || '';
    const dataAuto = el.getAttribute('data-automation-id') || '';

    return cleanText(`${label} ${placeholder} ${name} ${id} ${dataAuto}`);
  }

  async function autofillPage() {
    let filledCount = 0;
    const pageText = document.body.innerText.toLowerCase();
    const isJaliscoRole = /guadalajara|zapopan|el salto|jalisco/i.test(pageText);

    const city = isJaliscoRole ? P.location.secondaryCity : P.location.city;
    const state = isJaliscoRole ? P.location.secondaryState : P.location.state;
    const postalCode = isJaliscoRole ? P.location.secondaryPostalCode : P.location.postalCode;

    // 1. Text Inputs and Textareas (Processed sequentially to avoid VPS session collision)
    const textInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([type="submit"]):not([type="button"]):not([type="file"]), textarea'));

    for (const el of textInputs) {
      if (el.readOnly || el.disabled || el.getAttribute('aria-readonly') === 'true') continue;

      const autoId = (el.getAttribute('data-automation-id') || '').toLowerCase();
      const l = getFieldLabel(el);

      // --- WORKDAY SPECIFIC AUTOMATION IDS (Exact Match First) ---
      if (autoId.includes('firstname') || autoId.includes('givenname')) {
        await setNativeValueSafe(el, P.name.first);
        filledCount++;
      } else if (autoId.includes('middlename')) {
        await setNativeValueSafe(el, P.name.middle);
        filledCount++;
      } else if (autoId.includes('lastname') && !autoId.includes('secondary')) {
        await setNativeValueSafe(el, P.name.fatherFamily);
        filledCount++;
      } else if (autoId.includes('secondarylastname')) {
        await setNativeValueSafe(el, P.name.motherFamily);
        filledCount++;
      } else if (autoId.includes('addressline1')) {
        await setNativeValueSafe(el, P.location.street);
        filledCount++;
      } else if (autoId.includes('city') || autoId.includes('municipality')) {
        await setNativeValueSafe(el, city);
        filledCount++;
      } else if (autoId.includes('postalcode')) {
        await setNativeValueSafe(el, postalCode);
        filledCount++;
      } else if (autoId.includes('phonenumber') || autoId.includes('phone-number')) {
        await setNativeValueSafe(el, P.contact.phone);
        filledCount++;
      }

      // --- GENERIC LABEL MATCHING (Title Case for names) ---
      else if (l.includes('given name') || l.includes('first name') || l.includes('primer nombre') || l.includes('nombres')) {
        await setNativeValueSafe(el, P.name.first);
        filledCount++;
      } else if (l.includes('middle name') || l.includes('segundo nombre')) {
        await setNativeValueSafe(el, P.name.middle);
        filledCount++;
      } else if (l.includes('father') || l.includes('paterno') || l.includes('primer apellido') || (l.includes('family name') && !l.includes('mother') && !l.includes('materno'))) {
        await setNativeValueSafe(el, P.name.fatherFamily);
        filledCount++;
      } else if (l.includes('mother') || l.includes('materno') || l.includes('segundo apellido')) {
        await setNativeValueSafe(el, P.name.motherFamily);
        filledCount++;
      } else if ((l.includes('last name') || l.includes('apellidos')) && !l.includes('first') && !l.includes('primer')) {
        await setNativeValueSafe(el, `${P.name.fatherFamily} ${P.name.motherFamily}`);
        filledCount++;
      } else if (l.includes('full name') || l.includes('nombre completo')) {
        await setNativeValueSafe(el, P.name.full);
        filledCount++;
      }

      // --- CONTACT & SOCIAL ---
      else if (l.includes('email') || l.includes('correo') || l.includes('e mail')) {
        await setNativeValueSafe(el, P.contact.email);
        filledCount++;
      } else if (l.includes('phone') || l.includes('teléfono') || l.includes('telefono') || l.includes('celular') || l.includes('mobile')) {
        await setNativeValueSafe(el, P.contact.phone);
        filledCount++;
      } else if (l.includes('linkedin')) {
        await setNativeValueSafe(el, P.contact.linkedin);
        filledCount++;
      } else if (l.includes('github') || l.includes('git')) {
        await setNativeValueSafe(el, P.contact.github);
        filledCount++;
      } else if (l.includes('portfolio') || l.includes('website') || l.includes('sitio web')) {
        await setNativeValueSafe(el, P.contact.github);
        filledCount++;
      }

      // --- ADDRESS ---
      else if (l.includes('address') || l.includes('dirección') || l.includes('direccion') || l.includes('calle') || l.includes('street')) {
        await setNativeValueSafe(el, P.location.street);
        filledCount++;
      } else if (l.includes('city') || l.includes('ciudad') || l.includes('municipio')) {
        await setNativeValueSafe(el, city);
        filledCount++;
      } else if (l.includes('state') || l.includes('estado') || l.includes('provincia')) {
        await setNativeValueSafe(el, state);
        filledCount++;
      } else if (l.includes('postal') || l.includes('zip') || l.includes('código postal') || l.includes('codigo postal')) {
        await setNativeValueSafe(el, postalCode);
        filledCount++;
      }

      // --- SCREENING QUESTIONS ---
      else if (l.includes('sql') && (l.includes('year') || l.includes('año') || l.includes('experien'))) {
        await setNativeValueSafe(el, P.screening.sqlYears);
        filledCount++;
      } else if ((l.includes('automation') || l.includes('automatiz')) && (l.includes('year') || l.includes('año') || l.includes('experien'))) {
        await setNativeValueSafe(el, P.screening.automationYears);
        filledCount++;
      } else if (l.includes('robot') && (l.includes('year') || l.includes('año') || l.includes('experien'))) {
        await setNativeValueSafe(el, P.screening.roboticsYears);
        filledCount++;
      } else if (l.includes('salary') || l.includes('salarial') || l.includes('sueldo') || l.includes('remuneraci')) {
        if (l.includes('usd') || l.includes('dollar')) {
          await setNativeValueSafe(el, l.includes('year') || l.includes('anual') ? P.screening.salaryExpectationUsdYear : P.screening.salaryExpectationUsd);
        } else {
          await setNativeValueSafe(el, P.screening.salaryExpectationMxn);
        }
        filledCount++;
      } else if (l.includes('travel') || l.includes('viajar')) {
        await setNativeValueSafe(el, P.screening.willingToTravel);
        filledCount++;
      }
    }

    // 2. Radio Buttons (Sequential and gentle)
    const radios = Array.from(document.querySelectorAll('input[type="radio"], input[type="checkbox"]'));
    for (const r of radios) {
      if (r.disabled) continue;

      const l = getFieldLabel(r);
      const val = (r.value || '').toLowerCase();
      const parentText = cleanText(r.closest('label, div, tr')?.innerText || '');
      const fullContext = `${l} ${val} ${parentText}`;

      // Previously worked for company -> NO
      if (fullContext.includes('previously worked') || fullContext.includes('trabajado anteriormente') || fullContext.includes('prior employee')) {
        if (val === 'no' || parentText === 'no' || parentText.startsWith('no')) {
          if (!r.checked) { r.click(); await sleep(50); filledCount++; }
        }
      }
      // Prior dismissal -> NO
      else if (fullContext.includes('despedido') || fullContext.includes('dismissed') || fullContext.includes('solicitado abandonar')) {
        if (val === 'no' || parentText === 'no' || parentText.startsWith('no')) {
          if (!r.checked) { r.click(); await sleep(50); filledCount++; }
        }
      }
      // Age 18+ -> YES
      else if (fullContext.includes('18 years') || fullContext.includes('mayor de 18') || fullContext.includes('legal age')) {
        if (val === 'yes' || val === 'sí' || parentText === 'yes' || parentText === 'sí' || parentText.startsWith('sí')) {
          if (!r.checked) { r.click(); await sleep(50); filledCount++; }
        }
      }
      // Authorized to work -> YES
      else if (fullContext.includes('authorized') || fullContext.includes('autorización') || fullContext.includes('autorizado') || fullContext.includes('legal authorization')) {
        if (val === 'yes' || val === 'sí' || parentText === 'yes' || parentText === 'sí' || parentText.startsWith('sí')) {
          if (!r.checked) { r.click(); await sleep(50); filledCount++; }
        }
      }
      // Require visa sponsorship -> NO
      else if (fullContext.includes('sponsorship') || fullContext.includes('patrocinio') || fullContext.includes('visa')) {
        if (val === 'no' || parentText === 'no' || parentText.startsWith('no')) {
          if (!r.checked) { r.click(); await sleep(50); filledCount++; }
        }
      }
      // Willing to relocate -> YES
      else if (fullContext.includes('relocate') || fullContext.includes('reubicarse') || fullContext.includes('reubicación')) {
        if (val === 'yes' || val === 'sí' || parentText === 'yes' || parentText === 'sí' || parentText.startsWith('sí')) {
          if (!r.checked) { r.click(); await sleep(50); filledCount++; }
        }
      }
      // English advanced / fluent -> YES
      else if (fullContext.includes('inglés') || fullContext.includes('english')) {
        if (val === 'yes' || val === 'sí' || parentText === 'yes' || parentText === 'sí' || parentText.startsWith('sí') || parentText.includes('advanced') || parentText.includes('fluent')) {
          if (!r.checked) { r.click(); await sleep(50); filledCount++; }
        }
      }
    }

    // 3. Native Select Dropdowns
    const selects = Array.from(document.querySelectorAll('select'));
    for (const s of selects) {
      if (s.disabled) continue;
      const l = getFieldLabel(s);
      
      if (l.includes('country') || l.includes('país') || l.includes('pais')) {
        for (let opt of s.options) {
          if (/mexico|méxico/i.test(opt.text) || opt.value.toLowerCase() === 'mx' || opt.value.toLowerCase() === 'mex') {
            s.value = opt.value;
            s.dispatchEvent(new Event('change', { bubbles: true }));
            await sleep(50);
            filledCount++;
            break;
          }
        }
      }
      else if (l.includes('how did you hear') || l.includes('cómo se enteró') || l.includes('source')) {
        for (let opt of s.options) {
          if (/linkedin|job board|social media|internet|bolsa/i.test(opt.text)) {
            s.value = opt.value;
            s.dispatchEvent(new Event('change', { bubbles: true }));
            await sleep(50);
            filledCount++;
            break;
          }
        }
      }
    }

    showToast(`Autocompletados ${filledCount} campos (Modo Seguro)`);
  }

  // Floating UI Button and Toast
  function injectFloatingUI() {
    if (document.getElementById('career-ops-floating-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'career-ops-floating-btn';
    btn.innerHTML = '⚡ Autollenar Career-Ops';
    btn.title = 'Autollenar solicitud (Atajo: Alt + Shift + A)';
    btn.onclick = () => autofillPage();

    document.body.appendChild(btn);

    // Keyboard shortcut Alt + Shift + A
    window.addEventListener('keydown', (e) => {
      if (e.altKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        autofillPage();
      }
    });
  }

  function showToast(msg) {
    let toast = document.getElementById('career-ops-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'career-ops-toast';
      document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.className = 'career-ops-toast-show';
    setTimeout(() => {
      toast.className = '';
    }, 3500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingUI);
  } else {
    injectFloatingUI();
  }

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
      if (req.action === 'autofill') {
        autofillPage().then(() => sendResponse({ success: true }));
        return true;
      }
    });
  }
})();
