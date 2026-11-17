/* =====================================================================
   NOTAS PARA ALEGRARLE EL DÍA
   =====================================================================
   Este archivo lo editas TÚ directamente en GitHub:
     1. Abre este archivo y pulsa el lápiz ✏️ (arriba a la derecha).
     2. Agrega, cambia o borra notas.
     3. Pulsa "Commit changes". Vercel publica el cambio en un minuto.

   REGLAS (solo tres):
     - Cada nota va entre comillas simples '...' y termina con una coma.
     - Si la nota lleva un apóstrofo, usa comillas dobles: "..."
     - No borres el corchete [ del inicio ni el ]; del final.

   DOS TIPOS DE NOTA:
     'Texto'                                  -> sale cualquier día, al azar por fecha.
     { fecha: '2026-12-24', texto: 'Texto' }  -> sale SOLO ese día (año-mes-día).

   Cada día la app muestra una nota. Entre más notas haya, menos se repiten.
   ===================================================================== */

export const NOTAS = [
  // ---------- Notas de cualquier día ----------
  'Buenos días, mi vida. Hoy también creo en ti.',
  'Recordatorio: eres el ingeniero más guapo que conozco.',
  'Si hoy se pone difícil, acuérdate de que ya has pasado cosas peores. Y con estilo.',
  'Te quiero más que Grogu a las galletas azules.',
  'Un besito virtual para que te dure hasta que nos veamos.',
  'Estoy orgullosa de ti, aunque hoy solo logres un pomodoro.',
  'Toma agua, estira la espalda y sigue. Órdenes de tu novia.',
  'Cosi: cada tema que tachas es un paso más cerca de las vacaciones juntos.',
  'Eres mi jugada favorita. Mejor que cualquier apertura.',
  'Hoy alguien pensó en ti como quince veces. Fui yo.',
  'No tienes que poder con todo hoy. Solo con el siguiente bloque.',
  'Cuando termines, cuéntame qué aprendiste. Me encanta oírte explicar.',
  'Marshmello, precioso, mi vida: escoge el apodo que quieras, todos son tuyos.',
  'Tu esfuerzo de hoy es el brownie de mañana. Literalmente.',
  'Sos asombroso. Por si hoy se te olvidó.',

  // ---------- Notas para un día específico (cambia las fechas) ----------
  { fecha: '2026-12-24', texto: 'Feliz Nochebuena, mi amor. Hoy no se estudia, hoy se descansa.' },
  { fecha: '2026-12-31', texto: 'Último día del año. Gracias por compartirlo conmigo.' },
  { fecha: '2027-02-14', texto: 'Feliz día, mi vida. Eres mi persona favorita.' },
];
