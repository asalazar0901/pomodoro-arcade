import { defineConfig } from 'vite';

// Proyecto Vite (Vanilla JS).
// - Todo lo que está en /public se copia tal cual al sitio final:
//     public/assets/     -> sprites e imágenes   (se usan como "assets/archivo.png")
//     public/contenido/  -> notas y eventos editables desde GitHub
// - `npm run build` genera la carpeta /dist, que es lo que publica Vercel.
export default defineConfig({
  build: {
    target: 'es2022', // la app usa top-level await
  },
});
