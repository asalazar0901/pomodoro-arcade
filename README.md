# 🍅 Pomodoro Arcade

Temporizador Pomodoro gamificado con minijuegos y cupones canjeables. Hecho en HTML, CSS y JavaScript puro (sin dependencias ni build), listo para Vercel.

## Qué incluye

- **Pomodoro 25/10** con frases motivacionales. Cada bloque de 25 min completo da 1 🎟️.
- **Tiempos editables** en ⚙ Ajustes: el bloque de estudio no baja de 15 minutos sin el código de seguridad. Con el código también se abren los minijuegos fuera del descanso (sin dar tickets). El código se cambia en `js/security.js`.
- **Agenda**: nota del día, cuenta regresiva de eventos (torneos, exámenes, entregas) y pendientes por categoría.
- **Temarios de examen**: materias que se abren como carpetas, cada una con su checklist de temas. Se pueden agregar y quitar materias y temas, marcar lo ya estudiado y elegir con 🎯 qué tema se estudia en el Pomodoro. Cada bloque terminado se anota en ese tema.
- **Minijuegos solo en el descanso**:
  - Sopa de letras con generador automático (Mapa 1: Apodos, Mapa 2: Cariño). Completarla da +1 🎟️.
  - Arcade de supervivencia en Canvas. Llegar a 300 puntos da +1 🎟️.
  - Máximo 1 ticket por juego en cada descanso.
- **Tienda de cupones**: cada cupón pide tickets **y** una misión cumplida. Al canjearlo se abre una tarjeta lista para captura de pantalla.
- Todo el progreso se guarda en el navegador (`localStorage`).

### Cupones y misiones

| Cupón | Precio | Misión |
|---|---|---|
| Brownie | 2 🎟️ | 2 pomodoros en total |
| 30 min de Before Sunset | 3 🎟️ | Completar la sopa de letras del Mapa 2 (Cariño) |
| Hoy yo lavo los platos | 4 🎟️ | Racha de 3 pomodoros en un mismo día |
| Masaje de espalda | 5 🎟️ | 400 puntos en el arcade |
| El Favor Absoluto | 10 🎟️ | 12 pomodoros, 700 pts en arcade y las dos sopas de letras |

Para cambiar premios, precios o misiones edita el array `COUPON_CATALOG` en `js/store.js`.

## Editar notas y eventos desde GitHub

Las notas para alegrarle el día y los eventos de la cuenta regresiva viven en dos archivos pensados para editarse desde la web de GitHub, sin programar:

- `contenido/notas.js`: una nota por línea. También acepta notas para una fecha exacta.
- `contenido/eventos.js`: nombre, fecha y categoría de cada evento.

Abre el archivo en GitHub, pulsa el lápiz ✏️, cambia lo que quieras y pulsa **Commit changes**. Vercel publica el cambio solo. Cada archivo trae las instrucciones arriba. Si un archivo queda con un error de escritura, la app sigue funcionando y la Agenda avisa cuál revisar.

## Estructura

```
index.html
css/styles.css
js/app.js          Controlador principal y UI
js/timer.js        Pomodoro y frases
js/store.js        Tickets, cupones, misiones y datos de temarios
js/syllabus.js     Temarios de examen (materias y temas)
js/security.js     Código de seguridad
js/wordsearch.js   Sopa de letras
js/arcade.js       Arcade en Canvas
js/agenda.js       Agenda: nota del día, cuenta regresiva y pendientes
contenido/notas.js    Notas del día (editable en GitHub)
contenido/eventos.js  Eventos de la cuenta regresiva (editable en GitHub)
assets/            Sprites
```

## Publicar en Vercel

1. Entra a <https://vercel.com/new> con tu cuenta.
2. En **Import Git Repository** elige este repositorio. Si no aparece, pulsa **Adjust GitHub App Permissions** y dale acceso.
3. En **Framework Preset** deja **Other**. No hace falta comando de build ni carpeta de salida.
4. Pulsa **Deploy**. En menos de un minuto tendrás la URL para compartir.

Cada vez que se suba un cambio a `main`, Vercel vuelve a publicar solo.

## Probar en tu computadora

Los módulos de JavaScript necesitan un servidor local (abrir el archivo con doble clic no funciona):

```bash
npx serve .
# o
python3 -m http.server 8000
```

**Modo demo:** agrega `?demo=1` a la URL y el bloque de trabajo dura 25 segundos y el descanso 60, para probar todo sin esperar.

## Poner tus sprites

1. Guarda cada PNG con fondo transparente en `assets/`.
2. Abre `js/arcade.js` y busca el bloque `SPRITES` al inicio. Cambia `src: null` por la ruta de tu imagen, por ejemplo:

```js
homelander: { src: 'assets/homelander_v5.2.png', frames: 1, size: 44 },
```

Si la imagen es una tira horizontal de animación, pon en `frames` cuántos cuadros trae. Mientras `src` sea `null` el juego dibuja un placeholder en pixel art.

El ingeniero (`assets/ingeniero_v5.2.png`) y el zombi (`assets/zombi_v5.2.png`) ya están puestos. El ingeniero del reloj se cambia en `css/styles.css`, clase `.walker`.

## Conectar Google Sheets o Firebase más adelante

La función `loadCatalog()` en `js/store.js` es el único punto que hay que tocar: hoy devuelve el array local y trae comentado un ejemplo de `fetch` para Sheets y otro para Firebase.
