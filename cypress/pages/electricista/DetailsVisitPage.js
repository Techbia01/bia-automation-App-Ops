class DetailsVisitPage {
  // 🧭 SELECTORES - Getters para elementos de la página
  
  // Página activa de Ionic (evita interactuar con páginas ocultas)
  get activePage() {
    return cy.get('ion-page').filter(':visible').first();
  }

  get buttonDetails() {
    return cy.get('svg[data-icon="chevron-right"]');
  }

  get titleDetails() {
    // Buscar el título "Registro de llegada" de manera más robusta
    return this.findVisibleTextSimple('Registro de llegada');
  }

  get descriptionDetails() {
    // Buscar la descripción "Información" de manera más robusta
    return this.findVisibleTextSimple('Información');
  }

  get statusDetailsVisit() {
    // Buscar el contenedor completo del estado de manera más simple y robusta
    return cy.get('body').contains(/Estado\s*:\s*\S+/);
  }

  // Método alternativo para buscar el estado si el getter principal falla
  findStatusElementAlternative() {
    cy.log('🔍 Buscando elemento del estado con método alternativo...');
    
    // Buscar por múltiples patrones
    return cy.get('body').then(($body) => {
      // Estrategia 1: Buscar por texto que contenga "Estado:" seguido de algo
      let $statusEl = $body.find('*').filter(function() {
        const $el = Cypress.$(this);
        const text = $el.text();
        return /Estado\s*:\s*\S+/.test(text);
      }).filter(function() {
        const $el = Cypress.$(this);
        return $el.is(':visible') && 
               !$el.closest('.ion-page-hidden').length && 
               !$el.closest('[style*="display: none"]').length;
      });

      if ($statusEl.length > 0) {
        cy.log('✅ Estado encontrado con método alternativo');
        return cy.wrap($statusEl.first());
      }

      // Estrategia 2: Buscar por elementos que contengan "Estado" y sean visibles
      $statusEl = $body.find('*').filter(function() {
        const $el = Cypress.$(this);
        const text = $el.text();
        return text.includes('Estado') && text.length > 6; // Más que solo "Estado"
      }).filter(function() {
        const $el = Cypress.$(this);
        return $el.is(':visible') && 
               !$el.closest('.ion-page-hidden').length && 
               !$el.closest('[style*="display: none"]').length;
      });

      if ($statusEl.length > 0) {
        cy.log('✅ Estado encontrado con método alternativo (estrategia 2)');
        return cy.wrap($statusEl.first());
      }

      // Si no se encuentra, fallar
      throw new Error('No se pudo encontrar el elemento del estado de la visita con método alternativo');
    });
  }

  get visitCode() {
    // Buscar el código de visita de manera más robusta
    // El patrón ahora incluye el timestamp: "Prueba Automation XXX_XXXXXXXXXX"
    return this.findVisibleTextRegexSimple(/^Prueba Automation \d+_\d+$/);
  }

  get typeVisit() {
    // Buscar el tipo de visita de manera más robusta
    // Buscar por cualquier texto que contenga "instalación" (case insensitive)
    return this.findVisibleTextRegexSimple(/instalación/i);
  }

  get titleCustomerInfo() {
    // Buscar el título "Información del cliente" de manera más robusta
    return this.findVisibleTextSimple('Información del cliente');
  }

  get addressCustomerInfo() {
    // Buscar la dirección del cliente de manera más robusta
    return this.findVisibleTextSimple('CALLE 93A es-01');
  }

  get customerInfo() {
    // Buscar la información del cliente de manera más robusta
    // Buscar por el patrón del título de la visita
    return this.findVisibleTextRegexSimple(/^Prueba Automation \d+_\d+$/);
  }

  get cityInfo() {
    // Buscar la información de la ciudad de manera más robusta
    return this.findVisibleTextSimple('BOGOTÁ, D.C.');
  }

  get slideContainer() {
    //return cy.get('div._rightComponent_7hltg_13 ion-text.md').contains('Iniciar traslado');
    return cy.get('#slide-toggle-assigned');
  }

  get iconSlider() {
    return cy.get('div._draggable_7hltg_37');
  }

  get buttonContinueVisit() {
    return cy.contains('ion-button', 'Continuar acta');
  }

  // 🧭 MÉTODOS - Acciones que se pueden realizar en la página

  // Método más agresivo para evitar elementos ocultos
  findVisibleElement(selector, options = {}) {
    return cy.get(selector, { timeout: 25000, ...options })
      .not('.ion-page-hidden') // Excluir elementos con clase hidden
      .not('[style*="display: none"]') // Excluir elementos con display none
      .filter(':visible'); // Filtrar solo elementos visibles
      //.should('be.visible');
  }

  // Método completamente nuevo: buscar solo en contenedores visibles
  findVisibleTextInActivePage(text, options = {}) {
    // Buscar directamente en el body pero filtrando por visibilidad
    return cy.get('body')
      .then(($body) => {
        // Buscar elementos que contengan el texto y estén visibles
        const $elements = $body.find(`:contains("${text}")`).filter(':visible');
        
        // Filtrar solo los que no estén dentro de contenedores ocultos
        const $visibleElements = $elements.filter(function() {
          const $el = Cypress.$(this);
          return !$el.closest('.ion-page-hidden').length && 
                 !$el.closest('[style*="display: none"]').length;
        });
        
        if ($visibleElements.length === 0) {
          throw new Error(`No se encontraron elementos visibles con el texto: ${text}`);
        }
        
        // Retornar el primer elemento visible encontrado
        return cy.wrap($visibleElements.first());
      })
      .should('be.visible');
  }

  // Método para buscar texto con regex solo en elementos visibles
  findVisibleTextRegexInActivePage(regex, options = {}) {
    // Buscar directamente en el body pero filtrando por visibilidad
    return cy.get('body')
      .then(($body) => {
        // Buscar elementos que contengan el texto del regex y estén visibles
        const $elements = $body.find('*').filter(function() {
          const $el = Cypress.$(this);
          const text = $el.text();
          return regex.test(text) && 
                 $el.is(':visible') && 
                 !$el.closest('.ion-page-hidden').length && 
                 !$el.closest('[style*="display: none"]').length;
        });
        
        if ($elements.length === 0) {
          throw new Error(`No se encontraron elementos visibles con el regex: ${regex}`);
        }
        
        // Retornar el primer elemento visible encontrado
        return cy.wrap($elements.first());
      })
      .should('be.visible');
  }

  // Método alternativo usando contains con filtros más estrictos
  findVisibleTextStrict(text, options = {}) {
    return cy.contains(text, { timeout: 25000, ...options })
      .should('be.visible')
      .should('not.have.class', 'ion-page-hidden')
      .should('not.have.css', 'display', 'none')
      .then(($el) => {
        // Verificar que el elemento padre no tenga ion-page-hidden
        const $parent = $el.closest('.ion-page-hidden');
        if ($parent.length > 0) {
          throw new Error(`Elemento encontrado pero está dentro de un contenedor oculto`);
        }
        return $el;
      });
  }

  // Método legacy para compatibilidad
  containsInActive(content, options = {}) {
    // Usar el método más estricto
    return this.findVisibleTextStrict(content, options);
  }

  findInActive(selector, options = {}) {
    // Usar el método más estricto
    return this.findVisibleElement(selector, options);
  }

  // Método simple y directo para buscar elementos visibles
  findVisibleTextSimple(text, options = {}) {
    return cy.contains(text, { timeout: 25000, ...options })
      .should('be.visible')
      .then(($el) => {
        // Verificar que el elemento no esté dentro de un contenedor oculto
        const $hiddenParent = $el.closest('.ion-page-hidden, [style*="display: none"]');
        if ($hiddenParent.length > 0) {
          cy.log(`⚠️ Elemento encontrado pero dentro de contenedor oculto: ${$hiddenParent.attr('class')}`);
          // Intentar encontrar otro elemento con el mismo texto
          return this.findVisibleTextSimple(text, options);
        }
        return $el;
      });
  }

  // Método simple para regex
  findVisibleTextRegexSimple(regex, options = {}) {
    return cy.get('body')
      .then(($body) => {
        // Buscar todos los elementos que contengan texto
        const $elements = $body.find('*').filter(function() {
          const $el = Cypress.$(this);
          const text = $el.text();
          return regex.test(text);
        });
        
        // Filtrar solo los visibles y no ocultos
        const $visibleElements = $elements.filter(function() {
          const $el = Cypress.$(this);
          return $el.is(':visible') && 
                 !$el.closest('.ion-page-hidden').length && 
                 !$el.closest('[style*="display: none"]').length;
        });
        
        if ($visibleElements.length === 0) {
          throw new Error(`No se encontraron elementos visibles con el regex: ${regex}`);
        }
        
        return cy.wrap($visibleElements.first());
      })
      .should('be.visible');
  }

  // Método de debug para entender el estado actual de las páginas
  debugPageState() {
    cy.log('🔍 Debug: Estado actual de las páginas...');
    
    // Verificar todas las páginas de manera segura
    cy.get('body').then(($body) => {
      const $pages = $body.find('ion-page');
      cy.log(`📄 Total de páginas encontradas: ${$pages.length}`);
      
      if ($pages.length > 0) {
        $pages.each((index, page) => {
          const $page = Cypress.$(page);
          const classes = $page.attr('class') || '';
          const isVisible = $page.is(':visible');
          const hasHidden = classes.includes('ion-page-hidden');
          const display = $page.css('display');
          
          cy.log(`📄 Página ${index + 1}: classes="${classes}", visible=${isVisible}, hidden=${hasHidden}, display=${display}`);
        });
      } else {
        cy.log('📄 No se encontraron elementos ion-page');
      }
    });
    
    // Verificar elementos principales
    cy.get('#main-content').then(($main) => {
      if ($main.length > 0) {
        const classes = $main.attr('class') || '';
        const isVisible = $main.is(':visible');
        cy.log(`🏠 #main-content: classes="${classes}", visible=${isVisible}`);
      } else {
        cy.log('🏠 #main-content: No encontrado');
      }
    });
  }

  //Detalle de la visita
  goDetailsVisit() {
    // Debug: entender el estado actual de las páginas
    this.debugPageState();
    
    cy.log('🔍 Navegando a detalles de la visita...');
    
    // Hacer clic en el botón de detalles para navegar
    this.buttonDetails.click();
    
    // Esperar a que la navegación se complete
    cy.wait(4000);
    
    // Verificar que la URL cambió
    cy.url().should('include', '/visit/');
    
    // Verificar que los elementos clave estén visibles
    this.titleDetails.should('be.visible');
    this.descriptionDetails.should('be.visible');
    
    cy.log('✅ Navegación a detalles completada');
  }

  //Verificar el detalle de la visita
  verifyDetailsVisit(estadosPermitidos, tiposPermitidos){
    // La página ya debería estar cargada desde goDetailsVisit
    cy.log('🔍 Verificando elementos del detalle de la visita...');
    
    // Verificar elementos básicos de la página dentro de la página activa
    this.titleDetails.should('be.visible');
    this.descriptionDetails.should('be.visible');
    
    // Verificar el estado de la visita
    this.verificarEstadoVisita(estadosPermitidos);
    
    // Verificar el código de la visita
   // this.verificarCodigoVisita();
    
    // Verificar el tipo de visita
    this.validarTipoVisitaDinamico(tiposPermitidos);
    
    // Verificar información del cliente
    //this.titleCustomerInfo.should('be.visible');
    //this.addressCustomerInfo.should('be.visible');
    
    cy.log('✅ Verificación del detalle de visita completada');
  }

  // Método de debug para identificar el texto real en la página
  debugPageContent() {
    cy.log('🔍 Debug: Contenido de la página');
    
    // Buscar todos los textos que contengan "instalación" (case insensitive)
    cy.get('body').then(($body) => {
      const textContent = $body.text();
      cy.log(`📄 Contenido completo de la página: ${textContent}`);
      
      // Buscar elementos que puedan contener el tipo de visita
      cy.get('ion-text, div, span, p').each(($el, index) => {
        const text = $el.text().trim();
        if (text && (text.toLowerCase().includes('instalación') || text.toLowerCase().includes('visita'))) {
          cy.log(`🎯 Elemento ${index}: "${text}"`);
        }
      });
    });
  }

  // Método de debug específico para problemas de navegación
  debugNavigation() {
    cy.log('🧭 Debug: Estado de navegación');
    
    // Verificar la URL actual
    cy.url().then((url) => {
      cy.log(`🌐 URL actual: ${url}`);
    });
    
    // Verificar si hay elementos de la página de destino
    cy.get('body').then(($body) => {
      const hasRegistroLlegada = $body.text().includes('Registro de llegada');
      const hasInformacion = $body.text().includes('Información');
      
      cy.log(`📝 Contiene "Registro de llegada": ${hasRegistroLlegada}`);
      cy.log(`📝 Contiene "Información": ${hasInformacion}`);
    });
  }

  // Método definitivo para navegación basado en URL
  waitForUrlChange() {
    cy.log('🌐 Esperando cambio de URL...');
    
    // Obtener la URL actual antes de la navegación
    cy.url().then((currentUrl) => {
      cy.log(`📍 URL actual: ${currentUrl}`);
      
      // Esperar a que la URL cambie (navegación exitosa)
      cy.url().should('not.eq', currentUrl);
      
      // Verificar que la nueva URL contenga '/visit/'
      cy.url().should('include', '/visit/');
      
      cy.log('✅ URL cambiada exitosamente');
    });
  }

  // Método alternativo para forzar la navegación si la normal falla
  forceNavigation() {
    cy.log('🚀 Forzando navegación alternativa...');
    
    // Intentar hacer click en el botón nuevamente
    this.buttonDetails.click({ force: true });
    
    // Esperar más tiempo para la transición
    cy.wait(10000);
    
    // Verificar si ahora estamos en la página correcta
    cy.contains('Registro de llegada', { timeout: 15000 }).should('be.visible');
    
    // Verificar que la URL haya cambiado
    cy.url().should('include', '/visit/');
    
    cy.log('✅ Navegación forzada completada');
  }

  // Método para verificar que la página esté completamente cargada
  waitForPageLoad() {
    cy.log('⏳ Esperando a que la página se cargue completamente...');
    
    // Estrategia definitiva: no depender de clases CSS de Ionic
    // Esperar tiempo fijo para que la aplicación complete la navegación
    cy.wait(4000);
    
    // Verificar que estemos en la página correcta buscando elementos específicos
    cy.contains('Registro de llegada', { timeout: 30000 }).should('be.visible');
    
    // Verificar que otros elementos clave estén presentes
    cy.contains('Información', { timeout: 15000 }).should('be.visible');
    
    // Verificar que no haya indicadores de carga
    cy.get('body').should('not.contain', 'Loading...');
    
    // Verificar que la URL haya cambiado (navegación exitosa)
    cy.url().should('include', '/visit/');
    
    cy.log('✅ Página cargada completamente');
  }

  // Método para esperar a que Ionic complete la transición de página
  waitForIonicTransition() {
    cy.log('🔄 Esperando a que Ionic complete la transición de página...');
    
    // Estrategia definitiva: esperar tiempo fijo y verificar URL
    cy.wait(6000);
    
    // Verificar que la URL haya cambiado (navegación exitosa)
    cy.url().should('include', '/visit/');
    
    cy.log('✅ Transición de Ionic completada');
  }

  // Método de retry para casos donde la transición pueda fallar
  retryPageTransition(maxRetries = 3) {
    cy.log(`🔄 Intentando transición de página (máximo ${maxRetries} intentos)...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        cy.log(`📱 Intento ${attempt} de ${maxRetries}`);
        
        // Esperar a que Ionic complete la transición
        this.waitForIonicTransition();
        
        // Si llegamos aquí, la transición fue exitosa
        cy.log('✅ Transición exitosa en el primer intento');
        return;
      } catch (error) {
        cy.log(`⚠️ Intento ${attempt} falló: ${error.message}`);
        
        if (attempt < maxRetries) {
          cy.log(`🔄 Reintentando en 2 segundos...`);
          cy.wait(2000);
        } else {
          cy.log('❌ Todos los intentos fallaron, intentando navegación forzada...');
          // Como último recurso, intentar navegación forzada
          this.forceNavigation();
          return;
        }
      }
    }
  }

  verificarEstadoVisita(estadosPermitidos) {
    cy.wait(1000);
    
    // Buscar el estado de la visita de manera más específica
    cy.get('body')
      .then(($body) => {
        // Buscar elementos que contengan exactamente uno de los estados permitidos
        const $elements = $body.find('*').filter(function() {
          const $el = Cypress.$(this);
          const text = $el.text().trim();
          // Solo elementos con texto corto que coincidan exactamente con un estado permitido
          return estadosPermitidos.some(estadoPermitido => text === estadoPermitido);
        });
        
        // Filtrar solo los visibles y con texto específico (no elementos padre con mucho texto)
        const $visibleElements = $elements.filter(function() {
          const $el = Cypress.$(this);
          const text = $el.text().trim();
          // Solo elementos con texto corto (estado específico)
          return $el.is(':visible') && 
                 text.length < 50 && // Evitar elementos con mucho texto
                 !$el.closest('[class*="hidden"]').length && 
                 !$el.closest('[style*="display: none"]').length;
        });
        
        if ($visibleElements.length > 0) {
          // Tomar el elemento con el texto más corto (más específico)
          let $bestElement = $visibleElements.first();
          let shortestText = $bestElement.text().trim();
          
          $visibleElements.each(function() {
            const $el = Cypress.$(this);
            const text = $el.text().trim();
            if (text.length < shortestText.length) {
              $bestElement = $el;
              shortestText = text;
            }
          });
          
          const estadoReal = shortestText;
          cy.log(`🔍 Estado encontrado: "${estadoReal}"`);
          
          // Verificar que el estado esté en la lista de estados permitidos
          expect(estadosPermitidos).to.include(estadoReal);
          cy.log(`✅ Estado "${estadoReal}" es válido.`);
        } else {
          // Fallback: intentar buscar por el patrón "Estado: [valor]"
          const $estadoElements = $body.find('*').filter(function() {
            const $el = Cypress.$(this);
            const text = $el.text().trim();
            return /^Estado\s*:\s*\S+$/.test(text); // Solo elementos que contengan exactamente "Estado: [valor]"
          }).filter(function() {
            const $el = Cypress.$(this);
            return $el.is(':visible') && 
                   !$el.closest('[class*="hidden"]').length && 
                   !$el.closest('[style*="display: none"]').length;
          });
          
          if ($estadoElements.length > 0) {
            const $estadoElement = $estadoElements.first();
            const textoCompleto = $estadoElement.text().trim();
            const estadoExtraido = textoCompleto.replace(/^Estado\s*:\s*/i, '').trim();
            
            cy.log(`🔍 Estado extraído del patrón: "${estadoExtraido}"`);
            
            if (estadosPermitidos.includes(estadoExtraido)) {
              cy.log(`✅ Estado "${estadoExtraido}" es válido.`);
            } else {
              throw new Error(`El estado "${estadoExtraido}" no está en la lista de estados permitidos: ${JSON.stringify(estadosPermitidos)}`);
            }
          } else {
            // Último fallback: buscar elementos que contengan solo el estado sin prefijo
            const $ultimoFallback = $body.find('*').filter(function() {
              const $el = Cypress.$(this);
              const text = $el.text().trim();
              // Buscar elementos que contengan solo el estado (sin "Estado:" ni otros textos)
              return estadosPermitidos.some(estadoPermitido => 
                text === estadoPermitido || 
                text.includes(estadoPermitido) && text.length < 100
              );
            }).filter(function() {
              const $el = Cypress.$(this);
              return $el.is(':visible') && 
                     !$el.closest('[class*="hidden"]').length && 
                     !$el.closest('[style*="display: none"]').length;
            });
            
            if ($ultimoFallback.length > 0) {
              const $elementoEncontrado = $ultimoFallback.first();
              const textoEncontrado = $elementoEncontrado.text().trim();
              cy.log(`🔍 Estado encontrado en último fallback: "${textoEncontrado}"`);
              
              // Verificar si contiene algún estado permitido
              const estadoContenido = estadosPermitidos.find(estado => 
                textoEncontrado.includes(estado)
              );
              
              if (estadoContenido) {
                cy.log(`✅ Estado "${estadoContenido}" encontrado en el texto.`);
              } else {
                throw new Error('No se pudo encontrar el estado de la visita. Estados permitidos: ' + JSON.stringify(estadosPermitidos));
              }
            } else {
              throw new Error('No se pudo encontrar el estado de la visita. Estados permitidos: ' + JSON.stringify(estadosPermitidos));
            }
          }
        }
      });
  }

  validarTipoVisitaDinamico(tiposPermitidos) {
    // Buscar el tipo de visita de manera más específica
    cy.get('body')
      .then(($body) => {
        // Buscar elementos que contengan exactamente "Visita instalación"
        const $elements = $body.find('*').filter(function() {
          const $el = Cypress.$(this);
          const text = $el.text().trim();
          // Solo elementos que contengan exactamente el tipo de visita, no elementos padre
          return text === 'Visita instalación' || 
                 text === 'Visita Instalación' || 
                 text === 'Pre-visit' ||
                 text === 'Visita Falla';
        });
        
        // Filtrar solo los visibles y que no sean elementos padre con mucho texto
        const $visibleElements = $elements.filter(function() {
          const $el = Cypress.$(this);
          const text = $el.text().trim();
          // Solo elementos con texto corto (tipo de visita específico)
          return $el.is(':visible') && 
                 text.length < 100 && // Evitar elementos con mucho texto
                 !$el.closest('[class*="hidden"]').length && 
                 !$el.closest('[style*="display: none"]').length;
        });
        
        if ($visibleElements.length === 0) {
          throw new Error('No se encontraron elementos visibles con el tipo de visita');
        }
        
        // Tomar el elemento con el texto más corto (más específico)
        let $bestElement = $visibleElements.first();
        let shortestText = $bestElement.text().trim();
        
        $visibleElements.each(function() {
          const $el = Cypress.$(this);
          const text = $el.text().trim();
          if (text.length < shortestText.length) {
            $bestElement = $el;
            shortestText = text;
          }
        });
        
        const tipoActual = shortestText;
        
        cy.log(`🔍 Tipo de visita encontrado: "${tipoActual}"`);
        
        // Verificar que el tipo esté en la lista de tipos permitidos
        expect(tiposPermitidos).to.include(tipoActual);
        cy.log(`✅ Tipo de visita "${tipoActual}" es válido.`);
      });
  }

  verificarCodigoVisita() {
    // Verificar que el código de la visita esté visible
    // Buscar por el patrón del título que incluye el timestamp
    this.findVisibleTextRegexSimple(/^Prueba Automation \d+_\d+$/, { timeout: 10000 });
  }

  verificarCliente() {
    // Verificar que la información del cliente esté visible
    // Buscar por el patrón del título que incluye el timestamp
    this.findVisibleTextRegexSimple(/^Prueba Automation \d+_\d+$/);
  }

  startTransfer(containerKey) {
    cy.log(`🧪 Ejecutando startTransfer con: ${containerKey}`);

    cy.fixture('electricista/containerSelectors').then((containers) => {
      if (!containers[containerKey]) {
        throw new Error(`❌ No se encontró el contenedor para la clave: "${containerKey}"`);
      }
      const containerSelector = containers[containerKey].container;
      cy.log(`📦 Selector CSS encontrado: ${containerSelector}`);

      cy.get(containerSelector).should('exist').then(($container) => {
        const containerRect = $container[0].getBoundingClientRect();
        const containerLeft = containerRect.left;
        const containerWidth = containerRect.width;

        this.iconSlider.then(($slider) => {
          const sliderRect = $slider[0].getBoundingClientRect();
          const sliderWidth = sliderRect.width;

          const startX = sliderRect.left + 5;
          const endX = containerLeft + containerWidth - sliderWidth - 5;

          const sliderElement = $slider[0];

          const simulateTouch = (eventType, x) => {
            const touchObj = new Touch({
              identifier: Date.now(),
              target: sliderElement,
              clientX: x,
              clientY: sliderRect.top + sliderRect.height / 2,
            });

            const touchEvent = new TouchEvent(eventType, {
              cancelable: true,
              bubbles: true,
              touches: [touchObj],
              targetTouches: [touchObj],
              changedTouches: [touchObj],
            });

            sliderElement.dispatchEvent(touchEvent);
          };

          // Simular el gesto táctil
          simulateTouch('touchstart', startX);
          setTimeout(() => {
            simulateTouch('touchmove', (startX + endX) / 2);
            setTimeout(() => {
              simulateTouch('touchmove', endX);
              setTimeout(() => {
                simulateTouch('touchend', endX);
                Cypress.log({
                  name: 'Deslizamiento',
                  message: `🎯 Deslizamiento completado para estado: ${containerKey}`,
                });
              }, 100);
            }, 100);
          }, 100);
        });
      });
    });
  }

  verifyChangeStatusVisit(ejecutarTransfer = true) {
    cy.log('Entró a verifyChangeStatusVisit');
  
    // Normalización estricta pero sin alias ni mapeos externos
    const normaliza = (s) =>
      (s ?? '')
        .toString()
        .replace(/\u00A0/g, ' ')     // NBSP -> espacio
        .replace(/\s+/g, ' ')        // colapsa espacios
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // quita acentos
  
    // Quita "Estado", "Estado:", "estado :" del inicio
    const limpiaPrefijo = (s) => (s ?? '').replace(/^estado\s*:?\s*/i, '').trim();
  
    cy.fixture('electricista/visitStatus').then((visitStatus) => {
      const estados = Array.isArray(visitStatus?.validos) ? visitStatus.validos : [];
      expect(estados, 'visitStatus.validos no vacío').to.have.length.greaterThan(0);
  
      // Mapa canónico: normalizado -> índice en 'validos'
      const normMap = new Map(estados.map((e, i) => [normaliza(e), i]));
      cy.log(`📌 Estados válidos (raw): ${JSON.stringify(estados)}`);
      cy.log(`📌 Estados válidos (norm): ${JSON.stringify(estados.map(normaliza))}`);
  
      cy.fixture('electricista/containerSelectors').then((containerSelectors) => {
        // Esperar a que el elemento esté completamente renderizado
        cy.log('🔍 Esperando a que el elemento del estado esté completamente renderizado...');
        
        // Esperar un poco más para asegurar que el DOM esté completamente renderizado
        cy.wait(1000);
        
        // Debug: ver qué elementos están en la página
        cy.log('🔍 Debug: Verificando elementos en la página...');
        cy.get('body').then(($body) => {
          const allText = $body.text();
          cy.log(`🔍 Texto completo de la página: ${allText.substring(0, 500)}...`);
          
          // Buscar elementos que contengan "Estado"
          const $estadoElements = $body.find('*').filter(function() {
            const $el = Cypress.$(this);
            const text = $el.text();
            return text.includes('Estado');
          });
          
          cy.log(`🔍 Elementos que contienen "Estado": ${$estadoElements.length}`);
          $estadoElements.each(function(i) {
            const $el = Cypress.$(this);
            const text = $el.text();
            const isVisible = $el.is(':visible');
            const classes = $el.attr('class') || '';
            cy.log(`🔍 Elemento ${i}: "${text}" - Visible: ${isVisible} - Clases: ${classes}`);
          });
        });
        
        // Buscar el estado directamente sin depender del getter problemático
        // Esperar a que el DOM esté completamente cargado
        cy.wait(2000);
        
        cy.get('body')
          .then(($body) => {
            // Buscar elementos que contengan SOLO el estado, no todo el contenido de la página
            const $estadoElements = $body.find('*').filter(function() {
              const $el = Cypress.$(this);
              const text = $el.text().trim();
              
              // Solo elementos que contengan exactamente "Estado: [valor]" o similar
              // Evitar elementos que contengan mucho más texto
              if (text.length > 200) return false; // Evitar elementos con mucho contenido
              
              // Buscar el patrón "Estado:" seguido de texto
              return /^Estado\s*:\s*\S+$/.test(text) || 
                     /Estado\s*:\s*\S+/.test(text) && text.length < 100;
            }).filter(function() {
              const $el = Cypress.$(this);
              return $el.is(':visible') && 
                     !$el.closest('.ion-page-hidden').length && 
                     !$el.closest('[style*="display: none"]').length;
            });

            if ($estadoElements.length === 0) {
              throw new Error('No se encontró ningún elemento con el patrón "Estado: [valor]"');
            }

            // Tomar el elemento con el texto más corto (más específico)
            let $bestElement = $estadoElements.first();
            let shortestText = $bestElement.text().trim();
            
            $estadoElements.each(function() {
              const $el = Cypress.$(this);
              const text = $el.text().trim();
              if (text.length < shortestText.length) {
                $bestElement = $el;
                shortestText = text;
              }
            });

            const textoCompleto = shortestText;
            cy.log(`🔍 Elemento del estado encontrado: "${textoCompleto}"`);
            
            // Extraer solo el valor del estado (sin "Estado:")
            const estadoActual = textoCompleto.replace(/^Estado\s*:\s*/i, '').trim();
            
            if (!estadoActual) {
              throw new Error('No se pudo extraer el valor del estado del texto: ' + textoCompleto);
            }
            
            cy.log(`📌 Estado extraído: "${estadoActual}"`);
            
            // Continuar con la lógica del estado
            const estadoSinPrefijo = limpiaPrefijo(estadoActual);
            cy.log(`📌 Estado sin prefijo: "${estadoSinPrefijo}"`);

            // Falla temprano si solo quedó el prefijo o vacío
            if (!estadoSinPrefijo) {
              cy.screenshot('estado-vacio-o-solo-prefijo');
              throw new Error(
                `El estado leído está vacío o solo contiene el prefijo "Estado:". 
                Texto completo: "${estadoActual}"
                Estado sin prefijo: "${estadoSinPrefijo}"
                Revisa el selector o el timing del render.`
              );
            }

            const estadoNorm = normaliza(estadoSinPrefijo);
            const idx = normMap.has(estadoNorm) ? normMap.get(estadoNorm) : -1;

            // Logs de depuración
            cy.log(`📌 Estado normalizado: "${estadoNorm}"`);
            cy.log(`📌 Índice encontrado: ${idx}`);

            // Aserción: solo acepta un valor EXACTO que esté en validos (tras normalizar)
            expect(
              idx,
              `El estado "${estadoSinPrefijo}" no aparece en visitStatus.validos`
            ).to.be.at.least(0);

            // Usa SIEMPRE el valor canónico del JSON para el resto del flujo
            const estadoCanonico = estados[idx];
            const estadoCamelCase = this.convertirACamelCase(estadoCanonico);
            cy.log(`📌 Estado canónico: ${estadoCanonico}`);
            cy.log(`📌 Estado camelCase: ${estadoCamelCase}`);

            if (ejecutarTransfer && containerSelectors[estadoCamelCase]) {
              this.startTransfer(estadoCamelCase);
            } else {
              cy.log(`⚠️ No se requiere deslizamiento para: ${estadoCamelCase}`);
            }

            // Validación de avance (si no es el último)
            if (idx < estados.length - 1) {
              const siguienteEstado = estados[idx + 1];
              cy.log(`🔄 Esperando avance del estado a: ${siguienteEstado}`);

              // Relee el DOM luego de la acción con espera adicional
              cy.wait(2000); // Esperar a que se procese la acción
              
              // Buscar el estado nuevamente para verificar el cambio
              cy.get('body')
                .then(($body2) => {
                  const $estadoElements2 = $body2.find('*').filter(function() {
                    const $el = Cypress.$(this);
                    const text = $el.text().trim();
                    
                    // Aplicar los mismos filtros para la verificación
                    if (text.length > 200) return false;
                    return /^Estado\s*:\s*\S+$/.test(text) || 
                           /Estado\s*:\s*\S+/.test(text) && text.length < 100;
                  }).filter(function() {
                    const $el = Cypress.$(this);
                    return $el.is(':visible') && 
                           !$el.closest('.ion-page-hidden').length && 
                           !$el.closest('[style*="display: none"]').length;
                  });

                  if ($estadoElements2.length > 0) {
                    // Tomar el elemento más específico
                    let $bestElement2 = $estadoElements2.first();
                    let shortestText2 = $bestElement2.text().trim();
                    
                    $estadoElements2.each(function() {
                      const $el = Cypress.$(this);
                      const text = $el.text().trim();
                      if (text.length < shortestText2.length) {
                        $bestElement2 = $el;
                        shortestText2 = text;
                      }
                    });

                    const texto2 = shortestText2;
                    const actualLimpio = limpiaPrefijo(texto2.replace(/^Estado\s*:\s*/i, '').trim());
                    
                    cy.log(`📌 Estado tras acción (raw): "${texto2}"`);
                    cy.log(`📌 Estado tras acción (limpio): "${actualLimpio}"`);

                    expect(normaliza(actualLimpio)).to.eq(
                      normaliza(siguienteEstado),
                      `Se esperaba que el estado avanzara a "${siguienteEstado}"`
                    );
                    cy.log('🎯 Se actualizó el estado correctamente');
                  } else {
                    throw new Error('No se pudo encontrar el estado después de la acción');
                  }
                });
            } else {
              cy.log('✅ Ya está en el último estado');
            }
          });
      });
    });
  }
  
  convertirACamelCase(texto) {
    return texto
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (palabra, index) =>
        index === 0 ? palabra.toLowerCase() : palabra.toUpperCase()
      )
      .replace(/\s+/g, '');
  }

  buttonCompleteVisit() {
    this.buttonContinueVisit.should('be.visible')
    .should('not.be.disabled')
    .click();
  }
}

export default DetailsVisitPage;
  