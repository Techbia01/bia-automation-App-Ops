// Seccion de Transformadores encontrados


// Helpers
// =========================
const norm = (s = "") =>
    s.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();

const esc = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const rxLabel = (label = "") => new RegExp(esc(norm(label)).replace(/\s+/g, "\\s*"), "i");


// =========================
// Page Object
// =========================
class TransformersFoundPage {
    // ---------- Selectores de sección ----------
    get iconSection1() {
        return cy.contains(/Transformadores encontrados/i, { includeShadowDom: true });
    }
    get titleTransformersFound() {
        return cy.contains('ion-text', /Transformadores encontrados/i, { includeShadowDom: true });
    }
    get subtitleSections() {
        return cy.contains('ion-text', /Transformadores encontrados/i, { includeShadowDom: true });
    }

    get labelTransformersFound() {
        return cy.contains('ion-text', /¿Necesita Información del  Transformador?/i, { includeShadowDom: true });
    }

    get label1() {
        return cy.contains('ion-text', '¿Necesita Información del  Transformador?', { includeShadowDom: true })
            .should('be.visible')
            .then(($el) => {
                const color = getComputedStyle($el[0]).color;
                expect(color).to.eq('rgb(145, 148, 153)'); // valor calculado de var(--ink-weak)
            });
    }

    get buttonSaveTransformerInformation() {
        return cy.contains('ion-button', /Guardar/i, { includeShadowDom: true })
    }

    get buttonAddTransformerInformation() {
        return cy.contains('ion-button', /agregar información del transformador/i, { includeShadowDom: true })
    }




    get buttonSaveAndContinue() {
        return cy.contains('ion-button', /^Guardar y continuar$/i, { includeShadowDom: true });
    }

    // ---------- Utilitarios internos ----------
    // Busca el contenedor de un campo por su label visible
    _containerByLabel(label, timeout = 12000) {
        const pattern = rxLabel(label);

        return cy.get('form', { includeShadowDom: true, timeout })
            .find('._inputContainer_q4juv_1, ._inputContainer_hig3p_1', { includeShadowDom: true })
            .then(($nodes) => {
                const $match = Cypress.$($nodes).filter((_, el) =>
                    pattern.test(norm(el.textContent || ''))
                ).first();

                expect(
                    $match.length,
                    `No encontré contenedor para el label "${label}". Revisa que el texto del fixture coincida con el visible en la UI.`
                ).to.be.greaterThan(0);

                return cy.wrap($match);
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
    verifyViewTransformersFound() {
        this.iconSection1.should('be.visible').click();
        this.titleTransformersFound.should('be.visible');
        this.subtitleSections.should('be.visible');
        this.labelTransformersFound.should('be.visible');
        this.label1.should('be.visible');

    }

    // ---------- Validar no editables ----------
    validateNonEditableFields(data = {}) {
        if (!data || Object.keys(data).length === 0) {
            cy.log('⚠️ No se pasaron campos no editables o el objeto está vacío.');
            return;
        }

        Object.keys(data).forEach((label) => {
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

    selectButtonAddTransformerInformation() {
        this.buttonAddTransformerInformation.should('be.visible').click();
    }

    selectButtonSaveTransformerInformation() {

        // 1️⃣ Validar que el ion-button esté visible y tenga el texto correcto
        this.buttonSaveTransformerInformation
            .should('be.visible')
            .and('contain.text', 'Guardar');

        // 2️⃣ Validar que el botón nativo dentro del shadow DOM esté habilitado
        this.buttonSaveTransformerInformation
            .shadow()
            .find('button', { includeShadowDom: true })
            .should('be.enabled');

        // 3️⃣ Hacer click en el host para evitar problemas de "element covered"
        this.buttonSaveTransformerInformation
            .scrollIntoView({ block: 'center' })
            .click({ force: true });

        cy.log('✅ Botón Guardar y continuar validado y clickeado');
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

    VerifyLabelTransformersFound1() {
        this.labelTransformersFound.should('be.visible');
    }

}

export default new TransformersFoundPage();
