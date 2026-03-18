class ArrivalRegistrationPage {
    // 📌 Selectores como getters
  

    get titleArrivalRegistration() {
     return cy.contains('ion-text', 'Registro de llegada');
    }

    get subtitleArrivalRegistration() {
     return cy.contains('p', 'Carga una o más fotos evidencia de tu llegada al sitio de la visita.');
    }

    get textToUpload() {
      return cy.contains('p', 'Cargar registro de llegada a sitio');
    }

    get iconPhoto() {
      return cy.get('svg._icon_1i4xm_21');
    }

    get UploadPhotoInput() {
      return cy.get('input[type="file"][accept="image/*"][multiple]');
    }
    

    get buttonToSaveAndContinue() {
      return cy.contains('ion-button', 'Guardar y continuar');
    }
    
    // 🧭 MÉTODOS - Acciones que se pueden realizar en la página
    
        uploadArrivalLogToSite(cantidadEsperada = 3) {
          const imagenes = ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'];
          this.UploadPhotoInput.should('exist').click({ force: true }); // Asegura que el input esté presente en el DOM
          this.UploadPhotoInput.attachFile(imagenes.map((fileName) => ({ filePath: fileName })), { force: true });
        
          // Validar que se renderizan al menos 'cantidadEsperada' imágenes
          cy.get('img').should('have.length.at.least', cantidadEsperada);
        
          cy.log(`✅ Se cargaron correctamente ${cantidadEsperada} imágenes`);
        }
        
    verifyCheckPhotoRecordView(){
      this.titleArrivalRegistration.should('be.visible');
      this.subtitleArrivalRegistration.should('be.visible');
      this.textToUpload.should('be.visible');
      this.uploadArrivalLogToSite();
      this.verificarBotonGuardarHabilitado();
      cy.wait(4000);
    }

    verificarBotonGuardarHabilitado() {
      cy.log('✅ El botón está habilitado');
      this.buttonToSaveAndContinue.should('be.visible')
      .should('not.be.disabled')
      .click();
    }
  }
  
  export default ArrivalRegistrationPage;
  