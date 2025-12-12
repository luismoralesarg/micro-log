# Reporte de Seguridad y Vulnerabilidades - micro.log

**Fecha:** 2025-12-12
**Versión Analizada:** 1.0.0
**Analista:** Claude Security Analysis

---

## Resumen Ejecutivo

Se identificaron **10 vulnerabilidades** de diferentes niveles de severidad en la aplicación micro.log, una aplicación Electron + React para registro de actividades personales.

| Severidad | Cantidad |
|-----------|----------|
| Crítica   | 1        |
| Alta      | 2        |
| Media     | 4        |
| Baja      | 3        |

---

## Vulnerabilidades Identificadas

### 1. [CRÍTICA] Path Traversal en Operaciones de Archivo

**Ubicación:** `electron/main.cjs:178-246`

**Descripción:**
Las operaciones de archivo (`read-file`, `write-file`, `delete-file`, `list-files`, `ensure-dir`) no validan las rutas relativas proporcionadas. Un atacante podría usar secuencias de path traversal (`../`) para acceder a archivos fuera del directorio vault.

**Código Vulnerable:**
```javascript
// electron/main.cjs:178-192
ipcMain.handle('read-file', (event, relativePath) => {
  const vaultPath = getVaultPath();
  const fullPath = path.join(vaultPath, relativePath);  // Sin validación!
  const content = fs.readFileSync(fullPath, 'utf-8');
  return { success: true, content };
});
```

**Vectores de Ataque:**
- Lectura de archivos sensibles: `../../.ssh/id_rsa`, `../../.aws/credentials`
- Lectura de archivos del sistema: `../../etc/passwd` (Linux/macOS)
- Escritura de archivos maliciosos en ubicaciones arbitrarias
- Eliminación de archivos críticos del sistema

**Impacto:** Un atacante que pueda inyectar código en el renderer process podría leer/escribir/eliminar cualquier archivo accesible por el usuario.

**Recomendación:**
```javascript
const path = require('path');

function isPathSafe(basePath, relativePath) {
  const fullPath = path.resolve(basePath, relativePath);
  const normalizedBase = path.resolve(basePath);
  return fullPath.startsWith(normalizedBase + path.sep);
}

ipcMain.handle('read-file', (event, relativePath) => {
  const vaultPath = getVaultPath();
  if (!vaultPath) return { success: false, error: 'No vault configured' };

  // Validar path traversal
  if (!isPathSafe(vaultPath, relativePath)) {
    return { success: false, error: 'Invalid path' };
  }

  const fullPath = path.join(vaultPath, relativePath);
  // ... resto del código
});
```

---

### 2. [ALTA] Vulnerabilidades en Dependencias

**Fuente:** `npm audit`

**Vulnerabilidades Detectadas:**

| Paquete | Versión Actual | Severidad | CVE/Advisory |
|---------|---------------|-----------|--------------|
| electron | <35.7.5 | Moderada | GHSA-vmqv-hx8q-j7mg (ASAR Integrity Bypass) |
| esbuild | <=0.24.2 | Moderada | GHSA-67mh-4wv8-2f99 (Request Interception) |
| vite | 0.11.0 - 6.1.6 | Moderada | Depende de esbuild vulnerable |

**Descripción:**
- **Electron ASAR Bypass:** Permite a atacantes modificar recursos de la aplicación evadiendo verificaciones de integridad
- **esbuild:** Cualquier sitio web puede enviar requests al servidor de desarrollo y leer las respuestas

**Recomendación:**
```bash
npm audit fix --force
# O actualizar manualmente:
npm install electron@latest vite@latest
```

---

### 3. [ALTA] Shell.openExternal Sin Validación de URL

**Ubicación:** `electron/main.cjs:98-101`

**Código Vulnerable:**
```javascript
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  shell.openExternal(url);  // Cualquier URL se abre!
  return { action: 'deny' };
});
```

**Riesgo:** URLs maliciosas podrían ejecutar protocolos peligrosos (`file://`, `javascript:`, custom protocols).

**Recomendación:**
```javascript
const ALLOWED_PROTOCOLS = ['https:', 'http:', 'mailto:'];

mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  try {
    const parsedUrl = new URL(url);
    if (ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
      shell.openExternal(url);
    } else {
      console.warn('Blocked external URL:', url);
    }
  } catch (e) {
    console.error('Invalid URL:', url);
  }
  return { action: 'deny' };
});
```

---

### 4. [MEDIA] Falta de Content Security Policy (CSP)

**Ubicación:** `index.html`, `electron/main.cjs`

**Descripción:**
La aplicación no define una Content Security Policy, lo que podría permitir ataques XSS si se introduce código malicioso.

**Recomendación para index.html:**
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;
               connect-src 'self';">
```

**Recomendación para Electron (main.cjs):**
```javascript
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'; script-src 'self'"]
    }
  });
});
```

---

### 5. [MEDIA] Falta de Validación de Entrada

**Ubicación:** `src/hooks/useJournal.js:143-181`

**Descripción:**
Las entradas de usuario se almacenan sin validación de contenido. Aunque React previene XSS por defecto con JSX, la falta de sanitización puede ser problemática si los datos se usan en otros contextos.

**Código Actual:**
```javascript
const addEntry = useCallback(async (view, currentDate, text) => {
  if (!text.trim()) return;  // Solo valida que no esté vacío
  const entry = { id: Date.now(), text, ... };
  // Almacena directamente sin sanitización
});
```

**Recomendación:**
- Implementar límites de longitud máxima
- Sanitizar caracteres de control
- Validar formato de fecha

```javascript
const MAX_ENTRY_LENGTH = 10000;

const sanitizeText = (text) => {
  if (text.length > MAX_ENTRY_LENGTH) {
    throw new Error('Entry too long');
  }
  // Remover caracteres de control excepto newlines
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};
```

---

### 6. [MEDIA] Almacenamiento Inseguro en localStorage

**Ubicación:** `src/hooks/useJournal.js:43-50, 133-141`

**Descripción:**
En modo web, los datos se almacenan en `localStorage` sin encriptación. Cualquier script con acceso al mismo origen puede leer estos datos.

**Código Actual:**
```javascript
localStorage.setItem('microlog_data', JSON.stringify(newData));
```

**Riesgo:** Datos personales sensibles (diario, sueños, notas) expuestos a extensiones del navegador o scripts maliciosos.

**Recomendación:**
- Considerar IndexedDB con encriptación del lado del cliente
- Advertir al usuario sobre la sensibilidad de los datos en modo web
- Implementar encriptación con Web Crypto API

---

### 7. [MEDIA] Regex Injection Potencial

**Ubicación:** `src/App.jsx:54`

**Código:**
```javascript
(entry.text.match(new RegExp(`${prefix}[\\w-]+`, 'g')) || [])
```

**Descripción:**
Si `prefix` proviene de entrada de usuario no controlada, podría causar ReDoS (Regex Denial of Service). En el código actual, `prefix` es fijo (`#` o `@`), pero es un patrón a evitar.

---

### 8. [BAJA] Exposición de Información en Errores

**Ubicación:** Múltiples archivos

**Descripción:**
Los errores se registran en la consola con detalles completos, lo que podría exponer información sensible en producción.

**Ejemplo:**
```javascript
console.error('Error reading config:', e);
```

**Recomendación:**
Implementar logging diferenciado para desarrollo y producción.

---

### 9. [BAJA] Falta de Rate Limiting en IPC

**Ubicación:** `electron/main.cjs`

**Descripción:**
No hay limitación de frecuencia en las llamadas IPC, lo que podría permitir ataques de denegación de servicio locales.

---

### 10. [BAJA] DevTools Habilitado en Desarrollo

**Ubicación:** `electron/main.cjs:103-105`

**Código:**
```javascript
if (isDev) {
  mainWindow.webContents.openDevTools();
}
```

**Descripción:**
Aunque está protegido por `isDev`, verificar que `app.isPackaged` sea robusto y no pueda ser manipulado.

---

## Configuración de Seguridad Positiva (Bien Implementado)

La aplicación tiene varias buenas prácticas de seguridad:

1. **Context Isolation habilitado:** `contextIsolation: true` ✅
2. **Node Integration deshabilitado:** `nodeIntegration: false` ✅
3. **Preload script seguro:** Usa `contextBridge` correctamente ✅
4. **API limitada expuesta:** Solo expone funciones necesarias ✅
5. **.gitignore incluye .env:** Previene commit de secretos ✅

---

## Recomendaciones Prioritarias

### Inmediatas (Hacer ahora)

1. **Implementar validación de Path Traversal** en todas las operaciones de archivo
2. **Actualizar dependencias vulnerables** con `npm audit fix`
3. **Validar URLs** antes de `shell.openExternal`

### A Corto Plazo

4. **Agregar Content Security Policy**
5. **Implementar validación de entrada** para longitud y caracteres
6. **Mejorar logging** diferenciando desarrollo/producción

### A Mediano Plazo

7. **Considerar encriptación** para datos sensibles
8. **Implementar rate limiting** en IPC handlers
9. **Agregar firma de código** para releases
10. **Realizar auditorías de seguridad** periódicas

---

## Matriz de Riesgo

| Vulnerabilidad | Probabilidad | Impacto | Riesgo |
|---------------|--------------|---------|--------|
| Path Traversal | Media | Crítico | **CRÍTICO** |
| Deps Vulnerables | Alta | Medio | **ALTO** |
| shell.openExternal | Baja | Alto | **ALTO** |
| Sin CSP | Baja | Medio | **MEDIO** |
| Sin validación | Baja | Medio | **MEDIO** |
| localStorage | Media | Bajo | **MEDIO** |
| Regex Injection | Muy Baja | Medio | **BAJO** |

---

## Conclusión

La aplicación micro.log tiene una arquitectura de seguridad base razonable con context isolation y preload scripts correctamente implementados. Sin embargo, la **vulnerabilidad crítica de Path Traversal debe ser corregida inmediatamente**, ya que permite acceso arbitrario al sistema de archivos del usuario.

Se recomienda abordar las vulnerabilidades en el orden de prioridad indicado antes de cualquier release de producción.

---

*Reporte generado automáticamente. Para consultas de seguridad, revisar la documentación de seguridad de Electron: https://www.electronjs.org/docs/latest/tutorial/security*
