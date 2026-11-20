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
     DIFICULTAD (cambia solo los números o true/false)
     Si un juego se le hace imposible, súbele aquí los intentos o el tiempo.
       ahorcadoFallos          -> fallos antes de que se coman el malvavisco
       ahorcadoPistaTrasFallos -> la pista sale después de estos fallos (0 = desde el inicio)
       cosidleIntentos         -> intentos para adivinar la palabra
       cosidleModoDificil      -> true: tiene que reusar las letras que ya descubrió
       ajedrezIntentos         -> jugadas equivocadas permitidas
       ajedrezSegundos         -> tiempo para resolver (0 = sin reloj)
       sopaOcultarPalabras     -> true: solo ve la inicial y cuántas letras lleva
       sopaSenuelos            -> true: cuadrícula más grande y palabras falsas parecidas
       sopaSegundos            -> tiempo para encontrar todo (0 = sin reloj)
     ------------------------------------------------------------------- */
  dificultad: {
    ahorcadoFallos: 4,
    ahorcadoPistaTrasFallos: 2,
    cosidleIntentos: 4,
    cosidleModoDificil: true,
    ajedrezIntentos: 2,
    ajedrezSegundos: 600,
    sopaOcultarPalabras: true,
    sopaSenuelos: true,
    sopaSegundos: 240,
  },

  /* -------------------------------------------------------------------
     1. AHORCADO: "Salva el Malvavisco"
     Cada fallo acerca al villano al malvavisco. Los fallos permitidos
     se cambian arriba, en DIFICULTAD.
       palabra -> lo que hay que adivinar (puede llevar espacios)
       pista   -> la ayuda que se muestra
     ------------------------------------------------------------------- */
  ahorcado: [
    { palabra: 'ornitorrinco', pista: 'El animal con el peor diseño de la naturaleza' },
    { palabra: 'dipper', pista: 'Disfraz goated que no sé cómo usasaste un día' },
    { palabra: 'marshmello', pista: 'Resultado que pasaría si no hay time out' },
    { palabra: 'before sunset', pista: 'Película que te encanta' },
    { palabra: 'brownie', pista: 'Un postre que te gusta mucho' },
    { palabra: 'estereofon', pista: 'Bloque blanco que te frena en el arcade' },
    { palabra: 'gambito de dama', pista: 'Apertura de ajedrez con nombre de serie' },
    { palabra: 'grogu', pista: 'Pequeño, verde y fan de las galletas azules' },
    { palabra: 'buenos dias', pista: 'Lo primero que me escribes' },
    { palabra: 'te extraño', pista: 'Lo que más dices en semana de exámenes' },
    { palabra: 'videollamada', pista: 'Cuando no nos podemos ver en persona' },
    { palabra: 'quien cuelga primero', pista: 'La discusión que nadie gana' },
    { palabra: 'foto juntos', pista: 'Lo que siempre te pido en las salidas' },
    { palabra: 'aniversario', pista: 'La fecha que no se te puede olvidar' },
    { palabra: 'palomitas', pista: 'No pueden faltar en la peli' },
    { palabra: 'mensaje de buenas noches', pista: 'Lo último del día' },
    { palabra: 'tomarnos de la mano', pista: 'Lo que hacemos al caminar' },
  ],

  /* -------------------------------------------------------------------
     2. COSI-DLE
     Adivina la palabra (los intentos se cambian arriba, en DIFICULTAD).
     IMPORTANTE: cada palabra debe tener exactamente 5 letras y no llevar
     espacios. Las que no cumplan se ignoran solas.
     ------------------------------------------------------------------- */
  cosidle: [
    'cuaces', 'chess', 'grogu', 'besos', 'pasta', 'torre',
    'reina', 'jaque', 'amigo', 'novio', 'cielo', 'cosi',
    'sushi', 'mabel', 'vader', 'sueño',
    'motor', 'insta', 'blitz', 'tacos', 'negra',
    'citas', 'mimos', 'novia', 'manos', 'risas', 'fotos', 'memes',
    'reels', 'cenar', 'salir', 'playa', 'carta', 'dulce', 'pizza', 'celos', 'chats',
  ],

  /* -------------------------------------------------------------------
     3. EXAMEN SORPRESA (trivia)
       activo    -> false: el examen no aparece en el menú. true: aparece
       titulo    -> el nombre del examen
       segundos  -> tiempo para responder cada pregunta
       cuantas   -> cuántas preguntas salen en cada intento (al azar)
       aprobar   -> cuántas hay que acertar para ganar el ticket
     Cada pregunta lleva 4 opciones y la letra de la correcta: 'A', 'B', 'C' o 'D'.
     En el juego las opciones salen revueltas, así que no se puede memorizar la letra.
     ------------------------------------------------------------------- */
  trivia: {
    activo: false,
    titulo: 'Física 3: Dinámica de Nuestra Relación',
    segundos: 8,
    cuantas: 7,
    aprobar: 6,
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

      // ---------- Sobre nosotros ----------
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
     4. RETO DE AJEDREZ (mate en 6)
       titulo    -> texto que se muestra arriba del tablero
       fen       -> la posición en código FEN (se copia de lichess.org/editor)
       solucion  -> la línea completa, cada jugada como 'salida-llegada':
                    tu jugada, respuesta del rival, tu jugada, ... hasta el mate.
                    El rival juega solo. Un mate en 6 lleva 11 jugadas.
       nota      -> (opcional) texto que sale al terminar
     El turno lo dice el propio FEN: la letra "w" es blancas y "b" es negras.
     Todos son mates forzados de puros jaques, revisados por computadora:
     en cada paso solo una jugada mantiene el mate en 6, y el rival
     siempre elige la defensa que más aguanta.
     ------------------------------------------------------------------- */
  ajedrez: [
    {
      titulo: 'Mate en 6 · Reto 1',
      fen: '4k3/8/4P1r1/6p1/2PpQ3/2R4p/p7/7K w',
      solucion: ['e4-c6', 'e8-f8', 'c6-c8', 'f8-g7', 'c8-d7', 'g7-h8',
                 'c3-h3', 'g6-h6', 'h3-h6', 'h8-g8', 'd7-f7'],
    },
    {
      titulo: 'Mate en 6 · Reto 2',
      fen: '3R4/Pr3r2/4k1p1/Q7/P2b4/6P1/K5p1/3n4 w',
      solucion: ['a5-d5', 'e6-f6', 'd5-d4', 'f6-g5', 'd4-h4', 'g5-f5',
                 'd8-d5', 'f5-e6', 'h4-e4', 'e6-f6', 'e4-e5'],
    },
    {
      titulo: 'Mate en 6 · Reto 3',
      fen: '7K/P1r1r1Pp/P1RBp3/4n3/P4p1p/5P2/1k1q4/8 b',
      solucion: ['e5-g6', 'h8-h7', 'e7-g7', 'h7-h6', 'g7-h7', 'h6-g5',
                 'd2-d5', 'd6-e5', 'd5-e5', 'g5-g4', 'e5-f5'],
    },
    {
      titulo: 'Mate en 6 · Reto 4',
      fen: '8/2n3k1/P7/3P3p/1B6/5P2/3KpQ2/3R4 w',
      solucion: ['f2-g3', 'g7-h7', 'g3-c7', 'h7-h6', 'c7-f4', 'h6-h7',
                 'f4-f5', 'h7-h8', 'b4-c3', 'h8-g8', 'd1-g1'],
    },
    {
      titulo: 'Mate en 6 · Reto 5',
      fen: '7K/Rpk2q2/P4p2/1p6/1B4Q1/2p5/8/3r2N1 w',
      solucion: ['a7-b7', 'c7-c6', 'g4-c8', 'c6-d5', 'b7-b5', 'd5-e4',
                 'c8-g4', 'e4-e3', 'g4-e2', 'e3-f4', 'e2-f3'],
    },
    {
      titulo: 'Mate en 6 · Reto 6',
      fen: 'q7/2P1n3/2n5/2P3k1/1p6/1P1Q1Kp1/6P1/4b3 b',
      solucion: ['c6-d4', 'f3-e3', 'e1-f2', 'e3-d2', 'a8-a2', 'd2-d1',
                 'a2-a1', 'd3-b1', 'a1-b1', 'd1-d2', 'b1-c2'],
    },
    {
      titulo: 'Mate en 6 · Reto 7',
      fen: '2k5/8/8/1P4Q1/r7/1R1pp3/3p4/5K2 w',
      solucion: ['b3-c3', 'a4-c4', 'c3-c4', 'c8-d7', 'g5-f5', 'd7-e8',
                 'c4-c8', 'e8-e7', 'c8-c7', 'e7-e8', 'f5-c8'],
    },
    {
      titulo: 'Mate en 6 · Reto 8',
      fen: '8/1p1k2r1/1p6/R6P/KP3Q2/n4P2/5P2/N1r5 w',
      solucion: ['a5-d5', 'd7-e8', 'f4-e4', 'e8-f8', 'e4-f5', 'f8-e7',
                 'd5-d7', 'e7-e8', 'f5-e6', 'e8-f8', 'd7-d8'],
    },
    {
      titulo: 'Mate en 6 · Reto 9',
      fen: '6b1/2p5/k5q1/3Ppp2/4P3/1pK5/1N1N4/6r1 b',
      solucion: ['g1-c1', 'c3-b3', 'g6-b6', 'b3-a2', 'b6-a5', 'b2-a4',
                 'a5-a4', 'a2-b2', 'c1-c2', 'b2-b1', 'a4-a2'],
    },
    {
      titulo: 'Mate en 6 · Reto 10',
      fen: '7k/2B3p1/qp6/1R6/3n1pP1/6Q1/2n5/2b3K1 w',
      solucion: ['g3-h4', 'h8-g8', 'h4-d8', 'g8-f7', 'd8-d7', 'f7-f8',
                 'c7-d6', 'f8-g8', 'd7-e8', 'g8-h7', 'b5-h5'],
    },
    {
      titulo: 'Mate en 6 · Reto 11',
      fen: '8/6k1/N5r1/2K2P2/3pp3/8/5P2/1r1Q2Rq w',
      solucion: ['d1-d4', 'g7-f8', 'd4-d8', 'f8-f7', 'f5-g6', 'f7-g7',
                 'd8-e7', 'g7-g8', 'e7-f7', 'g8-h8', 'f7-f8'],
    },
    {
      titulo: 'Mate en 6 · Reto 12',
      fen: '8/5P2/r7/ppb1PN2/6R1/8/PP4n1/2kq1R1K b',
      solucion: ['d1-f1', 'h1-h2', 'c5-g1', 'h2-g3', 'f1-f2', 'g3-h3',
                 'f2-f3', 'g4-g3', 'g2-f4', 'h3-h4', 'f3-h5'],
    },
    {
      titulo: 'Mate en 6 · Reto 13',
      fen: '8/2p5/r3p1K1/2Q1p1R1/1P3p2/8/8/5k2 w',
      solucion: ['g5-g1', 'f1-e2', 'c5-c2', 'e2-f3', 'c2-d3', 'f3-f2',
                 'g1-f1', 'f2-g2', 'd3-f3', 'g2-h2', 'f1-h1'],
    },
    {
      titulo: 'Mate en 6 · Reto 14',
      fen: '2q5/p1n3P1/5K1p/1Np5/1Qb3k1/3RB3/2p5/4r3 w',
      solucion: ['b4-c4', 'g4-h5', 'c4-f7', 'h5-g4', 'f7-g6', 'g4-h3',
                 'e3-g1', 'e1-e3', 'd3-e3', 'h3-h4', 'g1-f2'],
    },
    {
      titulo: 'Mate en 6 · Reto 15',
      fen: '8/P1P5/6q1/k1p2Qpr/p7/8/PK6/8 b',
      solucion: ['g6-g7', 'b2-c1', 'g7-a1', 'c1-d2', 'h5-h2', 'd2-e3',
                 'a1-d4', 'e3-f3', 'h2-f2', 'f3-g3', 'd4-h4'],
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
