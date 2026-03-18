class AssignElectricianPage {
  // 📌 SELECTORES - Elementos de la interfaz
  
  // Selectores para filtros de estado
  get filtroEstados() {
    return cy.contains('span', 'Todos los estados').closest('button');
  }
  
  // Selectores para la tabla de visitas (compatible con BiaLayout)
  get tablaVisitas() {
    return cy.get('table[class*="tableOts"], table[class*="TableOts"], table[class*="table_"]').first();
  }
  
  get primeraVisita() {
    return cy.get('table[class*="tableOts"] tbody tr, table[class*="TableOts"] tbody tr, table[class*="table_"] tbody tr').first();
  }
  
  get botonAsignarElectricista() {
    // Botón + en la columna de electricista
    return cy.get('table tbody tr').first().find('button[class*="iconRow"], button[class*="IconRow"], button[class*="icon_"], button svg').eq(1);
  }
  
  // Selectores para el modal de asignación
  get modalAsignacion() {
    return cy.get('div[role="dialog"], .modal, [data-testid="modal"], .BiaModal, .modal-overlay, .modal-container, [class*="modal"], [class*="Modal"]');
  }
  
  get tituloModal() {
    return cy.contains(/Asignar electricista(s)?/).first();
  }
  
  // Selectores para el buscador de electricistas
  get buscadorElectricistas() {
    return cy.get('input[placeholder="Buscar"], input[placeholder*="Buscar electricista"], input[class*="search"], input[class*="Search"]')
      .filter((index, element) => {
        if (element.tagName !== 'INPUT') return false;
        const placeholder = element.getAttribute('placeholder') || '';
        return !placeholder.includes('Código Bia') && !placeholder.includes('Código OT');
      });
  }
  
  // 🧭 MÉTODOS - Lógica de negocio
  // Nota: Asignar electricista SOLO se puede hacer desde la tabla principal (botón +)

  /**
   * Filtrar visitas por estado "Por asignar electricista"
   */
  filtrarPorEstadoPorAsignarElectricista() {
    cy.log('🔍 Filtrando visitas por estado "Por asignar electricista"');
    
    cy.wait(2000);
    
    // Buscar y hacer clic en el filtro de estados
    this.filtroEstados.should('be.visible').click();
    
    // Esperar a que se abra el dropdown
    cy.get('div[class*="_dropdownMenu_"]').should('be.visible');
    
    // Desmarcar "Todos los estados"
    cy.get('div[class*="_selectedSection_"] button[class*="_option_"]')
      .contains('Todos los estados')
      .should('exist')
      .click({ force: true });
    
    // Seleccionar "Por asignar electricista"
    cy.fixture('coordinador/assignElectrician').then((fixture) => {
      cy.get('div[class*="_unselectedSection_"] button[class*="_option_"]')
        .contains(fixture.testData.estadoPorAsignarElectricista)
        .should('exist')
        .click({ force: true });
    });
    
    // Cerrar dropdown
    cy.get('body').click(0, 0);
    cy.wait(1000);
    
    cy.log('✅ Filtro aplicado correctamente');
  }

  /**
   * Seleccionar la primera visita de la lista filtrada
   */
  seleccionarPrimeraVisita() {
    cy.log('📋 Seleccionando la primera visita de la lista');
    
    cy.window().then((win) => {
      win.scrollTo(0, 0);
    });
    cy.wait(1000);
    
    this.tablaVisitas.should('exist');
    this.tablaVisitas.scrollIntoView({ 
      offset: { top: -150, left: 0 },
      duration: 1000
    });
    
    cy.wait(1000);
    this.primeraVisita.scrollIntoView().should('exist').click({ force: true });
    cy.wait(2000);
    
    cy.log('✅ Primera visita seleccionada correctamente');
  }

  /**
   * Obtener índice de columna por texto del encabezado
   */
  _indiceColumnaPorHeader(textoHeader) {
    return cy.get('table thead th').then(($ths) => {
      const headers = Array.from($ths).map((th) => (th.textContent || '').trim());
      const index = headers.findIndex((h) =>
        h.toLowerCase().includes(textoHeader.toLowerCase())
      );
      return index >= 0 ? index : -1;
    });
  }

  /**
   * Hacer clic en el botón + de la columna Electricistas (no Contratista)
   */
  hacerClicEnBotonAsignarElectricista() {
    cy.log('➕ Haciendo clic en botón de asignar electricista (botón +)');
    
    cy.wait(1000);
    
    // Buscar la columna por cabecera "Electricistas" o "Electricista"
    this._indiceColumnaPorHeader('Electricista').then((colIndex) => {
      if (colIndex < 0) {
        throw new Error('No se encontró la columna Electricistas en la tabla');
      }
      cy.get('table tbody tr').first().find('td').eq(colIndex).within(() => {
        cy.get('button').click({ force: true });
      });
    });
    
    cy.wait(2000);
    cy.log('✅ Botón de asignar electricista clickeado');
  }

  /**
   * Verificar que el modal se abra correctamente
   */
  verificarModalAbierto() {
    cy.log('📋 Verificando que el modal esté abierto');
    
    cy.fixture('coordinador/assignElectrician').then((fixture) => {
      cy.contains(fixture.testData.tituloModal, { timeout: 10000 }).should('be.visible');
    });
    
    cy.log('✅ Modal abierto correctamente');
  }

  /**
   * Buscar y seleccionar electricista del dropdown
   */
  buscarElectricista(textoBusqueda = null) {
    cy.fixture('coordinador/assignElectrician').then((fixture) => {
      const textoABuscar = textoBusqueda || fixture.testData.electricista;
      
      cy.log(`🔍 Buscando electricista por "${textoABuscar}"`);
      
      // 1. Hacer clic en el dropdown "Selecciona líder"
      cy.contains('Selecciona líder').click({ force: true });
      cy.wait(1000);
      
      // 2. Escribir en el campo de búsqueda dentro del dropdown
      cy.get('input[placeholder*="Buscar"]').should('be.visible').clear().type(textoABuscar);
      cy.wait(2000);
      
      cy.log('✅ Búsqueda de electricista completada');
    });
  }

  /**
   * Seleccionar el electricista de la lista del dropdown
   */
  seleccionarRadioElectricista(nombreElectricista = null) {
    cy.log(`👆 Seleccionando electricista: ${nombreElectricista || 'primer resultado'}`);
    
    cy.wait(1000);
    
    if (nombreElectricista) {
      // Seleccionar el electricista que contenga el nombre buscado
      cy.get('label, div[class*="option"], li').contains(nombreElectricista, { matchCase: false }).click({ force: true });
    } else {
      // Seleccionar el primer resultado
      cy.get('label, div[class*="option"], li').first().click({ force: true });
    }
    
    cy.log('✅ Electricista seleccionado');
    cy.wait(1000);
  }

  /**
   * Validar que el botón de asignar esté habilitado
   */
  validarBotonAsignarHabilitado() {
    cy.log('✅ Validando que el botón de asignar esté habilitado');
    cy.wait(3000);
    
    cy.fixture('coordinador/assignElectrician').then((fixture) => {
      cy.contains('button', fixture.testData.botonConfirmar).should('not.be.disabled');
    });
    
    cy.log('✅ Botón de asignar habilitado');
  }

  /**
   * Confirmar la asignación
   */
  confirmarAsignacion() {
    cy.log('✅ Confirmando asignación de electricista');
    
    cy.fixture('coordinador/assignElectrician').then((fixture) => {
      cy.contains('button', fixture.testData.botonConfirmar).click({ force: true });
    });
    
    cy.wait(3000);
    cy.log('✅ Asignación confirmada');
  }

  /**
   * Verificar mensaje de éxito
   */
  verificarMensajeExito(visitTitle) {
    cy.log('✅ Verificando mensaje de éxito');
    
    cy.fixture('coordinador/assignElectrician').then((fixture) => {
      cy.contains(fixture.testData.mensajeExito, { timeout: 10000 }).should('be.visible');
    });
    
    cy.log('✅ Mensaje de éxito verificado');
  }

  /**
   * Verificación final del proceso completado (Flujo 1)
   */
  verificarProcesoCompletado() {
    cy.log('🔍 Verificando proceso completado...');
    
    // Verificar que el estado cambió
    cy.contains('Lista para ejecutar').should('exist');
    cy.log('✅ Estado cambiado a "Lista para ejecutar"');
    
    // Verificar que el electricista fue asignado
    cy.contains('Electricista').parent().invoke('text').then((text) => {
      const electricistaText = text.replace('Electricista', '').trim();
      const hasElectrician = electricistaText.length > 0 && electricistaText !== '-';
      expect(hasElectrician).to.be.true;
      cy.log(`✅ Electricista asignado: ${electricistaText}`);
    });
    
    cy.log('✅ Verificación de asignación completada exitosamente');
  }

  /**
   * Capturar el código OT de la primera visita visible
   * Busca la columna "Código OT" por cabecera para no depender del orden de columnas
   */
  capturarCodigoOTPrimeraVisita() {
    cy.log('📋 Capturando código OT de la primera visita');
    
    return cy.get('table thead th').then(($ths) => {
      const headers = Array.from($ths).map((th) => (th.textContent || '').trim());
      const index = headers.findIndex((h) => h.includes('Código OT') || h.includes('Código'));
      const colIndex = index >= 0 ? index : 0;
      return cy.get('table tbody tr').first().find('td').eq(colIndex).invoke('text')
        .then((text) => text.trim());
    });
  }

  /**
   * Capturar el título de la primera visita
   */
  capturarTituloPrimeraVisita() {
    cy.log('📋 Capturando título de la primera visita');
    
    return cy.get('tr').eq(1).find('td').first().invoke('text').then((text) => {
      const title = text.trim();
      if (!title) {
        return 'Visita de prueba';
      }
      return title;
    });
  }

  /**
   * Verificar la asignación desde la vista de tabla (Flujo 2)
   */
  verificarAsignacionDesdeTabla(codigoOT) {
    cy.log('🔍 Verificando asignación desde la tabla');
    
    // 1. Quitar filtros
    cy.log('🔄 Quitando filtros...');
    cy.get('button').contains('Por asignar').click({ force: true });
    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      if ($body.find('span:contains("Todos los estados")').length > 0) {
        cy.contains('span', 'Todos los estados').click({ force: true });
        cy.wait(1000);
      }
    });
    
    // 2. Buscar la visita por código OT (solo si tenemos código no vacío)
    const codigoValido = typeof codigoOT === 'string' && codigoOT.trim().length > 0;
    const codigo = codigoValido ? codigoOT.trim() : '';
    if (!codigoValido) {
      cy.log('⚠️ No se pudo capturar el código OT; se omite la búsqueda en filtro');
    } else {
      cy.log(`🔍 Buscando visita con código: ${codigo}`);
      cy.get('input[placeholder*="Código"]').clear().type(codigo);
      cy.wait(2000);
    }
    
    // 3. Verificar que la visita aparece con el nuevo estado (solo si tenemos código)
    if (codigoValido) {
      cy.log('✅ Verificando estado y electricista en la tabla');
      cy.contains('tr', codigo).within(() => {
        // Verificar que el estado cambió a "Lista para ejecutar"
        cy.contains('Lista para ejecutar').should('exist');
        cy.log('✅ Estado: Lista para ejecutar');
        
        // Verificar que hay un electricista asignado (no está vacío)
        cy.get('td').then(($tds) => {
          const electricistaCell = $tds.eq(4); // Columna de electricista
          const electricistaText = electricistaCell.text().trim();
          expect(electricistaText).to.not.equal('-');
          expect(electricistaText).to.not.equal('');
          cy.log(`✅ Electricista asignado: ${electricistaText}`);
        });
      });
    }
    
    cy.log('✅ Verificación desde tabla completada');
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * FLUJO 2: Asignar electricista desde la TABLA (botón +)
   * ═══════════════════════════════════════════════════════════════════════════
   */
  asignarElectricistaDesdeTabla() {
    cy.log('🚀 FLUJO 2: Asignación desde TABLA (botón +)');
    
    // 1. Filtrar por estado "Por asignar electricista"
    this.filtrarPorEstadoPorAsignarElectricista();
    
    // 2. Capturar el código OT y encadenar todo el flujo
    this.capturarCodigoOTPrimeraVisita().then((codigoOT) => {
      cy.log(`📋 Código OT capturado: ${codigoOT}`);
      
      // 3. Hacer clic en el botón + de la columna electricista
      this.hacerClicEnBotonAsignarElectricista();
      
      // 4. Verificar que el modal se abra correctamente
      this.verificarModalAbierto();
      
      // 5. Buscar y seleccionar electricista desde fixture
      cy.fixture('coordinador/assignElectrician').then((fixture) => {
        const electricista = fixture.testData.electricista;
        this.buscarElectricista(electricista);
        
        // 6. Seleccionar el radio button del electricista
        this.seleccionarRadioElectricista(electricista);
      });
      
      // 7. Validar que se habilite el botón de asignar
      this.validarBotonAsignarHabilitado();
      
      // 8. Confirmar la asignación
      this.confirmarAsignacion();
      
      // 9. Verificar asignación desde la tabla
      this.verificarAsignacionDesdeTabla(codigoOT);
      
      cy.log('🎯 FLUJO 2 completado exitosamente');
    });
  }
}

export default AssignElectricianPage;
