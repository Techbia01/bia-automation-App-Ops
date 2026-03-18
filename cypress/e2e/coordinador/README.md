# 🎯 Test de Asignación de Contratista

## Descripción
Este test automatiza el proceso completo de asignación de un contratista a una visita desde el perfil del coordinador en la aplicación de electricistas.

## 📋 Funcionalidades del Test

### 1. Filtrado de Visitas
- Filtra todas las visitas por estado
- Selecciona únicamente las que están en estado "Por asignar contratista"

### 2. Selección de Visita
- Selecciona la primera visita de la lista filtrada
- Captura el título de la visita para validaciones posteriores

### 3. Asignación de Contratista
- Hace clic en el botón + de la columna contratista
- Verifica que el modal se abra correctamente
- Busca contratista por "JO" en el buscador
- Selecciona el contratista que aparece
- Valida que se habilite el botón de "Asignar contratista"

### 4. Verificación de Éxito
- Confirma la asignación
- Verifica el mensaje de éxito con el título de la visita

## 🏗️ Arquitectura del Test

### Page Object Model (POM)
- **`AssignContractorPage.js`**: Contiene todos los selectores y métodos para la asignación de contratista
- **Separación de responsabilidades**: Selectores separados de la lógica de negocio
- **Métodos modulares**: Cada acción tiene su propio método descriptivo

### Fixtures
- **`assignContractor.json`**: Contiene datos de prueba, selectores y timeouts
- **Configuración centralizada**: Facilita el mantenimiento y la reutilización

### Comandos Personalizados
- **`coordinatorCommands.js`**: Comandos específicos para el perfil coordinador
- **Automatización de acciones comunes**: Reduce la duplicación de código

## 🚀 Cómo Ejecutar el Test

### Prerrequisitos
1. Tener Cypress instalado y configurado
2. Tener acceso a la aplicación con credenciales de coordinador
3. Tener visitas en estado "Por asignar contratista"

### Ejecución
```bash
# Ejecutar solo este test
npx cypress run --spec "cypress/e2e/coordinador/assignVisit.cy.js"

# Ejecutar en modo interactivo
npx cypress open --e2e
```

### Configuración
El test utiliza el comando `cy.loginAsUser('coordinator')` que debe estar configurado en el proyecto.

## 📁 Estructura de Archivos

```
cypress/
├── e2e/
│   └── coordinador/
│       ├── assignVisit.cy.js          # Test principal
│       └── README.md                  # Esta documentación
├── pages/
│   └── coordinador/
│       ├── AssignContractorPage.js    # Page Object
│       └── index.js                   # Exportaciones
├── fixtures/
│   └── coordinador/
│       └── assignContractor.json      # Datos de prueba
└── support/
    ├── commands/
    │   └── coordinatorCommands.js     # Comandos personalizados
    └── coordinatorSupport.js          # Configuración de soporte
```

## 🔧 Personalización

### Modificar Selectores
Los selectores están centralizados en el fixture `assignContractor.json` y en el Page Object.

### Ajustar Timeouts
Los timeouts están configurados en el fixture y se pueden ajustar según la velocidad de la aplicación.

### Agregar Validaciones
Para agregar nuevas validaciones, extender el Page Object con nuevos métodos.

## 📝 Logs y Debugging

El test incluye logs descriptivos en cada paso:
- 🔍 Para acciones de búsqueda
- ✅ Para verificaciones exitosas
- 🚀 Para inicio de procesos
- 🎯 Para objetivos alcanzados

## 🐛 Solución de Problemas

### Problemas Comunes
1. **Modal no se abre**: Verificar que el botón + esté visible y clickeable
2. **Contratista no aparece**: Verificar que existan contratistas con "JO" en el nombre
3. **Mensaje de éxito no aparece**: Verificar que la asignación se procese correctamente

### Debugging
- Usar `cy.pause()` para pausar la ejecución en puntos específicos
- Revisar los logs de Cypress para identificar el paso donde falla
- Verificar que los selectores coincidan con la interfaz actual

## 🔄 Mantenimiento

### Actualizaciones de Selectores
Si la interfaz cambia, actualizar los selectores en:
1. `AssignContractorPage.js`
2. `assignContractor.json`

### Nuevas Funcionalidades
Para agregar nuevas funcionalidades:
1. Extender el Page Object
2. Actualizar el fixture si es necesario
3. Agregar nuevos métodos al test

## 📊 Métricas de Calidad

- **Cobertura**: Test automatiza el flujo completo de asignación
- **Mantenibilidad**: Código modular y bien documentado
- **Reutilización**: Page Object y fixtures reutilizables
- **Robustez**: Múltiples selectores y validaciones
