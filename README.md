# SafeSpace

**Proyecto final de Daniela Hernandez De la Peña**

SafeSpace es una aplicación web de apoyo emocional entre pares para personas jóvenes. La idea la vengo desarrollando desde hace tiempo y en este curso por fin la construí de verdad. Tiene un cuestionario inicial que personaliza la experiencia sin diagnosticar a nadie, un path diario de tareas pequeñas con guías de cómo hacerlas, un árbol que crece con tu constancia bajo un paisaje que cambia según el ánimo que registras, un círculo de escucha con dos sesiones al día, una sección de meditación con audios que grabé con mi propia voz, un panel de lecturas y un botón de emergencia que está visible en todo momento.

- App en producción: https://safespace-wheat.vercel.app
- Documento de planeación: `docs/SafeSpace_Documento_Definicion_Proyecto.pdf`

## Stack y función de cada herramienta

Elegí cada herramienta por una razón concreta, no por moda. El detalle de las comparaciones está en el documento de planeación, aquí va el resumen de qué hace cada una en mi proyecto.

| Herramienta | Para qué la uso |
| --- | --- |
| Next.js 14, App Router | Es el marco de la aplicación. Los componentes de servidor leen los datos y las Server Actions concentran la lógica de negocio |
| TypeScript estricto | Me atrapa los errores de tipos antes de ejecutar. Varias veces me salvó de subir algo roto |
| Supabase | La autenticación, la base de datos Postgres, las políticas de seguridad por fila y el almacenamiento de mis audios |
| Tailwind CSS | Los estilos, con una paleta azul pizarra que definí para que leer de noche no canse la vista |
| Zod | La validación de todo lo que entra al servidor |
| Vitest | Mis 36 pruebas automatizadas de la lógica central |
| GitHub y GitHub Actions | El control de versiones por etapas y la revisión automática de calidad en cada cambio |
| Vercel | El hosting. Cada push a main se despliega solo y cada rama genera un preview |
| Claude, de Anthropic | Mi copiloto de desarrollo. Más abajo documento exactamente cómo lo usé y qué errores le atrapé |

## Correr el proyecto en local

1. Clonar el repositorio y entrar a la carpeta
2. `npm install`
3. Copiar `.env.example` como `.env.local` y llenar los valores del proyecto de Supabase
4. Ejecutar `supabase/schema.sql` completo en el SQL Editor de Supabase
5. `npm run dev` y abrir http://localhost:3000

Para verificar todo, `npm run typecheck`, `npm run lint` y `npm test`.

## Variables de entorno

| Variable | Qué es |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | La URL de mi proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La clave pública anon. Puede ser pública porque la seguridad real está en las políticas RLS de la base |

En Vercel las configuré en Settings, Environment Variables. La clave `service_role` no se usa en ninguna parte de la aplicación y nunca debe subirse al repositorio, esa regla la dejé escrita desde la planeación.

## Decisiones de arquitectura

**La ventana horaria vive en el servidor.** El círculo abre en dos sesiones diarias, de 3:00 a 5:00 y de 8:00 a 10:00 pm hora del centro de México. Al principio planeé una sola sesión de 8:00 a 9:30, pero las primeras personas que probaron la app me hicieron ver que, siendo un espacio escrito, más ventanas dan más oportunidades de participar. El estado del foro no se guarda en ningún lado, se calcula con el reloj del servidor contra la zona America/Mexico_City. El reloj del teléfono solo pinta la cuenta regresiva, porque es un dato que la usuaria controla y no puede ser fuente de verdad.

**La idempotencia la garantiza la base de datos.** El path del día tiene la restricción UNIQUE(usuaria_id, fecha). Recargar la página o dos peticiones al mismo tiempo jamás generan dos paths distintos. Esta fue de las cosas que más me gustó aprender, la base puede garantizar cosas que el código solo promete.

**La seguridad está en la base, no en la interfaz.** Todas las tablas con datos personales tienen Row Level Security. Aunque la clave anon es pública, cada usuaria solo puede leer y escribir sus propios renglones.

**Sondeo en lugar de websockets.** Las publicaciones del círculo se refrescan cada 10 segundos, solo dentro de la ventana y solo si la pestaña está visible. Lo decidí en el plan de recorte del documento de planeación, menos infraestructura y menos formas de fallar para un piloto. El tiempo real queda para la versión dos.

**El círculo es escrito, no hablado.** Lo evalué y decidí texto por tres razones, la voz identifica a la persona y rompe el anonimato, la detección de lenguaje de riesgo y la moderación funcionan sobre texto, y el audio agrega infraestructura que el piloto no necesita. En el roadmap tengo la idea de notas de voz con voz distorsionada.

**Separación de responsabilidades.** La lógica pura vive en `src/lib` sin ninguna dependencia de red, por eso la puedo probar de forma aislada. Las Server Actions en `app/acciones` conectan la base de datos con la validación. Los componentes de cliente solo manejan la interacción.

**Optimizaciones que hice a mano.** Los renglones de tareas usan memo y useCallback para que marcar una tarea no vuelva a dibujar las demás. Las actualizaciones son optimistas y se revierten si el servidor falla. Las consultas juntan los datos relacionados en una sola ida y el listado del foro está indexado y acotado a 30 renglones.

**La pantalla de emergencia es estática.** La página `/emergencia` no depende de sesión, ni de base de datos, ni de internet más allá de cargarla. Los recursos viven en el código. Es la pantalla que tiene que funcionar aunque todo lo demás falle, y así la construí.

## Prompts principales usados con la IA

Usé la IA como copiloto durante todo el desarrollo, y con el tiempo fui afinando una forma de pedirle las cosas que me funcionó muy bien. Estas son las seis técnicas que apliqué:

**1. Darle el contexto como fuente de verdad.** Mis prompts partían del documento de planeación, no de la memoria. Le pedía, lee el documento de planeación de SafeSpace y construye a partir de él. Así trabajaba sobre mis decisiones y no inventaba alcance.

**2. Poner las restricciones dentro del prompt.** Nunca pedí haz un foro. Le fijaba las reglas que no se negocian, la validación de la ventana vive solo en el servidor, la zona oficial es America/Mexico_City, el reloj del cliente solo pinta.

**3. Definir el criterio de aceptación en la misma petición.** En los prompts de lógica pedía el código junto con sus pruebas y los valores exactos que debían pasar, por ejemplo, escribe pruebas para los límites 19:59:59, 20:00:00, 21:29:59 y 21:30:00. Así desde el prompt queda claro cómo se sabrá que quedó bien.

**4. Pedir poco a la vez.** Un módulo o una función por prompt, nunca hazme la app completa, y un commit por cada cambio con propósito. Así pude revisar cada resultado sin perderme.

**5. Corregir con evidencia.** Cuando la IA se equivocaba, mi corrección incluía la prueba o el error exacto, la prueba de no repetición falló porque el motor descarta las tareas recientes en bloque, corrígelo penalizándolas en el puntaje. Con evidencia, la corrección sale a la primera.

**6. Pedir explicación antes de aceptar.** Le pedía que me explicara qué hace cada cambio y por qué antes de integrarlo, y los archivos delicados, autenticación, seguridad y emergencia, los revisé con más calma. Estas reglas las dejé escritas en `CLAUDE.md` para que se respetaran en cada sesión.

### Anatomía de uno de mis prompts

El de la ventana horaria, desarmado en sus cuatro partes. Contexto, implementa estadoDelForo como función pura. Restricción, que derive el estado usando la zona America/Mexico_City con Intl, sin guardar estado. Tarea, para las dos sesiones del día. Criterio de aceptación, y escribe pruebas para los límites exactos de apertura y cierre. Un prompt así no deja a la IA adivinar ni el qué, ni el cómo, ni el cuándo está terminado.

### El prompt inicial del proyecto, completo

Este fue el prompt con el que arranqué la construcción, lo incluyo íntegro porque muestra el método completo en acción, contexto, restricciones, criterio de aceptación y formato de salida, todo en una sola petición:

> Vas a ser mi copiloto de desarrollo para SafeSpace, mi proyecto final. Antes de escribir nada, lee el documento de planeación que te compartí, ahí están todas las decisiones tomadas, las cinco funciones del producto, el modelo de datos preliminar del Anexo A y el principio rector del proyecto, que la seguridad y las garantías viven en la base de datos, no en el código.
>
> Tu tarea, construye el esquema SQL completo para Supabase en un solo archivo, schema.sql, que yo pueda pegar una sola vez en el SQL Editor y ejecutar sin errores.
>
> Restricciones que no se negocian. Primera, toda tabla con datos personales lleva Row Level Security con políticas donde cada usuaria solo puede leer y escribir sus propios renglones, porque la clave anon va a ser pública y la seguridad real tiene que estar en la base. Segunda, la tabla de asignaciones del path lleva la restricción UNIQUE(usuaria_id, fecha), quiero que la idempotencia del path del día la garantice la base de datos por diseño, no una bandera en el código, recargar la página jamás debe generar dos paths distintos. Tercera, en las publicaciones del foro el seudónimo va denormalizado, para poder mostrar autores sin abrir el acceso a perfiles ajenos a través de las políticas. Cuarta, los eventos del botón de emergencia se pueden escribir de forma anónima pero nadie puede leerlos desde el cliente. Quinta, la clave service_role no se usa en ninguna parte, ni en el esquema ni después en la aplicación.
>
> El esquema debe incluir, perfiles ligados a auth.users, las respuestas del cuestionario, objetivos y categorías de preferencia, el catálogo de tareas con sus datos semilla, las asignaciones diarias con sus tareas, las tres salas del foro con publicaciones y respuestas, las lecturas con su contenido semilla, el ánimo diario, y los eventos de emergencia.
>
> Criterio de aceptación, el script corre completo de una sola pasada, usa IF NOT EXISTS donde aplique para poder repetirse sin romper nada, deja los índices necesarios para las consultas frecuentes del foro, y termina con los datos semilla insertados. Coméntalo explicando el porqué de cada decisión, no el qué, y al final explícame las políticas RLS una por una antes de que yo lo ejecute.

El resultado fueron 13 tablas con sus políticas, índices y semillas, que corrieron a la primera y que siguen siendo la base de la aplicación en producción.

### Los demás prompts principales

1. "Implementa estadoDelForo como función pura que derive el estado de la ventana usando la zona America/Mexico_City con Intl, sin guardar estado, y escribe pruebas para los límites exactos 19:59:59, 20:00:00, 21:29:59 y 21:30:00"
2. "Escribe la server action publicarMensaje con las cuatro validaciones del documento en este orden, ventana horaria en servidor, contenido con Zod entre 1 y 2000 caracteres, límite de 5 mensajes por minuto, y evaluación de riesgo que marca sin bloquear"
3. "El motor del path debe seleccionar 3 tareas con categorías diversas sin repetir las de los últimos 14 días, con la regla compasiva de 1 tarea de dificultad 1 tras 3 días sin completar nada, hazlo función pura y determinista por fecha"
4. "La lista de tareas debe actualizar de forma optimista con reversa si la acción falla, y el renglón debe estar memoizado para no re-renderizar los demás al marcar uno"
5. "Configura GitHub Actions para correr typecheck, lint y las pruebas en cada push a main y en cada pull request"
6. "Agrega a cada tarea del catálogo una guía breve de cómo hacerla, visible con un botón propio separado del de completar, y una tarea nueva de caminata consciente de 30 minutos con su guía de meditación caminando"
7. "Agrega un árbol personal que crezca por etapas derivadas del total de tareas completadas, sin guardar estado propio, con la bienvenida de la semilla en la primera visita, y una afirmación que cambie cada media hora de forma determinista con la hora del centro de México"
8. "Dibuja detrás del árbol un paisaje que cambie con el ánimo registrado del día, lluvia, nublado, claros, medio sol o sol pleno, y suaviza la paleta azul a tonos pizarra de baja saturación cómodos para lectura nocturna"
9. "Haz el cuestionario y los textos de la interfaz neutros en género, y agrega una página de bienvenida pública, una gráfica de la evolución del ánimo y la instalación como app en el teléfono"
10. "Corrige la ortografía de todos los textos de la interfaz, acentos, eñes y signos de interrogación de apertura, sin romper la correspondencia entre las opciones del cuestionario y el motor del perfil"

## Limitaciones y alucinaciones de la IA detectadas y cómo las mitigué

Estos son errores reales que la IA cometió durante mi desarrollo y que mi proceso de verificación atrapó. Los documento porque la lección más importante que me llevo del proyecto es esta, la IA acelera muchísimo, pero el control de calidad es de una, con ayuda de las herramientas.

1. **El motor del path descartaba las tareas recientes en bloque.** La primera versión filtraba lo reciente por completo y, cuando quedaban pocas candidatas, las regresaba todas de golpe, así que un día podía repetir tareas teniendo alternativas nuevas. Me lo atrapó una prueba de Vitest que falló. Se corrigió penalizando lo reciente en el puntaje en lugar de descartarlo. Sin esa prueba, el error llegaba a producción.
2. **Puso lógica de servidor en una página estática.** El registro anónimo del evento de emergencia quedó dentro del renderizado de `/emergencia`, que es estática, y eso rompía el build. Lo detecté al correr `npm run build` antes de desplegar y el registro se movió al momento en que se presiona el botón SOS.
3. **Usó un alias de importación que no existía.** Ocho archivos importaban desde una ruta que el proyecto no tenía configurada. La verificación de tipos los marcó todos y se corrigió el mapa de rutas.
4. **Dejó tipos implícitos any en los manejadores de cookies.** El modo estricto de TypeScript los rechazó y se tiparon correctamente. Es el tipo de detalle que en producción esconde errores.
5. **Generó los textos sin ortografía española completa.** Toda la interfaz salió sin acentos, sin eñes y sin signos de apertura. Lo detecté probando la app en producción y pedí la corrección cuidando que las opciones del cuestionario y el motor del perfil siguieran coincidiendo, con las pruebas como red de seguridad.
6. **El riesgo permanente de que invente APIs.** Con bibliotecas que cambian rápido, la IA puede sugerir métodos de versiones viejas o inexistentes. Mi mitigación fue de proceso, todo cambio pasa por typecheck, lint y pruebas en local, y de nuevo en GitHub Actions antes de llegar a Vercel.

## AI log, bitácora cronológica

**27 de julio, planeación.** Le pedí a la IA estructurar mi documento de definición con las cinco secciones obligatorias, pseudocódigo, diagramas y análisis de alternativas. Las decisiones fueron mías, el alcance de las cinco funciones, el horario del círculo, las exclusiones y el plan de recorte.

**28 de julio, esquema de datos.** Le pedí el esquema de Supabase con RLS y la restricción UNIQUE para la idempotencia. Me entregó 13 tablas con políticas y datos semilla. Yo lo ejecuté en el SQL Editor y verifiqué que terminara sin errores.

**28 de julio, lógica central y su primer error.** Le pedí el motor del path con no repetición y regla compasiva. Su primera versión descartaba lo reciente en bloque, una prueba falló y con esa evidencia pedí la corrección. Quedó registrado como el primer error mitigado.

**28 de julio, dos errores más el mismo día.** Lógica de servidor en la página estática de emergencia, atrapada por el build, y un alias de importación inexistente en 8 archivos, atrapado por la verificación de tipos. Los dos se corrigieron antes de publicar.

**28 de julio, despliegue por etapas.** Este trabajo fue mío directo, creé mis cuentas de GitHub, Supabase y Vercel, subí el proyecto por etapas con commits descriptivos, configuré las variables de entorno y vi mi primer pipeline de GitHub Actions en verde.

**28 de julio, hallazgos probando como usuaria.** Descubrí que el campo del seudónimo pasaba desapercibido y bloqueaba el cuestionario sin explicación, y que el distintivo de la racha cerraba la sesión al tocarlo. Pedí las correcciones y las verifiqué en vivo.

**28 y 29 de julio, el producto evoluciona.** Con retroalimentación de las primeras personas que la probaron, pedí las guías paso a paso en las 25 tareas, la semilla y el árbol que crece, el paisaje del ánimo, el recordatorio de cada media hora y la ampliación del círculo a dos sesiones, con pruebas de los límites de ambas ventanas.

**29 de julio, la sección Meditar.** Decidí separar la meditación en su propia pestaña del menú. Durante la integración apareció una carpeta duplicada de un intento previo que apuntaba a una ruta inexistente, se detectó y se eliminó.

**29 y 30 de julio, mis audios.** Grabé 10 audios con mi voz, afirmaciones y meditaciones guiadas. La IA los convirtió a mp3, les limpió los graves y les emparejó el volumen, y los identificó por duración. Yo los subí a Supabase Storage, corregí la estructura de carpetas del bucket y probé la reproducción en la app.

**30 de julio, inclusión y pulido final.** Me di cuenta de que el cuestionario asumía género y pedí la reescritura en lenguaje neutro, sincronizada con el motor del perfil y verificada por las pruebas. Se agregaron la bienvenida pública, la gráfica del ánimo y la instalación como app, y actualicé el documento de planeación a la versión 2.0 con el anexo de evolución.

## Calidad antes de desplegar

Cada push a main corre en GitHub Actions la verificación de tipos, el lint y las 36 pruebas. Vercel despliega main a producción automáticamente y cada rama genera un entorno de preview. Ningún cambio llega a las usuarias sin pasar las tres puertas.

## Autoevaluación

**Qué funciona.** El flujo completo, registro, cuestionario de 15 preguntas, path diario con guías y racha, círculo con dos sesiones validadas en servidor, sección de meditación con mis audios, panel de lecturas, árbol con paisaje y botón de emergencia. La lógica central está probada y el CI la protege.

**Qué aprendí.** Que la base de datos puede garantizar cosas que el código solo promete. Que las pruebas no son un trámite, una encontró un error real antes que yo. Que probar la app como usuaria encuentra cosas que ninguna herramienta ve, así descubrí lo del seudónimo, lo de la racha, el menú faltante en las lecturas y los tiempos de lectura irreales, y todo se corrigió. Y que usar IA sin perder el control significa leer cada cambio, correr las verificaciones y poder explicar cada archivo del proyecto.

**Qué mejoraría con más tiempo.** El bosque compartido, mi idea favorita del roadmap, cada amistad tiene un árbol y si alguien deja de visitar el bosque su árbol pierde hojas, sin exponer nunca un estado clínico, la app diría solamente tu amiga no ha visitado el bosque, y se le podría enviar una hoja, un rayito de sol, una carta o una mariposa. Decidí no improvisarlo sobre la app en producción porque requiere amistades, políticas RLS entre usuarias y una bandeja de regalos, va como versión dos. También las notas de voz del círculo con voz distorsionada, el tiempo real con Supabase Realtime, un panel de moderación con cola de publicaciones marcadas, y grabar más audios.

## Aviso importante

SafeSpace es apoyo entre pares y no sustituye atención profesional de salud mental. En México, la Línea de la Vida atiende 24 horas en el 800 911 2000 y las emergencias en el 911.
