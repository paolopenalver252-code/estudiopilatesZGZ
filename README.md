# Estudio Pilates ZGZ — demo de rediseño web

Demo independiente para presentar una propuesta de rediseño a Estudio Pilates ZGZ (C/ San Miguel, 29 · Zaragoza).
No modifica la web oficial (`estudiopilateszgz.com`) ni ningún otro proyecto.

## Cómo verla

```bash
npm install        # solo hace falta para regenerar imágenes o lanzar las pruebas
npm run dev        # http://localhost:4747
npm run check      # en otra terminal, con el servidor en marcha: pruebas + capturas en ./screenshots
npm run images     # regenera las imágenes WebP desde _source/photos
```

Es HTML, CSS y JavaScript sin framework ni paso de compilación: la carpeta se puede publicar tal cual
(Vercel, Netlify o cualquier hosting estático). `vercel.json` y `.vercelignore` ya están preparados.

## Fuentes consultadas (15/10/2026)

- Web oficial: `estudiopilateszgz.com`, `/calendario/`, `/aviso-legal/`, `/politica-de-privacidad/` (navegador real).
- Ficha de Google Maps «ESTUDIO PILATES REFORMER» (C. de S. Miguel, 29, 50001): 5,0 ★, 6 opiniones; horario y 3 opiniones visibles.
- Búsquedas de redes sociales: no se encontró ningún perfil atribuible con seguridad, así que no se enlaza ninguno.
- Referencias de diseño: nimarapilates.com, reformedbody.co.uk, lpspilates.nl (solo principios, nada copiado).

## Diagnóstico de la web actual

**Funciona y conviene conservar:** fotografías profesionales y reales del estudio; logotipo propio; mensaje claro
(«Pilates clásico», aparatos, grupos reducidos); botón de WhatsApp; aviso legal publicado.

**Problemas comprobados:**
1. **El enlace de dirección lleva a otro sitio.** `maps.app.goo.gl/E42AVvPSpaTAXDuWA` abre «C. San Miguel, 29, **50620** Zaragoza» (Casetas, ~13 km), no el estudio.
2. **La reserva no carga.** En `/calendario/` el formulario de Bookly se queda en el icono de carga (respuesta AJAX con HTML y JSON mezclados y error JS sin capturar).
3. **Banner de cookies roto.** CookieYes lanza 4 errores en consola («Looks like your website URL has changed»); hay dos scripts de CookieYes y dos IDs de Google Analytics.
4. **Enlace «Política de cookies» apunta a la portada.**
5. **El aviso legal contiene una nota de plantilla sin editar** («Aquí deberías enlazar a una página separada…»).
6. **SEO/accesibilidad:** la portada no tiene ningún encabezado (H1–H6); 18 de 23 imágenes sin texto alternativo; sin datos estructurados de negocio local; `maximum-scale=1` impide ampliar en móvil.
7. **Horario inconsistente:** la web dice L–V 8:30–11:30 y 15:00–21:00; Google dice L–V 8:30–21:00.
8. Peso: 39 scripts y 17 hojas de estilo en la portada (WordPress + Betheme + Revolution Slider + Bookly).

**Opinión de diseño (no son fallos):** el texto va sobre una foto velada que resta contraste y protagonismo a las
fotografías; no hay navegación visible en la cabecera; falta un recorrido claro hacia la primera clase.

## Dirección visual

- **Concepto:** «Pilates clásico, enseñado de cerca»: precisión, corrección y acompañamiento, que es lo que repiten las reseñas.
- **Paleta tomada del propio local** (madera clara, tapicería rosada, paredes marfil) en lugar del verde oliva propuesto, que no aparece en el espacio:
  marfil `#F6F2EC` (fondo), arena `#EBE3D8` (secciones alternas), carbón `#2A2725` (texto y botón), arcilla `#93533F` (acento, contraste 5,3:1), rosa `#D9B8AA` (acento sobre oscuro).
- **Tipografía:** Instrument Serif (titulares, cursiva para el énfasis) + Hanken Grotesk (texto). Autoalojadas, sin Google Fonts externo.
- **Ritmo:** hero editorial asimétrico → franja de datos → método (texto fijo + foto) → equipamiento en composición escalonada → galería del local → opiniones en bloque oscuro → primera clase y FAQ → contacto.

## Secciones

Cabecera fija con menú móvil accesible · Hero · Datos clave · El método · Equipamiento (Reformer, Cadillac/Trapecio, Wunda Chair, Mat) ·
El estudio y Cintia · Opiniones (3 reales de Google) · Tu primera clase + FAQ · Contacto con formulario · Pie · Barra fija móvil (WhatsApp / Llamar).

El formulario **no envía datos a ningún servidor**: valida, compone el mensaje y abre WhatsApp (o el correo) para que la persona lo envíe. No hay confirmaciones falsas.

## Imágenes

Todas son fotografías publicadas por el propio estudio en `estudiopilateszgz.com/wp-content/uploads/2025/10/Detalle-XX.jpg`
y su logotipo (`Logo_negro_pilates_estudio`). Se han recortado y convertido a WebP en varios tamaños (`scripts/build-images.mjs`; 4–100 KB cada una).
No se ha usado ninguna imagen de stock ni de otros centros. Los originales están en `_source/` (excluido de git).

## Pruebas ejecutadas

`npm run check` (Playwright + Chrome instalado): **54/54 correctas**. Se ha probado a 320, 375, 390, 768, 1366, 1440 y 1920 px.
Comprueba que no haya desplazamiento horizontal, que todas las imágenes carguen, que los objetivos táctiles midan al menos 44 px y que haya un único H1.
También revisa el menú móvil (abrir, foco, cierre al navegar), la consola sin errores, que no haya peticiones fallidas,
la validación del formulario y el mensaje de WhatsApp, y title, description, OG y JSON-LD.
Manualmente: navegación por teclado (enlace «Saltar al contenido» y foco visible) y los enlaces de Google Maps, que abren la ficha correcta.
No hay lint ni build porque el proyecto no tiene paso de compilación.

## Pendiente de confirmar con el estudio antes de publicar

- **Horario real** (web y Google no coinciden). La demo usa el de la web.
- **Formación de Cintia:** la web dice «Profesora certificada con formación clásica». Falta saber qué certificación y de qué escuela; la demo solo dice «formación en Pilates clásico».
- **Quién aparece en las fotos:** hay dos profesoras distintas en las imágenes; no se identifica a ninguna como Cintia. Conviene un retrato de Cintia dando clase.
- **Clase de prueba:** la web la ofrece; confirmar condiciones (precio y duración). No se publica ninguna tarifa.
- **Grupos reducidos:** confirmar el número máximo de alumnos si se quiere concretar.
- **Fotos de Mat** y de la fachada exterior (no hay en la web).
- **Legal:** completar la política de cookies, revisar el aviso legal y decidir si se mantiene la analítica (y entonces, un banner de cookies que funcione).
- Antes de publicar en el dominio: quitar `noindex` (index.html, robots.txt, vercel.json) y poner la URL absoluta en `og:image`.

## Publicación

No se ha desplegado: en este equipo no hay sesión de Vercel. Para publicar la demo en una URL aparte:
`npx vercel` desde esta carpeta (pedirá iniciar sesión). La demo lleva `noindex` para no competir con la web oficial en Google.
