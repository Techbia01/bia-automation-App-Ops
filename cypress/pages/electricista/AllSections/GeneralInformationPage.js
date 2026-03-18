// Helpers
// =========================
const esc = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const norm = (s = "") =>
  (s || "")
    .replace(/\u00A0/g, " ")                         // NBSP -> espacio normal
    .replace(/\s+/g, " ")                            // colapsa espacios
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")// quita acentos
    .trim();

// Acepta "* " al inicio y ":" o "*" al final (opcional). Ignora mayúsculas.
const rxLabel = (label = "") => {
  const base = esc(norm(label)).replace(/\s+/g, "\\s*");
  return new RegExp(`^\\s*\\*?\\s*${base}\\s*[:*]?\\s*$`, "i");
};

// Limpia adornos comunes en el texto visible (útil antes de comparar)
const clean = (s = "") =>
  norm(s).replace(/^\*\s*/, "").replace(/\s*[:*]\s*$/, "").trim();
// =========================
// Page Object
// =========================
class GeneralInformationPage {
    // ---------- Selectores de sección ----------
    get iconSection1() {
        return cy.contains(/Información General/i, { includeShadowDom: true });
    }
    get titleGeneralInformation() {
        return cy.contains('ion-text', /Información General/i, { includeShadowDom: true });
    }
    get subtitleSections() {
        return cy.contains('ion-text', /Información de frontera/i, { includeShadowDom: true });
    }

    get buttonSaveAndContinue() {
        return cy.contains('ion-button', /^Guardar y continuar$/i, { includeShadowDom: true });
    }

    // ---------- Utilitarios internos ----------
    // Busca el contenedor de un campo por su label visible
// ---------- Utilitarios internos ----------
// Busca el contenedor de un campo por su label visible
_containerByLabel(label, timeout = 12000) {
    const pattern = rxLabel(label);
    cy.log(`🔍 Buscando contenedor para label: "${label}"`);
  
    const SELECTORS_NARROW = [
      '._inputContainer_q4juv_1',
      '._inputContainer_hig3p_1',
      '.form-group',
      '.field',
      '.input-container',
      'ion-item',
      '.item'
    ].join(', ');
  
    const SELECTORS_LABELS = 'ion-label, label, .item, ion-item, span, div, ion-text';
  
    const findLabelNodes = ($root) =>
      $root.find(SELECTORS_LABELS, { includeShadowDom: true });
  
    const findAllCandidates = ($root) =>
      $root.find(`${SELECTORS_NARROW}, ${SELECTORS_LABELS}`, { includeShadowDom: true });
  
    // 1) intenta dentro del <form>
    return cy.get('form', { includeShadowDom: true, timeout })
      .then(($form) => {
        let $nodes = findLabelNodes($form);
        if ($nodes.length === 0) {
          cy.log('⚠️ No hubo labels en <form>, ampliando a <body>…');
          $nodes = findLabelNodes(Cypress.$('body'));
        }
  
        // 2) match exacto (regex tolerante)
        let $match = Cypress.$($nodes).filter((_, el) => {
          const text = clean(el.textContent || '');
          return pattern.test(text);
        });
  
        // 3) si falla, match parcial por inclusión
        if ($match.length === 0) {
          const target = clean(label).toLowerCase();
          $match = Cypress.$($nodes).filter((_, el) => {
            const text = clean(el.textContent || '').toLowerCase();
            return text.includes(target);
          });
        }
  
        // 4) si aún no, abre el abanico (incluye contenedores)
        if ($match.length === 0) {
          const $wide = findAllCandidates($form);
          const target = clean(label).toLowerCase();
          $match = Cypress.$($wide).filter((_, el) => {
            const text = clean(el.textContent || '').toLowerCase();
            return pattern.test(text) || text.includes(target);
          });
        }
  
        if ($match.length === 0) {
          throw new Error(`No encontré contenedor para el label "${label}". Posible render como "* ${label}" o con ":"/espacios/acento.`);
        }
  
        // coge el primero visible
        const $visible = $match.filter((_, el) => Cypress.$(el).is(':visible'));
        const $labelNode = $visible.length ? Cypress.$($visible[0]) : Cypress.$($match[0]);
  
        // 5) sube al contenedor lógico
        const $containerNarrow = $labelNode.closest(SELECTORS_NARROW);
        if ($containerNarrow.length) return cy.wrap($containerNarrow);
  
        // fallback: ion-item cercano
        const $ion = $labelNode.closest('ion-item, .item');
        if ($ion.length) return cy.wrap($ion);
  
        // último recurso: devolver el propio label
        return cy.wrap($labelNode);
      });
  }
  
    _nativeInput($container) {
        // Busca el input nativo dentro del contenedor (Ionic Web Component)
        return cy
            .wrap($container)
            .find('input.native-input.sc-ion-input-md', { includeShadowDom: true });
    }

    // ---------- Elements (solo captura, sin lógica) ----------
    elements = {
        textField: (label) =>
            this._containerByLabel(label)
                .find('input.native-input.sc-ion-input-md:not(:disabled)', { includeShadowDom: true })
                .should('exist'),

        nonEditableField: (label) =>
            this._containerByLabel(label)
                .find('input.native-input.sc-ion-input-md:disabled', { includeShadowDom: true })
                .should('exist'),

        selectField: (label) =>
            this._containerByLabel(label)
                .find('ion-select', { includeShadowDom: true })
                .should('exist'),

        allContainers: () =>
            cy.get('._inputContainer_q4juv_1, ._inputContainer_hig3p_1', { includeShadowDom: true })
    };


    // =========================
    // MÉTODOS (lógica)
    // =========================
    verifyViewGeneralInformation() {
        this.iconSection1.should('be.visible').click();
        this.titleGeneralInformation.should('be.visible');
        this.subtitleSections.should('be.visible');
    }

    // ---------- Validar no editables ----------
    validateNonEditableFields(data = {}) {
        if (!data || Object.keys(data).length === 0) {
            cy.log('⚠️ No se pasaron campos no editables o el objeto está vacío.');
            return;
        }

        Object.keys(data).forEach((label) => {
            cy.log(`🔍 Validando campo no editable: "${label}"`);
            
            const field = this.elements.nonEditableField(label);

            // 1️⃣ Debe estar deshabilitado
            field.should('be.disabled');

            // 2️⃣ Debe tener algún valor
            field.invoke('val').should('not.be.empty');

            cy.log(`✅ Campo no editable "${label}" está deshabilitado y con valor.`);
        });
    }


    // ---------- Presencia de todos los campos esperados ----------

    validateAllFieldsPresence(expectedFields = {}) {
        cy.wait(2000);
        if (!expectedFields || Object.keys(expectedFields).length === 0) {
            cy.log('⚠️ expectedFields está vacío o undefined');
            return;
        }

        // Asegura que la sección esté montada (Ionic puede tardar)
        this.subtitleSections.should('be.visible');

        Object.keys(expectedFields).forEach((label) => {
            this._containerByLabel(label)
                .scrollIntoView()
                .should('exist');
            cy.log(`✅ Campo visible encontrado: "${label}"`);
        });
    }

    // ---------- Llenar inputs de texto ----------
    fillTextFields(fields = {}) {
        if (!fields || Object.keys(fields).length === 0) {
            cy.log('⚠️ No se encontraron campos de texto para llenar');
            return;
        }

        Object.entries(fields).forEach(([label, value]) => {
            this.elements.textField(label)
                .scrollIntoView()
                .clear({ force: true })
                .type(`${value}`, { delay: 0 });
            cy.log(`✍️ Escrito en campo "${label}": ${value}`);
        });
    }

    // ---------- Llenar selects (ion-select con action-sheet) ----------
    fillSelectFields(selects = {}) {
        if (!selects || Object.keys(selects).length === 0) {
            cy.log('⚠️ No se encontraron selects para llenar');
            return;
        }

        Object.entries(selects).forEach(([label, option]) => {
            this.elements.selectField(label).scrollIntoView().click({ force: true });

            // Primero intenta con los botones del action-sheet
            cy.contains('button', new RegExp(`^${esc(String(option))}$`, 'i'), { timeout: 10000 })
                .click({ force: true })
                .then(null, () => {
                    // Fallback: ion-select-option visible
                    cy.contains('ion-select-option', new RegExp(`^${esc(String(option))}$`, 'i'), { includeShadowDom: true, timeout: 8000 })
                        .click({ force: true });
                });

            cy.log(`🔽 Seleccionado "${option}" en "${label}"`);
        });
    }

    // ---------- Validación contra JSON ----------
    validateAgainstJsonStructure(expectedFields = {}) {
        const labels = Object.keys(expectedFields || {});
        if (labels.length === 0) {
            cy.log('⚠️ expectedFields vacío');
            return;
        }

        labels.forEach((label) => {
            this._containerByLabel(label).should('exist');
            cy.log(`🧩 Presente en DOM: ${label}`);
        });
    }

    verifyButtonSaveAndContinue() {
        // 1️⃣ Validar que el ion-button esté visible y tenga el texto correcto
        this.buttonSaveAndContinue
            .should('be.visible')
            .and('contain.text', 'Guardar y continuar');

        // 2️⃣ Validar que el botón nativo dentro del shadow DOM esté habilitado
        this.buttonSaveAndContinue
            .shadow()
            .find('button', { includeShadowDom: true })
            .should('be.enabled');

        // 3️⃣ Hacer click en el host para evitar problemas de "element covered"
        this.buttonSaveAndContinue
            .scrollIntoView({ block: 'center' })
            .click({ force: true });

        cy.log('✅ Botón Guardar y continuar validado y clickeado');
    }


}

export default new GeneralInformationPage();
