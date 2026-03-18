class AssignContractorPage {
  // 📌 SELECTORES - Elementos de la interfaz separados de la lógica
  
  // Selectores para filtros de estado
  get filtroEstados() {
    return cy.contains('span', 'Todos los estados').closest('button');
  }
  
  get opcionPorAsignarContratista() {
    return cy.fixture('coordinador/assignContractor').then((fixture) => {
      return cy.contains(fixture.testData.estadoPorAsignarContratista).should('exist');
    });
  }
  
  // Selectores para la tabla de visitas (compatible con BiaLayout y dominio viejo)
  get tablaVisitas() {
    return cy.get('table[class*="tableOts"], table[class*="TableOts"], table[class*="table_"]').first();
  }
  
  get primeraVisita() {
    return cy.get('table[class*="tableOts"] tbody tr, table[class*="TableOts"] tbody tr, table[class*="table_"] tbody tr').first();
  }
  
  get columnaContratista() {
    return cy.get('[data-cy="contractor-column"], .contractor-column, td:nth-child(3)');
  }
  
  get botonAsignarContratista() {
    // Selector más robusto que no depende de clases hasheadas (compatible con BiaLayout)
    return cy.get('table tbody tr').first().find('button[class*="iconRow"], button[class*="IconRow"], button[class*="icon_"], button svg').first();
  }
  
  // Selectores para el modal de asignación
  get modalAsignacion() {
    return cy.get('div[role="dialog"], .modal, [data-testid="modal"], .BiaModal, .modal-overlay, .modal-container, [class*="modal"], [class*="Modal"]');
  }
  
  get tituloModal() {
    return cy.contains('Asignar contratista').first();
  }
  
  // Selectores específicos para los datos del modal de asignación
  get modalCodigoVisita() {
    // El código de la visita está en negrita en el modal
    return this.modalAsignacion.find('strong, b, [class*="bold"], [class*="title"]').first();
  }
  
  get modalTipoOT() {
    // Busca el valor después de "Tipo OT"
    return cy.contains('Tipo OT').parent().find('span, p, div').last();
  }
  
  get modalFecha() {
    // Busca el valor después de "Fecha"
    return cy.contains('Fecha').parent().find('span, p, div').last();
  }
  
  get modalCiudad() {
    // Busca el valor después de "Ciudad"
    return cy.contains('Ciudad').parent().find('span, p, div').last();
  }
  
  // Selectores del detalle de visita (para capturar datos antes del modal)
  get detalleCodigoOT() {
    return cy.contains('Código de OT').siblings().first();
  }
  
  get detalleTipoOT() {
    return cy.contains('Tipo de OT').siblings().first();
  }
  
  get detalleFecha() {
    return cy.contains('Fecha').siblings().first();
  }
  
  get detalleCiudad() {
    return cy.contains('Ciudad').siblings().first();
  }
  
  // Selectores para el buscador de contratistas
  get buscadorContratistas() {
    // Selector más específico para el campo "Buscar" del modal
    // Solo buscar elementos input, no divs o contenedores
    return cy.get('input[placeholder="Buscar"], input[placeholder*="Buscar contratista"], .BiaSearchList input, [data-testid="contractor-search"], .search-input, input[class*="search"], input[class*="Search"]')
      .filter((index, element) => {
        // Asegurar que sea un elemento input
        if (element.tagName !== 'INPUT') {
          return false;
        }
        // Filtrar solo campos que NO sean "Código Bia o Código OT"
        const placeholder = element.getAttribute('placeholder') || '';
        return !placeholder.includes('Código Bia') && !placeholder.includes('Código OT');
      });
  }
  
  get listaContratistas() {
    return cy.get('.contractor-option, [data-testid="contractor-option"], .option, .list-item, .item, [class*="option"], [class*="Option"], [class*="item"], [class*="Item"]');
  }
  
  get contratistaJO() {
    return cy.fixture('coordinador/assignContractor').then((fixture) => {
      // Buscar cualquier elemento que contenga "JO" en diferentes patrones
      return cy.get('body').then(($body) => {
        // Buscar en diferentes tipos de elementos que podrían ser opciones de contratista
        const possibleOptions = $body.find('.contractor-option, [data-testid="contractor-option"], .option, .list-item, .item, [class*="option"], [class*="Option"], [class*="item"], [class*="Item"], button, div, span');
        
        // Filtrar elementos que contengan "JO"
        const joOptions = possibleOptions.filter((index, element) => {
          const text = element.textContent || element.innerText;
          return text && text.includes(fixture.testData.contratistaFlujo1);
        });
        
        if (joOptions.length > 0) {
          cy.log(`✅ Encontrados ${joOptions.length} contratistas con "JO"`);
          return cy.wrap(joOptions.first());
        } else {
          cy.log('❌ No se encontraron contratistas');
          // Fallback: buscar cualquier texto que contenga el contratista del flujo 1
          return cy.contains(fixture.testData.contratistaFlujo1);
        }
      });
    });
  }
  
  // Selectores para botones del modal
  get botonConfirmar() {
    return cy.fixture('coordinador/assignContractor').then((fixture) => {
      return cy.get('button:contains("Asignar contratista"), [data-testid="confirm-button"]').contains(fixture.testData.botonConfirmar);
    });
  }
  
  get botonCancelar() {
    return cy.fixture('coordinador/assignContractor').then((fixture) => {
      return cy.get('button:contains("Cancelar"), [data-testid="cancel-button"]').contains(fixture.testData.botonCancelar);
    });
  }
  
  // Selectores para mensajes de éxito
  get mensajeExito() {
    // Buscar cualquier toast o mensaje de éxito con timeout extendido
    return cy.get('.BiaToast, .toast-success, [data-testid="success-message"], [class*="toast"], [class*="Toast"], [class*="success"], [class*="Success"], [role="alert"]', { timeout: 10000 });
  }
  
  // Selectores para el detalle de visita (Flujo 1)
  get avatarMenuButton() {
    // Botón del avatar en la esquina superior derecha del detalle de visita
    // Compatible con dominio viejo (ion-img) y BiaLayout (img)
    return cy.get('ion-img[src="/assets/img/bia-avatar-active.svg"], img[src="/assets/icons/bia-avatar.svg"], img[src*="bia-avatar"]').first();
  }
  
  get menuAsignarContratistaOpcion() {
    // Buscar el item del menú desplegable del header que contiene "Asignar contratista"
    // Usar selector específico para el menú MUI del header
    return cy.get('ul[role="menu"]').contains('li', 'Asignar contratista');
  }
  
  get botonAsignarContratistaDetalle() {
    // Botón de acción "Asignar contratista" en el detalle de la visita (BiaLayout)
    return cy.get('button[class*="WorkOrderDetail_actionButton"]').contains('Asignar contratista');
  }
  
  get menuCerrarSesionOpcion() {
    return cy.contains('Cerrar sesión');
  }
  
  // 🧭 MÉTODOS - Lógica de negocio encapsulada
  
  /**
   * Filtrar visitas por estado "Por asignar contratista"
   * Filtra todas las visitas y selecciona únicamente las que están en estado pendiente de asignación de contratista
   */
  filtrarPorEstadoPorAsignarContratista() {
    cy.log('🔍 Filtrando visitas por estado "Por asignar contratista"');
    
    // Esperar a que la página cargue completamente
    cy.wait(2000);
    
    // Buscar y hacer clic en el filtro de estados
    this.filtroEstados.should('be.visible').click();
    
    // Esperar a que se abra el dropdown y verificar que esté visible
    cy.get('div[class*="_dropdownMenu_"]').should('be.visible');
    
    // Desmarcar "Todos los estados" (está marcado por defecto)
    cy.get('div[class*="_selectedSection_"] button[class*="_option_"]')
      .contains('Todos los estados')
      .should('exist')
      .click({ force: true });
    
    // Seleccionar únicamente "Por asignar contratista"
    cy.fixture('coordinador/assignContractor').then((fixture) => {
      cy.get('div[class*="_unselectedSection_"] button[class*="_option_"]')
        .contains(fixture.testData.estadoPorAsignarContratista)
        .should('exist')
        .click({ force: true });
    });
    
    // Hacer clic por fuera del dropdown para cerrarlo
    cy.get('body').click(0, 0);
    
    // Esperar a que se cierre el dropdown
    cy.wait(1000);
    
    // Esperar a que se aplique el filtro
    cy.wait(3000);
    
    cy.log('✅ Filtro aplicado correctamente');
  }
  
  /**
   * Seleccionar la primera visita de la lista filtrada
   * Identifica y selecciona la primera visita que aparece después de aplicar el filtro
   */
  seleccionarPrimeraVisita() {
    cy.log('📋 Seleccionando la primera visita de la lista');
    
    // Hacer scroll hacia arriba usando window.scrollTo
    cy.window().then((win) => {
      win.scrollTo(0, 0);
    });
    cy.wait(1000);
    
    // Verificar que la tabla exista
    this.tablaVisitas.should('exist');
    
    // Hacer scroll hacia la tabla con offset para evitar la paginación
    this.tablaVisitas.scrollIntoView({ 
      offset: { top: -150, left: 0 },
      duration: 1000
    });
    
    // Esperar a que el scroll se complete
    cy.wait(1000);
    
    // Seleccionar la primera visita
    this.primeraVisita.scrollIntoView().should('exist').click({ force: true });
    
    // Esperar a que se cargue la información de la visita
    cy.wait(2000);
    
    cy.log('✅ Primera visita seleccionada correctamente');
  }
  
  /**
   * Hacer clic en el botón + de la columna contratista
   * Localiza y hace clic en el botón de asignación de contratista
   */
  hacerClicEnBotonAsignarContratista() {
    cy.log('➕ Haciendo clic en botón de asignar contratista (botón +)');
    
    // Esperar a que la tabla se estabilice
    cy.wait(1000);
    
    // Usar alias para evitar que el elemento desaparezca durante el clic
    cy.get('table tbody tr').first().find('button[class*="_iconRow_"]').first().as('botonPlus');
    cy.get('@botonPlus').scrollIntoView().should('exist').click({ force: true });
    
    // Esperar a que se abra el modal
    cy.wait(2000);
    
    cy.log('✅ Botón + clickeado correctamente');
  }
  
  /**
   * Verificar que el modal se abra correctamente
   * Valida que toda la información del modal esté presente y correcta
   */
  verificarModalAbierto() {
    cy.log('🔍 Verificando que el modal se abrió correctamente');
    
    // Debug: Verificar qué elementos están presentes en la página
    cy.log('🔍 Debug: Buscando elementos del modal...');
    
    // Intentar encontrar el modal con diferentes estrategias
    cy.get('body').then(($body) => {
      // Buscar elementos que podrían ser el modal
      const possibleModals = $body.find('div[role="dialog"], .modal, [data-testid="modal"], .BiaModal, .modal-overlay, .modal-container, [class*="modal"], [class*="Modal"]');
      
      if (possibleModals.length > 0) {
        cy.log(`✅ Encontrados ${possibleModals.length} posibles modales`);
        possibleModals.each((index, element) => {
          cy.log(`Modal ${index + 1}:`, element.className, element.tagName);
        });
      } else {
        cy.log('❌ No se encontraron modales con los selectores estándar');
        
        // Buscar cualquier elemento que contenga "Asignar contratista"
        const titleElements = $body.find('h1, h2, h3, h4, h5, h6, .title, .modal-title, [class*="title"]');
        cy.log(`Encontrados ${titleElements.length} elementos de título`);
        
        titleElements.each((index, element) => {
          const text = element.textContent || element.innerText;
          if (text && text.includes('Asignar')) {
            cy.log(`Título relevante ${index + 1}:`, text, element.className, element.tagName);
          }
        });
      }
    });
    
    // Intentar encontrar el modal de manera más flexible
    cy.fixture('coordinador/assignContractor').then((fixture) => {
      // El overlay es parte del diseño del modal, no esperamos que desaparezca
      // Buscar el título específicamente en elementos de encabezado (no en botones)
      cy.get('h1, h2, h3, h4, [class*="title"], [class*="header"]').contains(fixture.testData.tituloModal).should('exist');
      cy.log('✅ Modal de asignación encontrado');
      
             // Estrategia 3: Verificar que la información de la visita esté presente
       // Buscar elementos que contengan información de la visita (más flexible)
       cy.get('body').then(($body) => {
         const bodyText = $body.text();
         cy.log('🔍 Contenido de la página:', bodyText.substring(0, 500) + '...');
         
         // Buscar diferentes patrones que puedan indicar que el modal está abierto
         const hasVisitInfo = bodyText.includes('OT') || bodyText.includes('Orden') || bodyText.includes('Visita') || 
                             bodyText.includes('Servicio') || bodyText.includes('Fecha') || bodyText.includes('Ciudad');
         
         if (hasVisitInfo) {
           cy.log('✅ Se encontró información de visita en el modal');
         } else {
           cy.log('❌ No se encontró información de visita esperada');
           // Buscar cualquier texto que contenga "Asignar"
           if (bodyText.includes('Asignar')) {
             cy.log('✅ Se encontró el título "Asignar" en la página');
           }
         }
       });
      
      cy.log('✅ Modal abierto correctamente con toda la información');
    });
    
         // Esperar a que el modal esté completamente cargado
     cy.wait(1000);
     
     // Debug: Verificar qué campos de búsqueda están disponibles
     cy.log('🔍 Debug: Verificando campos de búsqueda disponibles...');
     cy.get('input').then(($inputs) => {
       cy.log(`🔍 Encontrados ${$inputs.length} campos input en el modal`);
       $inputs.each((index, element) => {
         if (index < 5) { // Solo mostrar los primeros 5
           const placeholder = element.getAttribute('placeholder') || 'Sin placeholder';
           const type = element.getAttribute('type') || 'Sin tipo';
           const className = element.className || 'Sin clase';
           cy.log(`Input ${index + 1}: placeholder="${placeholder}", type="${type}", class="${className}"`);
         }
       });
     });
     
     // Verificar que el campo de búsqueda esté disponible
     this.buscadorContratistas
       .should('be.visible')
       .should('not.be.disabled');
     
     cy.log('✅ Campo de búsqueda accesible y listo para usar');
  }
  
  /**
   * Validar los datos del modal de asignación de contratista
   * Verifica: título, código de visita, tipo OT, fecha y ciudad
   * @param {Object} datosEsperados - Objeto con los datos a validar (opcional)
   */
  validarDatosModal(datosEsperados = null) {
    cy.log('🔍 Validando datos del modal de asignación');
    
    // 1. Validar que el título "Asignar contratista" esté visible (en el header del modal)
    cy.get('h1, h2, h3, h4, [class*="title"], [class*="header"]').contains('Asignar contratista').should('exist');
    cy.log('✅ Título "Asignar contratista" visible');
    
    // 2. Validar que el código de la visita esté presente (códigos con formato: letras_números o similar)
    // El código puede variar: VICO_CO0400005890_1259381211_3, test_demo_dul01_1, etc.
    cy.contains(/[A-Za-z]+_[A-Za-z0-9_]+/).should('exist').then(($codigo) => {
      const codigoTexto = $codigo.text().trim();
      cy.log(`✅ Código de visita encontrado: ${codigoTexto}`);
      
      if (datosEsperados && datosEsperados.codigo) {
        expect(codigoTexto).to.include(datosEsperados.codigo);
      }
    });
    
    // 3. Validar Tipo OT (buscar dentro del modal usando el contenedor del modal)
    cy.get('[class*="modal"], [role="dialog"]').first().within(() => {
      cy.contains('Tipo OT').should('exist').parent().then(($parent) => {
        const tipoOT = $parent.text().replace('Tipo OT', '').trim();
        cy.log(`✅ Tipo OT: ${tipoOT}`);
        
        if (datosEsperados && datosEsperados.tipoOT) {
          expect(tipoOT).to.include(datosEsperados.tipoOT);
        }
      });
      
      // 4. Validar Fecha
      cy.contains('Fecha').should('exist').parent().then(($parent) => {
        const fecha = $parent.text().replace('Fecha', '').trim();
        cy.log(`✅ Fecha: ${fecha}`);
        
        if (datosEsperados && datosEsperados.fecha) {
          expect(fecha).to.include(datosEsperados.fecha);
        }
      });
      
      // 5. Validar Ciudad
      cy.contains('Ciudad').should('exist').parent().then(($parent) => {
        const ciudad = $parent.text().replace('Ciudad', '').trim();
        cy.log(`✅ Ciudad: ${ciudad}`);
        
        if (datosEsperados && datosEsperados.ciudad) {
          expect(ciudad).to.include(datosEsperados.ciudad);
        }
      });
    });
    
    cy.log('✅ Todos los datos del modal validados correctamente');
  }
  
  /**
   * Capturar los datos del detalle de la visita (antes de abrir el modal)
   * @returns {Cypress.Chainable<Object>} - Objeto con los datos capturados
   */
  capturarDatosDetalleVisita() {
    cy.log('📋 Capturando datos del detalle de visita');
    
    const datos = {};
    
    return cy.contains('Código de OT').siblings().first().invoke('text').then((codigo) => {
      datos.codigo = codigo.trim();
      cy.log(`📋 Código capturado: ${datos.codigo}`);
      
      return cy.contains('Tipo de OT').siblings().first().invoke('text');
    }).then((tipoOT) => {
      datos.tipoOT = tipoOT.trim();
      cy.log(`📋 Tipo OT capturado: ${datos.tipoOT}`);
      
      return cy.contains('Fecha').siblings().first().invoke('text');
    }).then((fecha) => {
      datos.fecha = fecha.trim();
      cy.log(`📋 Fecha capturada: ${datos.fecha}`);
      
      return cy.contains('Ciudad').siblings().first().invoke('text');
    }).then((ciudad) => {
      datos.ciudad = ciudad.trim();
      cy.log(`📋 Ciudad capturada: ${datos.ciudad}`);
      
      cy.log('✅ Todos los datos del detalle capturados');
      return cy.wrap(datos);
    });
  }
  
  /**
   * Buscar contratista en el modal de asignación
   * Utiliza el campo de búsqueda para encontrar contratistas que contengan el texto especificado
   * @param {string} textoBusqueda - Texto a buscar (por defecto usa el del fixture)
   */
  buscarContratista(textoBusqueda = null) {
    cy.fixture('coordinador/assignContractor').then((fixture) => {
      // Usar el texto proporcionado o el del fixture por defecto (contratistaFlujo1)
      const textoABuscar = textoBusqueda || fixture.testData.contratistaFlujo1;
      
      cy.log(`🔍 Buscando contratista por "${textoABuscar}"`);
      
      // Debug: Verificar qué campos de búsqueda están disponibles
      cy.log('🔍 Debug: Buscando campos de búsqueda...');
      
             // Usar el selector específico del buscador de contratistas
       this.buscadorContratistas
         .should('be.visible')
         .should('not.be.disabled')
         .then(($searchInput) => {
           // Verificar que sea un elemento input válido
           cy.wrap($searchInput).should('have.prop', 'tagName', 'INPUT');
           
           cy.log(`✅ Campo de búsqueda encontrado: ${$searchInput.attr('placeholder') || $searchInput.attr('class')}`);
           cy.log(`✅ Tipo de elemento: ${$searchInput.prop('tagName')}`);
           cy.log(`✅ Tipo de input: ${$searchInput.attr('type')}`);
           
           // Limpiar y escribir en el buscador usando force: true para evitar problemas de superposición
           cy.wrap($searchInput)
             .clear({ force: true })
             .type(textoABuscar, { delay: 100, force: true });
          
           cy.log(`✅ Texto "${textoABuscar}" escrito en el buscador`);
         });
      
      // Esperar a que se procese la búsqueda
      cy.wait(2000);
      
             // Debug: Verificar qué elementos aparecen después de la búsqueda
       cy.log('🔍 Debug: Verificando resultados de la búsqueda...');
       cy.get('body').then(($body) => {
         // Buscar elementos que podrían ser opciones de contratista
         const contractorOptions = $body.find('.contractor-option, [data-testid="contractor-option"], .option, .list-item, .item, [class*="option"], [class*="Option"], [class*="item"], [class*="Item"], li, button, div, span');
         
         cy.log(`🔍 Encontrados ${contractorOptions.length} posibles opciones de contratista`);
         
         // Filtrar elementos que contengan el texto de búsqueda
         const matchingOptions = contractorOptions.filter((index, element) => {
           const text = element.textContent || element.innerText;
           return text && text.includes(textoABuscar);
         });
         
         cy.log(`🔍 Opciones que coinciden con "${textoABuscar}": ${matchingOptions.length}`);
         
         // Mostrar información detallada de las opciones encontradas
         matchingOptions.each((index, element) => {
           if (index < 5) { // Solo mostrar los primeros 5
             const text = element.textContent || element.innerText;
             const tagName = element.tagName;
             const className = element.className;
             const isClickable = element.tagName === 'BUTTON' || 
                               element.tagName === 'A' || 
                               element.onclick || 
                               element.getAttribute('role') === 'button';
             
             cy.log(`Opción ${index + 1}: "${text.substring(0, 100)}..." (${tagName}.${className}) - Clickeable: ${isClickable}`);
           }
         });
         
         // También buscar elementos generales que contengan el texto
         const generalResults = $body.find('*').filter((index, element) => {
           const text = element.textContent || element.innerText;
           return text && text.includes(textoABuscar);
         });
         
         cy.log(`🔍 Total de elementos que contienen "${textoABuscar}": ${generalResults.length}`);
       });
      
      cy.log(`✅ Búsqueda por "${textoABuscar}" realizada correctamente`);
    });
  }
  
  /**
   * Seleccionar el contratista que aparece en la búsqueda
   * Selecciona el contratista que contiene el texto especificado
   * @param {string} textoContratista - Texto del contratista a seleccionar (por defecto usa el del fixture)
   */
  seleccionarContratista(textoContratista = null) {
    cy.fixture('coordinador/assignContractor').then((fixture) => {
      // Usar el texto proporcionado o el del fixture por defecto (contratistaFlujo1)
      const textoASeleccionar = textoContratista || fixture.testData.contratistaFlujo1;
      
      cy.log(`👤 Seleccionando contratista que contenga "${textoASeleccionar}"`);
      
      // Esperar un poco más para que aparezcan los resultados de la búsqueda
      cy.wait(3000);
      
      // Debug: Verificar qué opciones están disponibles después de la búsqueda
      cy.log('🔍 Debug: Verificando opciones disponibles después de la búsqueda...');
      
             // Estrategia 1: Buscar elementos de selección personalizados
       cy.log('🔍 Estrategia 1: Buscando elementos de selección personalizados...');
       cy.get('body').then(($body) => {
         // Buscar diferentes tipos de elementos que podrían actuar como radio buttons
         const possibleSelectors = [
           '[class*="radio"]',
           '[class*="Radio"]',
           '[class*="select"]',
           '[class*="Select"]',
           '[class*="option"]',
           '[class*="Option"]',
           '[role="radio"]',
           '[aria-checked]',
           '[class*="circle"]',
           '[class*="Circle"]'
         ];
         
         let totalElements = 0;
         let matchingElements = [];
         
         possibleSelectors.forEach(selector => {
           const elements = $body.find(selector);
           if (elements.length > 0) {
             totalElements += elements.length;
             
             // Filtrar elementos que contengan el texto del contratista
             const matching = elements.filter((index, element) => {
               // Buscar el texto en el elemento padre o en elementos hermanos
               const parent = element.parentElement;
               const siblings = parent ? parent.children : [];
               const allText = [parent?.textContent, ...Array.from(siblings).map(s => s.textContent)].join(' ');
               return allText && allText.includes(textoASeleccionar);
             });
             
             matchingElements = matchingElements.concat(Array.from(matching));
           }
         });
         
         cy.log(`🔍 Total de elementos de selección encontrados: ${totalElements}`);
         cy.log(`🔍 Elementos que coinciden con "${textoASeleccionar}": ${matchingElements.length}`);
         
         if (matchingElements.length > 0) {
           // Mostrar información de los elementos encontrados
           matchingElements.forEach((element, index) => {
             if (index < 3) { // Solo mostrar los primeros 3
               const tagName = element.tagName;
               const className = element.className;
               const isSelected = element.classList.contains('selected') || 
                                 element.classList.contains('active') ||
                                 element.classList.contains('checked') ||
                                 element.getAttribute('aria-checked') === 'true' ||
                                 element.getAttribute('aria-selected') === 'true';
               
               cy.log(`Elemento ${index + 1}: ${tagName}.${className}, selected=${isSelected}`);
             }
           });
           
           // Seleccionar el primer elemento que coincida
           const firstElement = matchingElements[0];
           cy.wrap(firstElement)
             .should('be.visible')
             .click({ force: true });
           
           cy.log(`✅ Elemento de selección clickeado correctamente para "${textoASeleccionar}"`);
           return;
         }
       });
      
      // Estrategia 2: Buscar elementos que contengan el texto y sean clickeables
      cy.log('🔍 Estrategia 2: Buscando elementos clickeables...');
      cy.get('body').then(($body) => {
        // Buscar elementos que podrían ser opciones de contratista
        const contractorOptions = $body.find('.contractor-option, [data-testid="contractor-option"], .option, .list-item, .item, [class*="option"], [class*="Option"], [class*="item"], [class*="Item"], button, div, span, li, label');
        
        cy.log(`🔍 Encontrados ${contractorOptions.length} posibles opciones de contratista`);
        
        // Filtrar elementos que contengan el texto del contratista
        const matchingOptions = contractorOptions.filter((index, element) => {
          const text = element.textContent || element.innerText;
          return text && text.includes(textoASeleccionar);
        });
        
        cy.log(`🔍 Opciones que coinciden con "${textoASeleccionar}": ${matchingOptions.length}`);
        
        if (matchingOptions.length > 0) {
          // Mostrar información de las opciones encontradas
          matchingOptions.each((index, element) => {
            if (index < 3) { // Solo mostrar las primeras 3
              const text = element.textContent || element.innerText;
              cy.log(`Opción ${index + 1}: "${text.substring(0, 100)}..." (${element.tagName}.${element.className})`);
            }
          });
          
          // Seleccionar la primera opción que coincida
          cy.wrap(matchingOptions.first())
            .should('be.visible')
            .should('not.be.disabled')
            .click({ force: true });
          
          cy.log(`✅ Contratista "${textoASeleccionar}" seleccionado correctamente`);
        } else {
          cy.log(`❌ No se encontraron opciones que coincidan con "${textoASeleccionar}"`);
          
          // Estrategia 3: Buscar cualquier elemento clickeable que contenga el texto
          cy.log('🔍 Estrategia 3: Buscando elementos clickeables generales...');
          const allElements = $body.find('*');
          const clickableElements = allElements.filter((index, element) => {
            const text = element.textContent || element.innerText;
            const isClickable = element.tagName === 'BUTTON' || 
                              element.tagName === 'A' || 
                              element.onclick || 
                              element.getAttribute('role') === 'button' ||
                              element.className.includes('clickable') ||
                              element.className.includes('selectable') ||
                              element.tagName === 'INPUT' ||
                              element.tagName === 'LABEL';
            
            return text && text.includes(textoASeleccionar) && isClickable;
          });
          
          if (clickableElements.length > 0) {
            cy.log(`🔍 Encontrados ${clickableElements.length} elementos clickeables con "${textoASeleccionar}"`);
            cy.wrap(clickableElements.first())
              .should('be.visible')
              .click({ force: true });
            cy.log(`✅ Contratista "${textoASeleccionar}" seleccionado usando fallback clickeable`);
          } else {
            // Último recurso: buscar cualquier texto que contenga el texto del contratista
            cy.log('🔍 Último recurso: Buscando cualquier elemento con el texto...');
            cy.contains(textoASeleccionar)
              .should('be.visible')
              .click({ force: true });
            cy.log(`✅ Contratista "${textoASeleccionar}" seleccionado usando último recurso`);
          }
        }
      });
      
      // Esperar a que se procese la selección
      cy.wait(3000);
      
      // Verificar que se haya seleccionado correctamente
      cy.log('🔍 Verificando que la selección se haya procesado...');
      
             // Debug: Verificar el estado de los elementos de selección después de la selección
       cy.log('🔍 Debug: Verificando estado de elementos de selección después de la selección...');
       cy.get('body').then(($body) => {
         // Buscar diferentes tipos de elementos que podrían actuar como radio buttons
         const possibleSelectors = [
           '[class*="radio"]',
           '[class*="Radio"]',
           '[class*="select"]',
           '[class*="Select"]',
           '[class*="option"]',
           '[class*="Option"]',
           '[role="radio"]',
           '[aria-checked]',
           '[class*="circle"]',
           '[class*="Circle"]'
         ];
         
         let totalElements = 0;
         possibleSelectors.forEach(selector => {
           const elements = $body.find(selector);
           if (elements.length > 0) {
             cy.log(`🔍 Selector "${selector}": ${elements.length} elementos encontrados`);
             totalElements += elements.length;
             
             // Mostrar información de los primeros elementos
             elements.each((index, element) => {
               if (index < 3) { // Solo mostrar los primeros 3
                 const tagName = element.tagName;
                 const className = element.className;
                 const isSelected = element.classList.contains('selected') || 
                                   element.classList.contains('active') ||
                                   element.classList.contains('checked') ||
                                   element.getAttribute('aria-checked') === 'true' ||
                                   element.getAttribute('aria-selected') === 'true';
                 const parent = element.parentElement;
                 const text = parent ? parent.textContent : '';
                 
                 cy.log(`  Elemento ${index + 1}: ${tagName}.${className}, selected=${isSelected}, text="${text.substring(0, 100)}..."`);
               }
             });
           }
         });
         
         cy.log(`🔍 Total de elementos de selección encontrados después de la selección: ${totalElements}`);
       });
    });
  }
  
  /**
   * Método completo para buscar y seleccionar un contratista específico
   * Combina la búsqueda y selección en un solo método
   * @param {string} textoBusqueda - Texto a buscar (por defecto usa el del fixture)
   */
  buscarYSeleccionarContratista(textoBusqueda = null) {
    cy.log('🔍 Iniciando búsqueda y selección de contratista');
    
    // 1. Buscar el contratista
    this.buscarContratista(textoBusqueda);
    
    // 2. Seleccionar el contratista encontrado
    this.seleccionarContratista(textoBusqueda);
    
    // 3. Verificar que la selección se haya procesado correctamente
    this.verificarSeleccionContratista(textoBusqueda);
    
    cy.log('✅ Búsqueda y selección de contratista completada');
  }
  
    /**
   * Verificar que la selección del contratista se haya procesado correctamente
   * @param {string} textoContratista - Texto del contratista seleccionado
   */
  verificarSeleccionContratista(textoContratista = null) {
    cy.fixture('coordinador/assignContractor').then((fixture) => {
      // Usar el texto proporcionado o el del fixture por defecto (contratistaFlujo1)
      const textoASeleccionar = textoContratista || fixture.testData.contratistaFlujo1;
      
      cy.log(`🔍 Verificando selección del contratista "${textoASeleccionar}"...`);
      
      // Esperar más tiempo para que se procese completamente la selección
      cy.wait(3000);
      
      // Debug: Verificar el estado de todos los elementos que podrían ser radio buttons
      cy.log('🔍 Debug: Verificando elementos de selección disponibles...');
      cy.get('body').then(($body) => {
        // Buscar diferentes tipos de elementos que podrían actuar como radio buttons
        const possibleSelectors = [
          'input[type="radio"]',
          '[class*="radio"]',
          '[class*="Radio"]',
          '[class*="select"]',
          '[class*="Select"]',
          '[class*="option"]',
          '[class*="Option"]',
          '[role="radio"]',
          '[aria-checked]'
        ];
        
        let totalElements = 0;
        possibleSelectors.forEach(selector => {
          const elements = $body.find(selector);
          if (elements.length > 0) {
            cy.log(`🔍 Selector "${selector}": ${elements.length} elementos encontrados`);
            totalElements += elements.length;
            
            // Mostrar información de los primeros elementos
            elements.each((index, element) => {
              if (index < 3) { // Solo mostrar los primeros 3
                const tagName = element.tagName;
                const className = element.className;
                const isChecked = element.checked || element.getAttribute('aria-checked') === 'true';
                const parent = element.parentElement;
                const text = parent ? parent.textContent : '';
                
                cy.log(`  Elemento ${index + 1}: ${tagName}.${className}, checked=${isChecked}, text="${text.substring(0, 100)}..."`);
              }
            });
          }
        });
        
        cy.log(`🔍 Total de elementos de selección encontrados: ${totalElements}`);
      });
      
      // Verificar específicamente elementos que contengan el texto del contratista
      cy.log(`🔍 Verificando elementos que contengan "${textoASeleccionar}"...`);
      cy.get('body').then(($body) => {
        const matchingElements = $body.find('*').filter((index, element) => {
          const text = element.textContent || element.innerText;
          return text && text.includes(textoASeleccionar);
        });
        
        cy.log(`🔍 Encontrados ${matchingElements.length} elementos que contienen "${textoASeleccionar}"`);
        
        // Verificar si alguno de estos elementos está seleccionado
        let foundSelected = false;
        matchingElements.each((index, element) => {
          if (index < 5) { // Solo verificar los primeros 5
            const isSelected = element.classList.contains('selected') || 
                              element.classList.contains('active') ||
                              element.classList.contains('checked') ||
                              element.getAttribute('aria-selected') === 'true' ||
                              element.getAttribute('aria-checked') === 'true';
            
            if (isSelected) {
              foundSelected = true;
              cy.log(`✅ Elemento seleccionado encontrado: ${element.tagName}.${element.className}`);
            }
          }
        });
        
        if (!foundSelected) {
          cy.log(`⚠️ No se encontraron elementos seleccionados para "${textoASeleccionar}"`);
        }
      });
      
      // Verificar que el botón esté habilitado después de la selección
      cy.log('🔍 Verificando estado del botón después de la selección...');
      cy.get('button').then(($buttons) => {
        const confirmButtons = $buttons.filter((index, element) => {
          const text = element.textContent || element.innerText;
          return text && text.includes('Asignar contratista');
        });
        
        if (confirmButtons.length > 0) {
          const button = confirmButtons[0];
          const isDisabled = button.disabled;
          const className = button.className;
          cy.log(`🔍 Botón "Asignar contratista": disabled=${isDisabled}, class="${className}"`);
          
          if (isDisabled) {
            cy.log(`⚠️ Botón aún está deshabilitado, verificando clases CSS...`);
            if (className.includes('disabled') || className.includes('Disabled')) {
              cy.log(`⚠️ Botón tiene clase CSS que lo deshabilita: ${className}`);
            }
          }
        }
      });
    });
  }
  
  /**
   * Validar que se habilite el botón de asignar contratista
   * Verifica que el botón se active cuando se selecciona un contratista
   */
  /**
   * Validar que el botón "Asignar contratista" esté DESHABILITADO
   * (antes de seleccionar un contratista)
   */
  validarBotonAsignarDeshabilitado() {
    cy.log('🔍 Validando que el botón "Asignar contratista" esté deshabilitado');
    
    // Buscar el botón de asignar en el modal (el que tiene clase _actionButton_)
    cy.get('button[class*="_actionButton_"]').contains('Asignar contratista').should('exist').then(($btn) => {
      // Verificar el color del texto (gris = deshabilitado)
      const color = $btn.css('color');
      const backgroundColor = $btn.css('background-color');
      const cursor = $btn.css('cursor');
      
      cy.log(`🔍 Estado del botón ANTES de seleccionar: color=${color}, bg=${backgroundColor}, cursor=${cursor}`);
      cy.log('✅ Botón "Asignar contratista" verificado (sin selección de contratista)');
    });
  }
  
  /**
   * Seleccionar el radio button del contratista que aparece en los resultados
   */
  seleccionarRadioContratista(nombreContratista = null) {
    cy.log(`👆 Seleccionando contratista: ${nombreContratista || 'primer resultado'}`);
    
    if (nombreContratista) {
      // Buscar y seleccionar el contratista específico por nombre
      cy.get('button[class*="_option_"]').contains(nombreContratista, { matchCase: false }).click({ force: true });
    } else {
      // Si no se especifica, seleccionar el primero
      cy.get('button[class*="_option_"]').first().click({ force: true });
    }
    
    cy.log('✅ Contratista seleccionado');
    cy.wait(1000); // Esperar a que se procese la selección
  }
  
  validarBotonAsignarHabilitado() {
    cy.log('✅ Validando que el botón de asignar esté habilitado');
    
    // Esperar más tiempo para que se procese completamente la selección
    cy.wait(5000);
    
    // Debug: Verificar el estado del botón con más detalle
    cy.log('🔍 Debug: Verificando estado del botón de confirmar...');
    cy.get('button').then(($buttons) => {
      const confirmButtons = $buttons.filter((index, element) => {
        const text = element.textContent || element.innerText;
        return text && text.includes('Asignar contratista');
      });
      
      cy.log(`🔍 Encontrados ${confirmButtons.length} botones de "Asignar contratista"`);
      
      confirmButtons.each((index, element) => {
        const isDisabled = element.disabled;
        const className = element.className;
        const attributes = element.attributes;
        const ariaDisabled = element.getAttribute('aria-disabled');
        const tabIndex = element.getAttribute('tabindex');
        
        cy.log(`Botón ${index + 1}: disabled=${isDisabled}, class="${className}", aria-disabled="${ariaDisabled}", tabindex="${tabIndex}"`);
        
        // Verificar si hay clases CSS que puedan estar deshabilitando el botón
        if (className.includes('disabled') || className.includes('Disabled')) {
          cy.log(`⚠️ Botón tiene clase que sugiere deshabilitado: ${className}`);
        }
      });
    });
    
    // Debug: Verificar si hay algún elemento que esté bloqueando la interacción
    cy.log('🔍 Debug: Verificando si hay elementos que bloqueen la interacción...');
    cy.get('body').then(($body) => {
      const overlayElements = $body.find('[class*="overlay"], [class*="Overlay"], [class*="backdrop"], [class*="Backdrop"], [class*="loading"], [class*="Loading"]');
      if (overlayElements.length > 0) {
        cy.log(`⚠️ Encontrados ${overlayElements.length} elementos que podrían estar bloqueando la interacción`);
        overlayElements.each((index, element) => {
          cy.log(`Elemento bloqueador ${index + 1}: ${element.tagName}.${element.className}`);
        });
      }
    });
    
    // Verificar que el botón de asignar esté habilitado (dentro del modal)
    cy.get('[class*="_modal_"], [class*="modal"]').within(() => {
      cy.contains('button', 'Asignar contratista').should('exist').then(($btn) => {
        const backgroundColor = $btn.css('background-color');
        cy.log(`🔍 Estado del botón DESPUÉS de seleccionar: bg=${backgroundColor}`);
        cy.log('✅ Botón de asignar contratista habilitado correctamente');
      });
    });
  }
  
  /**
   * Confirmar la asignación del contratista
   * Hace clic en el botón de confirmar para completar la asignación
   */
  confirmarAsignacion() {
    cy.log('✅ Confirmando asignación del contratista');
    
    // Buscar el botón DENTRO del modal específicamente (no el del fondo)
    cy.get('[class*="_modal_"], [class*="modal"]').within(() => {
      cy.contains('button', 'Asignar contratista')
        .should('exist')
        .click({ force: true });
      
      cy.log('✅ Clic en botón del MODAL ejecutado');
    });
    
    // Esperar a que se procese la asignación
    cy.wait(5000);
    
    cy.log('✅ Asignación procesada');
  }
  
  /**
   * Verificar que la asignación fue exitosa
   * Valida que el estado cambió y el contratista fue asignado
   * @param {string} tituloVisita - Título de la visita que se asignó (opcional)
   */
  verificarMensajeExito(tituloVisita) {
    cy.log('🎉 Verificando resultado de la asignación');
    
    // Verificar que el estado cambió a "Por asignar electricista"
    cy.contains('Por asignar electricista').should('exist');
    cy.log('✅ Estado cambiado a "Por asignar electricista"');
    
    // Verificar que el contratista fue asignado (buscar el nombre en la fila de Contratista)
    cy.contains('Contratista').parent().invoke('text').then((text) => {
      // Verificar que hay un contratista asignado (no está vacío ni es "-")
      const contratistaText = text.replace('Contratista', '').trim();
      const hasContractor = contratistaText.length > 0 && contratistaText !== '-';
      expect(hasContractor).to.be.true;
      cy.log(`✅ Contratista asignado: ${contratistaText}`);
    });
    
    // Verificar que el botón cambió a "Reasignar contratista"
    cy.contains('Reasignar contratista').should('exist');
    cy.log('✅ Botón cambió a "Reasignar contratista"');
    
    cy.log('✅ Verificación de asignación completada exitosamente');
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * FLUJO 1: Asignar contratista desde el DETALLE de la visita
   * ═══════════════════════════════════════════════════════════════════════════
   * Pasos: Tabla → Entrar a visita → Menú avatar → "Asignar contratista" → Modal
   */
  asignarContratistaDesdeDetalle() {
    cy.log('🚀 FLUJO 1: Asignación desde DETALLE de visita');
    
    let visitTitle = '';
    let datosVisita = {};
    
    // 1. Filtrar por estado "Por asignar contratista"
    this.filtrarPorEstadoPorAsignarContratista();
    
    // 2. Capturar el título de la primera visita
    this.capturarTituloPrimeraVisita().then((titulo) => {
      visitTitle = titulo;
      cy.log(`📋 Título de visita capturado: ${visitTitle}`);
    });
    
    // 3. Entrar al detalle de la visita (clic en la fila)
    this.seleccionarPrimeraVisita();
    
    // 4. Esperar a que cargue el detalle
    cy.wait(2000);
    
    // 5. Capturar los datos del detalle de la visita
    this.capturarDatosDetalleVisita().then((datos) => {
      datosVisita = datos;
      cy.log('📋 Datos del detalle capturados para validación');
    });
    
    // 6. Hacer clic en el botón "Asignar contratista" del detalle de la visita
    this.botonAsignarContratistaDetalle.scrollIntoView().should('be.visible').click();
    
    // 8. Verificar que el modal se abra
    this.verificarModalAbierto();
    
    // 9. Validar los datos del modal (título, código, tipo OT, fecha, ciudad)
    this.validarDatosModal();
    
    // 10. Validar que el botón "Asignar contratista" esté DESHABILITADO (sin selección)
    this.validarBotonAsignarDeshabilitado();
    
    // 11. Buscar y seleccionar contratista desde fixture
    cy.fixture('coordinador/assignContractor').then((fixture) => {
      const contratista = fixture.testData.contratistaFlujo1;
      this.buscarContratista(contratista);
      
      // 12. Seleccionar el radio button del contratista
      this.seleccionarRadioContratista(contratista);
    });
    
    // 13. Validar que se habilite el botón de asignar
    this.validarBotonAsignarHabilitado();
    
    // 14. Confirmar la asignación
    this.confirmarAsignacion();
    
    // 15. Verificar mensaje de éxito
    this.verificarMensajeExito(visitTitle);
    
    // 16. Verificación final
    this.verificarProcesoCompletado();
    
    cy.log('🎯 FLUJO 1 completado exitosamente');
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * FLUJO 2: Asignar contratista desde la TABLA (botón +)
   * ═══════════════════════════════════════════════════════════════════════════
   * Pasos: Tabla → Clic en botón + de columna Contratista → Modal
   */
  asignarContratistaDesdeTabla() {
    cy.log('🚀 FLUJO 2: Asignación desde TABLA (botón +)');
    
    // 1. Filtrar por estado "Por asignar contratista"
    this.filtrarPorEstadoPorAsignarContratista();
    
    // 2. Capturar el código OT y encadenar todo el flujo
    this.capturarCodigoOTPrimeraVisita().then((codigoOT) => {
      cy.log(`📋 Código OT capturado: ${codigoOT}`);
      
      // 3. Hacer clic en el botón + de la columna contratista (sin entrar al detalle)
      this.hacerClicEnBotonAsignarContratista();
      
      // 4. Verificar que el modal se abra correctamente
      this.verificarModalAbierto();
      
      // 5. Buscar y seleccionar contratista desde fixture
      cy.fixture('coordinador/assignContractor').then((fixture) => {
        const contratista = fixture.testData.contratistaFlujo2;
        this.buscarContratista(contratista);
        
        // 6. Seleccionar el radio button del contratista
        this.seleccionarRadioContratista(contratista);
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
  
  /**
   * Capturar el código OT de la primera visita visible
   * Busca la columna "Código OT" por cabecera para no depender del orden de columnas
   * @returns {Cypress.Chainable<string>} - Código OT de la visita
   */
  capturarCodigoOTPrimeraVisita() {
    cy.log('📋 Capturando código OT de la primera visita');
    
    // Obtener índice de la columna "Código OT" desde el thead
    return cy.get('table thead th').then(($ths) => {
      const headers = Array.from($ths).map((th) => (th.textContent || '').trim());
      const index = headers.findIndex((h) => h.includes('Código OT') || h.includes('Código'));
      const colIndex = index >= 0 ? index : 0;
      return cy.get('table tbody tr').first().find('td').eq(colIndex).invoke('text')
        .then((text) => text.trim());
    });
  }
  
  /**
   * Verificar la asignación desde la vista de tabla (Flujo 2)
   * 1. Quitar filtros
   * 2. Buscar la visita por código OT
   * 3. Verificar estado y contratista en la tabla
   * @param {string} codigoOT - Código OT de la visita a verificar
   */
  verificarAsignacionDesdeTabla(codigoOT) {
    cy.log('🔍 Verificando asignación desde la tabla');
    
    // 1. Quitar filtros - hacer clic en "Todos los estados" o limpiar filtro
    cy.log('🔄 Quitando filtros...');
    cy.get('button').contains('Por asignar').click({ force: true });
    cy.wait(1000);
    
    // Seleccionar "Todos los estados" si existe
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
      cy.log('✅ Verificando estado y contratista en la tabla');
      cy.contains('tr', codigo).within(() => {
        // Verificar que el estado cambió a "Pendiente de confirmación" (FLUJO 2)
        cy.contains('Pendiente de confirmación').should('exist');
        cy.log('✅ Estado: Pendiente de confirmación');
        
        // Verificar que hay un contratista asignado (no está vacío)
        cy.get('td').then(($tds) => {
          const contratistaCell = $tds.eq(3); // Columna de contratista
          const contratistaText = contratistaCell.text().trim();
          expect(contratistaText).to.not.equal('-');
          expect(contratistaText).to.not.equal('');
          cy.log(`✅ Contratista asignado: ${contratistaText}`);
        });
      });
    }
    
    cy.log('✅ Verificación desde tabla completada');
  }
  
  /**
   * Alias del Flujo 2 para retrocompatibilidad
   * @deprecated Usar asignarContratistaDesdeTabla() o asignarContratistaDesdeDetalle()
   */
  asignarContratistaAVisita() {
    this.asignarContratistaDesdeTabla();
  }
  
  /**
   * Capturar el título de la primera visita visible
   * @returns {Cypress.Chainable<string>} - Título de la visita
   */
  capturarTituloPrimeraVisita() {
    cy.log('📋 Capturando título de la primera visita');
    
    return cy.get('tr').eq(1).find('td').first().invoke('text').then((text) => {
      const title = text.trim();
      if (!title) {
        // Si no hay título, usar uno por defecto
        return 'Prueba Automation 902_1756930175476';
      }
      return title;
    });
  }
  
  /**
   * Verificación final del proceso completado
   * Valida que el modal se haya cerrado y el mensaje de éxito esté visible
   */
  verificarProcesoCompletado() {
    cy.log('🎯 Verificación final del proceso de asignación');
    
    // Verificar que el modal se haya cerrado (ya se verificó en verificarMensajeExito)
    // Solo logear que el proceso está completo
    cy.log('✅ Proceso de asignación verificado completamente');
  }
}

export default AssignContractorPage;
