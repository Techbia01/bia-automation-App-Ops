// 🎯 COMANDOS PERSONALIZADOS PARA COORDINADOR
// Comandos específicos para automatizar acciones comunes del perfil coordinador

/**
 * Navegar a la página de órdenes de trabajo como coordinador
 * @param {string} url - URL de la página de órdenes de trabajo
 */
Cypress.Commands.add('navigateToWorkOrders', (url = '/admin/ots') => {
  cy.log(`🧭 Navegando a órdenes de trabajo: ${url}`);
  cy.visit(url);
  cy.wait(2000);
  cy.url().should('include', url);
  cy.log('✅ Navegación a órdenes de trabajo completada');
});

/**
 * Verificar que el usuario esté logueado como coordinador
 * @param {string} expectedRole - Rol esperado del usuario
 */
Cypress.Commands.add('verifyCoordinatorRole', (expectedRole = 'coordinator') => {
  cy.log(`👤 Verificando rol de coordinador: ${expectedRole}`);
  
  // Verificar que estemos en la página correcta
  cy.url().should('satisfy', (url) => {
    return url.includes('/home') || url.includes('/admin/ots');
  });
  
  // Verificar elementos específicos del coordinador
  cy.get('body').should('contain', 'Órdenes de trabajo');
  
  cy.log('✅ Rol de coordinador verificado correctamente');
});

/**
 * Esperar a que la tabla de órdenes de trabajo se cargue completamente
 * @param {number} timeout - Tiempo máximo de espera en milisegundos
 */
Cypress.Commands.add('waitForWorkOrdersTable', (timeout = 10000) => {
  cy.log('⏳ Esperando a que se cargue la tabla de órdenes de trabajo');
  
  // Esperar a que el loader desaparezca si existe
  cy.get('body').then(($body) => {
    if ($body.find('.loader, ._loaderPage_c1dpd_14, [data-cy="loader"]').length > 0) {
      cy.get('.loader, ._loaderPage_c1dpd_14, [data-cy="loader"]', { timeout }).should('not.exist');
    }
  });
  
  // Verificar que la tabla esté visible
  cy.get('table, [data-cy="visits-table"], .visits-table', { timeout }).should('be.visible');
  
  cy.log('✅ Tabla de órdenes de trabajo cargada correctamente');
});

/**
 * Filtrar órdenes de trabajo por estado específico
 * @param {string} estado - Estado por el cual filtrar
 */
Cypress.Commands.add('filterByStatus', (estado) => {
  cy.log(`🔍 Filtrando por estado: ${estado}`);
  
  // Buscar el filtro de estados
  cy.get('select[name*="status"], [data-cy="status-filter"], .status-filter')
    .should('be.visible')
    .select(estado);
  
  // Esperar a que se aplique el filtro
  cy.wait(3000);
  
  cy.log(`✅ Filtro por estado "${estado}" aplicado correctamente`);
});

/**
 * Verificar que aparezca un mensaje específico
 * @param {string} mensaje - Mensaje que se espera ver
 * @param {string} tipo - Tipo de mensaje (success, error, info)
 */
Cypress.Commands.add('verifyMessage', (mensaje, tipo = 'success') => {
  cy.log(`💬 Verificando mensaje: ${mensaje}`);
  
  // Buscar el mensaje según el tipo
  const selector = tipo === 'success' 
    ? '[data-cy="success-message"], .success-message, .toast-success, .BiaToast'
    : tipo === 'error'
    ? '[data-cy="error-message"], .error-message, .toast-error'
    : '[data-cy="info-message"], .info-message, .toast-info';
  
  cy.get(selector).should('contain', mensaje);
  
  cy.log(`✅ Mensaje "${mensaje}" verificado correctamente`);
});

/**
 * Capturar el título de la primera orden de trabajo visible
 * @returns {Cypress.Chainable<string>} - Título de la orden de trabajo
 */
Cypress.Commands.add('captureFirstWorkOrderTitle', () => {
  cy.log('📋 Capturando título de la primera orden de trabajo');
  
  return cy.get('tr').eq(1).find('td').first().invoke('text').then((text) => {
    const title = text.trim();
    cy.log(`📋 Título capturado: ${title}`);
    return title;
  });
});

/**
 * Verificar que un modal esté abierto y contenga información específica
 * @param {string} tituloModal - Título esperado del modal
 * @param {Array} elementosRequeridos - Lista de elementos que deben estar presentes
 */
Cypress.Commands.add('verifyModalContent', (tituloModal, elementosRequeridos = []) => {
  cy.log(`🔍 Verificando contenido del modal: ${tituloModal}`);
  
  // Verificar que el modal esté visible
  cy.get('[role="dialog"], .modal, [data-cy="modal"]').should('be.visible');
  
  // Verificar el título del modal
  cy.contains(tituloModal).should('be.visible');
  
  // Verificar elementos requeridos si se especifican
  if (elementosRequeridos.length > 0) {
    elementosRequeridos.forEach(elemento => {
      cy.get('body').should('contain', elemento);
    });
  }
  
  cy.log(`✅ Modal "${tituloModal}" verificado correctamente`);
});
