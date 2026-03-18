/**
 * PAGE OBJECT: VisualizacinTabPage
 * Ubicación: cypress/pages/VisualizacinTabPage.js
 * 
 * ✅ CÓDIGO GENERADO CON ANÁLISIS INTELIGENTE
 * 🎯 Selectores extraídos automáticamente de tu HTML
 * 📊 Elementos detectados: 2 inputs, 18 botones, 0 selects
 * 
 * 💡 USO DE MÉTODOS GENÉRICOS:
 * - Usa clickButton(selector) para cualquier botón
 * - Usa enterText(selector, value) para cualquier input/textarea
 * - Usa selectOption(selector, value) para cualquier select
 */

class VisualizacionTabPage {
    constructor() {
        // SELECTORES REALES extraídos de tu aplicación
        this.selectors = {
            ionInput0Input: '#ion-input-0', // Ingrese código Bia o Contract ID (text)
            ionInput1Input: '#ion-input-1', // Ingrese código SIC (text)
            button0Btn: '._buttonCollapse_2lk51_10', // Botón 1
            hVTCnicaBtn: '._item_2lk51_39', // HV técnica
            alcancesBtn: '._item_2lk51_39', // Alcances
            button3Btn: '._clearButton_1acbu_91', // Botón 4
            buscarFronteraBtn: '._buttonSubmit_q2wix_35', // Buscar frontera
            button5Btn: '._iconRow_tga9e_134', // Botón 6
            button6Btn: '._iconRow_tga9e_134', // Botón 7
            button7Btn: '._iconRow_tga9e_134', // Botón 8
            button8Btn: '._iconRow_tga9e_134', // Botón 9
            button9Btn: '._iconRow_tga9e_134', // Botón 10
            button10Btn: '._iconRow_tga9e_134', // Botón 11
            button11Btn: '._iconRow_tga9e_134', // Botón 12
            button12Btn: '._iconRow_tga9e_134', // Botón 13
            button13Btn: '._iconRow_tga9e_134', // Botón 14
            button14Btn: '._iconRow_tga9e_134', // Botón 15
            button15Btn: '._iconRow_tga9e_134', // Botón 16
            button16Btn: '._iconsPaginator_tga9e_165', // Botón 17
            button17Btn: '._iconsPaginator_tga9e_165', // Botón 18
        };
    }

    /**
     * Visita la página
     */
    visit() {
        cy.visit('https://ops.dev.bia.app/admin-regulatory/technical-life-sheet');
    }

    /**
     * Verifica que la página esté cargada
     */
    verifyPageLoaded() {
        cy.get(this.selectors.ionInput0Input).should('be.visible');
    }

    // ============================================
    // MÉTODOS GENÉRICOS REUTILIZABLES
    // ============================================

    /**
     * Hace clic en un botón (MÉTODO GENÉRICO)
     * @param {string} selector - El selector del botón (usar this.selectors.nombreBtn)
     * @example clickButton(this.selectors.submitBtn)
     */
    clickButton(selector) {
        cy.get(selector).click();
    }

    /**
     * Ingresa texto en un campo (MÉTODO GENÉRICO)
     * @param {string} selector - El selector del input/textarea
     * @param {string} value - El valor a ingresar
     * @example enterText(this.selectors.emailInput, 'test@ejemplo.com')
     */
    enterText(selector, value) {
        cy.get(selector).clear().type(value);
    }

    /**
     * Selecciona una opción de un select (MÉTODO GENÉRICO)
     * @param {string} selector - El selector del select
     * @param {string} value - El valor a seleccionar
     * @example selectOption(this.selectors.countrySelect, 'mx')
     */
    selectOption(selector, value) {
        cy.get(selector).select(value);
    }

    /**
     * Verifica que un elemento sea visible (MÉTODO GENÉRICO)
     * @param {string} selector - El selector del elemento
     * @example verifyElementVisible(this.selectors.successMessage)
     */
    verifyElementVisible(selector) {
        cy.get(selector).should('be.visible');
    }

    /**
     * Verifica que un elemento contenga texto (MÉTODO GENÉRICO)
     * @param {string} selector - El selector del elemento
     * @param {string} text - El texto esperado
     * @example verifyElementContains(this.selectors.title, 'Bienvenido')
     */
    verifyElementContains(selector, text) {
        cy.get(selector).should('contain', text);
    }

    // ============================================
    // MÉTODOS DE VERIFICACIÓN
    // ============================================

    /**
     * Verifica mensaje de éxito (ajusta el selector según tu app)
     */
    verifySuccessMessage(message) {
        cy.contains(message).should('be.visible');
    }

    /**
     * Verifica mensaje de error (ajusta el selector según tu app)
     */
    verifyErrorMessage(message) {
        cy.contains(message).should('be.visible');
    }
}

export default VisualizacionTabPage;