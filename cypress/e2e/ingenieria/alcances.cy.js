import LoginPage from '../../pages/LoginPage';

const loginPage = new LoginPage();

// ── Helpers reutilizables ────────────────────────────────────────────────────

const verificarDropdownObligatorio = (label, opciones) => {
  cy.contains(label).parent().invoke('text').should('include', '*');
  cy.contains(label).closest('[class*="BiaDropdown_dropdownContainer"]').find('button').click();
  cy.wait(500);
  opciones.forEach((opcion) => cy.contains(opcion).should('exist'));
  cy.get('body').click(0, 0);
  cy.wait(500);
};

const navegarARegistro = (biaCodigo) => {
  cy.contains('Definición de alcance').click();
  cy.contains('Definición de alcance').should('have.class', 'Mui-selected');
  cy.wait(3000);
  cy.get('input.MuiInputBase-input').first().clear().type(biaCodigo);
  cy.wait(2000);
  cy.get('tbody tr').first().scrollIntoView().click();
  cy.url().should('match', /\/dashboard\/scopes\/.+/);
  cy.wait(3000);
};

const seleccionarTipoMedida = (tipo) => {
  cy.contains('INFORMACIÓN GENERAL').should('be.visible').click();
  cy.wait(1000);
  cy.contains('Tipo de medida encontrada').closest('[class*="BiaDropdown_dropdownContainer"]').find('button').click();
  cy.wait(500);
  cy.contains(tipo).click();
  cy.wait(500);
  cy.contains('INFORMACIÓN GENERAL').click();
  cy.wait(1000);
};

const verificarSecciones = (secciones) => {
  secciones.forEach((seccion) => {
    cy.contains(seccion).should('be.visible');
  });
};

// ── Secciones por tipo de medida ─────────────────────────────────────────────

const SECCIONES_DIRECTA = [
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

const SECCIONES_SEMIDIRECTA = [
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

const SECCIONES_INDIRECTA = [
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

// ─────────────────────────────────────────────────────────────────────────────

describe('Alcances - Ingeniería', () => {

  beforeEach(() => {
    loginPage.visitBiaLayout();
    cy.loginAsUser('engineer', { useBiaLayout: true });
    cy.wait(8000);
    loginPage.verifyLoginSuccess('/dashboard/technical-life-sheet');

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

      // ── PARTE 7: Filtro por tipo de alcance ──────────────────────────────────
      cy.get('input.MuiInputBase-input').first().clear();
      cy.get('body').click(0, 0);
      cy.wait(1000);
      cy.get('button[class*="BiaDropdown_input"]').first().realClick();
      cy.get('[class*="BiaDropdown_dropdownMenu"]', { timeout: 8000 }).should('be.visible');
      cy.get('[class*="BiaDropdown_dropdownMenu"]').contains('Todos los tipos de alcance').click();
      cy.get('input[class*="BiaDropdown_searchInput"]').first().type(data.searches.type_scope_filter.query);
      cy.wait(500);
      cy.get('[class*="BiaDropdown_dropdownMenu"]').contains(data.searches.type_scope_filter.expected).click();
      cy.get('body').click(0, 0);
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0).each(($row) => {
        cy.wrap($row).scrollIntoView();
        cy.wrap($row).invoke('text').should('contain', data.searches.type_scope_filter.expected);
        cy.wrap($row).invoke('text').should('not.contain', data.searches.type_scope_filter.not_expected);
      });

      // ── PARTE 8: Filtro por operador de red ──────────────────────────────────
      cy.get('button[class*="BiaDropdown_input"]').first().realClick();
      cy.get('[class*="BiaDropdown_dropdownMenu"]', { timeout: 8000 }).should('be.visible');
      cy.get('input[class*="BiaDropdown_searchInput"]').first().clear().type('Todos los tipos de alcance');
      cy.wait(500);
      cy.get('[class*="BiaDropdown_dropdownMenu"]').contains('Todos los tipos de alcance').click();
      cy.get('body').click(0, 0);
      cy.wait(1000);

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

  it('FLUJO 2: Navegar a registro y verificar secciones con medida Directa', () => {
    navegarARegistro('CO0500003757');
    seleccionarTipoMedida('Directa');
    verificarSecciones(SECCIONES_DIRECTA);
  });

  it('FLUJO 3: Seleccionar tipo de medida Semidirecta y verificar secciones', () => {
    navegarARegistro('CO0500003757');
    seleccionarTipoMedida('Semidirecta');
    verificarSecciones(SECCIONES_SEMIDIRECTA);
  });

  it('FLUJO 4: Seleccionar tipo de medida Indirecta y verificar secciones', () => {
    navegarARegistro('CO0500003757');
    seleccionarTipoMedida('Indirecta');
    verificarSecciones(SECCIONES_INDIRECTA);
  });

  it('FLUJO 5: Validar sección DOCUMENTOS para cada tipo de medida', () => {
    navegarARegistro('CO0500003757');

    const validarDocumentos = () => {
      cy.contains('DOCUMENTOS').scrollIntoView().closest('button').then(($btn) => {
        if (!$btn.hasClass('Mui-expanded')) {
          cy.wrap($btn).click();
        }
      });
      cy.wait(1000);

      cy.contains('Factura Comercializador Anterior').should('be.visible');
      cy.contains('Factura Comercializador Anterior').then(($el) => {
        expect($el.text()).to.not.include('*');
      });
      cy.contains('Factura Comercializador Anterior').parent().contains('ADJUNTAR').should('exist');

      cy.contains('Hoja De Vida Anterior').should('be.visible');
      cy.contains('Hoja De Vida Anterior').then(($el) => {
        expect($el.text()).to.not.include('*');
      });
      cy.contains('Hoja De Vida Anterior').parent().contains('ADJUNTAR').should('exist');

      cy.contains('Url Carpeta frontera').should('be.visible');
      cy.contains('Url Carpeta frontera').then(($el) => {
        expect($el.text()).to.not.include('*');
      });
    };

    seleccionarTipoMedida('Directa');
    validarDocumentos();

    seleccionarTipoMedida('Semidirecta');
    validarDocumentos();

    seleccionarTipoMedida('Indirecta');
    validarDocumentos();
  });

  it ('FLUJO 6: Validar campos de la sección INFORMACIÓN GENERAL', () => {
    navegarARegistro('CO0500003757');

    cy.contains('INFORMACIÓN GENERAL').should('be.visible').click();
    cy.wait(1000);

    // ── Tipo de medida encontrada ─────────────────────────────────────────────
    verificarDropdownObligatorio('Tipo de medida encontrada', [
      'Directa',
      'Semidirecta',
      'Indirecta',
    ]);

    // ── Ubicación de la medida ────────────────────────────────────────────────
    verificarDropdownObligatorio('Ubicación de la medida', [
      'Interior en subestación',
      'Interior en gabinete propio',
      'Interior en gabinete compartido',
      'Exterior en fachada en gabinete propio',
      'Exterior en fachada en gabinete compartido',
      'Exterior en fachada sin gabinete',
      'Exterior en poste con gabinete',
      'Exterior en poste sin gabinete',
      'Sótano en gabinete propio',
      'Sótano en gabinete compartido',
      'Sótano subestación',
      'No se logra identificar',
    ]);

    // ── Factor de medida encontrado (input numérico obligatorio) ──────────────
    cy.contains('Factor de medida encontrado').parent().invoke('text').should('include', '*');
    cy.contains('Factor de medida encontrado').parent().find('input').as('factorInput');
    // Solo acepta enteros: letras no deben quedar en el valor
    cy.get('@factorInput').clear().type('abc').invoke('val').should('not.match', /[a-zA-Z]/);
    // Decimales no deben ser aceptados
    cy.get('@factorInput').clear().type('1.5').invoke('val').should('not.include', '.');
    // Números enteros sí deben aceptarse
    cy.get('@factorInput').clear().type('3567').should('have.value', '3567');

    // ── Número de fases del usuario ───────────────────────────────────────────
    verificarDropdownObligatorio('Número de fases del usuario', ['1', '2', '3']);

    // ── Tensión nominal sistema (V) ───────────────────────────────────────────
    verificarDropdownObligatorio('Tensión nominal sistema (V)', [
      '120',
      '208',
      '220',
      '240',
      '440',
    ]);

    // ── Nivel de tensión ──────────────────────────────────────────────────────
    verificarDropdownObligatorio('Nivel de tensión', ['1', '2', '3', '4']);

    // ── Red de media tensión (V) ──────────────────────────────────────────────
    verificarDropdownObligatorio('Red de media tensión (V)', [
      '11400',
      '13200',
      '34500',
    ]);
  });

});
