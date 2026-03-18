import LoginPage from '../../pages/LoginPage';
import VerifyActaPage from '../../pages/coordinador/VerifyActaPage';

// Instanciar las páginas
const loginPage = new LoginPage();
const verifyActaPage = new VerifyActaPage();

describe('Validar acta - Coordinador', () => {
  beforeEach(() => {
    // Login y verificaciones - Usando BiaLayout (nuevo módulo)
    cy.loginAsUser('coordinator', { useBiaLayout: true });
    cy.wait(4000);
    loginPage.verifyLoginSuccess('/dashboard/ots');
    loginPage.verifyCoordinatorBiaLayout();
  });

  it('FLUJO 1: Validar acta en tabla y descargar', function () {
    // Validar que existe acta en visitas Fallida/Exitosa y descargarla
    verifyActaPage.validarYDescargarActa();
  });
});
