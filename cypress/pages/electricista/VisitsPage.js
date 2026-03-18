class VisitsPage {
  // 📌 Selectores como getters
  get rutaVisitas() {
    return cy.url();
  }

  get seccionTusVisitas() {
    // Buscar el texto "Tus visitas" de manera más robusta
    // Primero intentar por el texto directo, luego por el header
    return cy.contains('Tus visitas').should('exist');
  }

  get inputBusqueda() {
    return cy.get('[data-cy="search-input"], input[placeholder*="buscar"], input[placeholder*="Buscar"]');
  }

  get listaVisitas() {
    return cy.get('[data-cy="visits-list"], .visits-container, .visit-item');
  }


  get estadoVisita() {
    // Buscar el estado de la visita de manera más robusta
    return cy.contains('Asignada').should('exist');
  }

  get tituloVisita() {
    // Buscar el título de la visita de manera más robusta
    // El patrón ahora incluye el timestamp: "Prueba Automation XXX_XXXXXXXXXX"
    return cy.contains(/^Prueba Automation \d+_\d+$/).should('exist');
  }


  // 🧭 MÉTODOS - Acciones que se pueden realizar en la página

  /**
   * Navegar a la sección de visitas
   */
  goToVisitas() {
    this.rutaVisitas.should('include', '/admin/ots');
    this.seccionTusVisitas.click();
  }


  /**
   * Buscar una visita específica por su título
   * @param {string} titulo - El título de la visita a buscar
   */
  buscarVisitaPorTitulo(titulo) {
    // Verificar que estamos en la página correcta
    cy.url().should('satisfy', (url) => {
      return url.includes('/admin/ots') || url.includes('/visits') || url.includes('/home');
    });
    
    // Esperar a que la página cargue completamente y el loader desaparezca
    cy.wait(3000);
    cy.get('._loaderPage_c1dpd_14', { timeout: 20000 }).should('not.exist');
    
    // Intentar usar el campo de búsqueda si existe
    this.intentarBusquedaPorInput(titulo);
    
    // Buscar directamente en la lista
    this.seleccionarVisitaDeLista(titulo);
  }

  /**
   * Intentar buscar usando el input de búsqueda
   * @param {string} titulo - Título a buscar
   */
  intentarBusquedaPorInput(titulo) {
    cy.get('body').then(($body) => {
      if ($body.find('input[placeholder*="buscar"], input[placeholder*="Buscar"], [data-cy="search-input"]').length > 0) {
        // Esperar a que el loader desaparezca
        cy.get('._loaderPage_c1dpd_14', { timeout: 15000 }).should('not.exist');
        
        this.inputBusqueda
          .first()
          .clear({ force: true })
          .type(titulo, { force: true })
          .wait(2000); // Esperar filtrado de resultados
      }
    });
  }

  /**
   * Seleccionar visita de la lista
   * @param {string} titulo - Título de la visita
   */
  seleccionarVisitaDeLista(titulo) {
    cy.contains(titulo, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true });
  }

  /**
   * Método combinado: navegar y buscar visita
   * @param {string} titulo - Título de la visita a buscar
   */
  buscarYSeleccionarVisita(titulo) {
    this.buscarVisitaPorTitulo(titulo);
  }


  verificarEstadoVisita(estadosPermitidos) {
    this.estadoVisita.invoke('text').then((estado) => {
        const estadoActual = estado.trim();
        expect(estadosPermitidos).to.include(estadoActual);
        cy.log(`✅ Estado "${estadoActual}" es válido.`);
      });
  }

  /**
   * Verificar que estamos viendo la visita correcta
   * @param {string} tituloEsperado - Título que debería mostrar la visita
   */
  verificarTituloVisita(tituloEsperado) {
    // Buscar el título exacto de la visita
    cy.contains(tituloEsperado).should('be.visible');
  }

  /**
   * Verificar que la página de visitas está cargada
   */
  verificarPaginaCargada() {
    cy.wait(2000);
    // Verificar que estamos en la página correcta
    cy.url().should('satisfy', (url) => {
      return url.includes('/home') || url.includes('/visits') || url.includes('/admin/ots');
    });
    
    // Verificar que el título "Tus visitas" esté visible
    this.seccionTusVisitas.should('be.visible');
    
    // Verificar que la página esté completamente cargada
    cy.get('body').should('not.contain', 'Loading...');
  }
}

export default VisitsPage;
