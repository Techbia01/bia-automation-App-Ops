import LoginPage from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Login - Ingeniería', () => {

  it('Login exitoso como Ingeniería', () => {
    loginPage.visitBiaLayout();
    cy.loginAsUser('engineer', { useBiaLayout: true });
    cy.wait(4000);
    loginPage.verifyLoginSuccess('/dashboard/technical-life-sheet');
  });

});
