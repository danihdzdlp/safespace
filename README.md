# SafeSpace

Un lugar para no cargar sola lo que sientes. Aplicacion web de apoyo emocional entre pares para personas jovenes en Mexico, con circulos de escucha en horario fijo, un path diario de tareas pequenas, un panel de lecturas y un boton de emergencia siempre visible.

Proyecto final del curso, segunda parte. La primera parte es el documento de definicion y planeacion que vive en `docs/`.

- App desplegada: PENDIENTE, pega aqui tu dominio de Vercel
- Documento de planeacion: `docs/SafeSpace_Documento_Definicion_Proyecto.pdf`

## Stack y funcion de cada herramienta

| Herramienta | Funcion en este proyecto |
| --- | --- |
| Next.js 14, App Router | Framework de la aplicacion. Componentes de servidor para leer datos y Server Actions para toda la logica de negocio |
| TypeScript estricto | Tipado de punta a punta, los errores se atrapan antes de ejecutar |
| Supabase | Autenticacion, base de datos Postgres y politicas de seguridad a nivel de fila (RLS) |
| Tailwind CSS | Estilos con la paleta nocturna definida en la fase de planeacion |
| Zod | Validacion estricta de toda entrada de datos en el servidor |
| Vitest | Pruebas automatizadas de la logica central, 25 pruebas |
| GitHub y GitHub Actions | Control de versiones y verificacion de calidad en cada push, tipos, lint y pruebas |
| Vercel | Hosting con despliegue automatico desde main y entornos de preview por rama |
| Claude Code | Copiloto de desarrollo, con revision manual de cada cambio |

## Correr el proyecto en local

1. Clona el repositorio y entra a la carpeta
2. `npm install`
3. Copia `.env.example` como `.env.local` y llena los valores de tu proyecto de Supabase
4. Ejecuta `supabase/schema.sql` completo en el SQL Editor de Supabase
5. `npm run dev` y abre http://localhost:3000

Verificaciones, `npm run typecheck`, `npm run lint`, `npm test`.

## Variables de entorno

| Variable | Que es |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave publica anon. Es publica por diseno, la seguridad real esta en las politicas RLS |

En Vercel se configuran en Settings, Environment Variables. La `service_role` key no se usa en ninguna parte de esta aplicacion y nunca debe agregarse al repositorio.

## Decisiones de arquitectura

**La ventana horaria vive en el servidor.** El foro abre de 8:00 a 9:30 pm hora del centro de Mexico, todos los dias. El estado no se guarda en la base, se deriva del reloj del servidor contra la zona `America/Mexico_City` en `src/lib/foro.ts`. El reloj del dispositivo solo pinta la cuenta regresiva, porque es un dato que la usuaria controla y no puede ser fuente de verdad.

**Idempotencia por diseno de base de datos.** El path del dia tiene la restriccion `UNIQUE(usuaria_id, fecha)`. Recargar la pagina o dos peticiones simultaneas jamas generan dos paths distintos, la base lo garantiza, no el codigo.

**Seguridad en la base, no en la interfaz.** Cada tabla de datos personales tiene Row Level Security. Aunque la clave anon es publica, una usuaria solo puede leer y escribir sus propios renglones.

**Sondeo en lugar de websockets.** Las publicaciones del circulo se refrescan cada 10 segundos solo dentro de la ventana y solo con la pestana visible. Decision tomada en el plan de recorte del documento de planeacion, menos infraestructura y menos modos de falla para un piloto, con Supabase Realtime como mejora futura.

**Separacion estricta de responsabilidades.** La logica pura vive en `src/lib` sin ninguna dependencia de red, por eso se puede probar de forma aislada. Las Server Actions en `app/acciones` orquestan base de datos y validacion. Los componentes de cliente solo manejan interaccion.

**Optimizaciones manuales.** Los renglones de tareas usan `memo` y `useCallback` para que marcar una tarea no re-renderice a las demas. Las actualizaciones son optimistas con reversa si el servidor falla. Las consultas juntan datos relacionados en una sola ida con `select` anidado y el listado del foro esta indexado por sala y fecha y acotado a 30 renglones.

**La pantalla de emergencia es estatica.** `/emergencia` no depende de sesion, ni de base de datos, ni de red. Los recursos viven en el codigo y la pagina se sirve prerenderizada. Es la pantalla que debe funcionar cuando todo lo demas falla.

## Prompts principales usados con la IA

1. "Lee el documento de planeacion de SafeSpace y construye el esquema SQL de Supabase con RLS en todas las tablas de datos personales, incluyendo la restriccion UNIQUE(usuaria_id, fecha) para la idempotencia del path"
2. "Implementa estadoDelForo como funcion pura que derive el estado de la ventana 20:00 a 21:30 usando la zona America/Mexico_City con Intl, sin guardar estado, y escribe pruebas para los limites exactos 19:59:59, 20:00:00, 21:29:59 y 21:30:00"
3. "Escribe la server action publicarMensaje con las cuatro validaciones del documento en este orden, ventana horaria en servidor, contenido con Zod entre 1 y 2000 caracteres, limite de 5 mensajes por minuto, y evaluacion de riesgo que marca sin bloquear"
4. "El motor del path debe seleccionar 3 tareas con categorias diversas sin repetir las de los ultimos 14 dias, con la regla compasiva de 1 tarea de dificultad 1 tras 3 dias sin completar nada, hazlo funcion pura y determinista por fecha"
5. "La lista de tareas debe actualizar de forma optimista con reversa si la accion falla, y el renglon debe estar memoizado para no re-renderizar los demas al marcar uno"
6. "Configura GitHub Actions para correr typecheck, lint y las pruebas en cada push a main y en cada pull request"

## Limitaciones y alucinaciones de la IA detectadas y como se mitigaron

Errores reales que la IA produjo durante este desarrollo y que el proceso de verificacion atrapo. Se documentan porque la leccion del proyecto es exactamente esta, la IA acelera, pero el control de calidad es humano y automatizado.

1. **El motor del path descartaba tareas recientes en bloque.** La primera version filtraba lo reciente por completo y, cuando quedaban pocas candidatas, las regresaba todas de golpe, con lo que el dia podia repetir tareas teniendo alternativas nuevas. Lo detecto una prueba de Vitest que fallo. Se corrigio penalizando lo reciente en el puntaje en lugar de descartarlo, de modo que solo entra cuando no alcanza con lo nuevo. Sin la prueba automatizada este error habria llegado a produccion.
2. **Una pagina estatica llamando logica de servidor.** La IA coloco el registro anonimo del evento de emergencia dentro del renderizado de `/emergencia`, que es estatica. Eso se ejecutaria una sola vez al compilar y ademas rompia el build. Se detecto al correr `npm run build` antes de desplegar y se movio el registro al momento en que se presiona el boton SOS.
3. **Importaciones con un alias inexistente.** Varios archivos importaban desde `@/app/acciones` cuando el alias solo cubria `src/`. `tsc --noEmit` marco los 8 archivos afectados y se corrigio el mapa de rutas en `tsconfig.json`.
4. **Tipos implicitos `any` en los manejadores de cookies de Supabase.** El modo estricto de TypeScript los rechazo y se tiparon con `CookieOptions` de `@supabase/ssr`. Es el tipo de detalle que la IA omite y que en produccion esconde errores.
5. **Riesgo permanente de APIs inventadas.** Con bibliotecas que cambian rapido, como `@supabase/ssr`, la IA puede sugerir metodos de versiones viejas o inexistentes. Mitigacion de proceso, todo cambio pasa por typecheck, lint y pruebas en local y de nuevo en GitHub Actions antes de llegar a Vercel, y los archivos sensibles, autenticacion, RLS y emergencia, se revisan linea por linea como marca `CLAUDE.md`.

## Calidad antes de desplegar

Cada push a main corre en GitHub Actions la verificacion de tipos, el lint y las 25 pruebas. Vercel despliega automaticamente main a produccion y cada rama a un entorno de preview, de modo que ningun cambio llega a la usuaria sin pasar las tres puertas.

## Autoevaluacion

**Que funciona.** El flujo completo de la usuaria, registro, cuestionario de 15 preguntas, path diario idempotente con racha, circulo con ventana horaria validada en servidor, panel de lecturas con sugerencia por perfil y boton de emergencia global. La logica central esta probada y el CI la protege.

**Que aprendi.** Que la base de datos puede garantizar cosas que el codigo solo promete, la restriccion UNIQUE resolvio la idempotencia mejor que cualquier bandera. Que las pruebas no son un tramite, una de ellas encontro un error real del motor antes que yo. Y que usar IA sin perder el control significa leer cada cambio, correr las verificaciones y saber explicar cada archivo del proyecto.

**Que mejoraria con mas tiempo.** Supabase Realtime en lugar de sondeo, un panel de moderacion con cola de publicaciones marcadas, sesiones del circulo con tema fijado por la moderadora en base de datos, y pruebas de integracion sobre las Server Actions con una base de prueba.

## Aviso importante

SafeSpace es apoyo entre pares y no sustituye atencion profesional de salud mental. En Mexico, la Linea de la Vida atiende 24 horas en el 800 911 2000 y las emergencias en el 911.
