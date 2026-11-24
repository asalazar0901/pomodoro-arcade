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
       ocultar               -> juegos que no aparecen en el menú. Opciones:
                                'frase', 'criptico', 'ahorcado', 'cosidle',
                                'ajedrez', 'arcade'. Lista vacía [] = todos
     ------------------------------------------------------------------- */
  ajustes: {
    ticketsMaxPorDescanso: 2,
    ocultar: ['frase'],
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
       criptoPistas            -> letras que ya vienen resueltas en la frase cifrada
       cripticoPistas          -> ayudas del críptico (0 a 3): tipo, definición y primera letra
       cripticoIntentos        -> respuestas equivocadas permitidas en el críptico
       criptoErrores           -> veces que puede llenar todo mal antes de perder
     ------------------------------------------------------------------- */
  dificultad: {
    ahorcadoFallos: 4,
    ahorcadoPistaTrasFallos: 2,
    cosidleIntentos: 4,
    cosidleModoDificil: true,
    ajedrezIntentos: 2,
    ajedrezSegundos: 600,
    sopaOcultarPalabras: false,
    sopaSenuelos: true,
    sopaSegundos: 210,
    criptoPistas: 2,
    criptoErrores: 3,
    cripticoPistas: 3,
    cripticoIntentos: 3,
  },

  /* -------------------------------------------------------------------
     1. AHORCADO: "Salva el Malvavisco" (por temas)
     Cada partida elige un tema al azar y una palabra de ese tema.
     Cada fallo acerca al villano al malvavisco (fallos: ver DIFICULTAD).
       tema     -> nombre que se muestra arriba
       fondo    -> el dibujo de fondo. Opciones:
                   'espacio' (estrellas), 'tablero' (ajedrez), 'biblioteca',
                   'plano' (azul de ingeniería), 'musica' (discos), 'cafe' (normal)
       palabras -> lista de { palabra, pista }. La palabra puede llevar espacios.
     Para un tema nuevo copia un bloque completo { tema ... }, desde la llave
     que abre hasta la que cierra, y pégalo debajo.
     ------------------------------------------------------------------- */
  ahorcado: [
    {
      tema: 'Star Wars',
      fondo: 'espacio',
      palabras: [
        { palabra: 'halcon milenario', pista: 'La nave que hizo la carrera de Kessel en menos de doce pársecs' },
        { palabra: 'tatooine', pista: 'Planeta desértico con dos soles' },
        { palabra: 'sable de luz', pista: 'El arma elegante de un caballero jedi' },
        { palabra: 'chewbacca', pista: 'Copiloto peludo que solo gruñe' },
        { palabra: 'estrella de la muerte', pista: 'Estación espacial capaz de destruir planetas' },
        { palabra: 'palpatine', pista: 'El emperador que movía los hilos desde el principio' },
        { palabra: 'mandaloriano', pista: 'Cazarrecompensas con casco que nunca se quita' },
        { palabra: 'hiperespacio', pista: 'Por donde viajan las naves más rápido que la luz' },
        { palabra: 'endor', pista: 'Luna boscosa donde viven los ewoks' },
        { palabra: 'droide', pista: 'Lo que son R2-D2 y C-3PO' },
        { palabra: 'obi wan kenobi', pista: 'Maestro de Anakin y luego de Luke' },
      ],
    },
    {
      tema: 'Historia del ajedrez',
      fondo: 'tablero',
      palabras: [
        { palabra: 'chaturanga', pista: 'Juego de la India, el abuelo del ajedrez' },
        { palabra: 'deep blue', pista: 'Computadora de IBM que le ganó a Kasparov en 1997' },
        { palabra: 'ruy lopez', pista: 'Sacerdote español que da nombre a una apertura' },
        { palabra: 'capablanca', pista: 'Campeón cubano famoso por su juego limpio y natural' },
        { palabra: 'bobby fischer', pista: 'Le ganó el título a Spassky en Reikiavik en 1972' },
        { palabra: 'la inmortal', pista: 'Partida de Anderssen contra Kieseritzky de 1851' },
        { palabra: 'steinitz', pista: 'Primer campeón mundial oficial, en 1886' },
        { palabra: 'judit polgar', pista: 'La mejor jugadora de la historia' },
        { palabra: 'mijail tal', pista: 'El mago de Riga, rey de los sacrificios' },
        { palabra: 'piezas de lewis', pista: 'Piezas medievales de marfil halladas en una isla de Escocia' },
        { palabra: 'elefante', pista: 'Así se llamaba antes la pieza que hoy es el alfil' },
      ],
    },
    {
      tema: 'Cultura general',
      fondo: 'biblioteca',
      palabras: [
        { palabra: 'frida kahlo', pista: 'Pintora mexicana de los autorretratos' },
        { palabra: 'teotihuacan', pista: 'Ciudad de las pirámides del Sol y de la Luna' },
        { palabra: 'don quijote', pista: 'Caballero que confundió molinos con gigantes' },
        { palabra: 'machu picchu', pista: 'Ciudad inca en lo alto de los Andes' },
        { palabra: 'mona lisa', pista: 'La sonrisa más famosa del Louvre' },
        { palabra: 'chichen itza', pista: 'Ciudad maya con la pirámide de Kukulkán' },
        { palabra: 'shakespeare', pista: 'Escribió Romeo y Julieta' },
        { palabra: 'gran muralla', pista: 'Construcción china de miles de kilómetros' },
        { palabra: 'beethoven', pista: 'Compositor que siguió creando ya sordo' },
        { palabra: 'olimpiadas', pista: 'Juegos que nacieron en la antigua Grecia' },
        { palabra: 'sor juana', pista: 'Monja y poeta novohispana del billete de 200' },
      ],
    },
    {
      tema: 'Ciencia e ingeniería',
      fondo: 'plano',
      palabras: [
        { palabra: 'termodinamica', pista: 'La rama de la física de la energía y el calor' },
        { palabra: 'entropia', pista: 'Lo que siempre aumenta en un sistema aislado' },
        { palabra: 'puente colgante', pista: 'Estructura sostenida por cables, como el Golden Gate' },
        { palabra: 'nikola tesla', pista: 'El inventor de la corriente alterna' },
        { palabra: 'marie curie', pista: 'Ganó dos premios Nobel en ciencias distintas' },
        { palabra: 'transistor', pista: 'Piececita que está en la base de toda la electrónica' },
        { palabra: 'aceleracion', pista: 'Cambio de la velocidad en el tiempo' },
        { palabra: 'torque', pista: 'Fuerza que hace girar; lo que presume un motor' },
        { palabra: 'ley de ohm', pista: 'V = I · R' },
        { palabra: 'isaac newton', pista: 'Según la leyenda, le cayó una manzana' },
        { palabra: 'resistencia de materiales', pista: 'Materia de ingeniería sobre cuánto aguanta una viga' },
      ],
    },
    {
      tema: 'Nuestras canciones',
      fondo: 'musica',
      palabras: [
        { palabra: 'say you wont let go', pista: 'De James Arthur, en nuestra playlist' },
        { palabra: 'all of me', pista: 'De John Legend, en nuestra playlist' },
        { palabra: 'perfect', pista: 'De Ed Sheeran, en nuestra playlist' },
        { palabra: 'romeo y julieta', pista: 'De Pablo Lacadiere, en nuestra playlist' },
        { palabra: 'caminar de tu mano', pista: 'De Río Roma con Fonseca, en nuestra playlist' },
        { palabra: 'i love you so', pista: 'De The Walters, en nuestra playlist' },
        { palabra: 'stand by me', pista: 'De Ben E. King, en nuestra playlist' },
        { palabra: 'those eyes', pista: 'De New West, en nuestra playlist' },
        { palabra: 'until i found you', pista: 'De Stephen Sanchez, en nuestra playlist' },
        { palabra: 'thinking out loud', pista: 'De Ed Sheeran, en nuestra playlist' },
        { palabra: 'just the way you are', pista: 'De Bruno Mars, en nuestra playlist' },
        { palabra: 'tu de que vas', pista: 'De Franco De Vita, en nuestra playlist' },
        { palabra: 'no te imaginas', pista: 'De No Te Va Gustar, en nuestra playlist' },
      ],
    },
  ],

  /* -------------------------------------------------------------------
     1c. CRÍPTICO (pistas de crucigrama críptico)
     Cada pista tiene una DEFINICIÓN (lo que significa la respuesta) y un
     JUEGO DE PALABRAS que lleva a la misma respuesta. El número de letras
     sale solo entre paréntesis.
       pista       -> la frase que ve él
       respuesta   -> la palabra (puede llevar espacios, tildes y Ñ)
       tipo        -> 'anagrama', 'escondida', 'al revés', 'suma',
                      'doble definición', 'contenedor', 'resta',
                      'iniciales' o 'suena como'
       definicion  -> qué parte de la pista es la definición (es una pista)
       explicacion -> cómo se resuelve; sale al final
     Trucos que se usan: notas musicales (DO, RE, MI, FA, SOL, LA, SI),
     símbolos químicos (NA sodio, FE hierro, CU cobre, O oxígeno...),
     números romanos (D = 500, VI = 6), puntos cardinales (N = norte).
     ------------------------------------------------------------------- */
  criptico: [
    { pista: 'Número irracional con roedor saquea los siete mares', respuesta: 'pirata', tipo: 'suma', definicion: 'saquea los siete mares', explicacion: 'PI (número irracional) + RATA (roedor).' },
    { pista: 'Negación junto a la luz del pastel de cumpleaños da para mil páginas', respuesta: 'novela', tipo: 'suma', definicion: 'da para mil páginas', explicacion: 'NO (negación) + VELA (luz del pastel).' },
    { pista: 'Nota y ensenada: lo que me echaste al conocernos', respuesta: 'mirada', tipo: 'suma', definicion: 'lo que me echaste al conocernos', explicacion: 'MI (nota) + RADA (ensenada).' },
    { pista: 'Una nota y la comida de la noche suman doce', respuesta: 'docena', tipo: 'suma', definicion: 'doce', explicacion: 'DO (nota) + CENA.' },
    { pista: 'Nota con papel ilumina la calle', respuesta: 'farol', tipo: 'suma', definicion: 'ilumina la calle', explicacion: 'FA (nota) + ROL (papel).' },
    { pista: 'Nota y final de partida para el golpe definitivo', respuesta: 'remate', tipo: 'suma', definicion: 'golpe definitivo', explicacion: 'RE (nota) + MATE (final de partida).' },
    { pista: 'Artículo con yacimiento: hoja de metal', respuesta: 'lamina', tipo: 'suma', definicion: 'hoja de metal', explicacion: 'LA (artículo) + MINA (yacimiento).' },
    { pista: 'Coro con sodio para la cabeza del rey', respuesta: 'corona', tipo: 'suma', definicion: 'para la cabeza del rey', explicacion: 'CORO + NA (símbolo del sodio).' },
    { pista: 'Hierro y estuario: fiesta con juegos mecánicos', respuesta: 'feria', tipo: 'suma', definicion: 'fiesta con juegos mecánicos', explicacion: 'FE (hierro) + RÍA (estuario).' },
    { pista: 'Cobre y sodio para que duerma el bebé', respuesta: 'cuna', tipo: 'suma', definicion: 'para que duerma el bebé', explicacion: 'CU (cobre) + NA (sodio).' },
    { pista: 'Quinientos con impuesto: cantante caprichosa', respuesta: 'diva', tipo: 'suma', definicion: 'cantante caprichosa', explicacion: 'D (500 en romano) + IVA (impuesto).' },
    { pista: 'Seis romano da existencia', respuesta: 'vida', tipo: 'suma', definicion: 'existencia', explicacion: 'VI (6 en romano) + DA.' },
    { pista: 'Astro con años: lo que sientes cuando no estoy', respuesta: 'soledad', tipo: 'suma', definicion: 'lo que sientes cuando no estoy', explicacion: 'SOL (astro) + EDAD (años).' },
    { pista: 'Bario repleto: gigante del mar', respuesta: 'ballena', tipo: 'suma', definicion: 'gigante del mar', explicacion: 'BA (bario) + LLENA (repleta).' },
    { pista: 'Cobalto con objetivo vuela atado a un hilo', respuesta: 'cometa', tipo: 'suma', definicion: 'vuela atado a un hilo', explicacion: 'CO (cobalto) + META (objetivo).' },
    { pista: 'Oxígeno con Antonio, en confianza, cuando caen las hojas', respuesta: 'otoño', tipo: 'suma', definicion: 'cuando caen las hojas', explicacion: 'O (oxígeno) + TOÑO (Antonio, de cariño).' },
    { pista: 'Va deprisa con un cero y te trae cartas', respuesta: 'correo', tipo: 'suma', definicion: 'te trae cartas', explicacion: 'CORRE (va deprisa) + O (cero).' },
    { pista: 'Pronombre con distancia inglesa: de ella nace una planta', respuesta: 'semilla', tipo: 'suma', definicion: 'de ella nace una planta', explicacion: 'SE (pronombre) + MILLA (distancia inglesa).' },
    { pista: 'Condimento y viaje sin vuelta: por aquí te vas', respuesta: 'salida', tipo: 'suma', definicion: 'por aquí te vas', explicacion: 'SAL (condimento) + IDA (viaje sin vuelta).' },
    { pista: 'Las dura, rara, para decir hola', respuesta: 'saludar', tipo: 'anagrama', definicion: 'decir hola', explicacion: 'LAS DURA revuelto = SALUDAR. "rara" avisa el anagrama.' },
    { pista: 'Ella baila con tres y brilla de noche', respuesta: 'estrella', tipo: 'anagrama', definicion: 'brilla de noche', explicacion: 'ELLA + TRES, bailando = ESTRELLA.' },
    { pista: 'Bola con cal, alborotadas, salta en ele', respuesta: 'caballo', tipo: 'anagrama', definicion: 'salta en ele', explicacion: 'BOLA + CAL alborotadas = CABALLO.' },
    { pista: 'Damitas alborotadas forman este lazo', respuesta: 'amistad', tipo: 'anagrama', definicion: 'este lazo', explicacion: 'DAMITAS alborotadas = AMISTAD.' },
    { pista: 'Cameron, revuelto, dirige una historia de amor', respuesta: 'romance', tipo: 'anagrama', definicion: 'una historia de amor', explicacion: 'CAMERON revuelto = ROMANCE.' },
    { pista: 'Angosta con litio, desordenada, extraña el pasado', respuesta: 'nostalgia', tipo: 'anagrama', definicion: 'extraña el pasado', explicacion: 'ANGOSTA + LI (litio), desordenadas = NOSTALGIA.' },
    { pista: 'Martín con una nota, alterados, para acabar', respuesta: 'terminar', tipo: 'anagrama', definicion: 'para acabar', explicacion: 'MARTIN + RE (nota), alterados = TERMINAR.' },
    { pista: 'Cortés y una diosa poética, en desorden, dicen misa', respuesta: 'sacerdote', tipo: 'anagrama', definicion: 'dicen misa', explicacion: 'CORTÉS + DEA (diosa, en poesía), en desorden = SACERDOTE.' },
    { pista: 'Tela fina mientras pase danzando', respuesta: 'seda', tipo: 'escondida', definicion: 'Tela fina', explicacion: 'pa-SE DA-nzando.' },
    { pista: 'Ali Monroe guarda un cítrico', respuesta: 'limon', tipo: 'escondida', definicion: 'un cítrico', explicacion: 'a-LI MON-roe.' },
    { pista: 'Tengo fe, escondida entre lunes, pero', respuesta: 'espero', tipo: 'escondida', definicion: 'Tengo fe', explicacion: 'lun-ES PERO.' },
    { pista: 'Animal rayado en el dulce brasileño', respuesta: 'cebra', tipo: 'escondida', definicion: 'Animal rayado', explicacion: 'dul-CE BRA-sileño.' },
    { pista: 'Libro de mapas que salta al revés', respuesta: 'atlas', tipo: 'al revés', definicion: 'Libro de mapas', explicacion: 'SALTA al revés = ATLAS.' },
    { pista: 'La sala regresa con plumas para volar', respuesta: 'alas', tipo: 'al revés', definicion: 'plumas para volar', explicacion: 'SALA al revés = ALAS.' },
    { pista: 'Lámina de regreso: tiene cuatro patas', respuesta: 'animal', tipo: 'al revés', definicion: 'tiene cuatro patas', explicacion: 'LÁMINA al revés = ANIMAL.' },
    { pista: 'Plato que abraza a una con el norte: fruta amarilla', respuesta: 'platano', tipo: 'contenedor', definicion: 'fruta amarilla', explicacion: 'PLATO con A + N (norte) dentro: PLAT-AN-O.' },
    { pista: 'Cita con el norte adentro: listón', respuesta: 'cinta', tipo: 'contenedor', definicion: 'listón', explicacion: 'CITA con N (norte) dentro: CI-N-TA.' },
    { pista: 'Pescado que abraza a "se" te sirve en el restaurante', respuesta: 'mesero', tipo: 'contenedor', definicion: 'te sirve en el restaurante', explicacion: 'MERO (pescado) con SE dentro: ME-SE-RO.' },
    { pista: 'Palma descabezada: espíritu', respuesta: 'alma', tipo: 'resta', definicion: 'espíritu', explicacion: 'PALMA sin la primera letra = ALMA.' },
    { pista: 'Llave sin doble ele vuela', respuesta: 'ave', tipo: 'resta', definicion: 'vuela', explicacion: 'LLAVE sin LL = AVE.' },
    { pista: 'Pegamento o fila del súper', respuesta: 'cola', tipo: 'doble definición', definicion: 'Pegamento / fila del súper', explicacion: 'Cola para pegar y la cola para pagar.' },
    { pista: 'Herramienta del carpintero o cadena de montañas', respuesta: 'sierra', tipo: 'doble definición', definicion: 'Herramienta / cadena de montañas', explicacion: 'Sierra para cortar y la Sierra Madre.' },
    { pista: 'Alumbra la mesa y empuja al barco', respuesta: 'vela', tipo: 'doble definición', definicion: 'Alumbra la mesa / empuja al barco', explicacion: 'Vela de cera y vela del barco.' },
    { pista: 'Sacerdote o remedio', respuesta: 'cura', tipo: 'doble definición', definicion: 'Sacerdote / remedio', explicacion: 'El cura de la iglesia y la cura de una enfermedad.' },
    { pista: 'Escribe y vuela', respuesta: 'pluma', tipo: 'doble definición', definicion: 'Escribe / vuela', explicacion: 'Pluma para escribir y pluma de ave.' },
    { pista: 'Lancha o salto de la pelota', respuesta: 'bote', tipo: 'doble definición', definicion: 'Lancha / salto de la pelota', explicacion: 'Un bote en el lago y el bote del balón.' },
    { pista: 'Lo mueves en el escritorio y huye del gato', respuesta: 'raton', tipo: 'doble definición', definicion: 'Lo mueves en el escritorio / huye del gato', explicacion: 'El ratón de la compu y el animal.' },
    { pista: 'Se oye como si estuviera hirviendo y crece en el jardín', respuesta: 'hierba', tipo: 'suena como', definicion: 'crece en el jardín', explicacion: 'HIERBA suena igual que HIERVA (de hervir).' },
    { pista: 'Suena a cacería, pero es tu hogar', respuesta: 'casa', tipo: 'suena como', definicion: 'tu hogar', explicacion: 'CASA suena igual que CAZA.' },
    { pista: 'Suena a tirar a la basura: elegir en las urnas', respuesta: 'votar', tipo: 'suena como', definicion: 'elegir en las urnas', explicacion: 'VOTAR suena igual que BOTAR (tirar).' },
    { pista: 'Suena como un continente: en dirección a', respuesta: 'hacia', tipo: 'suena como', definicion: 'en dirección a', explicacion: 'HACIA suena igual que ASIA.' },
  ],

  /* -------------------------------------------------------------------
     1b. FRASE CIFRADA (criptograma). Está oculta: ver «ocultar» en AJUSTES.
     Cada frase se cifra: cada letra se cambia por un número. Al descifrarla
     sale el autor. Las pistas y las comprobaciones se cambian en DIFICULTAD.
       frase -> la frase (con tildes y comas, como quieras)
       autor -> quién la dijo
     ------------------------------------------------------------------- */
  cripto: [
    { frase: 'Los errores están ahí, esperando a ser cometidos.', autor: 'Savielly Tartakower' },
    { frase: 'El ganador es el que comete el penúltimo error.', autor: 'Savielly Tartakower' },
    { frase: 'Los peones son el alma del ajedrez.', autor: 'François-André Philidor' },
    { frase: 'Para mejorar tu ajedrez, estudia primero los finales.', autor: 'José Raúl Capablanca' },
    { frase: 'La amenaza es más fuerte que su ejecución.', autor: 'Aron Nimzowitsch' },
    { frase: 'Cuando veas una buena jugada, busca una mejor.', autor: 'Emanuel Lasker' },
    { frase: 'El ajedrez es la vida.', autor: 'Bobby Fischer' },
    { frase: 'Dadme un punto de apoyo y moveré el mundo.', autor: 'Arquímedes' },
    { frase: 'Nada en la vida debe ser temido, solo comprendido.', autor: 'Marie Curie' },
    { frase: 'Un experto es alguien que ha cometido todos los errores posibles en un campo muy reducido.', autor: 'Niels Bohr' },
    { frase: 'No he fracasado. He encontrado diez mil formas que no funcionan.', autor: 'Thomas Edison' },
    { frase: 'La imaginación es más importante que el conocimiento.', autor: 'Albert Einstein' },
    { frase: 'La vida es como andar en bicicleta: para mantener el equilibrio hay que seguir adelante.', autor: 'Albert Einstein' },
    { frase: 'Lo importante es no dejar de hacerse preguntas.', autor: 'Albert Einstein' },
    { frase: 'Si he visto más lejos, es porque estoy sobre hombros de gigantes.', autor: 'Isaac Newton' },
    { frase: 'El presente es de ellos; el futuro, por el que tanto trabajé, es mío.', autor: 'Nikola Tesla' },
    { frase: 'La naturaleza está escrita en lenguaje matemático.', autor: 'Galileo Galilei' },
    { frase: 'Y sin embargo, se mueve.', autor: 'Galileo Galilei' },
    { frase: 'El científico no estudia la naturaleza porque sea útil, sino porque se deleita en ella.', autor: 'Henri Poincaré' },
    { frase: 'Ama y haz lo que quieras.', autor: 'San Agustín' },
    { frase: 'El amor no mira con los ojos, sino con el alma.', autor: 'William Shakespeare' },
    { frase: 'Ser o no ser, esa es la cuestión.', autor: 'William Shakespeare' },
    { frase: 'Lo esencial es invisible a los ojos.', autor: 'Antoine de Saint-Exupéry' },
    { frase: 'Amar no es mirarse el uno al otro, sino mirar juntos en la misma dirección.', autor: 'Antoine de Saint-Exupéry' },
    { frase: 'El tiempo que pasaste con tu rosa es lo que la hace tan importante.', autor: 'Antoine de Saint-Exupéry' },
    { frase: 'Donde hay amor, hay vida.', autor: 'Mahatma Gandhi' },
    { frase: 'El que lee mucho y anda mucho, ve mucho y sabe mucho.', autor: 'Miguel de Cervantes' },
    { frase: 'Caminante, no hay camino, se hace camino al andar.', autor: 'Antonio Machado' },
    { frase: 'Toda la vida es sueño, y los sueños, sueños son.', autor: 'Pedro Calderón de la Barca' },
    { frase: 'Lo que con mucho trabajo se adquiere, más se ama.', autor: 'Aristóteles' },
    { frase: 'La paciencia es amarga, pero su fruto es dulce.', autor: 'Jean-Jacques Rousseau' },
    { frase: 'El hombre es la medida de todas las cosas.', autor: 'Protágoras' },
    { frase: 'Solo sé que no sé nada.', autor: 'Sócrates' },
    { frase: 'La suerte está echada.', autor: 'Julio César' },
    { frase: 'Entre los individuos, como entre las naciones, el respeto al derecho ajeno es la paz.', autor: 'Benito Juárez' },
    { frase: 'Es mejor morir de pie que vivir de rodillas.', autor: 'Emiliano Zapata' },
    { frase: 'Camarón que se duerme, se lo lleva la corriente.', autor: 'Refrán popular' },
    { frase: 'Al que madruga, Dios lo ayuda.', autor: 'Refrán popular' },
    { frase: 'No hay mal que por bien no venga.', autor: 'Refrán popular' },
    { frase: 'Dime con quién andas y te diré quién eres.', autor: 'Refrán popular' },
    { frase: 'El que persevera, alcanza.', autor: 'Refrán popular' },
    { frase: 'Poco a poco se anda lejos.', autor: 'Refrán popular' },
    { frase: 'Más vale paso que dure y no trote que canse.', autor: 'Refrán popular' },
    { frase: 'Hazlo o no lo hagas, pero no lo intentes.', autor: 'Yoda' },
    { frase: 'Que la Fuerza te acompañe.', autor: 'Star Wars' },
    { frase: 'El miedo lleva a la ira, la ira lleva al odio, el odio lleva al sufrimiento.', autor: 'Yoda' },
    { frase: 'Este es el camino.', autor: 'The Mandalorian' },
    { frase: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', autor: 'Robert Collier' },
    { frase: 'Estudia no para saber una cosa más, sino para saberla mejor.', autor: 'Séneca' },
    { frase: 'No cuentes los días, haz que los días cuenten.', autor: 'Muhammad Ali' },
    { frase: 'Todo parece imposible hasta que se hace.', autor: 'Nelson Mandela' },
    { frase: 'La disciplina es el puente entre las metas y los logros.', autor: 'Jim Rohn' },
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
     Cada mapa es un nivel y se agrupan por tema en el menú.
       id       -> nombre corto sin espacios. OJO: 'tu-novia' y 'clasicos-cine'
                   los piden cupones de la tienda; no les cambies el id.
       tema     -> grupo en el que aparece
       titulo   -> cómo se llama el mapa
       palabras -> sin espacios; máximo 15 letras cada una
     El tiempo para resolverla se cambia arriba, en DIFICULTAD (sopaSegundos).
     ------------------------------------------------------------------- */
  sopa: [
    // ---------- Minecraft ----------
    { id: 'mc-materiales', tema: 'Minecraft', titulo: 'Materiales y crafteo', palabras: ['Diamante', 'Obsidiana', 'Redstone', 'Esmeralda', 'Netherite', 'Yunque', 'Mesa', 'Horno'] },
    { id: 'mc-mobs', tema: 'Minecraft', titulo: 'Criaturas del juego (mobs)', palabras: ['Creeper', 'Enderman', 'Zombie', 'Esqueleto', 'Wither', 'Aldeano', 'Ajolote', 'Ghast'] },
    { id: 'mc-mundos', tema: 'Minecraft', titulo: 'Dimensiones y biomas', palabras: ['Nether', 'End', 'Tundra', 'Jungla', 'Fortaleza', 'Pantano', 'Taiga', 'Bastión'] },
    // ---------- Ajedrez ----------
    { id: 'aj-tacticas', tema: 'Ajedrez', titulo: 'Tácticas y movimientos', palabras: ['Enroque', 'Jaque', 'Mate', 'Captura', 'Clavada', 'Promoción', 'Coronación', 'Tenedor'] },
    { id: 'aj-aperturas', tema: 'Ajedrez', titulo: 'Aperturas famosas', palabras: ['Siciliana', 'Francesa', 'Española', 'Gambito', 'CaroKann', 'Italiana', 'Eslava'] },
    { id: 'aj-leyendas', tema: 'Ajedrez', titulo: 'Piezas y leyendas', palabras: ['Alfil', 'Caballo', 'Peón', 'Torre', 'Rey', 'Reina', 'Kasparov', 'Carlsen', 'Fischer'] },
    // ---------- Tu novia ----------
    { id: 'tu-novia', tema: 'Tu novia', titulo: 'Tu novia', palabras: ['Picnic', 'Noviembre', 'Crepas', 'Rosado', 'Besitos', 'Aylin'] },
    { id: 'amo-de-ti', tema: 'Tu novia', titulo: 'Cosas que amo de ti', palabras: ['Inteligencia', 'Bondad', 'BuenCorazon', 'Hot', 'Belleza', 'Gracioso', 'Amable', 'Ambicion'] },
    { id: 'futuro', tema: 'Tu novia', titulo: 'El futuro juntos', palabras: ['Tatooine', 'Boda', 'Marshmellitos', 'Italia', 'España', 'USA'] },
    // ---------- Star Wars ----------
    { id: 'sw-lados', tema: 'Star Wars', titulo: 'Lado luminoso vs. lado oscuro', palabras: ['Jedi', 'Sith', 'Fuerza', 'Sable', 'Imperio', 'Rebelión', 'República', 'Mandaloriano'] },
    { id: 'sw-personajes', tema: 'Star Wars', titulo: 'Personajes icónicos', palabras: ['Vader', 'Yoda', 'Chewbacca', 'Luke', 'Leia', 'Han', 'Kenobi', 'Palpatine', 'Boba'] },
    { id: 'sw-planetas', tema: 'Star Wars', titulo: 'Planetas y naves', palabras: ['Tatooine', 'Hoth', 'Coruscant', 'Halcón', 'Estrella', 'Caza', 'Destructor', 'Naboo'] },
    // ---------- Películas románticas ----------
    { id: 'clasicos-cine', tema: 'Películas románticas', titulo: 'Clásicos del cine', palabras: ['Titanic', 'Diario', 'Notting', 'Cuestión', 'Orgullo', 'Prejuicio', 'Fantasma', 'Guardaespaldas'] },
    { id: 'cliches', tema: 'Películas románticas', titulo: 'Clichés de amor', palabras: ['Aeropuerto', 'Lluvia', 'Cartas', 'Destino', 'Boda', 'Encuentro', 'Mirada', 'Reconciliación'] },
    { id: 'parejas', tema: 'Películas románticas', titulo: 'Parejas inolvidables', palabras: ['Jack', 'Rose', 'Noah', 'Allie', 'Darcy', 'Elizabeth', 'Sam', 'Molly'] },
    // ---------- Fútbol ----------
    { id: 'fut-juego', tema: 'Fútbol', titulo: 'La táctica y el juego', palabras: ['Penal', 'Tiro', 'Fuera', 'Cancha', 'Árbitro', 'Capitán', 'Defensa', 'Delantero'] },
    { id: 'fut-torneos', tema: 'Fútbol', titulo: 'Torneos y estadios', palabras: ['Mundial', 'Champions', 'Libertadores', 'Bernabéu', 'Maracaná', 'Wembley', 'Final'] },
    { id: 'fut-calle', tema: 'Fútbol', titulo: 'Términos de calle', palabras: ['Chilena', 'Túnel', 'Sombrerito', 'Escuadra', 'Barrida', 'Gambeta', 'Taquito'] },
    // ---------- Crossover ----------
    { id: 'estrategia', tema: 'Crossover', titulo: 'Estrategia pura (fútbol + ajedrez)', palabras: ['Defensa', 'Ataque', 'Posición', 'Tiempo', 'Rey', 'Capitán', 'Movimiento', 'Gol'] },
    { id: 'romance-galaxia', tema: 'Crossover', titulo: 'Romance en la galaxia (novia + Star Wars)', palabras: ['Princesa', 'Rescate', 'Galaxia', 'Alianza', 'Promesa', 'Juntos', 'Fuerza'] },
  ],
};
