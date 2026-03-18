class DownloadCSVPage {
  // 📌 SELECTORES - Elementos de la interfaz

  get botonDescargarCSV() {
    return cy.contains('button', 'Descargar CSV');
  }

  get modalDescargar() {
    return cy.get('div[role="dialog"], [class*="modal"], [class*="Modal"]');
  }

  get tituloModal() {
    return cy.contains('Descargar archivo csv');
  }

  get dropdownEstadoOT() {
    return cy.contains('Estado de la OT').parent().find('select, [class*="select"], [role="combobox"]');
  }

  get dropdownTipoOT() {
    return cy.contains('Tipo de OT').parent().find('select, [class*="select"], [role="combobox"]');
  }

  get campoFecha() {
    return cy.contains('Fecha de ejecución').parent().find('input, [class*="date"], [class*="picker"]');
  }

  get inputSeleccionarFecha() {
    return cy.get('input[placeholder*="Seleccionar fecha"], input[placeholder*="fecha"]');
  }

  get botonDescargar() {
    return cy.contains('button', 'Descargar');
  }

  get botonCancelar() {
    return cy.contains('button', 'Cancelar');
  }

  // 🧭 MÉTODOS - Lógica de negocio

  /**
   * Hacer clic en el botón "Descargar CSV" de la página principal
   */
  abrirModalDescargarCSV() {
    cy.log('📥 Abriendo modal de Descargar CSV');
    
    this.botonDescargarCSV.should('be.visible').click();
    cy.wait(1000);
    
    cy.log('✅ Modal de descarga abierto');
  }

  /**
   * Verificar que el modal se abra correctamente
   */
  verificarModalAbierto() {
    cy.log('📋 Verificando que el modal esté abierto');
    
    cy.fixture('coordinador/downloadCSV').then((fixture) => {
      cy.contains(fixture.testData.tituloModal, { timeout: 10000 }).should('be.visible');
    });
    
    cy.log('✅ Modal abierto correctamente');
  }

  /**
   * Validar todos los textos del modal
   */
  validarTextosModal() {
    cy.log('📋 Validando textos del modal');
    
    cy.fixture('coordinador/downloadCSV').then((fixture) => {
      // Validar título del modal
      cy.contains(fixture.testData.tituloModal).should('be.visible');
      cy.log('✅ Título del modal validado');
      
      // Validar subtítulo/descripción
      cy.contains(fixture.testData.descripcionModal).should('be.visible');
      cy.log('✅ Descripción del modal validada');
      
      // Validar label "Estado de la OT"
      cy.contains(fixture.testData.labelEstadoOT).should('be.visible');
      cy.log('✅ Label Estado de la OT validado');
      
      // Validar label "Tipo de OT"
      cy.contains(fixture.testData.labelTipoOT).should('be.visible');
      cy.log('✅ Label Tipo de OT validado');
      
      // Validar label "Fecha de ejecución"
      cy.contains(fixture.testData.labelFechaEjecucion).should('be.visible');
      cy.log('✅ Label Fecha de ejecución validado');
      
      // Validar botón Cancelar
      cy.contains('button', fixture.testData.botonCancelar).should('be.visible');
      cy.log('✅ Botón Cancelar validado');
      
      // Validar botón Descargar (inicialmente puede estar deshabilitado)
      cy.contains('button', fixture.testData.botonDescargar).should('be.visible');
      cy.log('✅ Botón Descargar validado');
    });
    
    cy.log('✅ Todos los textos del modal validados');
  }

  /**
   * Seleccionar rango de fechas (máximo 60 días)
   * Selecciona desde el primer día del mes anterior hasta hoy
   */
  seleccionarRangoFechas() {
    cy.log('📅 Seleccionando rango de fechas');
    
    // Hacer clic en el campo de fecha para abrir el calendario
    cy.get('input[placeholder*="Seleccionar fecha"], input[placeholder*="fecha"]')
      .should('be.visible')
      .click({ force: true });
    
    cy.wait(1000);
    
    // Seleccionar fecha de inicio (primer día visible del mes anterior)
    // Navegar al mes anterior si es necesario
    cy.get('button[aria-label*="anterior"], button[class*="prev"], svg[data-testid*="chevron-left"]')
      .first()
      .click({ force: true });
    
    cy.wait(500);
    
    // Seleccionar el día 1 del mes anterior
    cy.get('button, td, div').contains(/^1$/).first().click({ force: true });
    
    cy.wait(500);
    
    // El calendario debería mostrar el segundo mes, seleccionar un día del mes actual
    // Navegar al mes actual
    cy.get('button[aria-label*="siguiente"], button[class*="next"], svg[data-testid*="chevron-right"]')
      .first()
      .click({ force: true });
    
    cy.wait(500);
    
    // Seleccionar el día actual o un día cercano (ej: día 15 o 28)
    cy.get('button, td, div').contains(/^28$/).first().click({ force: true });
    
    cy.wait(500);
    
    // Confirmar la selección si hay botón de confirmar
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Confirmar")').length > 0) {
        cy.contains('button', 'Confirmar').click({ force: true });
      }
    });
    
    cy.wait(1000);
    cy.log('✅ Rango de fechas seleccionado');
  }

  /**
   * Verificar que el botón de descargar esté habilitado
   */
  verificarBotonDescargarHabilitado() {
    cy.log('✅ Verificando que el botón de descargar esté habilitado');
    
    cy.fixture('coordinador/downloadCSV').then((fixture) => {
      cy.contains('button', fixture.testData.botonDescargar)
        .should('not.be.disabled')
        .and('be.visible');
    });
    
    cy.log('✅ Botón de descargar habilitado');
  }

  /**
   * Hacer clic en el botón de descargar
   */
  clickDescargar() {
    cy.log('📥 Haciendo clic en botón Descargar');
    
    // Buscar específicamente el botón Descargar del modal (no el de la página principal)
    // El modal tiene el botón junto al botón Cancelar
    cy.get('div[role="dialog"], [class*="modal"], [class*="Modal"]')
      .filter(':visible')
      .first()
      .within(() => {
        cy.contains('button', 'Descargar').should('be.visible').click({ force: true });
      });
    
    // No esperar aquí para no perder el toast
    cy.log('✅ Descarga iniciada');
  }

  /**
   * Verificar que la descarga se completó (el modal se cierra)
   */
  verificarDescargaCompletada() {
    cy.log('✅ Verificando que la descarga se completó');
    
    // Verificar mensaje de descarga exitosa (toast puede ser muy rápido)
    // Buscar el texto en todo el DOM sin selector específico
    cy.fixture('coordinador/downloadCSV').then((fixture) => {
      cy.contains(fixture.testData.mensajeDescargaExitosa, { timeout: 10000 })
        .should('exist');
    });
    
    cy.log('✅ Mensaje de descarga exitoso visible');
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * FLUJO PRINCIPAL: Descargar CSV
   * ═══════════════════════════════════════════════════════════════════════════
   */
  descargarCSV() {
    cy.log('🚀 FLUJO: Descargar CSV');
    
    // 1. Abrir el modal de descarga
    this.abrirModalDescargarCSV();
    
    // 2. Verificar que el modal se abrió
    this.verificarModalAbierto();
    
    // 3. Validar todos los textos del modal
    this.validarTextosModal();
    
    // 4. Seleccionar rango de fechas (máximo 60 días)
    this.seleccionarRangoFechas();
    
    // 5. Verificar que el botón de descargar está habilitado
    this.verificarBotonDescargarHabilitado();
    
    // 6. Hacer clic en descargar
    this.clickDescargar();
    
    // 7. Verificar descarga completada
    this.verificarDescargaCompletada();
    
    cy.log('🎯 FLUJO Descargar CSV completado exitosamente');
  }
}

export default DownloadCSVPage;
