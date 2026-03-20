// 🎯 CUSTOM COMMANDS - ENGINEERING MODULE

/**
 * Create a VIPE visit via API for the scopes flow
 * Returns { visitId, visitTitle }
 */
Cypress.Commands.add('crearVisitaIngenieria', () => {
    const title = 'PRUEBA_AUTOMATIZACION_(NO_TOCAR)';
  
    cy.log(`🟢 Creating engineering visit: ${title}`);
  
    return cy.request({
      method: 'POST',
      url: 'https://internal.dev.bia.app/v1/ms-bia-ops-integration/webhooks/work-orders/visit',
      headers: {
        'X-User-ID': 'prod_bubble',
        'Content-Type': 'application/json'
      },
      body: {
        card_id: '0',
        start_at: '2026-02-22 23:00',
        company_id: '13395',
        company_name: 'EDUARDOÑO S.A.S',
        network_operator_name: 'EPM ANTIOQUIA',
        address: 'CALLE 93A es-01',
        city_name: 'Bogotá D.C.',
        department: 'Bogotá',
        contract_id: '9932',
        contract_name: 'SALVIO es-01',
        title: title,
        visit_type_id: 'PRE_VISIT',
        installation_fee_id: 'URBAN',
        service_type_id: 'VIPE',
        card_parent_id: '11'
      },
      failOnStatusCode: false
    }).then((res) => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(`❌ Error creating visit: ${res.status} - ${res.body.message || 'Unknown error'}`);
      }
  
      const visitId = res.body.replace(/"/g, '');
      cy.log(`✅ Visit created — ID: ${visitId}`);
  
      return cy.wrap({ visitId, visitTitle: title });
    });
  });
  
  // TODO: cy.eliminarVisitaIngenieria(visitId) — pending DELETE endpoint from backend