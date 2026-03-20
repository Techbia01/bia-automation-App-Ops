import LoginPage from '../../pages/LoginPage';

const loginPage = new LoginPage();

const VISIT_TITLE = 'PRUEBA_AUTOMATIZACION_(NO_TOCAR)';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Get the index of a column by its header text
 */
const getColIndex = (headerText) => {
  return cy.contains('th', headerText).invoke('index');
};

/**
 * Click the + button in a specific column for the visit row
 */
const clickButtonInColumn = (headerText) => {
  getColIndex(headerText).then((colIndex) => {
    cy.contains('tr', VISIT_TITLE)
      .find('td').eq(colIndex)
      .find('button')
      .click({ force: true });
  });
};

/**
 * Read the current Estado OT of the visit row
 */
const getVisitStatus = () => {
  return getColIndex('Estado OT').then((colIndex) => {
    return cy.contains('tr', VISIT_TITLE)
      .find('td').eq(colIndex)
      .invoke('text')
      .then((text) => text.trim());
  });
};

// ═══════════════════════════════════════════════════════════════
// 1. LOGIN
// ═══════════════════════════════════════════════════════════════
describe('1 - Login | Coordinator', () => {

  it('FLOW 1: Successful login as coordinator', () => {
    cy.loginAsUser('coordinator', { useBiaLayout: true });
    cy.wait(4000);
    loginPage.verifyLoginSuccess('/dashboard/ots');
    loginPage.verifyCoordinatorBiaLayout();
    cy.log('✅ Coordinator logged in successfully');
    cy.url().should('include', '/dashboard/ots');
    cy.contains('OTs').should('be.visible');
  });

});


// ═══════════════════════════════════════════════════════════════
// 2. VISIT VALIDATION
// ═══════════════════════════════════════════════════════════════
describe('2 - Visit Validation | Coordinator', () => {

  beforeEach(() => {
    cy.loginAsUser('coordinator', { useBiaLayout: true });
    cy.wait(4000);
    loginPage.verifyLoginSuccess('/dashboard/ots');
    loginPage.verifyCoordinatorBiaLayout();
  });

  it('FLOW 2: Check if visit exists — create if not', () => {
    cy.log(`🔍 Searching visit: ${VISIT_TITLE}`);
    cy.get('.native-wrapper input').first()
      .should('be.visible')
      .clear()
      .type(VISIT_TITLE);
    cy.wait(2000);

    cy.get('body').then(($body) => {
      if ($body.text().includes('No se encontraron resultados')) {
        cy.log('⚠️ Visit does NOT exist — creating via API...');
        cy.crearVisitaIngenieria().then(({ visitId, visitTitle }) => {
          Cypress.env('visitId', visitId);
          Cypress.env('visitTitle', visitTitle);
          cy.log(`✅ Visit created — ID: ${visitId}`);
        });
      } else {
        cy.log('✅ Visit already EXISTS — skipping creation');
        Cypress.env('visitTitle', VISIT_TITLE);
      }
    });
  });

});


// ═══════════════════════════════════════════════════════════════
// 3. ASSIGN CONTRACTOR, ELECTRICIAN, UPLOAD ACTA
// ═══════════════════════════════════════════════════════════════
describe('3 - Prepare Visit | Coordinator', () => {

  beforeEach(() => {
    cy.loginAsUser('coordinator', { useBiaLayout: true });
    cy.wait(4000);
    loginPage.verifyLoginSuccess('/dashboard/ots');
    loginPage.verifyCoordinatorBiaLayout();

    // Search visit
    cy.get('.native-wrapper input').first()
      .should('be.visible')
      .clear()
      .type(VISIT_TITLE);
    cy.wait(2000);
  });

  it('FLOW 3: Drive visit to Pendiente de cierre', () => {

    const processStatus = () => {
      getVisitStatus().then((status) => {
        cy.log(`📌 Current status: ${status}`);

        if (status === 'Pendiente de cierre') {
          cy.log('✅ Visit ready — Pendiente de cierre');
          return;
        }

        if (status === 'Por asignar contratista') {
          cy.log('🔧 Assigning contractor...');
          clickButtonInColumn('Contratista');
          cy.get('input[placeholder="Buscar"]').should('be.visible').type('JONATHAN - BIA');
          cy.wait(1000);
          cy.contains('JONATHAN - BIA').click();
          cy.contains('button', 'Asignar contratista').click();
          cy.wait(2000);
          processStatus();

        } else if (status === 'Por asignar electricista') {
          cy.log('⚡ Clicking + in Electricistas column...');
          cy.contains('th', 'Electricistas').scrollIntoView();
          cy.wait(500);
          clickButtonInColumn('Electricistas');
        cy.contains('Selecciona líder').click();
        cy.wait(500);
        cy.get('input[placeholder="Buscar..."]').should('be.visible').type('juan castil');
        cy.wait(1000);
        cy.contains('juan castil').click();
        cy.contains('button', 'Asignar electricistas').click();
        cy.wait(2000);
        processStatus();

        } else if (status === 'Lista para ejecutar') {
          cy.log('📄 Uploading acta...');
          cy.contains('th', 'Acta').scrollIntoView();
          cy.wait(500);
          clickButtonInColumn('Acta');
          cy.wait(1000);

          // Validate acta icon appears in Acta column
          cy.contains('th', 'Acta').invoke('index').then((colIndex) => {
            cy.contains('tr', VISIT_TITLE)
              .find('td').eq(colIndex)
              .find('svg')
              .should('exist');
          });
          cy.wait(2000);
          processStatus();

        } else {
          cy.log(`⚠️ Unexpected status: "${status}"`);
        }
      });
    };

    processStatus();
  });

});


// ═══════════════════════════════════════════════════════════════
// 4. ENGINEER - SCOPES
// ═══════════════════════════════════════════════════════════════
// TODO: coming soon