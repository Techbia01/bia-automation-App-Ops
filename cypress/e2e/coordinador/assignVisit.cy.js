import LoginPage from '../../pages/LoginPage';
import AssignContractorPage from '../../pages/coordinador/AssignContractorPage';
import AssignElectricianPage from '../../pages/coordinador/AssignElectricianPage';

// Instanciar las páginas
const loginPage = new LoginPage();
const assignContractorPage = new AssignContractorPage();
const assignElectricianPage = new AssignElectricianPage();

describe('Asignar visita - Coordinador', () => {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ASIGNAR CONTRATISTA
  // ═══════════════════════════════════════════════════════════════════════════
   describe('Asignar contratista', () => {
    beforeEach(() => {
      // 1. Crear visita sin contratista (para tener datos disponibles)
      cy.crearVisitaSinContratista('TEST_ASIGNAR_CONTRATISTA');
      
      // 2. Login y verificaciones - Usando BiaLayout (nuevo módulo)
      cy.loginAsUser('coordinator', { useBiaLayout: true });
      cy.wait(4000);
      loginPage.verifyLoginSuccess('/dashboard/ots');
      loginPage.verifyCoordinatorBiaLayout();
    });

   it('FLUJO 1: Asignar contratista desde el DETALLE de la visita', function () {
      // Entra al detalle de la visita → Botón "Asignar contratista"
      assignContractorPage.asignarContratistaDesdeDetalle();
    });

    it('FLUJO 2: Asignar contratista desde la TABLA (botón +)', function () {
      // Desde la tabla → Clic en botón + de columna Contratista
      assignContractorPage.asignarContratistaDesdeTabla();
    });
  }); 

  // ═══════════════════════════════════════════════════════════════════════════
  // ASIGNAR ELECTRICISTA
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Asignar electricista', () => {
    beforeEach(() => {
      // Login y verificaciones - Usando BiaLayout (nuevo módulo)
      // No crear data nueva, usar las visitas existentes en estado "Por asignar electricista"
      cy.loginAsUser('coordinator', { useBiaLayout: true });
      cy.wait(4000);
      loginPage.verifyLoginSuccess('/dashboard/ots');
      loginPage.verifyCoordinatorBiaLayout();
    });

    it('FLUJO 3: Asignar electricista desde la TABLA (botón +)', function () {
      // Desde la tabla → Clic en botón + de columna Electricista
      // Nota: Asignar electricista SOLO se puede hacer desde la tabla, no desde el detalle
      assignElectricianPage.asignarElectricistaDesdeTabla();
    });
  });
});
