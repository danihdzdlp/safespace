-- Horarios del circulo actualizados a dos sesiones diarias,
-- de 3:00 a 5:00 y de 8:00 a 10:00 pm, en las guias y lecturas que lo mencionan.
-- Pegar completo en el SQL Editor de Supabase y ejecutar una sola vez.

update catalogo_tareas set guia = 'Asómate a cualquiera de las dos sesiones del círculo, de 3:00 a 5:00 o de 8:00 a 10:00 pm, aunque solo leas lo que otras personas comparten. Escuchar también es participar, y conocer historias parecidas a la tuya baja la sensación de estar sola en esto.' where id = 15;

update lecturas set cuerpo[4] = 'Y si ahora mismo sientes que no tienes a quién decírselo, dos cosas. La primera, para eso existe este espacio, el círculo abre dos veces al día, de 3:00 a 5:00 y de 8:00 a 10:00 pm, entras con seudónimo y compartes lo que traes, o solo escuchas, también cuenta. La segunda, esa sensación de no tener a nadie casi siempre es la emoción hablando, no la realidad completa, hay gente que se alegraría de saber de ti y no lo imaginas.' where id = 3;
