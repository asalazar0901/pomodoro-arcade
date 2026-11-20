# 🍅 Pomodoro Arcade

Temporizador Pomodoro gamificado con minijuegos y cupones canjeables. Hecho en HTML, CSS y JavaScript puro, empaquetado con Vite y listo para Vercel.

## Qué incluye

- **Pomodoro 25/10** con frases motivacionales. Cada bloque de 25 min completo da 1 🎟️.
- **Tiempos editables** en ⚙ Ajustes: el bloque de estudio no baja de 15 minutos sin el código de seguridad. Con el código también se abren los minijuegos fuera del descanso (sin dar tickets). El código se cambia en `js/security.js`.
- **Agenda**: nota del día, cuenta regresiva de eventos (torneos, exámenes, entregas) y pendientes por categoría. Todo se puede agregar, editar y quitar desde la app.
- **Sonidos** 8-bit sintetizados, con botón de silencio. Se pueden cambiar por archivos `.mp3` en `js/audio.js`.
- **Easter egg anti-trampas**: si alguien intenta regalarse tickets desde la consola o editando el almacenamiento, sale un mensaje y sus próximas 3 partidas del arcade son todo Darth Vader.
- **Temarios de examen**: materias que se abren como carpetas, cada una con su checklist de temas. Se pueden agregar y quitar materias y temas, marcar lo ya estudiado y elegir con 🎯 qué tema se estudia en el Pomodoro. Cada bloque terminado se anota en ese tema.
- **Minijuegos solo en el descanso** (máximo 2 tickets de minijuegos por descanso, ajustable):
  - Salva el malvavisco: ahorcado donde un villano camina hacia el malvavisco con cada fallo. 4 fallos y la pista se abre hasta el segundo.
  - Cosi-dle: adivinar una palabra de 5 letras en 4 intentos, en modo difícil (hay que reusar las letras descubiertas).
  - Examen sorpresa: 7 preguntas de 8 segundos, se aprueba con 6. Las opciones salen revueltas.
  - Reto de ajedrez: mate en 2 contra reloj (2 min, 1 intento). El rival contesta solo. Posiciones verificadas con motor.
  - Sopa de letras con generador automático (Mapa 1: Apodos, Mapa 2: Cariño): cuadrícula grande, palabras señuelo, solo se ve la inicial de cada palabra y hay 4 minutos. Completarla da +1 🎟️.
  - Arcade de supervivencia en Canvas. Llegar a 300 puntos da +1 🎟️.
  - Máximo 1 ticket por juego en cada descanso.
- **Tienda de cupones**: cada cupón pide tickets **y** una misión cumplida. Al canjearlo se abre una tarjeta lista para captura de pantalla.
- Todo el progreso se guarda en el navegador (`localStorage`).

### Cupones y misiones

| Cupón | Precio | Misión |
|---|---|---|
| Brownie | 12 🎟️ | 2 pomodoros en total |
| Skittles | 12 🎟️ | Completar la sopa de letras del Mapa 1 (Apodos) |
| Gomitas | 12 🎟️ | 3 pomodoros en total |
| Red Bull | 13 🎟️ | Racha de 2 pomodoros en un mismo día |
| 30 min de Before Sunset | 13 🎟️ | Completar la sopa de letras del Mapa 2 (Cariño) |
| Hoy yo lavo los platos | 14 🎟️ | Racha de 3 pomodoros en un mismo día |
| Masaje de 5 minutos | 12 🎟️ | 4 pomodoros en total |
| Masaje de 10 minutos | 13 🎟️ | 250 puntos en el arcade |
| Masaje de 15 minutos | 15 🎟️ | 400 puntos en el arcade |
| El Favor Absoluto | 23 🎟️ | 12 pomodoros, 700 pts en arcade y las dos sopas de letras |

Para cambiar premios, precios o misiones edita el array `COUPON_CATALOG` en `js/store.js`.

## Editar los minijuegos desde GitHub

Todas las palabras, pistas, preguntas, retos de ajedrez y sopas de letras viven en un solo archivo: `public/contenido/juegos.js`. Ábrelo en GitHub, pulsa el lápiz ✏️, copia una línea de la sección que quieras, cámbiala y pulsa **Commit changes**. Arriba del archivo están las reglas y en cada sección qué significa cada campo. Si algo queda mal escrito, la app usa los juegos de fábrica y avisa en la zona de minijuegos.

La dificultad de todos (fallos, intentos, tiempos, señuelos) está en el bloque `dificultad` al inicio de ese archivo. Si algo se vuelve imposible, sube ahí los números.

Para los retos de ajedrez, arma la posición en <https://lichess.org/editor>, copia el código FEN que aparece abajo y escribe la línea como lista de jugadas `casilla-casilla`: `['f4-f7', 'h7-h8', 'f7-g7']` (tu jugada, la respuesta del rival, tu mate). Un mate en 1 lleva una sola: `['h5-f7']`.

## Editar notas y eventos

Hay dos formas, y se complementan:

- **Desde la app** (pestaña Agenda): agregar, editar y quitar notas, eventos y pendientes. Estos cambios se guardan solo en el navegador donde se hacen.
- **Desde GitHub**: los predeterminados, que llegan a cualquier dispositivo. Viven en dos archivos pensados para editarse sin programar:
  - `public/contenido/notas.js`: una nota por línea. También acepta notas para una fecha exacta.
  - `public/contenido/eventos.js`: nombre, fecha y categoría de cada evento.

Abre el archivo en GitHub, pulsa el lápiz ✏️, cambia lo que quieras y pulsa **Commit changes**. Vercel publica el cambio solo. Cada archivo trae las instrucciones arriba. Si un archivo queda con un error de escritura, la app sigue funcionando y la Agenda avisa cuál revisar.

## Estructura

```
index.html
package.json           Scripts de Vite (dev, build, preview)
vite.config.js
vercel.json            Le dice a Vercel que compile con Vite
css/styles.css
js/app.js              Controlador principal y UI
js/timer.js            Pomodoro, frases y duraciones
js/store.js            Tickets, cupones, misiones y datos guardados
js/syllabus.js         Temarios de examen
js/agenda.js           Agenda: notas, cuenta regresiva y pendientes
js/security.js         Código de seguridad
js/audio.js            AudioController (efectos de sonido)
js/anticheat.js        Easter egg anti-trampas
js/wordsearch.js       Sopa de letras
js/minigames.js        Ahorcado, Cosi-dle, examen sorpresa y reto de ajedrez
js/gamedata.js         Carga y revisa public/contenido/juegos.js
js/arcade.js           Arcade en Canvas
public/assets/         Sprites
public/sounds/         Tus .mp3 (opcional)
public/contenido/      Notas, eventos y datos de minijuegos editables en GitHub
```

## Publicar en Vercel

1. Entra a <https://vercel.com/new> con tu cuenta.
2. En **Import Git Repository** elige este repositorio. Si no aparece, pulsa **Adjust GitHub App Permissions** y dale acceso.
3. Vercel detecta **Vite** solo. No cambies nada: `vercel.json` ya indica el comando de build y la carpeta de salida.
4. Pulsa **Deploy**. En menos de un minuto tendrás la URL para compartir.

Cada vez que se suba un cambio a `main`, Vercel vuelve a publicar solo.

## Probar en tu computadora

Necesitas [Node.js](https://nodejs.org) 18 o más reciente.

```bash
npm install
npm run dev      # abre la app en http://localhost:5173
npm run build    # genera la versión final en /dist
```

**Modo demo:** agrega `?demo=1` a la URL y el bloque de trabajo dura 25 segundos y el descanso 60, para probar todo sin esperar.

## Poner tus sprites

1. Guarda cada PNG con fondo transparente en `public/assets/`.
2. Abre `js/arcade.js` y busca el bloque `SPRITES` al inicio. Cambia `src: null` por la ruta de tu imagen, por ejemplo:

```js
homelander: { src: 'assets/homelander_v5.2.png', frames: 1, size: 44 },
```

Si la imagen es una tira horizontal de animación, pon en `frames` cuántos cuadros trae. Mientras `src` sea `null` el juego dibuja un placeholder en pixel art.

El ingeniero (`public/assets/ingeniero_v5.2.png`) y el zombi (`public/assets/zombi_v5.2.png`) ya están puestos. El ingeniero del reloj se cambia en `css/styles.css`, clase `.walker`.

## Conectar Google Sheets o Firebase más adelante

La función `loadCatalog()` en `js/store.js` es el único punto que hay que tocar: hoy devuelve el array local y trae comentado un ejemplo de `fetch` para Sheets y otro para Firebase.
