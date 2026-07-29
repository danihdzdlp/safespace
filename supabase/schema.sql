-- ============================================================
-- SafeSpace, esquema de base de datos
-- Ejecutar completo en el SQL Editor de Supabase (una sola vez).
-- Cada tabla de datos personales lleva Row Level Security.
-- La seguridad vive en la base, no en el codigo de la aplicacion.
-- ============================================================

-- ---------- Perfiles ----------
create table if not exists perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  seudonimo text not null check (char_length(seudonimo) between 2 and 18),
  nivel_dificultad int not null default 1 check (nivel_dificultad between 1 and 3),
  racha int not null default 0,
  ultimo_dia_completo date,
  animo_base int check (animo_base between 1 and 5),
  invitacion_foro text not null default 'activa' check (invitacion_foro in ('activa','suave')),
  creado_en timestamptz not null default now()
);
alter table perfiles enable row level security;
create policy "perfil propio lectura" on perfiles for select using (auth.uid() = id);
create policy "perfil propio alta" on perfiles for insert with check (auth.uid() = id);
create policy "perfil propio cambio" on perfiles for update using (auth.uid() = id);

-- ---------- Cuestionario ----------
create table if not exists cuestionario_respuestas (
  usuaria_id uuid not null references perfiles (id) on delete cascade,
  pregunta int not null check (pregunta between 1 and 15),
  respuesta jsonb not null,
  respondida_en timestamptz not null default now(),
  primary key (usuaria_id, pregunta)
);
alter table cuestionario_respuestas enable row level security;
create policy "respuestas propias" on cuestionario_respuestas
  for all using (auth.uid() = usuaria_id) with check (auth.uid() = usuaria_id);

create table if not exists objetivos_usuaria (
  usuaria_id uuid not null references perfiles (id) on delete cascade,
  objetivo text not null,
  primary key (usuaria_id, objetivo)
);
alter table objetivos_usuaria enable row level security;
create policy "objetivos propios" on objetivos_usuaria
  for all using (auth.uid() = usuaria_id) with check (auth.uid() = usuaria_id);

create table if not exists categorias_pref (
  usuaria_id uuid not null references perfiles (id) on delete cascade,
  categoria text not null,
  primary key (usuaria_id, categoria)
);
alter table categorias_pref enable row level security;
create policy "categorias propias" on categorias_pref
  for all using (auth.uid() = usuaria_id) with check (auth.uid() = usuaria_id);

-- ---------- Catalogo de tareas (lectura publica autenticada) ----------
create table if not exists catalogo_tareas (
  id serial primary key,
  titulo text not null,
  objetivo text not null,
  categoria text not null,
  dificultad int not null check (dificultad between 1 and 3),
  minutos int not null,
  guia text
);
alter table catalogo_tareas enable row level security;
create policy "catalogo visible" on catalogo_tareas for select to authenticated using (true);

-- ---------- Path del dia ----------
-- La restriccion UNIQUE garantiza la idempotencia por diseno de base de datos,
-- recargar la pagina nunca genera un conjunto distinto de tareas.
create table if not exists asignaciones (
  id bigint generated always as identity primary key,
  usuaria_id uuid not null references perfiles (id) on delete cascade,
  fecha date not null,
  unique (usuaria_id, fecha)
);
alter table asignaciones enable row level security;
create policy "asignaciones propias" on asignaciones
  for all using (auth.uid() = usuaria_id) with check (auth.uid() = usuaria_id);

create table if not exists asignacion_tareas (
  id bigint generated always as identity primary key,
  asignacion_id bigint not null references asignaciones (id) on delete cascade,
  tarea_id int not null references catalogo_tareas (id),
  completada boolean not null default false,
  completada_en timestamptz
);
alter table asignacion_tareas enable row level security;
-- El dueno de la asignacion es el dueno de sus renglones de tareas
create policy "tareas de mi asignacion" on asignacion_tareas
  for all using (
    exists (select 1 from asignaciones a where a.id = asignacion_id and a.usuaria_id = auth.uid())
  ) with check (
    exists (select 1 from asignaciones a where a.id = asignacion_id and a.usuaria_id = auth.uid())
  );

-- ---------- Foro ----------
create table if not exists salas (
  id text primary key,
  nombre text not null
);
alter table salas enable row level security;
create policy "salas visibles" on salas for select to authenticated using (true);

-- seudonimo denormalizado a proposito, permite mostrar autores sin exponer perfiles ajenos via RLS
create table if not exists publicaciones (
  id bigint generated always as identity primary key,
  sala_id text not null references salas (id),
  usuaria_id uuid not null references perfiles (id) on delete cascade,
  seudonimo text not null,
  texto text not null check (char_length(texto) between 1 and 2000),
  nivel_riesgo text not null default 'bajo' check (nivel_riesgo in ('bajo','medio','alto')),
  creada_en timestamptz not null default now()
);
create index if not exists publicaciones_sala_fecha on publicaciones (sala_id, creada_en desc);
alter table publicaciones enable row level security;
create policy "foro lectura" on publicaciones for select to authenticated using (true);
create policy "foro alta propia" on publicaciones for insert with check (auth.uid() = usuaria_id);

create table if not exists respuestas (
  id bigint generated always as identity primary key,
  publicacion_id bigint not null references publicaciones (id) on delete cascade,
  usuaria_id uuid not null references perfiles (id) on delete cascade,
  seudonimo text not null,
  texto text not null check (char_length(texto) between 1 and 500),
  creada_en timestamptz not null default now()
);
create index if not exists respuestas_publicacion on respuestas (publicacion_id, creada_en);
alter table respuestas enable row level security;
create policy "respuestas lectura" on respuestas for select to authenticated using (true);
create policy "respuestas alta propia" on respuestas for insert with check (auth.uid() = usuaria_id);

-- ---------- Panel de lecturas ----------
create table if not exists lecturas (
  id serial primary key,
  titulo text not null,
  tema text not null,
  minutos int not null,
  cuerpo text[] not null
);
alter table lecturas enable row level security;
create policy "lecturas visibles" on lecturas for select to authenticated using (true);

create table if not exists lecturas_usuaria (
  usuaria_id uuid not null references perfiles (id) on delete cascade,
  lectura_id int not null references lecturas (id),
  leida boolean not null default false,
  guardada boolean not null default false,
  marcada_en timestamptz not null default now(),
  primary key (usuaria_id, lectura_id)
);
alter table lecturas_usuaria enable row level security;
create policy "mis lecturas" on lecturas_usuaria
  for all using (auth.uid() = usuaria_id) with check (auth.uid() = usuaria_id);

-- ---------- Animo diario ----------
create table if not exists animo_diario (
  usuaria_id uuid not null references perfiles (id) on delete cascade,
  fecha date not null,
  valor int not null check (valor between 1 and 5),
  primary key (usuaria_id, fecha)
);
alter table animo_diario enable row level security;
create policy "mi animo" on animo_diario
  for all using (auth.uid() = usuaria_id) with check (auth.uid() = usuaria_id);

-- ---------- Eventos de emergencia (registro anonimo) ----------
create table if not exists eventos_emergencia (
  id bigint generated always as identity primary key,
  usuaria_hash text,
  creado_en timestamptz not null default now()
);
alter table eventos_emergencia enable row level security;
-- cualquiera puede registrar el evento, nadie puede leerlos desde el cliente
create policy "evento alta" on eventos_emergencia for insert to anon, authenticated with check (true);

-- ============================================================
-- Datos semilla
-- ============================================================
insert into salas (id, nombre) values
  ('ansiedad', 'Ansiedad'),
  ('animo', 'Ánimo bajo'),
  ('relaciones', 'Relaciones')
on conflict (id) do nothing;

insert into catalogo_tareas (titulo, objetivo, categoria, dificultad, minutos, guia) values
  ('Respira 4-7-8 durante tres minutos', 'ansiedad', 'respiracion', 1, 5, 'Siéntate cómoda, inhala por la nariz contando 4, sostén el aire contando 7 y exhala por la boca contando 8, como apagando una velita. Repite el ciclo unas 8 veces. Si te mareas un poco al inicio es normal, baja los números a 3-5-6.'),
  ('Nombra 5 cosas que ves, 4 que oyes y 3 que tocas', 'ansiedad', 'respiracion', 1, 5, 'Es un ancla para cuando la mente se acelera. Donde estés, di en voz baja o mentalmente 5 cosas que ves, 4 sonidos que oyes y 3 texturas que tocas. Hazlo lento, como describiéndoselo a alguien que no está ahí.'),
  ('Haz un escaneo corporal de pies a cabeza', 'ansiedad', 'respiracion', 2, 10, 'Acuéstate o siéntate y cierra los ojos. Recorre tu cuerpo despacio desde los pies hasta la cabeza, notando cómo se siente cada parte sin cambiar nada, solo observando. Donde encuentres tensión, respira hacia ahí y suéltala al exhalar.'),
  ('Escribe lo que te preocupa y qué parte depende de ti', 'ansiedad', 'escritura', 2, 15, 'Divide una hoja en dos columnas, lo que depende de mí y lo que no. Vacía todas tus preocupaciones y repártelas. Con las de tu columna elige una acción pequeña, y a las otras dales permiso de existir sin cargarlas hoy.'),
  ('Estira cuello y hombros con calma', 'ansiedad', 'movimiento', 1, 5, 'Lleva la oreja derecha hacia el hombro y sostén 20 segundos, cambia de lado. Luego sube los hombros hacia las orejas, sostén 5 segundos y suéltalos de golpe, tres veces. Termina dibujando círculos lentos con los hombros hacia atrás.'),
  ('Escribe 3 cosas que salieron bien hoy', 'animo', 'escritura', 1, 10, 'Antes de dormir escribe tres cosas que salieron bien hoy, por chiquitas que sean, el café estuvo rico también cuenta. El chiste es escribir también por qué salieron bien. Entrena al cerebro a registrar lo bueno, que por diseño se le escapa.'),
  ('Describe un momento pequeño que disfrutaste', 'animo', 'escritura', 1, 5, 'Elige un momento del día que disfrutaste aunque durara segundos y descríbelo con detalle, dónde estabas, qué se sentía, qué lo hizo bueno. Escribir los detalles alarga el efecto del momento.'),
  ('Escríbele una carta breve a tu yo de hace un año', 'animo', 'escritura', 3, 20, 'Escríbele unas líneas a la persona que eras hace un año. Cuéntale qué ha pasado, qué superaste que entonces parecía imposible, y qué te gustaría que supiera. No la corrijas, agradécele.'),
  ('Baila una canción completa', 'animo', 'movimiento', 2, 5, 'Pon la canción que te prenda, sube el volumen y muévete sin coreografía y sin espejo, nadie te ve. Una sola canción completa, de principio a fin. El cuerpo suelta lo que la mente lleva cargando.'),
  ('Camina 10 minutos sin teléfono', 'animo', 'movimiento', 1, 10, 'Deja el teléfono en casa y sal a caminar 10 minutos sin destino. Fíjate en tres cosas que nunca habías notado de tu calle. Caminar sin estímulos le da espacio a la mente para acomodarse sola.'),
  ('Arma una playlist de 5 canciones que te calman', 'animo', 'creatividad', 1, 15, 'Arma una lista con 5 canciones que te bajen las revoluciones, no las más tristes, las que te calman. Guárdala con un nombre que te haga sonreír. Es tu botiquín sonoro para los días difíciles.'),
  ('Mándale un mensaje a alguien querido', 'conexion', 'conexion', 1, 5, 'Mándale un mensaje a alguien que quieras sin pedir nada a cambio, solo me acordé de ti, o gracias por la otra vez. Corto y honesto. La conexión se riega con gestos chiquitos y frecuentes.'),
  ('Agradécele algo específico a una persona', 'conexion', 'conexion', 2, 10, 'Dile a una persona algo concreto que hizo y que te ayudó, entre más específico mejor, gracias por escucharme el martes sin juzgarme. Lo específico se siente verdadero, lo genérico se olvida.'),
  ('Llama a alguien con quien no hablas hace tiempo', 'conexion', 'conexion', 3, 15, 'Elige a esa persona con la que llevas tiempo sin hablar y márcale, aunque sean 10 minutos. Si da nervio, empieza con me acordé de ti y quise saber cómo estás. Casi siempre del otro lado también querían llamar.'),
  ('Entra al círculo de hoy, aunque solo leas', 'conexion', 'conexion', 1, 10, 'Hoy a las 8 asómate al círculo, aunque solo leas lo que otras personas comparten. Escuchar también es participar, y conocer historias parecidas a la tuya baja la sensación de estar sola en esto.'),
  ('Escribe qué necesitas decirle a alguien y cómo', 'relaciones', 'escritura', 2, 15, 'Piensa en esa conversación pendiente y escríbela primero, qué necesitas decir, qué sientes, qué pedirías. No la mandes todavía. Escribirla ordena, y ya ordenada decides si la dices, cuándo y cómo.'),
  ('Anota una discusión reciente y qué sentías debajo del enojo', 'relaciones', 'escritura', 3, 15, 'Recuerda una discusión reciente y escribe qué sentías debajo del enojo, casi siempre hay miedo, tristeza o cansancio disfrazados. Nombrar la emoción de abajo cambia la próxima conversación.'),
  ('Anota qué te dio energía hoy y qué te la quitó', 'autoconocimiento', 'escritura', 1, 10, 'Haz dos listas de tu día, qué me dio energía y qué me la quitó. Sin juzgar, solo registra. Después de unos días vas a ver patrones claros, y ahí es donde empiezan las buenas decisiones.'),
  ('Escribe tus 3 valores y un ejemplo de hoy', 'autoconocimiento', 'escritura', 3, 15, 'Escribe tres cosas que te importan de verdad, honestidad, familia, crear, lo que sea. Junto a cada una anota un momento de hoy en que actuaste conforme a ella, o en que te alejaste. Conocer tus valores es tener brújula.'),
  ('Dibuja cómo te sientes, sin juzgarlo', 'autoconocimiento', 'creatividad', 2, 15, 'Toma papel y algo para dibujar y dale forma a lo que sientes, colores, rayones, formas abstractas, no importa que no quede bonito. No lo pienses, deja que la mano hable. Al final ponle un título.'),
  ('Lee una lectura del panel de hoy', 'autoconocimiento', 'lectura', 1, 5, 'Abre el panel de lecturas y elige la que te llame, son de 3 a 5 minutos. Léela despacio y quédate con una sola idea, la que más te haya movido. Una idea aplicada vale más que diez leídas.'),
  ('Deja el teléfono fuera del cuarto 30 minutos antes de dormir', 'descanso', 'descanso', 2, 5, 'Media hora antes de dormir deja el teléfono cargando fuera de tu cuarto, o lo más lejos de la cama que puedas. Si lo usas de alarma, hoy es buen día para conseguir un despertador. Las primeras noches cuesta, después se agradece.'),
  ('Prepara tu cuarto para dormir mejor esta noche', 'descanso', 'descanso', 1, 10, 'Dedícale 10 minutos a tu cuarto pensando en dormir mejor, baja la luz, ventila tantito, acomoda la cama, aleja los pendientes visibles. Tu cuarto le manda señales a tu cerebro, procura que digan descanso.'),
  ('Toma un té o agua caliente sin pantallas', 'descanso', 'descanso', 1, 10, 'Prepárate un té o agua caliente y tómatelo sin ninguna pantalla enfrente, solo tú y la taza, sintiendo el calor y el sabor. Cinco minutos de no hacer nada también son una forma de cuidarte.'),
  ('Camina 30 minutos al aire libre, mirando tu entorno', 'animo', 'movimiento', 2, 30, 'Sal a un parque o donde haya pasto y camina sin audífonos, a paso cómodo. Cuando la mente se vaya a los pendientes, regrésala con suavidad a lo que ves, los árboles, la luz, la gente, los sonidos. No intentes dejar la mente en blanco a la fuerza, solo vuelve a mirar, una y otra vez. Eso es meditar caminando.');

insert into lecturas (titulo, tema, minutos, cuerpo) values
  ('Por qué la ansiedad se siente en el cuerpo', 'ansiedad', 5, array[
    'Quizá te ha pasado, estás en clase o en tu cama y de pronto el corazón se acelera, el pecho se aprieta, las manos sudan. No hay ningún peligro a la vista y aun así tu cuerpo actúa como si lo hubiera. No estás exagerando y no te estás volviendo loca, tu sistema de alarma está haciendo exactamente su trabajo, solo que en el momento equivocado.',
    'La ansiedad es un mecanismo antiquísimo. Cuando tu cerebro interpreta amenaza, real o imaginaria, suelta adrenalina y prepara al cuerpo para correr o pelear, el corazón bombea más rápido, la respiración se acorta para llevar oxígeno urgente, los músculos se tensan. Era perfecto para escapar de un depredador. Es agotador cuando la amenaza es un examen, un mensaje sin responder o un pensamiento a las 3 de la mañana.',
    'Aquí está la clave que cambia todo, ese sistema no distingue entre peligro real y peligro imaginado, pero sí escucha al cuerpo. Cuando tu respiración se alarga, especialmente la exhalación, le mandas al cerebro la señal contraria, aquí no hay emergencia. No es un truco de relajación, es fisiología pura, la exhalación lenta activa el freno natural de tu sistema nervioso.',
    'Por eso pelear con el pensamiento ansioso casi nunca funciona, es discutir con una alarma. Funciona mejor empezar por el cuerpo, respira inhalando en 4 tiempos, sostén 7 y exhala en 8, suelta los hombros, siente los pies en el piso, nombra 5 cosas que ves. Cuando el cuerpo baja la alarma, el pensamiento se vuelve manejable.',
    'Y una nota importante, sentir ansiedad de vez en cuando es humano y normal. Pero si la alarma se dispara casi a diario, te quita el sueño o te está haciendo evitar cosas que te importan, eso ya merece contárselo a un profesional de la salud. Pedir esa cita no es rendirse, es llevarle el problema a quien sabe desactivar alarmas.']),
  ('La ola de los 90 segundos', 'basicos', 4, array[
    'Hay un dato que cambió la forma en que muchas personas se relacionan con sus emociones. La parte química de una emoción intensa, la descarga que sientes en el cuerpo, dura alrededor de 90 segundos. Minuto y medio. Lo que la mantiene viva durante horas no es la química, es la historia que le contamos encima, una y otra vez, como quien le echa leña a una fogata.',
    'Piénsalo con un enojo reciente. El golpe inicial fue rápido, el calor en la cara, el nudo en el estómago. Lo que duró toda la tarde fue el repaso, lo que dijo, lo que debiste contestar, lo que vas a decir mañana. Cada repetición vuelve a encender la misma química. No es que la emoción sea eterna, es que la estamos renovando.',
    'Esto no significa que lo que sientes no importe o que debas cortarlo a la fuerza. Significa que puedes tratar la emoción como una ola. Llega, sube, hace cresta, y si no la alimentas con la misma historia, baja sola. Tu trabajo no es detener la ola, nadie puede, es no ahogarte en ella, dejarla pasar a través de ti.',
    'Una herramienta concreta para lograrlo es nombrar. Cuando venga la próxima ola, dilo por su nombre, estoy sintiendo enojo, estoy sintiendo tristeza, estoy sintiendo celos. Suena demasiado simple, pero al nombrar la emoción activas la parte del cerebro que observa, y observar ya es dejar de estar completamente adentro. Los surfistas no le ganan al mar, aprenden a leerlo.',
    'La próxima vez que sientas la subida, prueba esto, pon un temporizador mental de 90 segundos, respira lento y solo observa qué hace tu cuerpo, sin resolver nada todavía. Las decisiones importantes casi siempre salen mejor después de la ola que arriba de ella.']),
  ('Pedir ayuda no es debilidad', 'conexion', 5, array[
    'Hay una idea muy instalada, sobre todo entre la gente joven, de que pedir ayuda es una derrota, como si la vida fuera un examen individual donde voltear a ver a alguien más es hacer trampa. Es una idea que suena a fortaleza y produce lo contrario, gente cargando sola cosas que no se cargan sola.',
    'La biología dice otra cosa. Los seres humanos estamos literalmente construidos para regularnos en compañía. Desde bebés, nuestro sistema nervioso aprende a calmarse con la presencia de otro, y eso no se apaga al crecer. Por eso una conversación buena puede bajarte la angustia que llevabas días rumiando. No es dependencia, es diseño.',
    'Pedir ayuda es además una habilidad, y como toda habilidad, se entrena empezando pequeño. No necesitas contar tu vida entera ni tener las palabras perfectas. Puedes decir simplemente, hoy no fue un buen día y quería decírselo a alguien. O mandar un mensaje que diga, tienes 10 minutos para hablar. La otra persona no necesita resolver nada, casi siempre basta con que escuche.',
    'Y si ahora mismo sientes que no tienes a quién decírselo, dos cosas. La primera, para eso existe este espacio, el círculo abre todos los días a las 8, entras con seudónimo y compartes lo que traes, o solo escuchas, también cuenta. La segunda, esa sensación de no tener a nadie casi siempre es la emoción hablando, no la realidad completa, hay gente que se alegraría de saber de ti y no lo imaginas.',
    'Un último recordatorio que vale para siempre, si lo que cargas se siente demasiado grande, más grande que tú, ahí ya no toca resolverlo con amigas ni con apps, toca un profesional. Y si es urgente, el botón SOS de esta pantalla conecta con personas capacitadas, gratis y a cualquier hora. Usarlo también es una forma de fortaleza.']),
  ('Qué hacer cuando no quieres hacer nada', 'animo', 5, array[
    'Cuando el ánimo está bajo pasa algo muy injusto, lo que más te ayudaría, moverte, ver gente, salir, es exactamente lo que menos ganas tienes de hacer. Y encima llega la culpa por no hacerlo. Si estás en ese círculo, lo primero que necesitas saber es que no es flojera y no es falta de carácter, es cómo funciona el ánimo bajo, apaga el motor de las ganas.',
    'Nos contaron la historia al revés. Nos dijeron que primero llega la motivación y luego la acción, entonces esperamos a tener ganas. Pero en el ánimo bajo funciona en el orden contrario, primero viene una acción muy pequeña, y la motivación llega después, a veces. Esperar a tener ganas es esperar un tren que sale de otra estación.',
    'La palabra clave es tamaño. No es levántate y haz ejercicio, es siéntate en la orilla de la cama. No es limpia tu cuarto, es recoge una sola cosa. No es escríbele a tus amigas, es responde un mensaje. La acción diminuta parece ridícula, y justo por eso funciona, es tan pequeña que el cerebro no alcanza a ponerle resistencia. Y romper la inercia, aunque sea con un milímetro, cambia la física del día.',
    'El path de SafeSpace está construido exactamente con esa lógica, por eso cuando llevas días sin completar nada, no te regaña ni te exige más, te baja la carga a una sola tarea pequeña. Porque volver con algo mínimo vale infinitamente más que no volver. Pequeño no es poco, pequeño es la puerta.',
    'Y el límite honesto, si llevas más de dos semanas en las que casi nada te da placer, te cuesta dormir o comer, y el vacío no cede, eso merece una consulta con un profesional de la salud mental. No para etiquetarte, para ayudarte a salir con herramientas que sí funcionan. Mientras tanto, hoy, una cosa pequeña. Solo una.']),
  ('Dormir también es cuidarte', 'descanso', 4, array[
    'Solemos tratar el sueño como tiempo muerto, lo que queda cuando terminamos todo lo demás, y lo recortamos sin culpa. Pero mientras duermes, tu cerebro hace un trabajo que no puede hacer despierto, procesa lo que viviste, archiva recuerdos y recalibra las emociones del día siguiente. Dormir no es pausar tu vida, es mantenimiento de tu vida.',
    'Una noche mala ya se nota, y la ciencia lo ha medido, con poco sueño interpretamos peor las caras de los demás, todo se ve un poco más hostil, los problemas parecen más grandes y la paciencia se acaba antes. Si últimamente todo te irrita o te abruma, antes de sacar conclusiones sobre tu vida, pregúntate cómo has dormido.',
    'La buena noticia es que no necesitas una rutina perfecta de influencer. Necesitas dos o tres señales consistentes que le avisen a tu cuerpo que el día terminó. Bajar la intensidad de la luz una hora antes. Soltar el teléfono un rato antes de acostarte, la luz de la pantalla y el scroll le dicen a tu cerebro exactamente lo contrario de buenas noches. Algo caliente sin cafeína. Las mismas señales, casi a la misma hora, y el cuerpo aprende.',
    'Si llevas semanas durmiendo mal y ya intentaste lo básico, no lo normalices, el insomnio sostenido es de los problemas de salud más tratables que existen y de los que más impacto tienen al resolverse. Coméntalo con un profesional. Descansar no debería ser una batalla permanente, y no tiene que serlo.']),
  ('Escuchar sin arreglar', 'conexion', 4, array[
    'Cuando alguien que queremos comparte algo doloroso, el impulso automático es arreglarlo. Dar consejos, buscarle el lado bueno, contar que a nosotras nos pasó algo peor. Todo eso sale del cariño, y sin embargo casi siempre llega en el momento equivocado, porque lo primero que necesita una persona dolida rara vez es una solución, es sentirse escuchada.',
    'Hay una diferencia enorme entre sentirse escuchada y sentirse respondida. Escuchada es que el otro se quede contigo en lo que sientes, sin prisa por sacarte de ahí. Respondida es recibir un manual de instrucciones cuando lo que querías era compañía. Los consejos no pedidos, aunque sean buenos, muchas veces se sienten como una forma amable de decir, ya no quiero seguir oyendo esto.',
    'Escuchar sin arreglar suena así de simple, eso suena muy pesado, gracias por contármelo, estoy aquí contigo, quieres que solo te escuche o quieres ideas. Esa última pregunta es oro puro, le devuelve el control a la persona y te quita la presión de adivinar. Y ojo con las palabras que parecen consuelo y no lo son, los al menos, los pudo ser peor, los otros están sufriendo más.',
    'En el círculo practicamos exactamente esto, una persona comparte y las demás escuchan primero, los consejos solo llegan si alguien los pide. Pruébalo también afuera de la app, en tu casa, con tus amigas. Vas a notar que escuchar así es más difícil de lo que parece, y que cambia por completo la calidad de tus conversaciones. Es de los mejores regalos que se le pueden dar a alguien, y es gratis.']),
  ('Háblate como le hablarías a tu mejor amiga', 'autoconocimiento', 5, array[
    'Haz este experimento, recuerda lo último que te dijiste a ti misma después de equivocarte. Ahora imagina decirle esas mismas palabras, con ese mismo tono, a tu mejor amiga cuando se equivocó. Si la sola idea te incomoda, ya descubriste algo importante, tienes un doble estándar, y la persona que sale perdiendo eres tú.',
    'Muchas personas creen que esa voz interna dura es su motor, que sin ella se volverían conformistas. La evidencia dice lo contrario. La autocrítica constante no mejora el rendimiento, lo desgasta, porque a nadie le salen bien las cosas bajo un bombardeo permanente. Piensa en dos entrenadores, uno exige y te cuida a la vez, otro solo grita. Con cuál llegas más lejos, y con cuál terminas abandonando.',
    'La autocompasión no es bajar el estándar ni echarse porras vacías. Es cambiar de entrenador. Es hablarte con la misma honestidad pero sin la crueldad, sí me equivoqué, sí me duele, y también es verdad que era mi primera vez, que estaba cansada, que puedo intentarlo distinto mañana. La exigencia se queda, el maltrato se va.',
    'Un ejercicio concreto para esta semana. Cada vez que te caches siendo dura contigo, haz una pausa de tres segundos y pregúntate, qué le diría a mi mejor amiga si estuviera exactamente en esto. Y luego, esta es la parte difícil, dítelo a ti, con esas palabras. Al principio se siente raro, como un idioma nuevo. Es normal, llevas años hablando el otro.',
    'Con el tiempo pasa algo curioso, la voz amable no te vuelve blanda, te vuelve más valiente, porque intentar cosas nuevas asusta menos cuando sabes que un error no va a desatar una golpiza interna. Trátate como tratas a la gente que quieres. Tú también eres gente que quieres.']),
  ('Pequeño no es poco', 'basicos', 4, array[
    'Tenemos una idea cinematográfica del cambio, el antes y después dramático, el giro de vida completo, el lunes en que todo empieza. Y esa idea, aunque emociona, es la principal razón por la que los cambios no duran, porque lo enorme no cabe en un día normal, con tareas, cansancio y mal humor. Al primer tropiezo, el plan gigante se derrumba entero.',
    'Los cambios que sí duran casi siempre empiezan con algo tan pequeño que da casi pena contarlo. Tres minutos de respiración. Un mensaje enviado. Una nota de dos líneas antes de dormir. Un vaso de agua. Lo pequeño tiene un superpoder que lo grande no tiene, cabe en cualquier día, incluso en los peores, y lo que cabe en los peores días es lo único que sobrevive.',
    'Lo que construye un hábito no es el tamaño del gesto, es volver mañana. Por eso la racha de SafeSpace mide constancia y no intensidad, y por eso no se rompe con castigos, premia regresar. Un día de tres minutos vale más que un sábado heroico de tres horas que no se repite jamás. La identidad se construye por acumulación, cada vez que vuelves, te demuestras algo.',
    'Así que si hoy solo puedes con la versión mínima de tu path, hazla completa y sin culpa, no es la versión de consolación, es la versión que funciona. Y si ni eso, vuelve mañana, la puerta no se cierra. Pequeño no es poco. Pequeño, repetido, es como se construye todo lo grande que conoces.']);
