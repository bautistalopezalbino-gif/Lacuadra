# La Cuadra — Auditoría crítica y prompt de rediseño para Google Stitch

> Auditoría hecha sobre el código real del repo (`code.html`, 1.377 líneas; `carta.html`; `menu2.html`)
> y verificada en navegador (Chromium + el bundle real de `cdn.tailwindcss.com`).
> Nada de lo que sigue es opinión suelta: cada punto tiene evidencia y línea.
>
> **Cómo usar este documento:** la sección 1 es el diagnóstico (léela, duele pero es necesaria).
> La sección 3 es el bloque que copias y pegas tal cual en Google Stitch.
> La sección 5 es lo que Stitch **no** te va a resolver y tienes que hacer a mano.
>
> La dirección visual del prompt está calcada de la referencia que pasaste: **editorial oscuro**
> (fondo espresso, fotografía a sangre con luz dramática, serif ligera en versales muy espaciadas,
> iconos de línea, acento oro y bloques crema alternos). Todos los pares de color del sistema
> propuesto van con su ratio de contraste ya calculado y verificado.

---

## 1. Auditoría: todo lo que está mal

### A. Bugs de diseño confirmados en navegador

**A1. Ningún botón de la web tiene las esquinas redondeadas que crees que tiene.**
La config de Tailwind (línea 67) define `borderRadius.DEFAULT`, y el HTML usa la clase `rounded-DEFAULT` **15 veces** (todos los CTA: "Encargar", "Ver la Carta completa", "Reservar Mesa", "Pedir por WhatsApp", los botones del hero…).
`rounded-DEFAULT` **no existe** en Tailwind: la clave `DEFAULT` sólo se emite como `rounded` a secas.
Verificado: `rounded-DEFAULT` → `border-radius: 0px`. Los 15 botones principales de la marca salen **con esquina viva**, en contradicción directa con tu propio `DESIGN.md` ("Soft 0.25rem shape language").
→ **Solución:** usar `rounded` (no `rounded-DEFAULT`) y, mejor, dejar de apoyarse en la clave `DEFAULT`: definir un escalón nombrado (`rounded-btn`).

**A2. `rounded-full` ya no es un pill: es un cuadrado con 12px.**
La misma config sobrescribe `full: "0.75rem"`. Verificado: `rounded-full` → `12px`.
El badge "Más vendidas", los chips de "Terraza / Wi-Fi / Kids Corner / Accesible" y el caption del lightbox están diseñados como cápsulas y se renderizan como rectángulos redondeados. Cinco usos rotos.
→ **Solución:** `full: 9999px`, y crear un token aparte (`xl: 12px`) para lo que de verdad quería 12px.

**A3. La escala de radios no la respeta ni el propio HTML.**
Tras la sobrescritura: `rounded-lg` = 4px, `rounded-xl` = 8px… pero las tarjetas de categoría del menú usan `rounded-2xl`, que **no** está en el sistema y cae al default de Tailwind = 16px. Resultado: en la misma pantalla conviven 0px, 4px, 8px, 12px y 16px sin ninguna lógica. No hay lenguaje de forma; hay ruido.

**A4. Prompts de IA olvidados dentro del HTML de producción.**
Líneas 582 y 770: `data-alt="A warm, slightly grainy film photograph of an Argentine family in a rustic bakery setting…"`.
Son los prompts de generación de imágenes que quedaron pegados en el markup. Además usan `data-alt` en vez de `alt`, con lo que esas imágenes **no tienen texto alternativo**: ni lectores de pantalla ni Google saben qué hay ahí.

**A5. Enlace muerto en el footer.** Línea 1121: el icono de Instagram de la columna de marca apunta a `href="#"`. La cuenta real (`instagram.com/lacuadravalencia`) sólo está en la columna de contacto. Hay dos Instagram, uno roto.

**A6. Navegación que miente.** Línea 1132: el footer enlaza `#brunch` con la etiqueta **"Brunch"**, pero esa sección hoy se titula "Nuestra Carta" y no habla de brunch. Etiqueta huérfana de una versión anterior. Además el footer omite "Visítanos", que es la sección más importante para un negocio físico.

**A7. Siete `href="#"` con `onclick`.** "Encargar", "Reservar Mesa", "Encargar ahora" del menú móvil… son enlaces falsos con `event.preventDefault()`. No son botones, no se anuncian como botones, y sin JS no hacen nada. Deben ser `<button type="button">`.

**A8. "Reservar Mesa" y "Encargar" hacen exactamente lo mismo.**
Dos intenciones de usuario radicalmente distintas (reservar mesa / encargar tarta) abren el mismo action sheet genérico con el mismo mensaje de WhatsApp. El usuario que quiere mesa para 4 el sábado tiene que escribirlo todo él. Es el punto de fuga de conversión más caro de la web.

---

### B. Rendimiento: la web pesa ~13 MB en la primera carga

**B1. 13,2 MB de media únicos, 56 `<img>`, cero `loading="lazy"`.**
Medido: 27 imágenes + 1 vídeo = **13.255 KB**. `loading=` aparece **0 veces**. `srcset` **0 veces**. `decoding` **0 veces**. Atributos `width`/`height` en imágenes: **0** (los 6 `width=` que hay son de SVG).
En 4G de barrio esto son decenas de segundos y un Largest Contentful Paint catastrófico. En móvil, que es el 80% de tu tráfico real, se te cae el cliente antes de ver una medialuna.

**B2. Fotos de iPhone sin procesar, servidas a tamaño completo.**
`IMG_8805.png`, `IMG_8721.jpg`, `IMG_5641.jpg`: **1536×2048 px, 300 DPI, con EXIF completo de iPhone 13 Pro / 15 Pro**. Varias llevan **GPS-Data incrustado**: estás publicando coordenadas de dónde se hizo cada foto. La tira de fotos las muestra a **160 px de alto**: sirves 800 KB para pintar 160 px.

**B3. Extensiones mentirosas.** `IMG_8805.png` y `IMG_0429.png` son **JPEG** con extensión `.png`. Confunde a los CDN, a los optimizadores y a cualquier build futuro.

**B4. La misma foto repetida hasta 4 veces en la misma página.**
`IMG_5623.JPG` (Tarta Chajá) aparece en 4 sitios; `IMG_5594` (Lemon Pie) en 4; otras 10 fotos en 3. Tienes **cuatro secciones distintas que son la misma parrilla de las mismas 14 fotos**: "Nuestras Especialidades", "Lo que hacemos", la tira animada y "Tartas a encargo". Cero información nueva, cuatro veces el peso, y el usuario aprende a hacer scroll rápido sobre tu producto.

**B5. Tira de fotos infinita: 24 `<img>` de golpe.**
La duplicación para el loop carga 12 imágenes extra a resolución completa. Y `animation: lc-slide 36s linear infinite` sobre un track de `width: max-content` mantiene la GPU trabajando de forma permanente, también fuera de viewport: batería.

**B6. Tailwind Play CDN en producción.**
`<script src="https://cdn.tailwindcss.com">` en las 3 páginas. Son **407 KB de JavaScript** que compilan el CSS **en el navegador del cliente**, en cada visita. La propia documentación de Tailwind lo prohíbe explícitamente para producción. Produce FOUC (destello sin estilos), CLS y bloquea el render.

**B7. Material Symbols cargado dos veces** (líneas 8 y 12: la misma hoja duplicada), una fuente variable de iconos completa para ~15 iconos.

**B8. Parallax + scroll sin throttle.**
Dos listeners de `scroll`: el de la nav (línea 1167) **no es passive** y escribe clases en cada evento; el del parallax escribe `transform` sobre el `<video>` en cada frame de scroll. Sin `requestAnimationFrame`. Jank garantizado en gama media.

**B9. Textura de granito repintada en cada sección.** Un `::before` con SVG noise a `opacity .6` sobre `section, nav, footer` a pantalla completa, más el mismo ruido en `body`. Coste de pintado permanente para un efecto que a 400px de tile casi no se percibe en móvil.

**B10. El vídeo del hero.**
`autoplay muted loop` de 983 KB, sin `preload="none"`, con `poster` apuntando a `IMG_9003.PNG` (222 KB, y encima es un JPEG). Y el nombre del fichero es **`snaptik_7435229416659193120_v3.mp4`**: es un vídeo descargado de TikTok con un ripper. Eso significa (a) recompresión y probable marca de agua, (b) que la pieza principal de tu marca no es tuya en formato máster. Un vídeo hero es tu activo más caro: no puede venir de un descargador.

---

### C. SEO y negocio local: la parte que te está costando dinero

**C1. Cero `<meta name="description">` en `code.html` y en `carta.html`.** Google se inventa el snippet.

**C2. Cero Open Graph / Twitter Cards.** Cuando alguien comparte lacuadra por WhatsApp o Instagram —que es **como se comparte de verdad una cafetería**— sale un enlace gris sin foto ni título. Para un negocio que vive del boca a boca, esto es el error más caro de toda la lista.

**C3. Cero `application/ld+json`.** No hay `Schema.org/Bakery` ni `LocalBusiness`: ni dirección, ni horarios, ni teléfono, ni rango de precios, ni geo. Google no puede montar el panel de conocimiento ni el "Abierto ahora · Cierra a las 21:00" en resultados. Para una cafetería de barrio, **este es el SEO que importa**, y no existe.

**C4. Sin favicon, sin `robots.txt`, sin `sitemap.xml`, sin canonical.**
Y además duplicidad de URL: la nav enlaza `/carta.html` mientras `vercel.json` sirve también `/carta`. Dos URLs, mismo contenido, sin canonical.

**C5. Los horarios sólo existen como texto plano** dentro de un `<p>` con `<br>`. No son datos estructurados, no se pueden leer por máquina, y no hay ningún indicador de "abierto ahora".

**C6. Sin analítica.** No hay forma de saber cuánta gente pulsa "Encargar". Estás rediseñando a ciegas.

**C7. `menu2.html` está huérfano.** Tiene meta description (la única del repo), está publicado en `/menu2` y no lo enlaza nadie. O se integra o se borra: contenido duplicado indexable.

**C8. Bilingüismo a medias.** `carta.html` lleva traducción al inglés bajo cada producto, pero todo el HTML es `lang="es"` y no hay `hreflang`, ni selector de idioma, ni `lang="en"` en los textos ingleses. En Valencia, con turismo, esto es dejar tráfico en la mesa; y para un lector de pantalla, el inglés se lee con fonética española.

---

### D. Accesibilidad

**D1. 6 imágenes sin `alt`** (dos con el prompt de IA en `data-alt`, ver A4).

**D2. El badge "Más vendidas" falla WCAG AA.** Blanco sobre `#9C7030` = **4,4:1**, con texto de 12px. El mínimo es 4,5:1. Falla por poco, pero falla.

**D3. Los botones de WhatsApp fallan estrepitosamente.** Texto blanco sobre `#25D366` = **1,98:1**. Sobre el hover `#1DA851` = **3,1:1**. Muy por debajo de cualquier mínimo. El verde WhatsApp exige texto oscuro.

**D4. Los captions sobre foto (`text-white/60`, `text-white/70`)** dependen de un degradado que no controla el contraste real: sobre las zonas claras de las fotos de merengue y crema, el texto desaparece.

**D5. El lightbox no es usable con teclado.**
`document.querySelectorAll('img:not([src="/logo.png"]))').forEach(img => img.addEventListener('click', …))` (línea 1302): el handler va sobre `<img>`, que no es focusable, no tiene `role="button"`, no tiene `tabindex`, y no responde a Enter/Espacio. **Toda la galería es inaccesible por teclado.** Además no hay focus trap ni devolución de foco al cerrar.

**D6. El menú móvil no anuncia su estado.** Sin `aria-expanded`, sin `aria-controls`, sin focus trap, y `Escape` no lo cierra (sí cierra el lightbox y el action sheet: inconsistente).

**D7. El action sheet copia la UI de iOS literalmente**: `#007AFF` azul sistema Apple, `-apple-system`, botón "Cancelar". En Android y escritorio se ve como un cuerpo extraño, y ese azul **no pertenece a tu paleta**: es la única nota fría de toda la web.

**D8. Sin `:focus-visible` propio.** Ningún estilo de foco definido sobre fondos crema; el outline por defecto sobre `#FAF7F2` es casi invisible.

---

### E. Contenido, arquitectura y conversión (lo más grave)

**E1. No hay un solo precio en la home.** Ni un rango, ni "café desde X". El usuario tiene que abandonar la página e ir a una carta de 95 KB para saber si puede permitirse un alfajor.

**E2. No hay reseñas ni prueba social.** Y lo peor: `server.js` implementa un endpoint `/api/reviews` con caché de 24h contra Google Places… que **nadie llama nunca** desde el HTML, y que además **no existe en producción**, porque `vercel.json` despliega sólo estáticos sin funciones. Código muerto que simula una funcionalidad que el usuario final jamás ve. Tienes el activo (reseñas de Google de una cafetería de barrio) y lo estás tirando.

**E3. Ocho secciones, dos mensajes.** El recorrido es: hero → historia (5 párrafos) → 6 fotos → carta → encargos → 6 fotos → tira de fotos → 14 fotos → visítanos. **Cuatro bloques de galería consecutivos.** No hay progresión narrativa ni jerarquía de decisión: el usuario no sabe en qué momento se supone que debe actuar.

**E4. El "Quiénes somos" tiene 5 párrafos y 190 palabras** sin foto intercalada, sin datos, sin ritmo. La historia (Argentina, 1992, cinco años en Valencia) es tu mayor diferenciador y está enterrada en un muro de texto que nadie lee.

**E5. Todo desemboca en el mismo WhatsApp genérico.** El mismo número, el mismo mensaje pre-rellenado, para tarta de cumpleaños, catering de oficina y reserva de mesa. Sin formulario, sin selección de producto, sin fecha, sin franja horaria. Cada pedido implica 6 mensajes de ida y vuelta que gestiona una persona detrás del mostrador.

**E6. Sin nada sobre "hoy".** Una pastelería artesanal vive de *hoy*: qué ha salido del horno esta mañana, qué queda, qué es de temporada. La web es un catálogo estático e intemporal. Es exactamente lo contrario de lo que vendes.

**E7. Sin alérgenos.** Vendes comida elaborada en la UE. La información de alérgenos no es una mejora de UX: es obligación legal (Reglamento UE 1169/2011) y aquí no aparece por ningún lado.

**E8. Sin aviso legal, sin política de privacidad, sin cookies.** El footer dice "Todos los derechos reservados" y nada más. Un negocio español con web pública necesita identificación LSSI-CE como mínimo.

**E9. `darkMode: "class"` configurado en las 3 páginas, sin interruptor y sin variantes** salvo dos clases sueltas en el footer. Config muerta que confunde a quien toque el código.

---

### F. Higiene del repositorio

- `Fotos/` pesa **60 MB** en git, con `.MP4` y originales de iPhone. Cada clon se los lleva.
- Nombres de archivo sin semántica: `85EDECD6-1EBE-4C90-BCC8-45C6F1407087.png` es la Tarta Fresita. Imposible de mantener.
- 3 páginas HTML con **la misma config de Tailwind copiada y pegada** (~90 líneas × 3). Cualquier cambio de color exige tocar tres sitios y no fallar.
- `server.js` lee un `config.json` con `GOOGLE_API_KEY` que no está versionado (bien) pero tampoco documentado (mal), para un servidor que Vercel no ejecuta.
- CSS incrustado en tres `<style>` distintos, incluido uno **dentro de una `<section>`** (la tira de fotos).

---

## 2. Qué cambia en el rediseño (decisiones, no gustos)

La referencia visual que me pasaste marca la dirección: **editorial oscuro**. Fondo espresso casi negro,
fotografía a sangre con luz dramática, tipografía serif en versales muy espaciadas, iconografía de línea
fina, acento oro y bloques crema que alternan con los oscuros para dar ritmo. Es un salto grande respecto
a lo actual (todo crema plano, sin jerarquía) y encaja mucho mejor con "pastelería de autor".

| Problema actual | Decisión de diseño |
|---|---|
| Fondo crema uniforme, todo al mismo peso visual | **Alternancia oscuro / crema / beige**: el ritmo lo marca el fondo, no las cajas. |
| 4 galerías idénticas con las mismas fotos | Una fila de categorías con icono de línea + un bloque "Hoy" + una rejilla de Instagram. Cada foto, **una sola vez**. |
| Sin precios en la home | "Hoy en La Cuadra" con producto, estado ("recién horneado") **y precio**. |
| CTA genérico a WhatsApp | Tres intenciones separadas: **Reservar mesa**, **Encargar tarta**, **Catering**, cada una con su mensaje. |
| Sin identidad de marca fuerte | Logotipo en versales espaciadas + ilustración de línea de la fachada (como en la referencia). |
| Sin prueba social | Bloque de reseñas de Google, sobre fondo oscuro. |
| Historia enterrada en 5 párrafos | Split **Argentina / Valencia**: dos mitades, dos fotos, dos párrafos de 25 palabras. |
| 13,2 MB | Presupuesto duro: **< 1,2 MB** en la primera pantalla. |
| Radios y contrastes rotos | Escala de 4 pasos y todos los pares de color con su ratio AA declarado. |

---

## 3. PROMPT MAESTRO PARA GOOGLE STITCH

> Copia **todo** el bloque siguiente y pégalo en Stitch como primer mensaje (modo *Experimental* si lo tienes:
> respeta mejor los sistemas de diseño largos). Sube además la imagen de referencia y 4–6 fotos reales
> del obrador **antes** de enviarlo.

```
Eres un diseñador de producto senior especializado en marcas gastronómicas premium.
Rediseña la web de "La Cuadra", pastelería y cafetería argentina artesanal en
Patraix (Valencia, España). Público: vecinos del barrio (30–55), oficinistas de la
zona y turistas. Objetivos, por orden: (1) que entren a la tienda física,
(2) que encarguen tartas y catering, (3) que reserven mesa.
Idioma de toda la interfaz: español de España. Diseño mobile-first.

DIRECCIÓN VISUAL
Editorial oscuro y apetitoso, como la carta de un obrador de autor impresa en papel
grueso. Fondo espresso casi negro como base de la marca, alternando con bloques
crema y beige para marcar el ritmo de lectura. La fotografía manda: planos cerrados
de producto, luz lateral cálida y dramática, fondos oscuros, mucho contraste entre
la miga dorada y la sombra. Iconografía de línea fina dibujada a mano alzada, nunca
iconos rellenos ni de librería genérica. Sensación: cálido, artesano, caro sin ser
pretencioso. Nada de degradados de moda, glassmorphism, neón ni sombras duras.

Aplica ESTE sistema de diseño de forma estricta:

---
name: La Cuadra — Obrador Nocturno
colors:
  # Base oscura (la identidad)
  espresso: '#1A120C'            # fondo principal oscuro
  espresso-soft: '#2A1D14'       # bloques oscuros secundarios
  espresso-line: '#3D2C20'       # separadores sobre oscuro
  # Base clara (bloques alternos)
  cream: '#F7F1E7'               # fondo claro principal
  sand: '#EDE2D3'                # fondo claro secundario ("Hoy en La Cuadra")
  white-pure: '#FFFFFF'          # sólo tarjetas elevadas sobre crema
  # Texto
  on-dark: '#F7F1E7'             # 16.5:1 sobre espresso
  on-dark-muted: '#C9B9A5'       # 9.7:1 sobre espresso
  on-light: '#2A1D14'            # 14.6:1 sobre cream
  on-light-muted: '#5B4636'      # 7.9:1 sobre cream / 6.9:1 sobre sand
  # Acento
  gold: '#C9A227'                # 7.6:1 sobre espresso — filetes, "&", detalles
  gold-bright: '#D9A441'         # 8.2:1 sobre espresso — hover de enlaces
  siena: '#7A3520'               # marrón de marca heredado, para botones sobre crema
  on-siena: '#F7F1E7'            # 7.9:1
  success: '#4EA97B'             # chip "Abierto ahora" sobre oscuro
typography:
  wordmark:  { font: 'Cormorant Garamond', size: 'clamp(2rem, 6vw, 4.5rem)', weight: 300, transform: uppercase, letterSpacing: '0.14em', lineHeight: 1 }
  display:   { font: 'Cormorant Garamond', size: 'clamp(2.2rem, 6vw, 4rem)',  weight: 300, transform: uppercase, letterSpacing: '0.10em', lineHeight: 1.1 }
  headline:  { font: 'Cormorant Garamond', size: 'clamp(1.6rem, 3.5vw, 2.4rem)', weight: 400, transform: uppercase, letterSpacing: '0.08em' }
  title:     { font: 'Cormorant Garamond', size: '1.3rem', weight: 400, lineHeight: 1.25 }
  body:      { font: 'Jost', size: '0.95rem', weight: 300, lineHeight: 1.65 }
  body-sm:   { font: 'Jost', size: '0.8rem',  weight: 300, lineHeight: 1.5 }
  overline:  { font: 'Jost', size: '0.7rem',  weight: 400, transform: uppercase, letterSpacing: '0.22em' }
  link:      { font: 'Jost', size: '0.75rem', weight: 400, transform: uppercase, letterSpacing: '0.18em' }
  price:     { font: 'Jost', size: '0.95rem', weight: 500, tabularNums: true }
rounded:
  sm: 2px        # chips y badges
  md: 4px        # botones e inputs — casi recto, es deliberado
  lg: 6px        # tarjetas y fotos de rejilla
  pill: 9999px   # SOLO chips de estado
  # NO uses ningún otro radio. Nada de 12px, 16px ni 24px.
spacing:
  unit: 8px
  gutter: 20px
  margin-mobile: 20px
  margin-desktop: 64px
  section-gap-mobile: 56px
  section-gap-desktop: 96px
  max-width: 1320px
---

REGLAS DE COLOR
- La página alterna bloques: oscuro (espresso) → claro (cream) → beige (sand) →
  oscuro → oscuro → claro. Nunca dos bloques claros seguidos.
- Un solo acento: oro. Se usa en filetes finos bajo los títulos de sección, en el
  "&" del claim, en la flecha de los enlaces y en detalles de la ilustración.
  Nunca como fondo de un botón grande ni como color de párrafo largo.
- Sobre foto, el texto va siempre sobre un velo sólido oscuro (rgba(26,18,12,.62))
  o sobre la zona ya oscura de la imagen, nunca sobre luces.
- Los botones de WhatsApp llevan texto OSCURO (#12271C) sobre verde, nunca blanco.
- Prohibido cualquier azul de sistema (#007AFF y similares).

TIPOGRAFÍA
Serif ligera en VERSALES con tracking amplio (0.10–0.14em) para el logotipo, los
titulares y los títulos de sección: es la firma de la marca. Nunca uses la serif en
párrafos largos. Sans ligera (Jost, peso 300) para todo el texto corrido, con líneas
cortas (máx. 62 caracteres). Etiquetas y enlaces en versales pequeñas muy espaciadas,
del tipo "VER MÁS →" con la flecha separada por un espacio. Precios en cifras
tabulares. Bajo cada título de sección, un filete oro centrado de 40px × 1px.

COMPONENTES
- Botón primario sobre oscuro: relleno crema, texto espresso, radio md, altura 48px.
- Botón fantasma sobre oscuro: borde 1px rgba(247,241,231,.45), texto crema.
- Botón primario sobre claro: relleno espresso, texto crema.
- Enlace de texto: versales espaciadas + flecha "→", con subrayado fino oro que
  crece de izquierda a derecha en hover.
- Icono de categoría: dibujo de línea de 1,25px, 48px, sin relleno, color heredado.
- Tarjeta de categoría: icono → nombre en versales serif → dos líneas de texto →
  foto 4:3 → enlace "VER MÁS →". Sin caja, sin borde, sin sombra: la separan el aire
  y la retícula.
- Tarjeta "de hoy": overline en oro ("RECIÉN HORNEADO"), nombre en serif, precio,
  foto 4:3. Máximo cuatro por fila.
- Chip de estado: pill, punto verde + "ABIERTO AHORA · CIERRA A LAS 21:00".
- Tabla de horarios: día en versales pequeñas, horas en sans, el día actual en oro.
- Ilustración de marca: dibujo de línea de la fachada de la cafetería, a una tinta,
  para el pie de página. Es el remate de la identidad, no un adorno opcional.
- Foco de teclado: outline 2px oro con offset 2px. Obligatorio y visible sobre los
  dos fondos.

MOVIMIENTO
Discreto. Fade + 16px de subida al entrar en viewport, 400 ms, una sola vez.
Nada de parallax, nada de carruseles en bucle infinito, nada de elementos que se
mueven solos de forma permanente. Respeta prefers-reduced-motion.

ESTRUCTURA (una sola página, en este orden exacto — no añadas secciones)

1. BARRA SUPERIOR sobre el hero, transparente, sin borde. Izquierda: enlaces en
   versales espaciadas (INICIO · CARTA · SOBRE LA CUADRA), el activo con filete oro
   debajo. Centro: logotipo "LA CUADRA" en serif versales con "VALENCIA" debajo en
   micro-versales. Derecha: botón fantasma "CÓMO LLEGAR" con icono de pin.
   Al hacer scroll se vuelve sólida espresso y reduce a 64px.
   En móvil: logo centrado, hamburguesa a la derecha, panel a pantalla completa
   sobre espresso con los enlaces en serif grande y dos botones al fondo:
   "RESERVAR MESA" y "ENCARGAR".

2. HERO oscuro a pantalla casi completa (85vh). Foto a sangre: plano cerrado de un
   croissant/medialuna dorada con una taza de café al fondo, luz lateral cálida,
   fondo en penumbra. El texto ocupa el tercio izquierdo, sobre la zona oscura:
   logotipo enorme "LA CUADRA" en serif versales espaciadas, debajo
   "PASTELERÍA & CAFETERÍA / EN VALENCIA" con el "&" en oro.
   Dos botones: "VER LA CARTA" (relleno crema) y "CÓMO LLEGAR" (fantasma, con pin).
   Abajo centrado, un círculo fino con una flecha hacia abajo que invita al scroll.
   Añade, en micro-versales bajo los botones: "ABIERTO AHORA · CIERRA A LAS 21:00"
   con punto verde.

3. CATEGORÍAS, fondo crema. Cinco columnas iguales: BOLLERÍA · EMPANADAS ·
   PASTELERÍA · CAFÉ · PARA COMER. Cada una: icono de línea dibujado a mano,
   nombre en serif versales, dos líneas de descripción en sans pequeña, foto 4:3
   del producto real y enlace "VER MÁS →". En móvil: carrusel horizontal de dos
   columnas y media, con scroll-snap.

4. HOY EN LA CUADRA, fondo beige (sand). Título centrado en serif versales con
   filete oro debajo. Cuatro productos del día en fila: overline en oro con el
   estado ("RECIÉN HORNEADO", "SALIÓ DEL HORNO", "ALGO DULCE", "PARA ACOMPAÑAR"),
   nombre del producto en serif, PRECIO, y foto 4:3.
   Botón oscuro centrado abajo: "VER LO QUE TENEMOS HOY →".
   Bajo el botón, en micro-versales: "ELABORACIÓN DIARIA · SIN CONSERVANTES".

5. ARGENTINA / VALENCIA, bloque oscuro partido en dos mitades a sangre. Izquierda:
   foto de calle de Buenos Aires en penumbra, título "ARGENTINA" en serif versales,
   dos líneas: "Medialunas, alfajores, empanadas. Sabores de infancia y tradición."
   Derecha: foto de Valencia, título "VALENCIA", dos líneas: "Café, barrio, producto
   local y la vida mediterránea que nos inspira."
   Debajo de cada una, una cifra en serif: "1992 · NUESTRO ORIGEN" y
   "2020 · LLEGAMOS A PATRAIX". Un enlace por mitad, no dos botones iguales.

6. RESEÑAS, fondo espresso-soft. A la izquierda la nota media enorme en serif
   ("4,8"), cinco estrellas finas en oro y "SOBRE N RESEÑAS EN GOOGLE".
   A la derecha, tres opiniones reales en columnas separadas por filetes verticales
   de 1px, texto en sans ligera, firma en versales pequeñas. Sin comillas gigantes,
   sin tarjetas con borde.

7. ENCARGOS Y CATERING, fondo crema. Tres columnas con icono de línea:
   "TARTAS POR ENCARGO" / "BANDEJAS PARA LA OFICINA" / "CATERING DE EVENTOS".
   Dos líneas de texto cada una y su propio botón oscuro:
   "PEDIR TARTA →", "PEDIR BANDEJA →", "CONSULTAR CATERING →".
   Aviso en micro-versales: "RESERVA CON 48 H DE ANTELACIÓN".

8. PASA POR LA CUADRA, bloque oscuro. A la izquierda, sobre espresso: título en
   serif versales, dos líneas ("Síguenos en Instagram y descubre nuestro día a día"),
   el handle @lacuadravalencia y un botón fantasma "VER INSTAGRAM →".
   A la derecha, rejilla de 4×2 fotos cuadradas reales del local y del producto,
   separadas por 8px, sin texto encima.

9. VISÍTANOS Y PIE, fondo crema, tres columnas separadas por filetes verticales:
   (a) ilustración de línea de la fachada de La Cuadra con el rótulo, más el
       logotipo debajo;
   (b) dirección completa "C/ dels Campaners, 17 · 46014 Valencia", enlaces a
       Instagram y WhatsApp con iconos de línea, y teléfono pulsable;
   (c) icono de reloj y la tabla de horarios completa (LUNES–VIERNES 07:00–21:00 /
       SÁBADO 08:00–21:00 / DOMINGO 08:00–14:00), con el día actual resaltado en oro,
       y botón oscuro "CÓMO LLEGAR →".
   Barra final sobre espresso: logotipo pequeño a la izquierda; a la derecha, en
   micro-versales: CARTA · SOBRE LA CUADRA · TRABAJA CON NOSOTROS · CONTACTO ·
   AVISO LEGAL · PRIVACIDAD · ALÉRGENOS, y el copyright.

PANTALLA SECUNDARIA — CARTA
Fondo crema, cabecera oscura corta con el logotipo y el título "CARTA".
Barra de categorías fija bajo la cabecera, con scroll horizontal en móvil
(CAFETERÍA · BOLLERÍA · BOCADILLOS · EMPANADAS · PASTELERÍA); la categoría activa
se marca con filete oro al hacer scroll.
Cada categoría es una LISTA, no una rejilla de fotos: nombre en serif versales a la
izquierda, filete de puntos, precio a la derecha en cifras tabulares. Bajo el nombre,
una línea de descripción en sans y su traducción al inglés en cursiva más pequeña y
en on-light-muted. Iconos de alérgenos de línea al final de cada fila.
Al pie: leyenda de alérgenos y "PRECIOS CON IVA INCLUIDO".
En móvil, botón flotante inferior "ENCARGAR →" sobre espresso.

QUÉ NO QUIERO (errores de la versión actual — no los repitas)
- Nada de cuatro galerías seguidas con las mismas fotos repetidas.
- Ninguna foto puede aparecer dos veces en la misma página.
- Nada de tiras de fotos animadas en bucle infinito.
- Nada de vídeo en el hero: una sola foto fija, muy buena.
- Nada de textura de ruido sobre todas las secciones.
- Nada de action sheet estilo iOS con azul de sistema.
- Ninguna sección puede ser sólo fotos sin texto ni precio.
- Ningún botón puede llevar a un WhatsApp genérico: cada CTA, su mensaje.
- Cero texto claro al 60% de opacidad sobre foto.
- Ningún icono relleno ni de set genérico: todos de línea fina.
```

---

## 4. Prompts de seguimiento (uno por iteración)

Stitch trabaja mejor a golpe pequeño. Tras el prompt maestro, itera **de uno en uno**:

1. `Rehaz sólo el hero: foto oscura a sangre de una medialuna con café al fondo, texto en el tercio izquierdo, logotipo "LA CUADRA" en serif versales con tracking 0.14em, claim "PASTELERÍA & CAFETERÍA EN VALENCIA" con el "&" en oro, dos botones y chip verde de "abierto ahora".`
2. `Diseña los cinco iconos de categoría como dibujos de línea de 1,25px, misma familia gráfica: croissant, empanada, porción de tarta, taza de café, sándwich. Sin relleno.`
3. `Rehaz "Hoy en La Cuadra" sobre fondo beige: cuatro productos con overline en oro, nombre en serif y PRECIO visible. Añade filete oro de 40px bajo el título de sección.`
4. `Diseña la ilustración de línea de la fachada de la cafetería para el pie: una tinta, trazo fino, con el rótulo "LA CUADRA VALENCIA" y dos plantas a los lados.`
5. `Dame la versión móvil completa: hero a 85vh, categorías en carrusel con scroll-snap, y el panel de menú a pantalla completa sobre espresso.`
6. `Añade estados: hover, foco de teclado con outline oro de 2px, y el estado "hoy agotado" de una tarjeta de producto.`
7. `Diseña el modal de encargo: selección de tarta, número de raciones, fecha de recogida y nota. Botón final "ENVIAR POR WHATSAPP". Estilo de la marca, sin azul de sistema.`

**Truco:** si Stitch te devuelve algo genérico, no discutas en prosa — reenvía el bloque `---` del sistema de diseño y escribe `aplica esto literalmente, especialmente los radios, el tracking de las versales y la alternancia de fondos`.

---

## 5. Lo que Stitch NO te va a arreglar (hazlo tú después)

Stitch entrega diseño y HTML+Tailwind. Todo esto queda fuera y es **la mitad del problema real**:

**Imágenes (el mayor impacto, con diferencia)**
1. Convertir las 27 fotos a **WebP/AVIF**, a 3 anchos (480 / 960 / 1440) y servirlas con `srcset` + `sizes`.
2. `loading="lazy"` + `decoding="async"` en todas menos la del hero; la del hero con `fetchpriority="high"`.
3. `width` y `height` explícitos en cada `<img>` (elimina el CLS).
4. **Borrar el EXIF** (incluido el GPS) antes de publicar: `exiftool -all= Fotos/*`.
5. Renombrar con semántica: `tarta-chaja.webp`, `medialunas-banadas.webp`.
6. Corregir las extensiones mentirosas (`.png` que son JPEG).
7. Objetivo: **< 1,2 MB** en la primera pantalla. Hoy son 13,2 MB.

**Build**
8. Sacar Tailwind del CDN: `npx tailwindcss -i src.css -o dist.css --minify` y servir CSS estático.
9. Extraer la config de Tailwind a **un solo** `tailwind.config.js` compartido por las tres páginas.
10. Sustituir Material Symbols (fuente completa) por SVG inline de los ~15 iconos usados.
11. Cargar la hoja de Material Symbols **una sola vez** (hoy está duplicada).

**SEO / negocio local**
12. `<meta name="description">` en las tres páginas.
13. Open Graph + Twitter Card con una imagen 1200×630 diseñada a propósito. **Prioridad máxima**: es lo que se ve al compartir por WhatsApp.
14. `application/ld+json` con `Bakery` / `CafeOrCoffeeShop`: `address`, `geo`, `openingHoursSpecification`, `telephone`, `priceRange`, `sameAs` (Instagram), `hasMenu` → `/carta`.
15. Favicon, `robots.txt`, `sitemap.xml`, `<link rel="canonical">`, y unificar `/carta` vs `/carta.html`.
16. Conectar de verdad las reseñas de Google (o cachear el JSON manualmente): hoy `server.js` no se ejecuta en Vercel.
17. Analítica ligera (Plausible o Vercel Analytics) con eventos en cada CTA.

**Legal y accesibilidad**
18. Alérgenos en la carta (obligatorio, Reglamento UE 1169/2011).
19. Aviso legal + política de privacidad enlazados en el pie.
20. Verificar el contraste de cada par con un medidor antes de publicar. El badge actual (4,4:1) y el texto blanco sobre verde WhatsApp (1,98:1) no pasan.
21. Hacer la galería operable con teclado: `<button>` en vez de `<img>` con `onclick`, focus trap en modales, `Escape` cierra **todos** los overlays, `aria-expanded` en el botón de menú.
22. Convertir los 7 `href="#"` con `onclick` en `<button type="button">` reales.

**Contenido**
23. Escribir tres párrafos nuevos de historia (máximo 90 palabras) y una sola "nota del pastelero".
24. Decidir los seis productos de "Hoy en el mostrador" **con su precio**.
25. Sustituir el vídeo de TikTok por una foto propia (o un vídeo grabado y editado en origen).
26. O integrar `menu2.html` en la carta, o borrarlo.
