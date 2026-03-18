import 'cypress-file-upload';
import LoginPage from '../pages/LoginPage.js';
const loginPage = new LoginPage();

Cypress.Commands.add('loginAsUser', (userType, options = {}) => {
  // Opciones: { useBiaLayout: false } - usar true para el nuevo dominio bia-layout
  const { useBiaLayout = false } = options;
  
  // 1. Limpiar TODO el cache antes de navegar
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // 2. Limpiar cache de Cypress (todos los dominios)
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
  
  cy.fixture('electricista/users').then(users => {
    // Validar que el fixture se cargó correctamente
    if (!users) {
      throw new Error('No se pudo cargar el fixture de usuarios');
    }
    
    // Debug: Log para ver qué usuarios están disponibles
    cy.log(`Buscando usuario: ${userType}`);
    cy.log(`Usuarios disponibles en fixture: ${JSON.stringify(Object.keys(users))}`);
    
    // Validar que el tipo de usuario existe
    if (!users[userType]) {
      const availableUsers = Object.keys(users).join(', ');
      throw new Error(`Usuario '${userType}' no encontrado en el fixture. Usuarios disponibles: ${availableUsers}`);
    }
    
    // Validar que el usuario tiene email y password
    const user = users[userType];
    if (!user.email || !user.password) {
      throw new Error(`El usuario '${userType}' no tiene email o password definidos`);
    }
    
    // 4. Navegar al login correspondiente según el dominio
    if (useBiaLayout) {
      loginPage.visitBiaLayout();
      loginPage.loginBiaLayout(user.email, user.password);
    } else {
      loginPage.visit();
      loginPage.login(user.email, user.password);
    }
    
    // 5. Esperar a que cargue y hacer reload para forzar carga del módulo correcto
    cy.wait(2000);
    cy.reload();
    cy.wait(1000);
    
    // 6. Segundo reload para asegurar que el cache se limpie completamente
    cy.reload();
  });
});

Cypress.Commands.add('crearVisitaCompleta', (title) => {
    // Generar timestamp único para evitar duplicados
    const timestamp = Date.now();
    const uniqueTitle = `${title}_${timestamp}`;
    
    cy.log(`🟢 Ejecutando crearVisitaCompleta con title único: ${uniqueTitle}`);
    console.log('🟢 Ejecutando crearVisitaCompleta con title único:', uniqueTitle);
    
    return cy.request({
      method: 'POST',
      url: 'https://internal.dev.bia.app/v1/ms-bia-ops-integration/webhooks/work-orders/visit',
      headers: {
        'X-User-ID': 'prod_bubble',
        'Content-Type': 'application/json'
      },
      body: {
        card_id: '0',
        start_at: '2026-03-15 10:00',
        company_id: '4579',
        company_name: uniqueTitle,
        network_operator_name: 'ENEL es-01',
        address: 'CALLE 93A es-01',
        city_name: 'BOGOTÁ, D.C.',
        department: 'BOGOTÁ, D.C.',
        contract_id: '26790',
        contract_name: 'SALVIO es-01',
        title: uniqueTitle,
        visit_type_id: 'INSTALLATION_VISIT',
        installation_fee_id: 'URBAN',
        service_type_id: 'INST'
      },
      failOnStatusCode: false // No fallar en códigos de estado no exitosos
        }).then((res) => {
      // Verificar si la respuesta fue exitosa
      if (res.status !== 200 && res.status !== 201) {
        cy.log(`❌ Error al crear visita: ${res.status} - ${res.body.message || 'Sin mensaje de error'}`);
        throw new Error(`Error ${res.status}: ${res.body.message || 'Error desconocido'}`);
      }
      
      const visitId = res.body.replace(/"/g, ''); // ✅ extrae correctamente el ID
      cy.log(`✅ Visita creada exitosamente con ID: ${visitId}`);
      cy.wait(1000);

    // Asignar contratista
          return cy.request({
        method: 'POST',
        url: 'https://internal.dev.bia.app/ms-electricians-api/cms/visit/assign/contractor',
        headers: {
          'X-User-ID': 'automatic-dev',
          'Content-Type': 'application/json'
        },
        body: {
          contractor_name: 'BIA',
          contractor_id: '8f15f0e1-fd67-4248-b83c-22c33cc862ba',
          visit_id: visitId
        }
      }).then((response) => {
          cy.log(`Status code: ${response.status}`);
          cy.log(`Body: ${JSON.stringify(response.body)}`);
          console.log('🧾 Detalles respuesta contractor/assign:', response);
        // Asignar electricista
        return cy.request({
          method: 'PATCH',
          url: `https://internal.dev.bia.app/ms-electrician-visits/v1/visits/${visitId}/electricians`,
          headers: {
            'x-user-id': 'automatic-dev',
            'Content-Type': 'application/json'
          },
          body: {
            electrician_lead: {
              name: 'yesika vanegas',
              id: 'zOjHvl4e5eg8PkyactYsuc58gWD2'
            }
          }
        }).then(() => ({ visitId, uniqueTitle }));
      });
  });
});

// 🎯 Comando para crear visita SIN contratista (estado "Por asignar contratista")
Cypress.Commands.add('crearVisitaSinContratista', (title) => {
  // Generar timestamp único para evitar duplicados
  const timestamp = Date.now();
  const uniqueTitle = `${title}_${timestamp}`;
  
  cy.log(`🟢 Ejecutando crearVisitaSinContratista con title único: ${uniqueTitle}`);
  
  return cy.request({
    method: 'POST',
    url: 'https://internal.dev.bia.app/v1/ms-bia-ops-integration/webhooks/work-orders/visit',
    headers: {
      'X-User-ID': 'prod_bubble',
      'Content-Type': 'application/json'
    },
    body: {
      card_id: '0',
      start_at: '2026-03-15 10:00',
      company_id: '4579',
      company_name: uniqueTitle,
      network_operator_name: 'ENEL es-01',
      address: 'CALLE 93A es-01',
      city_name: 'BOGOTÁ, D.C.',
      department: 'BOGOTÁ, D.C.',
      contract_id: '26790',
      contract_name: 'SALVIO es-01',
      title: uniqueTitle,
      visit_type_id: 'INSTALLATION_VISIT',
      installation_fee_id: 'URBAN',
      service_type_id: 'INST'
    },
    failOnStatusCode: false
  }).then((res) => {
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Error ${res.status}: ${res.body.message || 'Error desconocido'}`);
    }
    
    const visitId = res.body.replace(/"/g, '');
    // No retornar nada para evitar problemas de async/sync
    Cypress.env('lastVisitId', visitId);
    Cypress.env('lastVisitTitle', uniqueTitle);
  });
});

// 🎯 Importar comandos personalizados del coordinador
import './commands/coordinatorCommands.js';
