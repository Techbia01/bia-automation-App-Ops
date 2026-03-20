Cypress.config('includeShadowDom', true);
import './commands';
import "cypress-real-events/support";

// 🎯 Importar soporte específico para coordinador
import './coordinatorSupport';

// 🎯 Importar comandos específicos para ingeniería
import './commands/engineeringCommands.js';