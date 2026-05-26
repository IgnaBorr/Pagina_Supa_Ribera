RIBERA AUDIOVISUAL — WEB CON EDITOR SUPABASE

Qué se agregó
- Editor real en admin.html con login por Supabase Auth.
- Acceso oculto: hacer 5 clicks seguidos en el logo superior izquierdo abre admin.html.
- Edición de textos principales, contacto e Instagram/WhatsApp.
- Edición visual del carrusel de portada con drag & drop.
- Edición del portfolio: agregar, modificar, ordenar o borrar trabajos.
- Galería interna por trabajo: fotos y videos. Al clickear un trabajo, se abre una ventana con todo el material.
- Supabase Storage para guardar archivos.
- Supabase Database para publicar el contenido sin tocar código.

PASOS DE INSTALACIÓN

1) Subí estos archivos a GitHub Pages.

2) En Supabase creá un proyecto.

3) En Supabase > SQL Editor, ejecutá:
   supabase_schema_ribera.sql

4) En Supabase > Authentication > Users, creá este usuario:
   ribera.audiovisuales@gmail.com
   y asignale la contraseña que quieras usar.

5) En Supabase > Project Settings > API copiá:
   - Project URL
   - anon public key

6) Abrí el archivo:
   supabase-config.js
   y pegá esos datos:

   window.RIBERA_SUPABASE = {
     url: "https://TU-PROYECTO.supabase.co",
     anonKey: "TU_ANON_PUBLIC_KEY",
     bucket: "ribera-media",
     adminEmail: "ribera.audiovisuales@gmail.com"
   };

7) Subí el cambio a GitHub Pages.

8) Entrá al sitio público y hacé 5 clicks seguidos en el logo superior izquierdo.
   Se abre admin.html.

9) Iniciá sesión con:
   ribera.audiovisuales@gmail.com
   + la contraseña que creaste en Supabase.

10) Editá contenido y tocá “Publicar cambios”.

Notas operativas
- Si Supabase todavía no está configurado, el sitio usa ribera-content.js como contenido de respaldo.
- No pongas la contraseña en ningún archivo. La contraseña vive en Supabase Auth.
- La anon public key puede estar en front-end; la seguridad está en las políticas RLS del SQL.
- Para videos, conviene usar MP4 livianos. Subir videos pesados a una home es lindo, hasta que Lighthouse te mira con cara de auditor.
