-- Sección de meditación, tres guías paso a paso para el panel de lecturas,
-- y tiempos de lectura honestos para los textos existentes.
-- Pegar completo en el SQL Editor de Supabase y ejecutar una sola vez.

-- Tiempos honestos segun la longitud real de cada lectura
update lecturas set minutos = 4 where id in (1, 3, 4, 7);
update lecturas set minutos = 3 where id in (2, 5, 6, 8);

insert into lecturas (titulo, tema, minutos, cuerpo)
select 'Respiración para aterrizar, guía de 5 minutos', 'meditacion', 5, array[
  'Esta es una guía para cuando la cabeza va demasiado rápido y necesitas volver al presente. Busca un lugar donde puedas estar 5 minutos sin interrupciones, sentada en una silla o en el piso, con la espalda cómoda pero despierta. Puedes cerrar los ojos o dejar la mirada suave en un punto fijo.',
  'Empieza por notar tu cuerpo. Siente el peso sobre la silla o el piso, los pies tocando el suelo, las manos donde estén. No cambies nada todavía, solo date cuenta de que estás aquí.',
  'Ahora lleva la atención a tu respiración, sin modificarla, solo obsérvala dos o tres ciclos, por dónde entra el aire, hasta dónde llega, cómo sale.',
  'Cuando estés lista, empieza el ritmo, inhala por la nariz contando 4, sostén el aire contando 4, y exhala por la boca contando 6, despacio, como si empañaras un vidrio. La exhalación larga es la que le avisa a tu cuerpo que no hay peligro.',
  'Tu mente se va a ir a los pendientes, es su naturaleza y no significa que lo estés haciendo mal. Cada vez que lo notes, sin regañarte, regresa al conteo. Ese regreso es exactamente el ejercicio, cada vuelta cuenta como una repetición en el gimnasio.',
  'Repite el ciclo unas 10 veces, alrededor de 4 minutos. Para cerrar, respira normal, mueve suave los dedos, abre los ojos si los cerraste, y nota si algo cambió, aunque sea un 5 por ciento. Con eso basta por hoy.'
]
where not exists (select 1 from lecturas where titulo = 'Respiración para aterrizar, guía de 5 minutos');

insert into lecturas (titulo, tema, minutos, cuerpo)
select 'Escaneo del cuerpo para antes de dormir', 'meditacion', 8, array[
  'Esta guía es para soltar el día desde la cama. Acuéstate boca arriba, apaga la pantalla al terminar de leer los pasos, y deja los brazos a los lados. La idea es simple, vas a recorrer tu cuerpo con la atención, como una lucecita cálida que pasa despacio, y donde encuentre tensión, la suelta.',
  'Empieza por los pies. Nota su temperatura, el contacto con la cobija, y al exhalar imagina que se vuelven pesados, que la cama los sostiene por completo. Quédate ahí dos o tres respiraciones.',
  'Sube despacio, pantorrillas, rodillas, muslos. En cada zona lo mismo, notar, respirar, soltar el peso. No hay prisa, si te quedas dormida a la mitad, la meditación cumplió su trabajo mejor que nunca.',
  'Sigue con la cadera, la panza y el pecho. Aquí vive mucha tensión del día, así que date una respiración extra. Nota cómo la panza sube y baja sola, sin que tú hagas nada, tu cuerpo sabe respirar sin ayuda.',
  'Continúa con la espalda, los hombros, que suelen cargar todo, deja que se hundan en el colchón, los brazos hasta las puntas de los dedos, el cuello, la mandíbula, aflójala y separa un poquito los dientes, y por último la frente y los ojos.',
  'Al terminar el recorrido, quédate un momento sintiendo el cuerpo completo, pesado y sostenido. Si aparece un pensamiento del día, déjalo pasar como quien ve un coche pasar por la calle, no te subas. Buenas noches.'
]
where not exists (select 1 from lecturas where titulo = 'Escaneo del cuerpo para antes de dormir');

insert into lecturas (titulo, tema, minutos, cuerpo)
select 'Caminata con los cinco sentidos', 'meditacion', 10, array[
  'Esta es una meditación en movimiento, perfecta si estar quieta te desespera. Necesitas unos 10 minutos y cualquier lugar para caminar, un parque es ideal pero una calle tranquila también sirve. Sin audífonos, el sonido es parte del ejercicio.',
  'Los primeros pasos, camina a tu ritmo normal y nota el cuerpo caminando, el peso que cambia de un pie al otro, el vaivén de los brazos, el aire en la cara. No tienes que caminar raro ni lento, solo darte cuenta.',
  'Ahora dedica un minuto a cada sentido. Primero la vista, busca 5 cosas que normalmente no notarías, el color de una puerta, la forma de una nube, una planta creciendo donde no debería.',
  'Luego el oído, cierra el foco visual y cuenta cuántos sonidos distintos puedes distinguir, los cercanos, los lejanos, los constantes y los que van y vienen.',
  'Sigue el tacto, la temperatura del aire en la piel, la textura del piso a través de los zapatos, el sol o la sombra. Después el olfato, qué huele esta calle, y si traes agua o un dulce, termina con el gusto, un sorbo o un trago con toda la atención.',
  'Cuando la mente se vaya a los pendientes, y se va a ir muchas veces, no pelees con ella, solo elige un sentido y vuelve a él. Al final, antes de entrar a lo que sigue de tu día, pregúntate qué fue lo más bonito que percibiste. Esa pregunta entrena a tu atención para buscar lo bueno.'
]
where not exists (select 1 from lecturas where titulo = 'Caminata con los cinco sentidos');
