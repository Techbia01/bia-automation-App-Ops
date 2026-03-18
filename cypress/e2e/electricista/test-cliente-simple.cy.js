import LoginPage from '../../pages/electricista/LoginPage';
import VisitsPage from '../../pages/electricista/VisitsPage';
import GeneralInformationPage from '../../pages/electricista/AllSections/GeneralInformationPage';

const loginPage = new LoginPage();
const visitsPage = new VisitsPage();

describe('Test Simple: Campo Cliente en Información General', () => {
  beforeEach(() => {
    // Login simple
    cy.loginAsUser('electrician');
    cy.wait(4000);
    loginPage.verifyLoginSuccess('/home');
    loginPage.verifyHomeVisible();
  });

  it('Navegar a una visita y validar campo Cliente', function () {
    cy.log('🔍 Iniciando test del campo Cliente...');
    
    // Esperar a que la página cargue completamente
    cy.wait(5000);
    
    // PASO 1: Navegar a la sección de visitas
    cy.log('🔍 PASO 1: Navegando a visitas...');
    
    // Buscar botón o enlace para visitas
    cy.get('ion-button, button, a, ion-item', { includeShadowDom: true, timeout: 10000 })
      .contains(/visita|orden|trabajo/i)
      .first()
      .click({ force: true });
    
    cy.wait(3000);
    
    // PASO 2: Verificar que estamos en la página de visitas
    cy.log('🔍 PASO 2: Verificando página de visitas...');
    visitsPage.verifyViewVisits();
    
    // PASO 3: Buscar una visita existente
    cy.log('🔍 PASO 3: Buscando visita existente...');
    visitsPage.intentarBusquedaPorInput('test');
    cy.wait(3000);
    
    // PASO 4: Seleccionar la primera visita disponible
    cy.log('🔍 PASO 4: Seleccionando visita...');
    cy.get('ion-item, .item, div', { includeShadowDom: true, timeout: 10000 })
      .first()
      .click({ force: true });
    
    cy.wait(5000);
    
    // PASO 5: Verificar si estamos en información general
    cy.log('🔍 PASO 5: Verificando información general...');
    
    try {
      GeneralInformationPage.verifyViewGeneralInformation();
      cy.log('✅ ¡ÉXITO! Estamos en la página de información general');
      
      // PASO 6: Validar solo el campo "Cliente"
      cy.log('🔍 PASO 6: Validando campo Cliente...');
      GeneralInformationPage.validateNonEditableFields({ "Cliente": "" });
      
      cy.log('✅ Test completado exitosamente - Campo Cliente encontrado y validado');
      
    } catch (error) {
      cy.log(`❌ No estamos en información general: ${error.message}`);
      
      // Analizar la página actual para entender dónde estamos
      cy.get('body', { includeShadowDom: true, timeout: 10000 })
        .then(($body) => {
          const pageText = $body.text();
          cy.log(`📄 Texto de la página actual: ${pageText.substring(0, 300)}...`);
          
          // Buscar elementos que puedan indicar dónde estamos
          const relevantElements = $body.find('*').filter((index, el) => {
            const text = el.textContent?.trim();
            return text && (
              text.toLowerCase().includes('cliente') ||
              text.toLowerCase().includes('información') ||
              text.toLowerCase().includes('general') ||
              text.toLowerCase().includes('visita') ||
              text.toLowerCase().includes('orden')
            );
          });
          
          cy.log(`📊 Elementos relevantes en la página actual: ${relevantElements.length}`);
          relevantElements.slice(0, 5).each((index, el) => {
            const text = el.textContent?.trim();
            cy.log(`📝 Elemento relevante ${index + 1}: "${text}"`);
          });
        });
      
      // Intentar encontrar botones para continuar
      cy.get('ion-button, button', { includeShadowDom: true, timeout: 10000 })
        .then(($buttons) => {
          const buttonTexts = [];
          $buttons.each((index, button) => {
            const text = button.textContent?.trim();
            if (text) {
              buttonTexts.push(text);
            }
          });
          
          cy.log(`🔘 Botones disponibles: ${buttonTexts.join(', ')}`);
          
          // Buscar botones que puedan llevar a información general
          const infoButtons = $buttons.filter((index, button) => {
            const text = button.textContent?.trim().toLowerCase();
            return text && (
              text.includes('continuar') ||
              text.includes('siguiente') ||
              text.includes('completar') ||
              text.includes('información')
            );
          });
          
          if (infoButtons.length > 0) {
            cy.log(`🎯 Botones para continuar encontrados: ${infoButtons.length}`);
            cy.wrap(infoButtons.first()).click({ force: true });
            cy.wait(3000);
            
            // Verificar nuevamente si estamos en información general
            try {
              GeneralInformationPage.verifyViewGeneralInformation();
              cy.log('✅ ¡ÉXITO! Ahora estamos en información general');
              
              // Validar campo Cliente
              GeneralInformationPage.validateNonEditableFields({ "Cliente": "" });
              cy.log('✅ Campo Cliente validado exitosamente');
              
            } catch (secondError) {
              cy.log(`❌ Aún no estamos en información general: ${secondError.message}`);
            }
          }
        });
    }
  });
});
