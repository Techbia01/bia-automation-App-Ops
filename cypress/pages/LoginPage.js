class LoginPage {
  // 🧭 Selectores centralizados - Dominio viejo (ops.dev.bia.app)
  get emailInput() {
    return cy.get('input[name="username"]');
  }

  get passwordInput() {
    return cy.get('input[name="password"]');
  }

  get submitButton() {
    return cy.get('ion-button[type="submit"]').contains('Iniciar sesión');
  }

  // 🧭 Selectores - BiaLayout (bia-layout.dev.bia.app)
  get emailInputBiaLayout() {
    return cy.get('input[name="email"]');
  }

  get passwordInputBiaLayout() {
    return cy.get('input[name="password"]');
  }

  get submitButtonBiaLayout() {
    return cy.get('button[type="submit"]').contains('Iniciar sesión');
  }

   get visitText() {
  return cy.contains('ion-text', 'Tus visitas')

  }verifyCoordinator() {
  cy.contains('OTs').should('be.visible');
  this.ProfileButton.click();
  this.roleText.contains('Coordinador').should('be.visible');
}

    get ProfileButton() {
  return cy.get('ion-img[src="/assets/img/bia-avatar.svg"]');
  }

  get ProfileButtonBiaLayout() {
    return cy.get('img[src="/assets/icons/bia-avatar.svg"]');
  }

  get roleText(){
    return cy.get('._role_11zk1_72');
  }

  get roleTextBiaLayout(){
    return cy.get('.Header_infoProfile__role__464D1');
  }

 /* get errorMessage() {
    return cy.get('.error-message'); // Reemplaza con el selector real si cambia
  }*/

  // 🚀 Acciones (métodos)
  visit() {
    cy.visit('https://ops.dev.bia.app/login');
  }

  visitBiaLayout() {
    cy.visit('https://bia-layout.dev.bia.app/login');
  }

  // Métodos para dominio viejo (ops.dev.bia.app)
  fillEmail(email) {
    this.emailInput.should('be.visible');
    this.emailInput.clear().type(email);
  }

  fillPassword(password) {
    this.passwordInput.should('be.visible');
    this.passwordInput.clear().type(password);
  }

  clickSubmit() {
    this.submitButton.should('be.visible');
    this.submitButton.click();
  }

  login(email, password) {
    this.fillEmail(email);
    this.fillPassword(password);
    this.clickSubmit();
  }

  // Métodos para BiaLayout (bia-layout.dev.bia.app)
  fillEmailBiaLayout(email) {
    this.emailInputBiaLayout.should('be.visible');
    this.emailInputBiaLayout.clear().type(email);
  }

  fillPasswordBiaLayout(password) {
    this.passwordInputBiaLayout.should('be.visible');
    this.passwordInputBiaLayout.clear().type(password);
  }

  clickSubmitBiaLayout() {
    this.submitButtonBiaLayout.should('be.visible');
    this.submitButtonBiaLayout.click();
  }

  loginBiaLayout(email, password) {
    this.fillEmailBiaLayout(email);
    this.fillPasswordBiaLayout(password);
    this.clickSubmitBiaLayout();
  }

verifyLoginSuccess(expectedPath) {
  cy.location('pathname').should('eq', expectedPath);
}

  verifyLoginError() {
    this.errorMessage.should('be.visible').and('contain', 'Invalid credentials');
  }

  verifyHomeVisible() {
  this.visitText.contains('Tus visitas').should('be.visible');
}

verifyContractor() {
  cy.contains('OTs').should('be.visible');
  this.ProfileButton.click();
  this.roleText.contains('Contratista').should('be.visible');
}

verifyCoordinatorBiaLayout() {
  cy.contains('OTs').should('be.visible');
  this.ProfileButtonBiaLayout.click();
  this.roleTextBiaLayout.contains('Coordinador').should('be.visible');
  // Cerrar el menú haciendo click fuera para evitar que cubra otros elementos
  cy.get('body').click(0, 0);
}

verifyContractorBiaLayout() {
  cy.contains('OTs').should('be.visible');
  this.ProfileButtonBiaLayout.click();
  this.roleTextBiaLayout.contains('Contratista').should('be.visible');
  // Cerrar el menú haciendo click fuera para evitar que cubra otros elementos
  cy.get('body').click(0, 0);
}

}

export default LoginPage;
