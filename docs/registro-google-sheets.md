# Registro de Mati en tu Google Sheets 💙

Cada vez que Mati termina un pomodoro, gana o pierde un juego, desbloquea una insignia, recibe un castigo, compra un cupón o anota una victoria, un ELO, una meta o un torneo, la app agrega una fila a tu hoja:

| Fecha | Tipo | Detalle | Tickets |
|---|---|---|---|
| 23/11/2026 20:14 | Pomodoro | Terminó un bloque de 25 min en modo Ajedrez | 12 |
| 23/11/2026 20:20 | Minijuego | Ganó Críptico. +1 🎟️ | 13 |

Todo es gratis (Google Sheets + Apps Script). Toma unos 5 minutos y se hace una sola vez.

## 1. Crea la hoja
1. Entra a [sheets.new](https://sheets.new) con tu cuenta de Google. Ponle de nombre algo como «Registro de Mati».

## 2. Pega el código
1. En la hoja, abre **Extensiones → Apps Script**.
2. Borra lo que aparece y pega todo el contenido de [`docs/registro-apps-script.gs`](registro-apps-script.gs).
3. Dale a 💾 **Guardar**.

## 3. Publícalo como aplicación web
1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engranaje ⚙️ de «Seleccionar tipo», elige **Aplicación web**.
3. Llena así:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
4. **Implementar**. Google te pedirá autorizar el acceso a tus hojas: acepta con tu cuenta. Si sale «Google no ha verificado esta aplicación», toca **Configuración avanzada → Ir a … (no seguro)**. Es seguro: el código es tuyo y solo escribe en esta hoja.
5. Copia la **URL de la aplicación web** (termina en `/exec`).

## 4. Pégala en GitHub
1. En GitHub abre `public/contenido/registro.js` y toca el lápiz ✏️.
2. Pega la URL entre las comillas:
   ```js
   export const REGISTRO = { hojaUrl: 'https://script.google.com/macros/s/XXXX/exec' };
   ```
3. **Commit changes**. En un minuto Vercel publica el cambio.

Listo. Desde ahí Mati verá en «Tu progreso» el aviso «💙 Tu novia ve tus avances» y tú verás las filas llegar a la pestaña **Registro** de tu hoja.

## Bueno saber
- **Para apagarlo**, deja `hojaUrl: ''` en GitHub.
- **Sin internet**, los eventos esperan en su teléfono y se envían cuando vuelva la conexión.
- **Si cambias el código de Apps Script**, usa **Implementar → Gestionar implementaciones → ✏️ → Versión: nueva**, para que la URL siga siendo la misma.
- **La URL queda visible en el repositorio.** Quien la tenga solo podría *agregar* filas a esa hoja, no leerla ni ver tu Drive. Si algún día te molesta, crea una implementación nueva y cambia la URL.
- **Los eventos de antes de activarlo no se envían.** El registro empieza el día que pegues la URL.
