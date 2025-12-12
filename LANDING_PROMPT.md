# Prompt: Landing Page para micro.log

## Objetivo
Crear una landing page para **micro.log**, una aplicación de journaling personal minimalista. La landing debe compilarse a HTML + JS estático para poder subirla a un hosting básico (sin necesidad de Node.js/Docker).

---

## Stack Técnico

- **React 18** con **Vite** (para desarrollo)
- **TailwindCSS 3** para estilos
- **Build estático**: El resultado final debe ser archivos HTML, CSS y JS puros (usar `vite build`)
- **Sin backend**: Todo estático, sin dependencias de servidor
- **Responsive**: Mobile-first, adaptable a todos los tamaños

---

## Diseño Visual (IMPORTANTE - Debe coincidir con la app)

### Tipografía
- **Fuente principal**: `JetBrains Mono` (monospace)
- **Pesos**: 300 (light), 400 (regular), 500 (medium)
- **Fallbacks**: `SF Mono, Consolas, monospace`
- Todo el texto debe ser monospace, sin excepciones

### Paleta de Colores - Modo Oscuro (default)
```css
--background: neutral-950 (#0a0a0a)
--card-bg: neutral-900 (#171717)
--borders: neutral-800 (#262626)
--text-primary: neutral-100 (#f5f5f5)
--text-muted: neutral-500 (#737373)
--accent-tags: cyan-400 (#22d3ee)
--accent-mentions: amber-400 (#fbbf24)
--accent-highlight: amber-500 (#f59e0b)
```

### Paleta de Colores - Modo Claro
```css
--background: neutral-50 (#fafafa)
--card-bg: white (#ffffff)
--borders: neutral-200 (#e5e5e5)
--text-primary: neutral-900 (#171717)
--text-muted: neutral-400 (#a3a3a3)
--accent-tags: cyan-600 (#0891b2)
--accent-mentions: amber-600 (#d97706)
```

### Estilo Visual
- **Minimalismo brutalist**: Sin decoraciones innecesarias
- **Terminal-inspired**: Estética de línea de comandos
- **Bordes sutiles**: 1px solid con colores de borde definidos
- **Hover effects**: Cambio sutil de background en elementos interactivos
- **Tipografía como UI**: El contenido es el protagonista

---

## Estructura de la Landing

### 1. Hero Section
- Logo/nombre: `micro.log` en tipografía grande
- Tagline: "Tu diario personal. Sin fricción. Sin nubes. Sin excusas."
- Versión en inglés: "Your personal journal. Minimal friction. No cloud. No excuses."
- Botones CTA:
  - **Descargar** (con opciones macOS, Windows, Linux)
  - **Probar Web App** (link a la versión web)
- Animación sutil: quizás un cursor parpadeante estilo terminal

### 2. Features Section (8 módulos)
Mostrar los 8 módulos de la app con íconos simples (usar caracteres unicode o SVG mínimos):

| Módulo | Descripción | Ícono sugerido |
|--------|-------------|----------------|
| Daily Log | Entradas rápidas estilo bullet con `#tags` y `@mentions` | `●` |
| Dreams | Espacio dedicado para registrar sueños | `☾` |
| Notes | Notas más largas cuando los bullets no alcanzan | `≡` |
| Ideas | Seguimiento de ideas: nuevo → en progreso → hecho | `💡` o `◐` |
| Wisdom | Colecciona citas, pensamientos y lecciones | `❝` |
| Tags | Filtra entradas por `#hashtags` | `#` |
| People | Seguimiento de relaciones vía `@menciones` | `@` |
| Insights | Dashboard de estadísticas y tendencias | `◷` |

### 3. Privacy Section
- Título: "Tu privacidad, nuestra prioridad"
- Puntos clave:
  - ✓ Todos tus datos en tu máquina
  - ✓ Sin cuentas, sin registro
  - ✓ Sin tracking, sin analytics
  - ✓ Sin conexión a internet requerida
  - ✓ Exporta tus datos cuando quieras (JSON)
- Mensaje: "micro.log es **local-first**. Tus pensamientos son solo tuyos."

### 4. Demo/Preview Section
- Screenshots de la app (modo oscuro y claro)
- GIF o video corto mostrando el flujo de crear una entrada
- Ejemplo visual del syntax highlighting de `#tags` y `@mentions`

### 5. Download Section
Tarjetas de descarga para cada plataforma:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    macOS        │  │    Windows      │  │     Linux       │
│   (.dmg)        │  │   (.exe)        │  │  (.AppImage)    │
│                 │  │                 │  │                 │
│   [Descargar]   │  │   [Descargar]   │  │   [Descargar]   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

- Detectar SO del usuario y destacar la opción correspondiente
- Link alternativo a GitHub releases

### 6. Open Source Section
- Badge de GitHub con stars
- "micro.log es open source. Contribuye, reporta bugs, o simplemente dale una ⭐"
- Link al repositorio

### 7. Footer
- Links: GitHub | Releases | Issues
- "Hecho con ♥ para quienes escriben todos los días"
- Toggle de idioma (ES/EN)
- Toggle de tema (oscuro/claro)

---

## Interacciones y Animaciones

- **Dark/Light mode toggle**: Transición suave entre modos
- **Scroll animations**: Fade-in sutil al hacer scroll (usar Intersection Observer)
- **Hover effects**:
  - Botones: cambio de background y borde
  - Cards: elevación sutil o cambio de borde
- **Cursor parpadeante**: En el hero, simular un cursor de terminal
- **Typing effect**: Opcional, escribir el tagline letra por letra

---

## SEO y Meta Tags

```html
<title>micro.log - Tu diario personal minimalista</title>
<meta name="description" content="Aplicación de journaling personal. Sin fricción, sin nubes, sin excusas. Todos tus datos en tu máquina.">
<meta name="keywords" content="journal, diary, journaling, daily log, personal, private, local-first, open source">
<meta property="og:title" content="micro.log">
<meta property="og:description" content="Tu diario personal. Minimalista. Privado. Local.">
<meta property="og:image" content="og-image.png">
```

---

## Consideraciones Técnicas para Build Estático

### Configuración de Vite
```javascript
// vite.config.js
export default {
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Genera HTML + JS + CSS estáticos
  }
}
```

### Estructura del proyecto
```
/landing
  /src
    /components
      Hero.jsx
      Features.jsx
      Privacy.jsx
      Download.jsx
      Footer.jsx
    App.jsx
    main.jsx
    index.css
  /public
    favicon.ico
    og-image.png
    screenshots/
  index.html
  vite.config.js
  tailwind.config.js
  package.json
```

### Post-build
Después de `npm run build`, el directorio `dist/` contendrá:
- `index.html`
- `assets/` (JS y CSS bundleados)
- Archivos estáticos de `/public`

Esto se puede subir directamente a cualquier hosting (Netlify, GitHub Pages, hosting compartido tradicional).

---

## Contenido de Texto (Bilingüe)

### Español
- **Hero**: "Tu diario personal. Sin fricción. Sin nubes. Sin excusas."
- **CTA**: "Descargar" / "Probar Online"
- **Features title**: "Todo lo que necesitas. Nada que no."
- **Privacy title**: "Tu privacidad, nuestra prioridad"
- **Download title**: "Disponible para todos"

### English
- **Hero**: "Your personal journal. Minimal friction. No cloud. No excuses."
- **CTA**: "Download" / "Try Online"
- **Features title**: "Everything you need. Nothing you don't."
- **Privacy title**: "Your privacy is our priority"
- **Download title**: "Available everywhere"

---

## Assets Necesarios

1. **Logo**: SVG del logo de micro.log (o usar texto estilizado)
2. **Screenshots**:
   - Vista Daily Log (dark mode)
   - Vista Daily Log (light mode)
   - Vista Insights
3. **Favicon**: ICO y PNG para diferentes tamaños
4. **OG Image**: Imagen de 1200x630px para compartir en redes sociales
5. **Iconos de plataforma**: macOS, Windows, Linux (pueden ser unicode o SVG simples)

---

## Extras Opcionales

- **Contador de descargas** (si hay API de GitHub)
- **Testimonios** (si los hay)
- **Changelog resumido** de la última versión
- **FAQ** (preguntas frecuentes)
- **Comparación** con otras apps de journaling (sin nombrarlas directamente)

---

## Ejemplo de Componente Hero (referencia)

```jsx
function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <h1 className="text-4xl md:text-6xl font-light tracking-tight">
        micro<span className="text-cyan-400">.</span>log
      </h1>
      <p className="mt-4 text-neutral-500 text-center max-w-md">
        Tu diario personal. Sin fricción. Sin nubes. Sin excusas.
      </p>
      <div className="mt-8 flex gap-4">
        <button className="px-6 py-3 bg-cyan-500 text-neutral-950 font-medium hover:bg-cyan-400 transition">
          Descargar
        </button>
        <button className="px-6 py-3 border border-neutral-700 hover:border-neutral-500 transition">
          Probar Online
        </button>
      </div>
    </section>
  )
}
```

---

## Checklist Final

- [ ] Responsive en móvil, tablet y desktop
- [ ] Toggle dark/light mode funcional
- [ ] Toggle idioma ES/EN funcional
- [ ] Links de descarga correctos
- [ ] Build genera archivos estáticos correctamente
- [ ] Meta tags de SEO completos
- [ ] Favicon funcionando
- [ ] Performance optimizada (Lighthouse > 90)
- [ ] Accesibilidad básica (contraste, alt texts, navegación por teclado)
