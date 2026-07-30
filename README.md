# SafeSpace

Un lugar para no cargar en soledad lo que sientes. Aplicación web de apoyo emocional entre pares para personas jóvenes en México, con círculos de escucha en dos sesiones diarias, un path diario de tareas pequeñas con guías, un árbol personal que crece con la constancia bajo un paisaje que refleja el ánimo del día, un recordatorio personal que cambia cada media hora, un panel de lecturas, una sección de meditación guiada por voz y un botón de emergencia siempre visible.

Proyecto final del curso, segunda parte. La primera parte es el documento de definición y planeación que vive en `docs/`.

- App desplegada: PENDIENTE, pega aquí tu dominio de Vercel
- Documento de planeación: `docs/SafeSpace_Documento_Definicion_Proyecto.pdf`

## Stack y función de cada herramienta

| Herramienta | Función en este proyecto |
| --- | --- |
| Next.js 14, App Router | Framework de la aplicación. Componentes de servidor para leer datos y Server Actions para toda la lógica de negocio |
| TypeScript estricto | Tipado de punta a punta, los errores se atrapan antes de ejecutar |
| Supabase | Autenticación, base de datos Postgres y políticas de seguridad a nivel de fila (RLS) |
| Tailwind CSS | Estilos con la paleta nocturna definida en la fase de planeación |
| Zod | Validación estricta de toda entrada de datos en el servidor |
| Vitest | Pruebas automatizadas de la lógica central, 36 pruebas |
| GitHub y GitHub Actions | Control de versiones y verificación de calidad en cada push, tipos, lint y pruebas |
| Vercel | Hosting con despliegue automático desde main y entornos de preview por rama |
| Claude Code | Copiloto de desarrollo, con revisión manual de cada cambio |

## Correr el proyecto en local

1. Clona el repositorio y entra a la carpeta
2. `npm install`
3. Copia `.env.example` como `.env.local` y llena los valores de tu proyecto de Supabase
4. Ejecuta `supabase/schema.sql` completo en el SQL Editor de Supabase
5. `npm run dev` y abre http://localhost:3000

Verificaciones, `npm run typecheck`, `npm run lint`, `npm test`.

## Variables de entorno

| Variable | Qué es |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon. Es pública por diseño, la seguridad real está en las políticas RLS |

En Vercel se configuran en Settings, Environment Variables. La `service_role` key no se usa en ninguna parte de esta aplicación y nunca debe agregarse al repositorio.

## Decisiones de arquitectura

**La ventana horaria vive en el servidor.** El foro abre en dos sesiones diarias, de 3:00 a 5:00 y de 8:00 a 10:00 pm hora del centro de México. Originalmente era una sola sesión de 8:00 a 9:30, se amplió por retroalimentación de las primeras usuarias, al ser un espacio escrito, más ventanas dan más oportunidades de conexión. El estado no se guarda en la base, se deriva del reloj del servidor contra la zona `America/Mexico_City` en `src/lib/foro.ts`. El reloj del dispositivo solo pinta la cuenta regresiva, porque es un dato que la usuaria controla y no puede ser fuente de verdad.

**Idempotencia por diseño de base de datos.** El path del día tiene la restricción `UNIQUE(usuaria_id, fecha)`. Recargar la página o dos peticiones simultáneas jamás generan dos paths distintos, la base lo garantiza, no el código.

**Seguridad en la base, no en la interfaz.** Cada tabla de datos personales tiene Row Level Security. Aunque la clave anon es pública, una usuaria solo puede leer y escribir sus propios renglones.

**Sondeo en lugar de websockets.** Las publicaciones del círculo se refrescan cada 10 segundos solo dentro de la ventana y solo con la pestaña visible. Decisión tomada en el plan de recorte del documento de planeación, menos infraestructura y menos modos de falla para un piloto, con Supabase Realtime como mejora futura.

**Círculo escrito, no hablado.** Se evaluó incluir notas de voz y se decidió texto para esta versión por tres razones, la voz identifica a la persona y rompe la promesa de anonimato, la detección de lenguaje de riesgo y la moderación funcionan sobre texto, y el almacenamiento y reproducción de audio agregan una capa de infraestructura que el piloto no necesita. Queda en el roadmap con una idea concreta, voz distorsionada para proteger la identidad.

**Separación estricta de responsabilidades.** La lógica pura vive en `src/lib` sin ninguna dependencia de red, por eso se puede probar de forma aislada. Las Server Actions en `app/acciones` orquestan base de datos y validación. Los componentes de cliente solo manejan interacción.

**Optimizaciones manuales.** Los renglones de tareas usan `memo` y `useCallback` para que marcar una tarea no re-renderice a las demás. Las actualizaciones son optimistas con reversa si el servidor falla. Las consultas juntan datos relacionados en una sola ida con `select` anidado y el listado del foro está indexado por sala y fecha y acotado a 30 renglones.

**La pantalla de emergencia es estática.** `/emergencia` no depende de sesión, ni de base de datos, ni de red. Los recursos viven en el código y la página se sirve prerenderizada. Es la pantalla que debe funcionar cuando todo lo demás falla.

## Prompts principales usados con la IA

1. "Lee el documento de planeación de SafeSpace y construye el esquema SQL de Supabase con RLS en todas las tablas de datos personales, incluyendo la restricción UNIQUE(usuaria_id, fecha) para la idempotencia del path"
2. "Implementa estadoDelForo como función pura que derive el estado de la ventana 20:00 a 21:30 usando la zona America/Mexico_City con Intl, sin guardar estado, y escribe pruebas para los límites exactos 19:59:59, 20:00:00, 21:29:59 y 21:30:00"
3. "Escribe la server action publicarMensaje con las cuatro validaciones del documento en este orden, ventana horaria en servidor, contenido con Zod entre 1 y 2000 caracteres, límite de 5 mensajes por minuto, y evaluación de riesgo que marca sin bloquear"
4. "El motor del path debe seleccionar 3 tareas con categorías diversas sin repetir las de los últimos 14 días, con la regla compasiva de 1 tarea de dificultad 1 tras 3 días sin completar nada, hazlo función pura y determinista por fecha"
5. "La lista de tareas debe actualizar de forma optimista con reversa si la acción falla, y el renglón debe estar memoizado para no re-renderizar los demás al marcar uno"
6. "Configura GitHub Actions para correr typecheck, lint y las pruebas en cada push a main y en cada pull request"
7. "Agrega a cada tarea del catálogo una guía breve de cómo hacerla, visible con un botón propio separado del de completar, y una tarea nueva de caminata consciente de 30 minutos con su guía de meditación caminando"
8. "Agrega un árbol personal que crezca por etapas derivadas del total de tareas completadas, sin guardar estado propio, con la bienvenida de la semilla en la primera visita, y una afirmación que cambie cada media hora de forma determinista con la hora del centro de México"
9. "Dibuja detrás del árbol un paisaje que cambie con el ánimo registrado del día, lluvia, nublado, claros, medio sol o sol pleno, y suaviza la paleta azul a tonos pizarra de baja saturación cómodos para lectura nocturna"
10. "Haz el cuestionario y los textos de la interfaz neutros en género, y agrega una página de bienvenida pública, una gráfica de la evolución del ánimo y la instalación como app en el teléfono"
11. "Corrige la ortografía de todos los textos de la interfaz, acentos, eñes y signos de interrogación de apertura, sin romper la correspondencia entre las opciones del cuestionario y el motor del perfil"

## Limitaciones y alucinaciones de la IA detectadas y cómo se mitigaron

Errores reales que la IA produjo durante este desarrollo y que el proceso de verificación atrapó. Se documentan porque la lección del proyecto es exactamente esta, la IA acelera, pero el control de calidad es humano y automatizado.

1. **El motor del path descartaba tareas recientes en bloque.** La primera versión filtraba lo reciente por completo y, cuando quedaban pocas candidatas, las regresaba todas de golpe, con lo que el día podía repetir tareas teniendo alternativas nuevas. Lo detectó una prueba de Vitest que falló. Se corrigió penalizando lo reciente en el puntaje en lugar de descartarlo, de modo que solo entra cuando no alcanza con lo nuevo. Sin la prueba automatizada este error habría llegado a producción.
2. **Una página estática llamando lógica de servidor.** La IA colocó el registro anónimo del evento de emergencia dentro del renderizado de `/emergencia`, que es estática. Eso se ejecutaría una sola vez al compilar y además rompía el build. Se detectó al correr `npm run build` antes de desplegar y se movió el registro al momento en que se presiona el botón SOS.
3. **Importaciones con un alias inexistente.** Varios archivos importaban desde `@/app/acciones` cuando el alias solo cubría `src/`. `tsc --noEmit` marcó los 8 archivos afectados y se corrigió el mapa de rutas en `tsconfig.json`.
4. **Tipos implícitos `any` en los manejadores de cookies de Supabase.** El modo estricto de TypeScript los rechazó y se tiparon con `CookieOptions` de `@supabase/ssr`. Es el tipo de detalle que la IA omite y que en producción esconde errores.
5. **Textos generados sin ortografía española completa.** La IA escribió la interfaz sin acentos, eñes ni signos de interrogación de apertura, siguiendo una convención de programación que no aplica a los textos visibles. Se detectó probando la app en producción y se corrigió en un cambio dedicado, cuidando que las opciones del cuestionario y el motor del perfil siguieran coincidiendo, con las pruebas como red de seguridad.
6. **Riesgo permanente de APIs inventadas.** Con bibliotecas que cambian rápido, como `@supabase/ssr`, la IA puede sugerir métodos de versiones viejas o inexistentes. Mitigación de proceso, todo cambio pasa por typecheck, lint y pruebas en local y de nuevo en GitHub Actions antes de llegar a Vercel, y los archivos sensibles, autenticación, RLS y emergencia, se revisan línea por línea como marca `CLAUDE.md`.

## Calidad antes de desplegar

Cada push a main corre en GitHub Actions la verificación de tipos, el lint y las 36 pruebas. Vercel despliega automáticamente main a producción y cada rama a un entorno de preview, de modo que ningún cambio llega a la usuaria sin pasar las tres puertas.

## Autoevaluación

**Qué funciona.** El flujo completo de la usuaria, registro, cuestionario de 15 preguntas, path diario idempotente con racha, círculo con ventana horaria validada en servidor, panel de lecturas con sugerencia por perfil y botón de emergencia global. La lógica central está probada y el CI la protege.

**Qué aprendí.** Que la base de datos puede garantizar cosas que el código solo promete, la restricción UNIQUE resolvió la idempotencia mejor que cualquier bandera. Que las pruebas no son un trámite, una de ellas encontró un error real del motor antes que yo. Que probar la app como usuaria real encuentra cosas que ninguna herramienta ve, en las primeras pruebas en producción descubrimos que el campo del seudónimo pasaba tan desapercibido que todas las usuarias se lo saltaban y quedaban bloqueadas al final del cuestionario sin explicación, y que el distintivo de la racha funcionaba como botón de salir y cerraba la sesión al tocarlo por curiosidad. Se corrigió haciendo el seudónimo un paso destacado y obligatorio desde la primera pantalla, con aviso claro, y separando la racha del cierre de sesión. Un cuarto hallazgo, la pantalla de cada lectura no tenía el menú de navegación y dejaba a la usuaria sin regreso directo, se le agregó. Y que usar IA sin perder el control significa leer cada cambio, correr las verificaciones y saber explicar cada archivo del proyecto.

**Qué mejoraría con más tiempo.** El bosque compartido, la pieza más querida del roadmap, cada amiga tiene un árbol y si alguien lleva días sin entrar, su árbol pierde hojas. El diseño de privacidad es la clave, la app jamás diría que alguien está deprimida, solo diría tu amiga no ha visitado el bosque, y se le podría enviar una hoja, un rayito de sol, una carta o una mariposa. Requiere sistema de amistades, políticas RLS entre usuarias y una bandeja de regalos, por eso se decidió no improvisarlo sobre la app en producción y construirlo como versión dos. También, notas de voz en el círculo con voz distorsionada para proteger el anonimato, junto con Supabase Realtime en lugar de sondeo. Un panel de moderación con cola de publicaciones marcadas. Sesiones del círculo con tema fijado por la moderadora en base de datos. Y pruebas de integración sobre las Server Actions con una base de prueba.

## Aviso importante

SafeSpace es apoyo entre pares y no sustituye atención profesional de salud mental. En México, la Línea de la Vida atiende 24 horas en el 800 911 2000 y las emergencias en el 911.
