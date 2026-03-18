import LoginPage from '../../pages/LoginPage';
import VisitsPage from '../../pages/electricista/VisitsPage';
import visitStatus from '../../fixtures/electricista/visitStatus.json';
import visitType from '../../fixtures/electricista/visitType.json';
import DetailsVisitPage from '../../pages/electricista/DetailsVisitPage';
import ArrivalRegistrationPage from '../../pages/electricista/ArrivalRegistrationPage';
import CompleteVisitPage from '../../pages/electricista/CompleteVisitPage';
import GeneralInformationPage from '../../pages/electricista/AllSections/GeneralInformationPage';
import fieldsGeneralInformation from '../../fixtures/electricista/fieldsGeneralInformation.json';

const loginPage = new LoginPage();
const visitsPage = new VisitsPage();
const detailsVisitPage = new DetailsVisitPage();
const arrivalRegistrationPage = new ArrivalRegistrationPage();

describe('Crear visita tipo Instalacion por API y completarla en UI', () => {
  let visitTitle = '';

  beforeEach(() => {
    // Genera un número aleatorio de 3 dígitos (entre 100 y 999)
    const numeroVisita = Math.floor(100 + Math.random() * 900);
    visitTitle = `Prueba Automation ${numeroVisita}`;

    // Llamada al comando personalizado con el título base
    cy.crearVisitaCompleta(visitTitle).then((result) => {
      // Guarda el visitId como alias para usar en el test
      cy.wrap(result.visitId).as('visitId');
      // Guarda el título único generado por el comando
      cy.wrap(result.uniqueTitle).as('uniqueVisitTitle');
      cy.wait(2000);
    });

    // Login y verificaciones
    cy.loginAsUser('electrician');
    cy.wait(4000);
    loginPage.verifyLoginSuccess('/home');
    loginPage.verifyHomeVisible();
  });

  it('Completar visita tipo instalacion', function () {
    // Obtener el título único de la visita creada
    cy.get('@uniqueVisitTitle').then((uniqueTitle) => {
      // Verificar que la página inicial está cargada
      visitsPage.verificarPaginaCargada();

      // Navegar a visitas y buscar la visita específica
      visitsPage.buscarYSeleccionarVisita(uniqueTitle);

      // Verificar que encontramos la visita correcta
      visitsPage.verificarTituloVisita(uniqueTitle);

      // Verificar que el estado de la visita es "Asignada"
      visitsPage.verificarEstadoVisita(visitStatus.validos);

      //Verificar el detalle de la visita
      detailsVisitPage.goDetailsVisit();
      detailsVisitPage.verifyDetailsVisit(visitStatus.validos, visitType.validos);

      // Iniciar traslado
      detailsVisitPage.verifyChangeStatusVisit();
      detailsVisitPage.startTransfer('enCamino');
      arrivalRegistrationPage.verifyCheckPhotoRecordView();
      detailsVisitPage.verifyChangeStatusVisit();
      detailsVisitPage.verifyChangeStatusVisit();
      detailsVisitPage.verifyChangeStatusVisit();
      detailsVisitPage.verifyChangeStatusVisit(false);
      detailsVisitPage.buttonCompleteVisit();
      CompleteVisitPage.verifyViewGeneratePDF();
      GeneralInformationPage.verifyViewGeneralInformation();
      GeneralInformationPage.validateAllFieldsPresence(fieldsGeneralInformation.expectedFields);
      GeneralInformationPage.validateAgainstJsonStructure(fieldsGeneralInformation.expectedFields);
      GeneralInformationPage.fillTextFields(fieldsGeneralInformation.textFields);
      GeneralInformationPage.validateNonEditableFields(fieldsGeneralInformation.noEditableFields);
      GeneralInformationPage.fillSelectFields(fieldsGeneralInformation.selectFields);
      GeneralInformationPage.verifyButtonSaveAndContinue();
      CompleteVisitPage.verifySectionCompleted('Información General');
    });
  });
});
