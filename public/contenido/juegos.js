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
    sopaOcultarPalabras: true,
    sopaSenuelos: true,
    sopaSegundos: 240,
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
     ------------------------------------------------------------------- */
  criptico: [
    { pista: 'Religiosa con jamón revuelto', respuesta: 'monja', tipo: 'anagrama', definicion: 'Religiosa', explicacion: 'JAMÓN revuelto = MONJA.' },
    { pista: 'Delia, loca, es perfecta', respuesta: 'ideal', tipo: 'anagrama', definicion: 'es perfecta', explicacion: 'DELIA loca = IDEAL.' },
    { pista: 'Saco roto me da repugnancia', respuesta: 'asco', tipo: 'anagrama', definicion: 'repugnancia', explicacion: 'SACO roto = ASCO.' },
    { pista: 'Mora deshecha: un puñado de flores', respuesta: 'ramo', tipo: 'anagrama', definicion: 'un puñado de flores', explicacion: 'MORA deshecha = RAMO.' },
    { pista: 'Ernesto revuelto: cantantes de ópera', respuesta: 'tenores', tipo: 'anagrama', definicion: 'cantantes de ópera', explicacion: 'ERNESTO revuelto = TENORES.' },
    { pista: 'Alegría mal llevada provoca estornudos', respuesta: 'alergia', tipo: 'anagrama', definicion: 'provoca estornudos', explicacion: 'ALEGRÍA mal = ALERGIA.' },
    { pista: 'Pasta revuelta para picar en el bar', respuesta: 'tapas', tipo: 'anagrama', definicion: 'para picar en el bar', explicacion: 'PASTA revuelta = TAPAS.' },
    { pista: 'Óscar mezclado: pan de Reyes', respuesta: 'rosca', tipo: 'anagrama', definicion: 'pan de Reyes', explicacion: 'ÓSCAR mezclado = ROSCA.' },
    { pista: 'Lámina rota es una bestia', respuesta: 'animal', tipo: 'anagrama', definicion: 'una bestia', explicacion: 'LÁMINA rota = ANIMAL.' },
    { pista: 'Japonés revuelto absorbe el agua del baño', respuesta: 'esponja', tipo: 'anagrama', definicion: 'absorbe el agua del baño', explicacion: 'JAPONÉS revuelto = ESPONJA.' },
    { pista: 'Metal que guarda el tesoro', respuesta: 'oro', tipo: 'escondida', definicion: 'Metal', explicacion: 'tes-ORO: está escondido dentro de "tesoro".' },
    { pista: 'Tejido escondido en este lazo', respuesta: 'tela', tipo: 'escondida', definicion: 'Tejido', explicacion: 'es-TE LA-zo.' },
    { pista: 'Agua salada dentro del camarón', respuesta: 'mar', tipo: 'escondida', definicion: 'Agua salada', explicacion: 'ca-MAR-ón.' },
    { pista: 'Alimento que esconde la campana', respuesta: 'pan', tipo: 'escondida', definicion: 'Alimento', explicacion: 'cam-PAN-a.' },
    { pista: 'Flor escondida en el caro sabor', respuesta: 'rosa', tipo: 'escondida', definicion: 'Flor', explicacion: 'ca-RO SA-bor.' },
    { pista: 'Querer escondido en la cama roja', respuesta: 'amar', tipo: 'escondida', definicion: 'Querer', explicacion: 'c-AMA R-oja.' },
    { pista: 'Muestra de cariño escondida en árabe sobrio', respuesta: 'beso', tipo: 'escondida', definicion: 'Muestra de cariño', explicacion: 'ára-BE SO-brio.' },
    { pista: 'Roma al revés es lo que siento por ti', respuesta: 'amor', tipo: 'al revés', definicion: 'lo que siento por ti', explicacion: 'ROMA al revés = AMOR.' },
    { pista: 'Las regresan como condimento', respuesta: 'sal', tipo: 'al revés', definicion: 'condimento', explicacion: 'LAS al revés = SAL.' },
    { pista: 'Atar al revés: roedor', respuesta: 'rata', tipo: 'al revés', definicion: 'roedor', explicacion: 'ATAR al revés = RATA.' },
    { pista: 'Zorra de vuelta en la paella', respuesta: 'arroz', tipo: 'al revés', definicion: 'en la paella', explicacion: 'ZORRA al revés = ARROZ.' },
    { pista: 'Adán regresa sin cosa alguna', respuesta: 'nada', tipo: 'al revés', definicion: 'sin cosa alguna', explicacion: 'ADÁN al revés = NADA.' },
    { pista: 'Noel al revés: rey de la selva', respuesta: 'leon', tipo: 'al revés', definicion: 'rey de la selva', explicacion: 'NOEL al revés = LEÓN.' },
    { pista: 'Ocas de vuelta: prenda de vestir', respuesta: 'saco', tipo: 'al revés', definicion: 'prenda de vestir', explicacion: 'OCAS al revés = SACO.' },
    { pista: 'Estrella y cubo de juego forman al militar', respuesta: 'soldado', tipo: 'suma', definicion: 'al militar', explicacion: 'SOL (estrella) + DADO (cubo de juego) = SOLDADO.' },
    { pista: 'Tour y astro rey: flor amarilla', respuesta: 'girasol', tipo: 'suma', definicion: 'flor amarilla', explicacion: 'GIRA (tour) + SOL (astro rey) = GIRASOL.' },
    { pista: 'Mari posa: insecto con alas de colores', respuesta: 'mariposa', tipo: 'suma', definicion: 'insecto con alas de colores', explicacion: 'MARI + POSA = MARIPOSA.' },
    { pista: 'Extrae extremos con este útil escolar', respuesta: 'sacapuntas', tipo: 'suma', definicion: 'útil escolar', explicacion: 'SACA (extrae) + PUNTAS (extremos) = SACAPUNTAS.' },
    { pista: 'Rostro y verdura: lleva su casa a cuestas', respuesta: 'caracol', tipo: 'suma', definicion: 'lleva su casa a cuestas', explicacion: 'CARA (rostro) + COL (verdura) = CARACOL.' },
    { pista: 'Uva seca más época: entretenimiento', respuesta: 'pasatiempo', tipo: 'suma', definicion: 'entretenimiento', explicacion: 'PASA (uva seca) + TIEMPO (época) = PASATIEMPO.' },
    { pista: 'Roca fundida y vajilla en la cocina', respuesta: 'lavaplatos', tipo: 'suma', definicion: 'en la cocina', explicacion: 'LAVA (roca fundida) + PLATOS (vajilla) = LAVAPLATOS.' },
    { pista: 'Rescata existencias en la alberca', respuesta: 'salvavidas', tipo: 'suma', definicion: 'en la alberca', explicacion: 'SALVA (rescata) + VIDAS (existencias) = SALVAVIDAS.' },
    { pista: 'Interpreta álbumes en este aparato', respuesta: 'tocadiscos', tipo: 'suma', definicion: 'aparato', explicacion: 'TOCA (interpreta) + DISCOS (álbumes) = TOCADISCOS.' },
    { pista: 'Asiento del parque y lugar del dinero', respuesta: 'banco', tipo: 'doble definición', definicion: 'Asiento del parque / lugar del dinero', explicacion: 'Un banco del parque y un banco con dinero.' },
    { pista: 'Felino que levanta coches', respuesta: 'gato', tipo: 'doble definición', definicion: 'Felino / que levanta coches', explicacion: 'Gato (animal) y gato hidráulico.' },
    { pista: 'Pieza de ajedrez y edificio alto', respuesta: 'torre', tipo: 'doble definición', definicion: 'Pieza de ajedrez / edificio alto', explicacion: 'La torre del tablero y una torre de oficinas.' },
    { pista: 'Menú del restaurante o mensaje de amor', respuesta: 'carta', tipo: 'doble definición', definicion: 'Menú / mensaje de amor', explicacion: 'La carta del restaurante y una carta de amor.' },
    { pista: 'Juguete y articulación', respuesta: 'muñeca', tipo: 'doble definición', definicion: 'Juguete / articulación', explicacion: 'Una muñeca de juguete y la muñeca de la mano.' },
    { pista: 'Piso de un edificio y ser vivo con hojas', respuesta: 'planta', tipo: 'doble definición', definicion: 'Piso / ser vivo con hojas', explicacion: 'Planta baja y una planta del jardín.' },
    { pista: 'Trofeo y parte alta del árbol', respuesta: 'copa', tipo: 'doble definición', definicion: 'Trofeo / parte alta del árbol', explicacion: 'La copa del campeonato y la copa del árbol.' },
    { pista: 'Fuego y animal de los Andes', respuesta: 'llama', tipo: 'doble definición', definicion: 'Fuego / animal de los Andes', explicacion: 'Una llama de fuego y la llama andina.' },
    { pista: 'Cano abraza lo mío: senda', respuesta: 'camino', tipo: 'contenedor', definicion: 'senda', explicacion: 'CANO con MI adentro: CA-MI-NO.' },
    { pista: 'Pero contiene una erre: el mejor amigo', respuesta: 'perro', tipo: 'contenedor', definicion: 'el mejor amigo', explicacion: 'PERO con una R adentro: PER-R-O.' },
    { pista: 'Bala sin cabeza sirve para volar', respuesta: 'ala', tipo: 'resta', definicion: 'sirve para volar', explicacion: 'BALA sin la primera letra = ALA.' },
    { pista: 'Rosa sin cabeza: la hembra del oso', respuesta: 'osa', tipo: 'resta', definicion: 'la hembra del oso', explicacion: 'ROSA sin la primera letra = OSA.' },
    { pista: 'Marco sin cabeza: lo usa el arquero', respuesta: 'arco', tipo: 'resta', definicion: 'lo usa el arquero', explicacion: 'MARCO sin la primera letra = ARCO.' },
    { pista: 'Cabezas de Sueños, Oro y Lunas: la estrella', respuesta: 'sol', tipo: 'iniciales', definicion: 'la estrella', explicacion: 'Sueños, Oro, Lunas = SOL.' },
    { pista: 'Al principio, Mi Abuela Tenía Esperanzas: victoria en el tablero', respuesta: 'mate', tipo: 'iniciales', definicion: 'victoria en el tablero', explicacion: 'Mi, Abuela, Tenía, Esperanzas = MATE.' },
    { pista: 'Saludo que suena como el mar', respuesta: 'hola', tipo: 'suena como', definicion: 'Saludo', explicacion: 'HOLA se oye igual que OLA.' },
    { pista: 'Se oye como el pelo del brazo: hermoso', respuesta: 'bello', tipo: 'suena como', definicion: 'hermoso', explicacion: 'BELLO suena igual que VELLO.' },
    { pista: 'Suena a tubería: poseyó', respuesta: 'tuvo', tipo: 'suena como', definicion: 'poseyó', explicacion: 'TUVO suena igual que TUBO.' },
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
