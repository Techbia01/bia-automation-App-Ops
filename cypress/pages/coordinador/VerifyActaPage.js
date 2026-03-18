class VerifyActaPage {
  // 📌 SELECTORES
  get filtroEstados() {
    return cy.contains('span', 'Todos los estados').closest('button');
  }

  get tablaOts() {
    return cy.get('table').first();
  }

  get filasTabla() {
    return cy.get('table tbody tr');
  }

  // 🧭 MÉTODOS

  obtenerIndiceColumna(headerText, fallbackIndex) {
    return cy.get('table thead th').then(($ths) => {
      const headers = Array.from($ths).map((th) =>
        (th.textContent || '').trim()
      );
      const index = headers.findIndex((h) => h.includes(headerText));
      if (index >= 0) {
        return index;
      }
      return fallbackIndex;
    });
  }

  filtrarPorEstadosConActa() {
    cy.log('🔍 Filtrando por estados con acta (Fallida/Exitosa)');

    return cy.fixture('coordinador/verifyActa').then((fixture) => {
      const estados = fixture.testData.estadosConActa;

      // Abrir filtro de estados
      this.filtroEstados.should('be.visible').click({ force: true });

      // Esperar a que abra el dropdown
      cy.get('div[class*="_dropdownMenu_"]').should('be.visible');

      // Desmarcar "Todos los estados" si está seleccionado
      cy.get('div[class*="_selectedSection_"] button[class*="_option_"]')
        .contains('Todos los estados')
        .click({ force: true });

      // Seleccionar los estados requeridos
      estados.forEach((estado) => {
        cy.get('div[class*="_unselectedSection_"] button[class*="_option_"]')
          .contains(estado)
          .click({ force: true });
      });

      // Cerrar dropdown
      cy.get('body').click(0, 0);
      cy.wait(1000);
    });
  }

  seleccionarFilaConActa() {
    cy.log('🔍 Buscando visita con acta en estado Fallida/Exitosa');

    return cy.fixture('coordinador/verifyActa').then((fixture) => {
      const estadosConActa = fixture.testData.estadosConActa;

      return this.obtenerIndiceColumna(
        fixture.testData.columnaEstadoOT,
        fixture.indicesFallback.estadoOT
      ).then((estadoIndex) => {
        return this.obtenerIndiceColumna(
          fixture.testData.columnaActa,
          fixture.indicesFallback.acta
        ).then((actaIndex) => {
          return this.filasTabla.then(($rows) => {
            const rows = Array.from($rows);
            const matchRow = rows.find((row) => {
              const tds = row.querySelectorAll('td');
              if (!tds || tds.length === 0) return false;

              const estadoCell = tds[estadoIndex];
              const estadoText = (estadoCell?.textContent || '').trim();
              const estadoValido = estadosConActa.some((e) =>
                estadoText.includes(e)
              );
              if (!estadoValido) return false;

              const actaCell =
                actaIndex === -1 ? tds[tds.length - 1] : tds[actaIndex];
              if (!actaCell) return false;

              // Solo filas con acta YA CARGADA: icono "archivo" (faFile), NO icono "plus" (faPlus = Cargar acta)
              const selArchivo =
                '[class*="fa-file"], [class*="faFile"], [class*="icon-faFile"], svg[data-icon="file"]';
              const selPlus =
                '[class*="fa-plus"], [class*="faPlus"], [class*="icon-faPlus"], svg[data-icon="plus"]';
              const tieneIconoArchivo = actaCell.querySelector(selArchivo);
              const tieneIconoPlus = actaCell.querySelector(selPlus);
              if (!tieneIconoArchivo || tieneIconoPlus) return false;

              return true;
            });

            if (!matchRow) {
              throw new Error(
                'No se encontró una visita con acta en estado Fallida o Exitosa.'
              );
            }

            return cy.wrap({ row: matchRow, actaIndex });
          });
        });
      });
    });
  }

  abrirActaDesdeTabla() {
    cy.log('📄 Abriendo acta desde la tabla principal');

    return this.seleccionarFilaConActa().then(({ row, actaIndex }) => {
      cy.wrap(row).find('td').then(($tds) => {
        const targetCell =
          actaIndex === -1 ? $tds[$tds.length - 1] : $tds[actaIndex];
        if (!targetCell) {
          throw new Error('No se pudo encontrar la columna de Acta en la fila.');
        }
        // Clic solo en el botón/enlace que tiene icono de ARCHIVO (acta cargada), no en el de "plus" (Cargar acta)
        cy.wrap(targetCell).then(($cell) => {
          const el = $cell[0];
          const iconoArchivo = el.querySelector(
            '[class*="fa-file"], [class*="faFile"], [class*="icon-faFile"], svg[data-icon="file"]'
          );
          const botonActa = iconoArchivo
            ? iconoArchivo.closest('button') || iconoArchivo.closest('a')
            : null;
          if (botonActa) {
            cy.wrap(botonActa).click({ force: true });
          } else {
            cy.wrap($cell).find('button, a').first().click({ force: true });
          }
        });
      });
    });
  }

  verificarOpcionesActa() {
    cy.log('✅ Verificando opciones del acta');

    return cy.fixture('coordinador/verifyActa').then((fixture) => {
      cy.contains(fixture.testData.opcionReemplazar).should('be.visible');
      cy.contains(fixture.testData.opcionDescargarActa).should('be.visible');
      cy.contains(fixture.testData.opcionBorrarActa).should('be.visible');
    });
  }

  descargarActa() {
    cy.log('⬇️ Descargando acta');

    return cy.fixture('coordinador/verifyActa').then((fixture) => {
      cy.contains(fixture.testData.opcionDescargarActa)
        .should('be.visible')
        .click({ force: true });
    });
  }

  verificarDescargaActa() {
    cy.log('✅ Verificando descarga del acta');

    return cy.fixture('coordinador/verifyActa').then((fixture) => {
      // Validar toast rápido con regex
      const regex = new RegExp(fixture.testData.mensajeDescargaRegex, 'i');
      cy.contains(regex, { timeout: fixture.timeouts.descarga }).should('exist');
    });
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * FLUJO PRINCIPAL: Validar y descargar acta
   * ═══════════════════════════════════════════════════════════════════════════
   */
  validarYDescargarActa() {
    cy.log('🚀 FLUJO: Validar y descargar acta');

    this.filtrarPorEstadosConActa();
    this.abrirActaDesdeTabla();
    this.verificarOpcionesActa();
    this.descargarActa();
    this.verificarDescargaActa();

    cy.log('🎯 FLUJO de acta completado');
  }
}

export default VerifyActaPage;
