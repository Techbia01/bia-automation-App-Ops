import LoginPage from '../pages/LoginPage';
const loginPage = new LoginPage();

describe('Login con múltiples tipos de usuario', () => {

  it('Login exitoso como Coordinador', () => {
    cy.loginAsUser('coordinator', { useBiaLayout: true });
    cy.wait(4000);
    loginPage.verifyLoginSuccess('/dashboard/ots');
    loginPage.verifyCoordinatorBiaLayout();
  });

  it('Login exitoso como Contratista', () => {
    cy.loginAsUser('contractor', { useBiaLayout: true });
    cy.wait(4000);
    loginPage.verifyLoginSuccess('/dashboard/ots');
    loginPage.verifyContractorBiaLayout();
  });

  it('Login exitoso como Electricista', () => {
    loginPage.visit();
    cy.loginAsUser('electrician');
    loginPage.verifyLoginSuccess('/home');
    loginPage.verifyHomeVisible();
  });

  it('Login exitoso como Ingenieria', () => {
    loginPage.visit();
    cy.loginAsUser('engineer');
    loginPage.verifyLoginSuccess('/admin-regulatory/technical-life-sheet');
  }); 

 /* it('Login fallido con usuario inválido', () => {
    cy.loginAsUser('invalid');
    loginPage.verifyLoginError();
  }); */

});
