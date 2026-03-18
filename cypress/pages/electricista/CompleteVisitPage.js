// ===== Helpers =====
const esc = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Reconsulta el ion-item por label en cada paso (evita "detached subject")
const _itemByLabel = (label) => {
  const re = new RegExp(`^${esc(label)}$`, 'i');
  const itemSel = 'ion-item[class^="_wrapItem_"]';
  return cy
    .contains(`${itemSel} ion-label ion-text`, re, { includeShadowDom: true })
    .closest(itemSel, { includeShadowDom: true });
};

// ===== Page Object =====
class CompleteVisitPage {
  // --- Getters ---
  get titleActa() {
    return cy.contains('ion-text', 'Acta', { includeShadowDom: true });
  }
  get subtitleSections() {
    return cy.contains('ion-text', 'Secciones', { includeShadowDom: true });
  }
  get buttonGeneratePDF() {
    return cy.contains('ion-button', /^Generar PDF$/i, { includeShadowDom: true });
  }

  // 🔸 (si la quieres seguir usando) Item de sección por label visible
  sectionItem(label) {
    return _itemByLabel(label);
  }

  // --- Acciones públicas ---
  verifyViewGeneratePDF() {
    this.titleActa.should('be.visible');
    this.subtitleSections.should('be.visible');
    this.verifySectionTitles();
  }

  verifySectionTitles() {
    cy.fixture('electricista/sectionTitles').then((data) => {
      const expectedTitles = data.titulos;

      const getLabels = () =>
        cy.get('ion-item._wrapItem_vu1p7_1 ion-label ion-text', { includeShadowDom: true }).then(($els) =>
          Cypress.$($els).filter((_, el) => {
            const step = el.closest('ion-item')?.querySelector('div._statusStep_1v7u6_7 ion-text')?.textContent?.trim();
            return /^[1-9]$|^1[0-9]$|^2[0-5]$/.test(step || '');
          })
        );

      const scrollContainer = 'ion-content';

      const scrollAndCheck = () => {
        cy.get(scrollContainer, { includeShadowDom: true })
          .first()
          .scrollTo('bottom', { duration: 500, ensureScrollable: false });

        cy.wait(500);

        getLabels().then(($labels) => {
          if ($labels.length < expectedTitles.length) {
            scrollAndCheck(); // sigue scrolleando hasta que aparezcan todas
          } else {
            cy.wrap($labels)
              .should('have.length', expectedTitles.length)
              .each(($el, index) => {
                const actualText = Cypress.$($el).text().trim();
                const expectedText = expectedTitles[index];
                expect(actualText).to.eq(expectedText);
              })
              .then(() => cy.log(`✅ Se validaron ${expectedTitles.length} secciones`));
          }
        });
      };

      scrollAndCheck();
    });
  }

  verificarBotonGuardarHabilitado() {
    this.buttonGeneratePDF
      .scrollIntoView({ block: 'center' })
      .should('be.visible')
      .and('contain.text', 'Generar PDF')
      .shadow()
      .find('button', { includeShadowDom: true })
      .should('be.enabled');

    // Click al host para evitar overlays sobre el nativo
    this.buttonGeneratePDF.click({ force: true });
    cy.log('✅ Botón Generar PDF visible, habilitado y clickeado');
  }

  // ⛳️ Verifica que UNA sección esté completada (check visible)
  // ✅ versión robusta que reconsulta en cada paso
  verifySectionCompleted(label) {
    const recheck = () => _itemByLabel(label);

    // 1) Scroll + visibilidad (reconsulta)
    cy.then(() => recheck().scrollIntoView({ block: 'center' }));
    cy.then(() => recheck().should('be.visible'));

    // 2) Icono de check (reconsulta)
    cy.then(() =>
      recheck()
        .find('svg[data-icon="check"]', { includeShadowDom: true })
        .should('exist')
    );

    // 3) (Opcional) clase *_completed_* (reconsulta)
    cy.then(() =>
      recheck()
        .find('[class*="_statusStep_"]', { includeShadowDom: true })
        .invoke('attr', 'class')
        .then((cls = '') => {
          // Si quieres exigir la clase además del SVG, descomenta:
          // expect(/_completed_/.test(cls), `Sección "${label}" debe tener clase de completado`).to.be.true;
        })
    );

    cy.log(`✅ Sección "${label}" marcada como completada`);
  }

  // ✅ Verifica VARIAS secciones completadas
  verifySectionsCompleted(labels = []) {
    if (!Array.isArray(labels) || labels.length === 0) {
      cy.log('⚠️ No se pasaron etiquetas de secciones a verificar');
      return;
    }
    labels.forEach((label) => this.verifySectionCompleted(label));
  }

  // 🧩 Verifica que TODAS las secciones visibles estén completadas
  verifyAllSectionsCompleted() {
    cy.get('ion-item[class^="_wrapItem_"]', { includeShadowDom: true, timeout: 12000 })
      .should('have.length.at.least', 1)
      .each(($item) => {
        const $jq = Cypress.$($item);
        const labelText = $jq.find('ion-label ion-text').text().trim();

        const hasCheck = $jq.find('svg[data-icon="check"]').length > 0;
        const statusCls = $jq.find('[class*="_statusStep_"]').attr('class') || '';
        const hasCompletedClass = /_completed_/.test(statusCls);

        expect(
          hasCheck || hasCompletedClass,
          `La sección "${labelText}" debería estar completada (check svg o clase _completed_)`
        ).to.be.true;

        cy.log(`✅ "${labelText}" completada`);
      });
  }
}

export default new CompleteVisitPage();
