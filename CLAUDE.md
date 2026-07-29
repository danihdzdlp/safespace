# Convenciones del proyecto SafeSpace

Este archivo guia a Claude Code cuando asiste en este repositorio.

## Reglas duras
- La validacion de la ventana horaria del foro vive SOLO en el servidor (src/lib/foro.ts y las server actions). El cliente solo pinta.
- La zona horaria oficial es America/Mexico_City. Nunca usar el reloj del dispositivo para decidir.
- La idempotencia del path diario la garantiza la restriccion UNIQUE(usuaria_id, fecha) en la base, no el codigo.
- Nunca escribir la service_role key en el codigo ni en el repositorio.
- Todo archivo que toque autenticacion, politicas RLS o la pagina de emergencia requiere revision manual linea por linea antes de fusionar.
- La pagina /emergencia no depende de sesion ni de la base de datos. Debe funcionar cuando todo lo demas falla.

## Estilo
- TypeScript estricto, sin any.
- Componentes de servidor por defecto, "use client" solo donde hay interactividad.
- Textos de interfaz en espanol de Mexico, sin guiones largos ni punto y coma.
- Comentarios que expliquen el porque de las decisiones, no el que.
