# Nueva landing page — `index.html`

Home rediseñada de La Cuadra: editorial oscuro, contenido y precios reales, un solo archivo
sin dependencias externas (ni Tailwind CDN ni Google Fonts).

## Verla en local

Desde la carpeta del proyecto, cualquiera de estas tres:

```bash
npx http-server . -p 8080     # y abre http://localhost:8080/index.html
python3 -m http.server 8080   # y abre http://localhost:8080/index.html
node server.js                # y abre http://localhost:5000/index.html
```

Hay que servirla por HTTP, no abrir el archivo con doble clic: `reviews.json` se carga por `fetch`
y el navegador lo bloquea con el protocolo `file://`.

## Qué incluye

| | |
|---|---|
| Peso | **587 KB** la página entera (antes: 13,2 MB) · ~416 KB la primera pantalla |
| Imágenes | 21, todas WebP con `srcset`, `width/height`, `loading="lazy"` y **sin EXIF/GPS** |
| Dependencias | ninguna. CSS y JS propios, fuentes autoalojadas en `fonts/` (115 KB) |
| SEO | meta description, Open Graph + Twitter Card, canonical, favicon, JSON-LD `Bakery` con dirección, geo, horarios, teléfono y carta |
| Accesibilidad | todos los pares de color ≥ 4,5:1 verificados, foco de teclado visible, menú móvil con `aria-expanded`, foco atrapado y cierre con `Escape`, un solo `<h1>`, cero `href="#"`, cero `onclick` |
| Horarios | una sola fuente de verdad en JS (`HORARIO`), en zona horaria Europe/Madrid: pinta el chip «Abierto ahora / Cerrado» y resalta el día actual en las dos tablas |
| CTAs | cada botón lleva su propio mensaje de WhatsApp prerrellenado (tarta, bandeja, catering, reserva de mesa) |
| Mapa | se carga al pulsar, no antes: sin cookies de Google en la primera visita |

## Pendiente (necesita datos tuyos)

1. **Horarios.** `code.html` y `carta.html` se contradicen. La landing usa los de `code.html`
   (L–V 07:00–21:00 · S 08:00–21:00 · D 08:00–14:00). Si no son correctos, cámbialos en **dos sitios**:
   la constante `HORARIO` del `<script>` y las dos tablas `.hours` (Visítanos y pie).
2. **Reseñas de Google.** Rellena `reviews.json` con nota, total y tres reseñas reales:
   ```json
   { "rating": 4.8, "total": 312, "reviews": [ { "author": "Nombre", "text": "..." } ] }
   ```
   La sección se transforma sola en el bloque de tres columnas con la nota y las estrellas.
   Mientras esté vacío se muestra un bloque cerrado con un enlace a Google, sin datos inventados.
3. **Año de llegada a Valencia.** El bloque «Valencia» dice «Patraix · Nuestra casa» para no
   inventar una fecha. Si me dices el año, lo pongo como cifra igual que el 1992.
4. **Aviso legal, privacidad y alérgenos.** El pie lo indica como pendiente. Los alérgenos son
   obligatorios (Reglamento UE 1169/2011).
5. **Publicar.** Cuando quieras que sustituya a la home actual, en `vercel.json`:
   `{ "source": "/", "destination": "/index.html" }`. Hasta entonces `/` sigue sirviendo `code.html`.

## Mantenimiento del día a día

- **«Hoy en La Cuadra»**: los cuatro productos y sus precios están en el HTML, en el bloque
  `<!-- 4 · HOY EN LA CUADRA -->`. Cambiarlos es editar nombre, precio y `src` de la imagen.
- **Fotos nuevas**: pásalas por el mismo tratamiento (recorte 4:3, WebP calidad 72, dos anchos:
  460 y 760 px) para no volver a subir originales de iPhone de 800 KB.
