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
  minutos int not null
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
  ('animo', 'Animo bajo'),
  ('relaciones', 'Relaciones')
on conflict (id) do nothing;

insert into catalogo_tareas (titulo, objetivo, categoria, dificultad, minutos) values
  ('Respira 4-7-8 durante tres minutos', 'ansiedad', 'respiracion', 1, 5),
  ('Nombra 5 cosas que ves, 4 que oyes y 3 que tocas', 'ansiedad', 'respiracion', 1, 5),
  ('Haz un escaneo corporal de pies a cabeza', 'ansiedad', 'respiracion', 2, 10),
  ('Escribe lo que te preocupa y que parte depende de ti', 'ansiedad', 'escritura', 2, 15),
  ('Estira cuello y hombros con calma', 'ansiedad', 'movimiento', 1, 5),
  ('Escribe 3 cosas que salieron bien hoy', 'animo', 'escritura', 1, 10),
  ('Describe un momento pequeno que disfrutaste', 'animo', 'escritura', 1, 5),
  ('Escribele una carta breve a tu yo de hace un ano', 'animo', 'escritura', 3, 20),
  ('Baila una cancion completa', 'animo', 'movimiento', 2, 5),
  ('Camina 10 minutos sin telefono', 'animo', 'movimiento', 1, 10),
  ('Arma una playlist de 5 canciones que te calman', 'animo', 'creatividad', 1, 15),
  ('Mandale un mensaje a alguien querido', 'conexion', 'conexion', 1, 5),
  ('Agradecele algo especifico a una persona', 'conexion', 'conexion', 2, 10),
  ('Llama a alguien con quien no hablas hace tiempo', 'conexion', 'conexion', 3, 15),
  ('Entra al circulo de hoy, aunque solo leas', 'conexion', 'conexion', 1, 10),
  ('Escribe que necesitas decirle a alguien y como', 'relaciones', 'escritura', 2, 15),
  ('Anota una discusion reciente y que sentias debajo del enojo', 'relaciones', 'escritura', 3, 15),
  ('Anota que te dio energia hoy y que te la quito', 'autoconocimiento', 'escritura', 1, 10),
  ('Escribe tus 3 valores y un ejemplo de hoy', 'autoconocimiento', 'escritura', 3, 15),
  ('Dibuja como te sientes, sin juzgarlo', 'autoconocimiento', 'creatividad', 2, 15),
  ('Lee una lectura del panel de hoy', 'autoconocimiento', 'lectura', 1, 5),
  ('Deja el telefono fuera del cuarto 30 minutos antes de dormir', 'descanso', 'descanso', 2, 5),
  ('Prepara tu cuarto para dormir mejor esta noche', 'descanso', 'descanso', 1, 10),
  ('Toma un te o agua caliente sin pantallas', 'descanso', 'descanso', 1, 10);

insert into lecturas (titulo, tema, minutos, cuerpo) values
  ('Por que la ansiedad se siente en el cuerpo', 'ansiedad', 4, array[
    'La ansiedad no es solo un pensamiento, es una respuesta fisica. Tu cuerpo interpreta que hay una amenaza y se prepara para correr o pelear, el corazon se acelera, la respiracion se acorta, los musculos se tensan. Es un sistema muy antiguo que no distingue entre un examen y un peligro real.',
    'Por eso las tecnicas que trabajan desde el cuerpo funcionan tan bien. Cuando alargas la exhalacion, le mandas a tu sistema nervioso la senal contraria, aqui no hay peligro. No es magia, es fisiologia.',
    'La proxima vez que la sientas, intenta esto, en lugar de pelear con el pensamiento, empieza por el cuerpo. Respira lento, suelta los hombros, siente los pies en el piso. El pensamiento se calma despues.']),
  ('La ola de los 90 segundos', 'basicos', 3, array[
    'Una emocion intensa, en su parte quimica, dura alrededor de 90 segundos en el cuerpo. Lo que la mantiene viva mas tiempo es la historia que nos contamos sobre ella, una y otra vez.',
    'Esto no significa que lo que sientes no importe. Significa que puedes tratar la emocion como una ola, llega, sube, y si no la alimentas con la misma historia, baja. Tu trabajo no es detener la ola, es no ahogarte en ella.',
    'Cuando venga la proxima, prueba nombrarla, estoy sintiendo enojo, estoy sintiendo tristeza. Nombrar lo que sientes ya es empezar a surfearla.']),
  ('Pedir ayuda no es debilidad', 'conexion', 4, array[
    'Hay una idea muy instalada de que pedir ayuda es una derrota, como si la vida fuera un examen individual. Pero los seres humanos estamos literalmente construidos para regularnos en compania, es biologia, no dependencia.',
    'Pedir ayuda es una habilidad, y como toda habilidad, se entrena. Puedes empezar pequeno, no necesitas contar todo, puedes decir simplemente, hoy no fue un buen dia, queria decirselo a alguien.',
    'Y si sientes que por ahora no tienes a quien decirselo, para eso existe este espacio. El circulo de las 8 abre todos los dias.']),
  ('Que hacer cuando no quieres hacer nada', 'animo', 5, array[
    'Cuando el animo esta bajo, la motivacion no llega primero. Es al reves de lo que nos contaron, primero viene la accion pequena, y la motivacion llega despues, si llega. Esperar a tener ganas es esperar un tren que sale de otra estacion.',
    'La clave esta en el tamano. No es levantate y haz ejercicio, es sientate en la cama. No es limpia tu cuarto, es recoge una cosa. Pequeno no es poco, pequeno es lo que rompe la inercia.',
    'Y si hoy solo pudiste con una cosa minima, cuenta. En serio cuenta. El path de SafeSpace esta disenado exactamente con esa logica.']),
  ('Dormir tambien es cuidarte', 'descanso', 4, array[
    'El sueno no es tiempo perdido, es el momento en que tu cerebro procesa lo que viviste y regula las emociones del dia siguiente. Dormir mal una noche ya cambia como interpretas las caras de los demas, todo se ve un poco mas hostil.',
    'No necesitas una rutina perfecta. Necesitas dos o tres senales consistentes que le avisen a tu cuerpo que el dia termino, bajar la luz, soltar el telefono un rato antes, algo caliente sin pantallas.',
    'Si llevas semanas durmiendo mal y ya lo intentaste, ese es un buen tema para llevar con un profesional de la salud. Descansar no deberia ser una batalla permanente.']),
  ('Escuchar sin arreglar', 'conexion', 3, array[
    'Cuando alguien comparte algo doloroso, el impulso natural es arreglarlo, dar consejos, buscar el lado bueno. Casi siempre, lo que la otra persona necesita primero es otra cosa, sentirse escuchada.',
    'Escuchar sin arreglar suena asi, eso suena muy pesado, gracias por contarmelo, estoy aqui. Sin peros, sin al menos, sin lo que yo haria.',
    'En el circulo practicamos exactamente eso. Una persona comparte, las demas escuchan. Los consejos, solo si alguien los pide.']),
  ('Hablate como le hablarias a tu mejor amiga', 'autoconocimiento', 4, array[
    'Fijate en como te hablas cuando te equivocas. Muchas personas usan con ellas mismas un tono que jamas usarian con alguien que quieren. La autocritica constante no te hace mejor, te hace mas pequena.',
    'La autocompasion no es bajar el estandar, es cambiar el entrenador. Un buen entrenador te exige y te cuida a la vez. Uno que solo grita, tarde o temprano hace que abandones.',
    'Ejercicio simple, la proxima vez que te descubras siendo dura contigo, preguntate, que le diria a mi mejor amiga si estuviera en esto. Y luego ditelo a ti.']),
  ('Pequeno no es poco', 'basicos', 3, array[
    'Los cambios que duran casi nunca empiezan grandes. Empiezan con algo tan pequeno que da casi verguenza contarlo, tres minutos de respiracion, un mensaje enviado, una nota de dos lineas.',
    'Lo que construye el habito no es el tamano del gesto, es volver manana. Por eso en SafeSpace la racha mide constancia, no intensidad.',
    'Si hoy solo puedes con la version minima de tu path, hazla. Manana el punto de partida ya es otro.']);
