/* =====================================================================
   DATOS DE LOS MINIJUEGOS
   =====================================================================
   Este archivo lo editas TÚ directamente en GitHub:
     1. Abre este archivo y pulsa el lápiz ✏️ (arriba a la derecha).
     2. Copia una línea de la sección que quieras, pégala debajo y cámbiala.
     3. Pulsa "Commit changes". Vercel publica el cambio en un minuto.

   REGLAS (solo tres):
     - Los textos van entre comillas simples '...'. Si llevan apóstrofo, usa "..."
     - Cada línea termina con una coma.
     - No borres corchetes [ ] ni llaves { }.

   Si algo queda mal escrito, la app no se rompe: usa los juegos de fábrica
   y avisa en la zona de minijuegos.
   ===================================================================== */

export const JUEGOS = {

  /* -------------------------------------------------------------------
     AJUSTES GENERALES
       ticketsMaxPorDescanso -> cuántos tickets se pueden ganar con
                                minijuegos en un mismo descanso
     ------------------------------------------------------------------- */
  ajustes: {
    ticketsMaxPorDescanso: 2,
  },

  /* -------------------------------------------------------------------
     1. AHORCADO: "Salva el Malvavisco"
     Cada fallo acerca al villano al malvavisco. Tiene 6 fallos.
       palabra -> lo que hay que adivinar (puede llevar espacios)
       pista   -> la ayuda que se muestra
     ------------------------------------------------------------------- */
  ahorcado: [
    { palabra: 'india de rey', pista: 'Tu apertura de confianza con negras' },
    { palabra: 'the mentalist', pista: 'La serie que verías otra vez desde el principio' },
    { palabra: 'brown eyed girl', pista: 'La canción que te recuerda a mí' },
    { palabra: 'wii sports', pista: 'Tu primera obsesión gamer' },
    { palabra: 'valery salov', pista: 'Tu ajedrecista favorito (y villano del arcade)' },
    { palabra: 'berenjena', pista: 'La comida que odiabas de niño' },
    { palabra: 'tender la cama', pista: 'Lo primero que haces al despertar' },
    { palabra: 'grageas', pista: 'El peor snack que has probado (cortesía de Harry Potter)' },
    { palabra: 'ornitorrinco', pista: 'El animal con el peor diseño de la naturaleza' },
    { palabra: 'dipper', pista: 'Disfraz goated que no sé cómo usasaste un día' },
    { palabra: 'marshmello', pista: 'Resultado que pasaría si no hay time out' },
    { palabra: 'before sunset', pista: 'Película que te encanta' },
    { palabra: 'brownie', pista: 'Un postre que te gusta mucho' },
    { palabra: 'estereofon', pista: 'Bloque blanco que te frena en el arcade' },
    { palabra: 'gambito de dama', pista: 'Apertura de ajedrez con nombre de serie' },
    { palabra: 'grogu', pista: 'Pequeño, verde y fan de las galletas azules' },
  ],

  /* -------------------------------------------------------------------
     2. COSI-DLE
     Adivina la palabra en 6 intentos.
     IMPORTANTE: cada palabra debe tener exactamente 5 letras y no llevar
     espacios. Las que no cumplan se ignoran solas.
     ------------------------------------------------------------------- */
  cosidle: [
    'cuaces', 'chess', 'grogu', 'besos', 'pasta', 'torre',
    'reina', 'jaque', 'amigo', 'novio', 'cielo', 'cosi',
    'sushi', 'mabel', 'vader', 'sueño',
    'motor', 'insta', 'blitz', 'tacos', 'negra',
  ],

  /* -------------------------------------------------------------------
     3. EXAMEN SORPRESA (trivia)
       titulo    -> el nombre del examen
       segundos  -> tiempo para responder cada pregunta
       cuantas   -> cuántas preguntas salen en cada intento (al azar)
       aprobar   -> cuántas hay que acertar para ganar el ticket
     Cada pregunta lleva 4 opciones y la letra de la correcta: 'A', 'B', 'C' o 'D'.
     ------------------------------------------------------------------- */
  trivia: {
    titulo: 'Física 3: Dinámica de Nuestra Relación',
    segundos: 15,
    cuantas: 5,
    aprobar: 3,
    preguntas: [
      {
        pregunta: 'Si no me pongo alarma un domingo, ¿a qué hora me despierto por inercia?',
        opciones: ['9:00 AM', '7:30 AM', '10:00 AM', '6:00 AM'],
        correcta: 'B',
      },
      {
        pregunta: '¿Cuál es el color favorito del ingeniero de esta app?',
        opciones: ['Verde', 'Café', 'Azul', 'Rojo'],
        correcta: 'C',
      },
      {
        pregunta: '¿Qué película se puede ver 30 minutos con un cupón de la tienda?',
        opciones: ['Before Sunset', 'Interstellar', 'Gravity Falls', 'Star Wars'],
        correcta: 'A',
      },
      {
        pregunta: 'En el arcade, ¿qué enemigo se mueve en "L" como el caballo?',
        opciones: ['Homelander', 'Darth Vader', 'El zombi', 'Valery Salov'],
        correcta: 'D',
      },
      {
        pregunta: '¿Qué te da supervelocidad en el arcade?',
        opciones: ['El plato de pasta', 'Red Bull Green Edition', 'Los Skittles', 'El zapallo'],
        correcta: 'B',
      },
      {
        pregunta: '¿Cuál es el animal con el peor diseño de la naturaleza?',
        opciones: ['El ornitorrinco', 'La jirafa', 'El pez globo', 'El koala'],
        correcta: 'A',
      },
      {
        pregunta: '¿Quiénes resuelven misterios y te inspiran a terminar el bloque?',
        opciones: ['Rick y Morty', 'Finn y Jake', 'Dipper y Mabel', 'Phineas y Ferb'],
        correcta: 'C',
      },

      // ---------- Preguntas con sus respuestas reales ----------
      {
        pregunta: 'Si pudieras comer una sola cosa toda la semana, ¿qué sería?',
        opciones: ['Pizza', 'Dálmata', 'Sushi', 'Tacos al pastor'],
        correcta: 'B',
      },
      {
        pregunta: '¿Cuál es el peor snack que has probado?',
        opciones: ['Takis Fuego', 'Chapulines', 'Las grageas de Harry Potter', 'Pulparindo'],
        correcta: 'C',
      },
      {
        pregunta: '¿Qué pides en una taquería sin pensarlo?',
        opciones: ['Tacos', 'Gringas', 'Quesadillas', 'Tortas'],
        correcta: 'A',
      },
      {
        pregunta: 'Cuando estudias, ¿dulce o salado?',
        opciones: ['Dulce', 'Salado', 'Ninguno, solo agua', 'Los dos al mismo tiempo'],
        correcta: 'B',
      },
      {
        pregunta: '¿Qué bebida nunca falta en tus noches de estudio?',
        opciones: ['Café', 'Red Bull', 'La Coca', 'Té'],
        correcta: 'C',
      },
      {
        pregunta: '¿Qué comida odiabas de niño y ahora te gusta?',
        opciones: ['Brócoli', 'Champiñones', 'Hígado', 'Berenjena'],
        correcta: 'D',
      },
      {
        pregunta: '¿Qué materia te ha hecho sufrir más hasta ahora?',
        opciones: ['Cálculo 1', 'Física 2', 'Estática', 'Álgebra lineal'],
        correcta: 'B',
      },
      {
        pregunta: '¿Qué profe es el más intenso?',
        opciones: ['Uno de mate', 'Uno de física', 'Uno de química', 'Uno de programación'],
        correcta: 'A',
      },
      {
        pregunta: '¿A qué hora estudias mejor?',
        opciones: ['En la tarde', 'En la madrugada', 'Temprano', 'Justo antes del examen'],
        correcta: 'C',
      },
      {
        pregunta: '¿Qué haces cuando ya no puedes concentrarte?',
        opciones: ['Una siesta', 'Hacer algo más', 'Comer', 'Ver reels'],
        correcta: 'B',
      },
      {
        pregunta: 'Si no fueras ingeniero, ¿qué estarías estudiando?',
        opciones: ['Medicina', 'Arquitectura', 'Una ciencia básica, como mate o física pura', 'Música'],
        correcta: 'C',
      },
      {
        pregunta: '¿Cuál ha sido tu calificación más baja?',
        opciones: ['38', '60', '71', '54'],
        correcta: 'D',
      },
      {
        pregunta: '¿Qué proyecto de la carrera te ha gustado más?',
        opciones: ['Un puente', 'Un robot', 'Un motor', 'Una app'],
        correcta: 'C',
      },
      {
        pregunta: '¿Con qué apertura te sientes más cómodo?',
        opciones: ['Siciliana', 'India de Rey', 'Gambito de dama', 'Italiana'],
        correcta: 'B',
      },
      {
        pregunta: 'En ajedrez, ¿blancas o negras?',
        opciones: ['Blancas', 'Negras', 'Las que me toquen', 'Depende del rival'],
        correcta: 'B',
      },
      {
        pregunta: '¿Quién es tu ajedrecista favorito?',
        opciones: ['Magnus Carlsen', 'Hikaru Nakamura', 'Valery Salov', 'Bobby Fischer'],
        correcta: 'C',
      },
      {
        pregunta: '¿Cuál es tu rating más alto en blitz?',
        opciones: ['2240', '1850', '2040', '2400'],
        correcta: 'A',
      },
      {
        pregunta: '¿Qué serie podrías ver otra vez desde el principio?',
        opciones: ['The Office', 'The Mentalist', 'Breaking Bad', 'Dr. House'],
        correcta: 'B',
      },
      {
        pregunta: '¿Cuál es tu personaje favorito de Gravity Falls?',
        opciones: ['Mabel', 'Bill Cipher', 'El tío Stan', 'Dipper'],
        correcta: 'D',
      },
      {
        pregunta: '¿Cuál fue el primer videojuego que te obsesionó?',
        opciones: ['Mario Kart', 'Minecraft', 'Wii Sports', 'FIFA'],
        correcta: 'C',
      },
      {
        pregunta: '¿Qué película te hace llorar aunque no lo admitas?',
        opciones: ['Coco', 'La razón de estar contigo', 'Up', 'Interstellar'],
        correcta: 'B',
      },
      {
        pregunta: 'Si pudieras vivir en un universo de ficción, ¿cuál sería?',
        opciones: ['Star Wars', 'Harry Potter', 'Marvel', 'El Señor de los Anillos'],
        correcta: 'A',
      },
      {
        pregunta: '¿Qué es lo primero que haces al despertar?',
        opciones: ['Ver el celular', 'Tender la cama', 'Bañarte', 'Desayunar'],
        correcta: 'B',
      },
      {
        pregunta: '¿Cuánto tardas en contestar un mensaje cuando estás estudiando?',
        opciones: ['Un minuto', 'Una hora', 'Hasta terminar el pomodoro', 'Al día siguiente'],
        correcta: 'A',
      },
      {
        pregunta: '¿Qué app abres más en el celular?',
        opciones: ['TikTok', 'WhatsApp', 'Instagram', 'Lichess'],
        correcta: 'C',
      },
      {
        pregunta: '¿Qué te pone de malas en dos segundos?',
        opciones: ['Que te interrumpan', 'Tener hambre', 'Perder en blitz', 'Escuchar algo que no querías escuchar'],
        correcta: 'D',
      },
      {
        pregunta: '¿Cuál es tu forma favorita de descansar?',
        opciones: ['Jugando ajedrez', 'Durmiendo', 'Viendo series', 'Comiendo'],
        correcta: 'B',
      },
      {
        pregunta: '¿Pospones la alarma? ¿Cuántas veces?',
        opciones: ['Nunca', 'Sí, una vez', 'Sí, tres veces', 'La apago y sigo dormido'],
        correcta: 'B',
      },
      {
        pregunta: '¿Cuál ha sido tu cita favorita conmigo?',
        opciones: ['El parquecito y luego ir a comer', 'El cine', 'Un café', 'Una película en casa'],
        correcta: 'A',
      },
      {
        pregunta: '¿Qué canción te recuerda a mí?',
        opciones: ['Perfect', 'Yellow', 'Brown Eyed Girl', 'Die With A Smile'],
        correcta: 'C',
      },
      {
        pregunta: '¿Qué lugar te gustaría que conociéramos juntos?',
        opciones: ['Japón', 'París', 'Todo el mundo', 'La playa'],
        correcta: 'C',
      },
      {
        pregunta: '¿Qué es lo que más te gusta de cuando nos vemos?',
        opciones: ['La comida', 'El tiempo de calidad', 'Los besos', 'Los brownies'],
        correcta: 'B',
      },
      {
        pregunta: '¿Cuál de mis apodos para ti es tu favorito?',
        opciones: ['Cosi', 'Marshmello', 'Grogu', 'Mati'],
        correcta: 'D',
      },
      {
        pregunta: 'Si tuvieras que describirnos con una película, ¿cuál sería?',
        opciones: ['Before Sunset', 'Titanic', 'Up', 'La La Land'],
        correcta: 'A',
      },
    ],
  },

  /* -------------------------------------------------------------------
     4. RETO DE AJEDREZ (mate en 1)
       titulo    -> texto que se muestra arriba del tablero
       fen       -> la posición en código FEN (se copia de lichess.org/editor)
       solucion  -> casilla de salida, guion, casilla de llegada: 'h5-f7'
       nota      -> (opcional) explicación que sale al resolverlo
     El turno lo dice el propio FEN: la letra "w" es blancas y "b" es negras.
     ------------------------------------------------------------------- */
  ajedrez: [
    {
      titulo: 'Mate del pastor',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
      solucion: 'h5-f7',
      nota: 'La dama toma en f7 protegida por el alfil.',
    },
    {
      titulo: 'Mate del pasillo',
      fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
      solucion: 'e1-e8',
      nota: 'Los propios peones encierran al rey.',
    },
    {
      titulo: 'Mate del loco',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2',
      solucion: 'd8-h4',
      nota: 'El mate más rápido del ajedrez.',
    },
    {
      titulo: 'Mate de la coz',
      fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
      solucion: 'g5-f7',
      nota: 'El caballo da mate y el rey queda encerrado por sus propias piezas.',
    },
  ],

  /* -------------------------------------------------------------------
     5. SOPA DE LETRAS
     Cada mapa es un nivel. Puedes agregar mapas nuevos copiando un bloque.
       id      -> nombre corto sin espacios (no cambies 'apodos' ni 'carino':
                  algunos cupones dependen de ellos)
       titulo  -> cómo se llama el mapa
       palabras -> sin espacios; máximo 12 letras cada una
     ------------------------------------------------------------------- */
  sopa: [
    { id: 'apodos', titulo: 'Mapa 1: Apodos', palabras: ['cosi', 'marshmello', 'grogu', 'besito', 'precioso', 'mivida'] },
    { id: 'carino', titulo: 'Mapa 2: Cariño', palabras: ['tequiero', 'teamo', 'sosasombroso'] },
  ],
};
