import LoginPage from '../../pages/LoginPage';
import DownloadCSVPage from '../../pages/coordinador/DownloadCSVPage';

// Instanciar las páginas
const loginPage = new LoginPage();
const downloadCSVPage = new DownloadCSVPage();

describe('Descargar CSV - Coordinador', () => {
  beforeEach(() => {
    // Login y verificaciones - Usando BiaLayout (nuevo módulo)
    cy.loginAsUser('coordinator', { useBiaLayout: true });
    cy.wait(4000);
    loginPage.verifyLoginSuccess('/dashboard/ots');
    loginPage.verifyCoordinatorBiaLayout();
  });

  it('FLUJO 1: Descargar CSV con rango de fechas', function () {
    // Abrir modal → Seleccionar fechas (máx 60 días) → Descargar
    downloadCSVPage.descargarCSV();
  });
});
