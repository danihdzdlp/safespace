-- Actualización de textos de SafeSpace, acentos y lecturas ampliadas
-- Pegar completo en el SQL Editor de Supabase y ejecutar una sola vez.

update salas set nombre = 'Ánimo bajo' where id = 'animo';

update catalogo_tareas set titulo = 'Respira 4-7-8 durante tres minutos' where id = 1;
update catalogo_tareas set titulo = 'Nombra 5 cosas que ves, 4 que oyes y 3 que tocas' where id = 2;
update catalogo_tareas set titulo = 'Haz un escaneo corporal de pies a cabeza' where id = 3;
update catalogo_tareas set titulo = 'Escribe lo que te preocupa y qué parte depende de ti' where id = 4;
update catalogo_tareas set titulo = 'Estira cuello y hombros con calma' where id = 5;
update catalogo_tareas set titulo = 'Escribe 3 cosas que salieron bien hoy' where id = 6;
update catalogo_tareas set titulo = 'Describe un momento pequeño que disfrutaste' where id = 7;
update catalogo_tareas set titulo = 'Escríbele una carta breve a tu yo de hace un año' where id = 8;
update catalogo_tareas set titulo = 'Baila una canción completa' where id = 9;
update catalogo_tareas set titulo = 'Camina 10 minutos sin teléfono' where id = 10;
update catalogo_tareas set titulo = 'Arma una playlist de 5 canciones que te calman' where id = 11;
update catalogo_tareas set titulo = 'Mándale un mensaje a alguien querido' where id = 12;
update catalogo_tareas set titulo = 'Agradécele algo específico a una persona' where id = 13;
update catalogo_tareas set titulo = 'Llama a alguien con quien no hablas hace tiempo' where id = 14;
update catalogo_tareas set titulo = 'Entra al círculo de hoy, aunque solo leas' where id = 15;
update catalogo_tareas set titulo = 'Escribe qué necesitas decirle a alguien y cómo' where id = 16;
update catalogo_tareas set titulo = 'Anota una discusión reciente y qué sentías debajo del enojo' where id = 17;
update catalogo_tareas set titulo = 'Anota qué te dio energía hoy y qué te la quitó' where id = 18;
update catalogo_tareas set titulo = 'Escribe tus 3 valores y un ejemplo de hoy' where id = 19;
update catalogo_tareas set titulo = 'Dibuja cómo te sientes, sin juzgarlo' where id = 20;
update catalogo_tareas set titulo = 'Lee una lectura del panel de hoy' where id = 21;
update catalogo_tareas set titulo = 'Deja el teléfono fuera del cuarto 30 minutos antes de dormir' where id = 22;
update catalogo_tareas set titulo = 'Prepara tu cuarto para dormir mejor esta noche' where id = 23;
update catalogo_tareas set titulo = 'Toma un té o agua caliente sin pantallas' where id = 24;

update lecturas set titulo = 'Por qué la ansiedad se siente en el cuerpo', minutos = 5, cuerpo = array[
  'Quizá te ha pasado, estás en clase o en tu cama y de pronto el corazón se acelera, el pecho se aprieta, las manos sudan. No hay ningún peligro a la vista y aun así tu cuerpo actúa como si lo hubiera. No estás exagerando y no te estás volviendo loca, tu sistema de alarma está haciendo exactamente su trabajo, solo que en el momento equivocado.',
  'La ansiedad es un mecanismo antiquísimo. Cuando tu cerebro interpreta amenaza, real o imaginaria, suelta adrenalina y prepara al cuerpo para correr o pelear, el corazón bombea más rápido, la respiración se acorta para llevar oxígeno urgente, los músculos se tensan. Era perfecto para escapar de un depredador. Es agotador cuando la amenaza es un examen, un mensaje sin responder o un pensamiento a las 3 de la mañana.',
  'Aquí está la clave que cambia todo, ese sistema no distingue entre peligro real y peligro imaginado, pero sí escucha al cuerpo. Cuando tu respiración se alarga, especialmente la exhalación, le mandas al cerebro la señal contraria, aquí no hay emergencia. No es un truco de relajación, es fisiología pura, la exhalación lenta activa el freno natural de tu sistema nervioso.',
  'Por eso pelear con el pensamiento ansioso casi nunca funciona, es discutir con una alarma. Funciona mejor empezar por el cuerpo, respira inhalando en 4 tiempos, sostén 7 y exhala en 8, suelta los hombros, siente los pies en el piso, nombra 5 cosas que ves. Cuando el cuerpo baja la alarma, el pensamiento se vuelve manejable.',
  'Y una nota importante, sentir ansiedad de vez en cuando es humano y normal. Pero si la alarma se dispara casi a diario, te quita el sueño o te está haciendo evitar cosas que te importan, eso ya merece contárselo a un profesional de la salud. Pedir esa cita no es rendirse, es llevarle el problema a quien sabe desactivar alarmas.'
] where id = 1;

update lecturas set titulo = 'La ola de los 90 segundos', minutos = 4, cuerpo = array[
  'Hay un dato que cambió la forma en que muchas personas se relacionan con sus emociones. La parte química de una emoción intensa, la descarga que sientes en el cuerpo, dura alrededor de 90 segundos. Minuto y medio. Lo que la mantiene viva durante horas no es la química, es la historia que le contamos encima, una y otra vez, como quien le echa leña a una fogata.',
  'Piénsalo con un enojo reciente. El golpe inicial fue rápido, el calor en la cara, el nudo en el estómago. Lo que duró toda la tarde fue el repaso, lo que dijo, lo que debiste contestar, lo que vas a decir mañana. Cada repetición vuelve a encender la misma química. No es que la emoción sea eterna, es que la estamos renovando.',
  'Esto no significa que lo que sientes no importe o que debas cortarlo a la fuerza. Significa que puedes tratar la emoción como una ola. Llega, sube, hace cresta, y si no la alimentas con la misma historia, baja sola. Tu trabajo no es detener la ola, nadie puede, es no ahogarte en ella, dejarla pasar a través de ti.',
  'Una herramienta concreta para lograrlo es nombrar. Cuando venga la próxima ola, dilo por su nombre, estoy sintiendo enojo, estoy sintiendo tristeza, estoy sintiendo celos. Suena demasiado simple, pero al nombrar la emoción activas la parte del cerebro que observa, y observar ya es dejar de estar completamente adentro. Los surfistas no le ganan al mar, aprenden a leerlo.',
  'La próxima vez que sientas la subida, prueba esto, pon un temporizador mental de 90 segundos, respira lento y solo observa qué hace tu cuerpo, sin resolver nada todavía. Las decisiones importantes casi siempre salen mejor después de la ola que arriba de ella.'
] where id = 2;

update lecturas set titulo = 'Pedir ayuda no es debilidad', minutos = 5, cuerpo = array[
  'Hay una idea muy instalada, sobre todo entre la gente joven, de que pedir ayuda es una derrota, como si la vida fuera un examen individual donde voltear a ver a alguien más es hacer trampa. Es una idea que suena a fortaleza y produce lo contrario, gente cargando sola cosas que no se cargan sola.',
  'La biología dice otra cosa. Los seres humanos estamos literalmente construidos para regularnos en compañía. Desde bebés, nuestro sistema nervioso aprende a calmarse con la presencia de otro, y eso no se apaga al crecer. Por eso una conversación buena puede bajarte la angustia que llevabas días rumiando. No es dependencia, es diseño.',
  'Pedir ayuda es además una habilidad, y como toda habilidad, se entrena empezando pequeño. No necesitas contar tu vida entera ni tener las palabras perfectas. Puedes decir simplemente, hoy no fue un buen día y quería decírselo a alguien. O mandar un mensaje que diga, tienes 10 minutos para hablar. La otra persona no necesita resolver nada, casi siempre basta con que escuche.',
  'Y si ahora mismo sientes que no tienes a quién decírselo, dos cosas. La primera, para eso existe este espacio, el círculo abre todos los días a las 8, entras con seudónimo y compartes lo que traes, o solo escuchas, también cuenta. La segunda, esa sensación de no tener a nadie casi siempre es la emoción hablando, no la realidad completa, hay gente que se alegraría de saber de ti y no lo imaginas.',
  'Un último recordatorio que vale para siempre, si lo que cargas se siente demasiado grande, más grande que tú, ahí ya no toca resolverlo con amigas ni con apps, toca un profesional. Y si es urgente, el botón SOS de esta pantalla conecta con personas capacitadas, gratis y a cualquier hora. Usarlo también es una forma de fortaleza.'
] where id = 3;

update lecturas set titulo = 'Qué hacer cuando no quieres hacer nada', minutos = 5, cuerpo = array[
  'Cuando el ánimo está bajo pasa algo muy injusto, lo que más te ayudaría, moverte, ver gente, salir, es exactamente lo que menos ganas tienes de hacer. Y encima llega la culpa por no hacerlo. Si estás en ese círculo, lo primero que necesitas saber es que no es flojera y no es falta de carácter, es cómo funciona el ánimo bajo, apaga el motor de las ganas.',
  'Nos contaron la historia al revés. Nos dijeron que primero llega la motivación y luego la acción, entonces esperamos a tener ganas. Pero en el ánimo bajo funciona en el orden contrario, primero viene una acción muy pequeña, y la motivación llega después, a veces. Esperar a tener ganas es esperar un tren que sale de otra estación.',
  'La palabra clave es tamaño. No es levántate y haz ejercicio, es siéntate en la orilla de la cama. No es limpia tu cuarto, es recoge una sola cosa. No es escríbele a tus amigas, es responde un mensaje. La acción diminuta parece ridícula, y justo por eso funciona, es tan pequeña que el cerebro no alcanza a ponerle resistencia. Y romper la inercia, aunque sea con un milímetro, cambia la física del día.',
  'El path de SafeSpace está construido exactamente con esa lógica, por eso cuando llevas días sin completar nada, no te regaña ni te exige más, te baja la carga a una sola tarea pequeña. Porque volver con algo mínimo vale infinitamente más que no volver. Pequeño no es poco, pequeño es la puerta.',
  'Y el límite honesto, si llevas más de dos semanas en las que casi nada te da placer, te cuesta dormir o comer, y el vacío no cede, eso merece una consulta con un profesional de la salud mental. No para etiquetarte, para ayudarte a salir con herramientas que sí funcionan. Mientras tanto, hoy, una cosa pequeña. Solo una.'
] where id = 4;

update lecturas set titulo = 'Dormir también es cuidarte', minutos = 4, cuerpo = array[
  'Solemos tratar el sueño como tiempo muerto, lo que queda cuando terminamos todo lo demás, y lo recortamos sin culpa. Pero mientras duermes, tu cerebro hace un trabajo que no puede hacer despierto, procesa lo que viviste, archiva recuerdos y recalibra las emociones del día siguiente. Dormir no es pausar tu vida, es mantenimiento de tu vida.',
  'Una noche mala ya se nota, y la ciencia lo ha medido, con poco sueño interpretamos peor las caras de los demás, todo se ve un poco más hostil, los problemas parecen más grandes y la paciencia se acaba antes. Si últimamente todo te irrita o te abruma, antes de sacar conclusiones sobre tu vida, pregúntate cómo has dormido.',
  'La buena noticia es que no necesitas una rutina perfecta de influencer. Necesitas dos o tres señales consistentes que le avisen a tu cuerpo que el día terminó. Bajar la intensidad de la luz una hora antes. Soltar el teléfono un rato antes de acostarte, la luz de la pantalla y el scroll le dicen a tu cerebro exactamente lo contrario de buenas noches. Algo caliente sin cafeína. Las mismas señales, casi a la misma hora, y el cuerpo aprende.',
  'Si llevas semanas durmiendo mal y ya intentaste lo básico, no lo normalices, el insomnio sostenido es de los problemas de salud más tratables que existen y de los que más impacto tienen al resolverse. Coméntalo con un profesional. Descansar no debería ser una batalla permanente, y no tiene que serlo.'
] where id = 5;

update lecturas set titulo = 'Escuchar sin arreglar', minutos = 4, cuerpo = array[
  'Cuando alguien que queremos comparte algo doloroso, el impulso automático es arreglarlo. Dar consejos, buscarle el lado bueno, contar que a nosotras nos pasó algo peor. Todo eso sale del cariño, y sin embargo casi siempre llega en el momento equivocado, porque lo primero que necesita una persona dolida rara vez es una solución, es sentirse escuchada.',
  'Hay una diferencia enorme entre sentirse escuchada y sentirse respondida. Escuchada es que el otro se quede contigo en lo que sientes, sin prisa por sacarte de ahí. Respondida es recibir un manual de instrucciones cuando lo que querías era compañía. Los consejos no pedidos, aunque sean buenos, muchas veces se sienten como una forma amable de decir, ya no quiero seguir oyendo esto.',
  'Escuchar sin arreglar suena así de simple, eso suena muy pesado, gracias por contármelo, estoy aquí contigo, quieres que solo te escuche o quieres ideas. Esa última pregunta es oro puro, le devuelve el control a la persona y te quita la presión de adivinar. Y ojo con las palabras que parecen consuelo y no lo son, los al menos, los pudo ser peor, los otros están sufriendo más.',
  'En el círculo practicamos exactamente esto, una persona comparte y las demás escuchan primero, los consejos solo llegan si alguien los pide. Pruébalo también afuera de la app, en tu casa, con tus amigas. Vas a notar que escuchar así es más difícil de lo que parece, y que cambia por completo la calidad de tus conversaciones. Es de los mejores regalos que se le pueden dar a alguien, y es gratis.'
] where id = 6;

update lecturas set titulo = 'Háblate como le hablarías a tu mejor amiga', minutos = 5, cuerpo = array[
  'Haz este experimento, recuerda lo último que te dijiste a ti misma después de equivocarte. Ahora imagina decirle esas mismas palabras, con ese mismo tono, a tu mejor amiga cuando se equivocó. Si la sola idea te incomoda, ya descubriste algo importante, tienes un doble estándar, y la persona que sale perdiendo eres tú.',
  'Muchas personas creen que esa voz interna dura es su motor, que sin ella se volverían conformistas. La evidencia dice lo contrario. La autocrítica constante no mejora el rendimiento, lo desgasta, porque a nadie le salen bien las cosas bajo un bombardeo permanente. Piensa en dos entrenadores, uno exige y te cuida a la vez, otro solo grita. Con cuál llegas más lejos, y con cuál terminas abandonando.',
  'La autocompasión no es bajar el estándar ni echarse porras vacías. Es cambiar de entrenador. Es hablarte con la misma honestidad pero sin la crueldad, sí me equivoqué, sí me duele, y también es verdad que era mi primera vez, que estaba cansada, que puedo intentarlo distinto mañana. La exigencia se queda, el maltrato se va.',
  'Un ejercicio concreto para esta semana. Cada vez que te caches siendo dura contigo, haz una pausa de tres segundos y pregúntate, qué le diría a mi mejor amiga si estuviera exactamente en esto. Y luego, esta es la parte difícil, dítelo a ti, con esas palabras. Al principio se siente raro, como un idioma nuevo. Es normal, llevas años hablando el otro.',
  'Con el tiempo pasa algo curioso, la voz amable no te vuelve blanda, te vuelve más valiente, porque intentar cosas nuevas asusta menos cuando sabes que un error no va a desatar una golpiza interna. Trátate como tratas a la gente que quieres. Tú también eres gente que quieres.'
] where id = 7;

update lecturas set titulo = 'Pequeño no es poco', minutos = 4, cuerpo = array[
  'Tenemos una idea cinematográfica del cambio, el antes y después dramático, el giro de vida completo, el lunes en que todo empieza. Y esa idea, aunque emociona, es la principal razón por la que los cambios no duran, porque lo enorme no cabe en un día normal, con tareas, cansancio y mal humor. Al primer tropiezo, el plan gigante se derrumba entero.',
  'Los cambios que sí duran casi siempre empiezan con algo tan pequeño que da casi pena contarlo. Tres minutos de respiración. Un mensaje enviado. Una nota de dos líneas antes de dormir. Un vaso de agua. Lo pequeño tiene un superpoder que lo grande no tiene, cabe en cualquier día, incluso en los peores, y lo que cabe en los peores días es lo único que sobrevive.',
  'Lo que construye un hábito no es el tamaño del gesto, es volver mañana. Por eso la racha de SafeSpace mide constancia y no intensidad, y por eso no se rompe con castigos, premia regresar. Un día de tres minutos vale más que un sábado heroico de tres horas que no se repite jamás. La identidad se construye por acumulación, cada vez que vuelves, te demuestras algo.',
  'Así que si hoy solo puedes con la versión mínima de tu path, hazla completa y sin culpa, no es la versión de consolación, es la versión que funciona. Y si ni eso, vuelve mañana, la puerta no se cierra. Pequeño no es poco. Pequeño, repetido, es como se construye todo lo grande que conoces.'
] where id = 8;
