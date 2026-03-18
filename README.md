# bia-automation-App-Ops

Automatización E2E con Cypress para la aplicación **App OPS** (BIA).

## Requisitos

- Node.js (v18 o superior recomendado)
- npm

## Instalación

```bash
npm install
```

## Ejecutar pruebas

- **Interfaz gráfica (Cypress Test Runner):**
  ```bash
  npm run cy:open
  ```
- **Línea de comandos (headless):**
  ```bash
  npm run cy:run
  ```
  o:
  ```bash
  npm test
  ```

## Estructura

- `cypress/e2e/` – Tests por rol (coordinador, electricista, ingeniería) y login
- `cypress/pages/` – Page objects
- `cypress/fixtures/` – Datos de prueba (JSON)
- `cypress/support/` – Comandos y configuración de soporte
- `cypress.config.js` – Configuración de Cypress

## Flujos cubiertos

- Login
- Coordinador: asignar visita, asignar contratista, asignar electricista, descargar CSV, validar y descargar acta
- Electricista: visitas en línea, detalles de visita
- Ingeniería: búsqueda de HV
