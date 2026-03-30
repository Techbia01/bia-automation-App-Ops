import LoginPage from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Alcances - Ingeniería', () => {

  beforeEach(() => {
    loginPage.visitBiaLayout();
    cy.loginAsUser('engineer', { useBiaLayout: true });
    cy.wait(8000);
    loginPage.verifyLoginSuccess('/dashboard/technical-life-sheet');

    // Navegar a la sección Alcances desde el menú
    cy.contains('Alcances').click();
    cy.url().should('include', '/dashboard/scopes');
  });

  it('FLUJO 1: Verificar estructura y funcionalidad de la página Alcances', () => {
    cy.fixture('ingenieria/alcancesData').then((data) => {
      cy.wait(6000);

      // ── PARTE 1: Los 3 tabs principales existen ──────────────────────────────
      cy.contains('Validación de documentos').should('be.visible');
      cy.contains('Definición de alcance').should('be.visible');
      cy.contains('Finalizado').should('be.visible');

      // ── PARTE 2: Cada tab se puede clicar y queda activo ─────────────────────
      cy.contains('Validación de documentos').click();
      cy.contains('Validación de documentos').should('have.class', 'Mui-selected');

      cy.contains('Definición de alcance').click();
      cy.contains('Definición de alcance').should('have.class', 'Mui-selected');

      cy.contains('Finalizado').click();
      cy.contains('Finalizado').should('have.class', 'Mui-selected');

      // ── PARTE 3: Barra de búsqueda por código Bia ────────────────────────────
      cy.wait(1000);
      cy.get('input[placeholder*="Bia" i], input[placeholder*="código" i], input[placeholder*="buscar" i]')
        .should('be.visible');

      // ── PARTE 4: Filtro de tipo de alcance ───────────────────────────────────
      cy.get('button[class*="BiaDropdown_input"]').first().click();
      cy.wait(1000);
      data.type_scopes.forEach((scope) => {
        cy.contains(scope.name).should('be.visible');
      });
      cy.get('body').click(0, 0);

      // ── PARTE 5: Filtro de operador de red ───────────────────────────────────
      cy.get('button[class*="BiaDropdown_input"]').last().click();
      cy.wait(1000);
      data.network_operators.forEach((operator) => {
        cy.contains(operator).should('exist');
      });
      cy.get('body').click(0, 0);

      // ── PARTE 6: Búsqueda por código BIA trae solo registros coincidentes ────
      cy.get('input.MuiInputBase-input').first().clear();
      cy.get('input.MuiInputBase-input').first().type(data.searches.bia_code);
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0).each(($row) => {
        cy.wrap($row).scrollIntoView();
        cy.wrap($row).invoke('text').should('contain', data.searches.bia_code);
        cy.wrap($row).invoke('text').should('not.contain', data.searches.bia_code_excluded);
      });

      // ── PARTE 7: Abrir filtro de tipo de alcance ─────────────────────────────
      cy.get('input.MuiInputBase-input').first().clear();
      cy.get('body').click(0, 0); // perder foco del input para evitar re-renders que cierren el dropdown
      cy.wait(1000);
      cy.get('button[class*="BiaDropdown_input"]').first().realClick();
      cy.get('[class*="BiaDropdown_dropdownMenu"]', { timeout: 8000 }).should('be.visible');
      cy.get('[class*="BiaDropdown_dropdownMenu"]')
        .contains('Todos los tipos de alcance')
        .click();
      // Buscar "inst" y seleccionar Instalación
      cy.get('input[class*="BiaDropdown_searchInput"]').first().type(data.searches.type_scope_filter.query);
      cy.wait(500);
      cy.get('[class*="BiaDropdown_dropdownMenu"]')
        .contains(data.searches.type_scope_filter.expected)
        .click();
      cy.get('body').click(0, 0);
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0).each(($row) => {
        cy.wrap($row).scrollIntoView();
        cy.wrap($row).invoke('text').should('contain', data.searches.type_scope_filter.expected);
        cy.wrap($row).invoke('text').should('not.contain', data.searches.type_scope_filter.not_expected);
      });

      // ── PARTE 8: Resetear filtro de tipo y filtrar por operador de red ────────
      cy.get('button[class*="BiaDropdown_input"]').first().realClick();
      cy.get('[class*="BiaDropdown_dropdownMenu"]', { timeout: 8000 }).should('be.visible');
      cy.get('input[class*="BiaDropdown_searchInput"]').first().clear().type('Todos los tipos de alcance');
      cy.wait(500);
      cy.get('[class*="BiaDropdown_dropdownMenu"]').contains('Todos los tipos de alcance').click();
      cy.get('body').click(0, 0);
      cy.wait(1000);

      // Abrir filtro de operador de red y buscar
      cy.get('button[class*="BiaDropdown_input"]').last().realClick();
      cy.get('[class*="BiaDropdown_dropdownMenu"]', { timeout: 8000 }).should('be.visible');
      cy.get('input[class*="BiaDropdown_searchInput"]').last().clear().type('Todos los operadores de red');
      cy.wait(500);
      cy.get('[class*="BiaDropdown_dropdownMenu"]').contains('Todos los operadores de red').click();
      cy.get('input[class*="BiaDropdown_searchInput"]').last().clear().type(data.searches.operator_filter.query);
      cy.wait(500);
      cy.get('[class*="BiaDropdown_dropdownMenu"]').contains(data.searches.operator_filter.expected[0]).click();
      cy.get('body').click(0, 0);
      cy.wait(2000);

      cy.get('tbody tr').should('have.length.greaterThan', 0).each(($row) => {
        cy.wrap($row).scrollIntoView();
        cy.wrap($row).invoke('text').then((text) => {
          const containsExpected = data.searches.operator_filter.expected.some((op) => text.includes(op));
          expect(containsExpected).to.be.true;
        });
        cy.wrap($row).invoke('text').should('not.contain', data.searches.operator_filter.not_expected);
      });
    });
  });

  it('FLUJO 2: Navegar a un registro desde el tab Definición de alcance', () => {
    // Clic en tab Definición de alcance
    cy.contains('Definición de alcance').click();
    cy.contains('Definición de alcance').should('have.class', 'Mui-selected');
    cy.wait(3000);

    // DEBUG: loguear tag y placeholder del input de búsqueda
    cy.get('input').first().then(($input) => {
      cy.log('Tag: ' + $input.prop('tagName'));
      cy.log('Placeholder: ' + $input.attr('placeholder'));
    });

    // Buscar por código BIA
    cy.get('input.MuiInputBase-input').first().clear().type('CO0500003757');
    cy.wait(2000);

    // Clic en el registro encontrado
    cy.get('tbody tr').first().scrollIntoView().click();

    // Verificar que navegó al detalle del registro (URL tiene algo después de /scopes/)
    cy.url().should('match', /\/dashboard\/scopes\/.+/);
    cy.wait(3000);


    // Abrir sección Información general
    cy.contains('INFORMACIÓN GENERAL').should('be.visible').click();
    cy.wait(1000);

    // Pulsar el botón debajo de "Tipo de medida encontrada" para abrir dropdown
    cy.contains('Tipo de medida encontrada').closest('[class*="BiaDropdown_dropdownContainer"]').find('button').click();
    cy.wait(500);

    // Seleccionar opción Directa
    cy.contains('Directa').click();
    cy.wait(500);

    // Volver a pulsar Información general
    cy.contains('INFORMACIÓN GENERAL').click();

    // Verificar que todas las secciones estén visibles
    const secciones = [
      'DOCUMENTOS',
      'INFORMACIÓN GENERAL',
      'INFORMACIÓN DEL TRANSFORMADOR',
      'MEDIDOR ENCONTRADO',
      'TOTALIZADOR',
      'CABLEADO',
      'INFORMACIÓN DE PLANTA',
      'MANIOBRA',
      'MEDIDA A INSTALAR Y CELDA',
      'ANTENA Y RED CELULAR',
      'FACTOR DE MEDIDA A INSTALAR',
      'OBSERVACIONES E INFORMACIÓN COMPLEMENTARIA',
    ];
    secciones.forEach((seccion) => {
      cy.contains(seccion).should('be.visible');
    });
  });

  it ('FLUJO 3: Seleccionar tipo de medida Semidirecta y verificar secciones', () => {
    // Clic en tab Definición de alcance
    cy.contains('Definición de alcance').click();
    cy.contains('Definición de alcance').should('have.class', 'Mui-selected');
    cy.wait(3000);

    // Buscar por código BIA
    cy.get('input.MuiInputBase-input').first().clear().type('CO0500003757');
    cy.wait(2000);

    // Clic en el registro encontrado
    cy.get('tbody tr').first().scrollIntoView().click();

    // Verificar que navegó al detalle del registro
    cy.url().should('match', /\/dashboard\/scopes\/.+/);
    cy.wait(3000);

    // Abrir sección Información general
    cy.contains('INFORMACIÓN GENERAL').should('be.visible').click();
    cy.wait(1000);

    // Pulsar el botón de "Tipo de medida encontrada" para abrir dropdown
    cy.contains('Tipo de medida encontrada').closest('[class*="BiaDropdown_dropdownContainer"]').find('button').click();
    cy.wait(500);

    // Seleccionar opción Semidirecta
    cy.contains('Semidirecta').click();
    cy.wait(500);

    // Cerrar sección Información general
    cy.contains('INFORMACIÓN GENERAL').click();

    // Verificar que todas las secciones estén visibles
    const secciones = [
      'DOCUMENTOS',
      'INFORMACIÓN GENERAL',
      'INFORMACIÓN DEL TRANSFORMADOR',
      'MEDIDOR ENCONTRADO',
      'TOTALIZADOR',
      'CABLEADO',
      'CABLEADO CONTROL',
      'BLOQUE DE PRUEBAS',
      'TRANSFORMADORES DE CORRIENTE',
      'INFORMACIÓN DE PLANTA',
      'MANIOBRA',
      'MEDIDA A INSTALAR Y CELDA',
      'ANTENA Y RED CELULAR',
      'FACTOR DE MEDIDA A INSTALAR',
      'OBSERVACIONES E INFORMACIÓN COMPLEMENTARIA',
    ];
    secciones.forEach((seccion) => {
      cy.contains(seccion).should('be.visible');
    });
  });

  it ('FLUJO 4: Seleccionar tipo de medida Indirecta y verificar secciones', () => {
    // Clic en tab Definición de alcance
    cy.contains('Definición de alcance').click();
    cy.contains('Definición de alcance').should('have.class', 'Mui-selected');
    cy.wait(3000);

    // Buscar por código BIA
    cy.get('input.MuiInputBase-input').first().clear().type('CO0500003757');
    cy.wait(2000);

    // Clic en el registro encontrado
    cy.get('tbody tr').first().scrollIntoView().click();

    // Verificar que navegó al detalle del registro
    cy.url().should('match', /\/dashboard\/scopes\/.+/);
    cy.wait(3000);

    // Abrir sección Información general
    cy.contains('INFORMACIÓN GENERAL').should('be.visible').click();
    cy.wait(1000);

    // Pulsar el botón de "Tipo de medida encontrada" para abrir dropdown
    cy.contains('Tipo de medida encontrada').closest('[class*="BiaDropdown_dropdownContainer"]').find('button').click();
    cy.wait(500);

    // Seleccionar opción Indirecta
    cy.contains('Indirecta').click();
    cy.wait(500);

    // Cerrar sección Información general
    cy.contains('INFORMACIÓN GENERAL').click();

    // Verificar que todas las secciones estén visibles
    const secciones = [
      'DOCUMENTOS',
      'INFORMACIÓN GENERAL',
      'INFORMACIÓN DEL TRANSFORMADOR',
      'MEDIDOR ENCONTRADO',
      'TOTALIZADOR',
      'CABLEADO',
      'CABLEADO CONTROL',
      'BLOQUE DE PRUEBAS',
      'TRANSFORMADORES DE CORRIENTE',
      'TRANSFORMADORES DE TENSIÓN',
      'INFORMACIÓN DE PLANTA',
      'MANIOBRA',
      'MEDIDA A INSTALAR Y CELDA',
      'ANTENA Y RED CELULAR',
      'FACTOR DE MEDIDA A INSTALAR',
      'OBSERVACIONES E INFORMACIÓN COMPLEMENTARIA',
    ];
    secciones.forEach((seccion) => {
      cy.contains(seccion).should('be.visible');
    });
  });

});
