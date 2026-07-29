# Guia de despliegue y plan de trabajo

Esta guia te lleva de la carpeta del proyecto a los tres enlaces que pide la entrega. Tiempo estimado la primera vez, entre 60 y 90 minutos.

Nota importante sobre honestidad. La rubrica evalua que tu historial de GitHub refleje un proceso real. Esta guia te propone subir el proyecto por etapas mientras revisas, pruebas y ajustas cada pieza con Claude Code. Los commits deben corresponder a trabajo que de verdad hiciste y que puedes explicar, esa es ademas la defensa perfecta en la presentacion.

## Paso 1, Supabase (15 min)

1. Crea una cuenta en supabase.com y un proyecto nuevo, region us-east-1 esta bien
2. En el menu SQL Editor pega el contenido completo de `supabase/schema.sql` y ejecuta. Debe terminar sin errores y crear 13 tablas con sus politicas y datos semilla
3. En Authentication, Sign In / Up, desactiva Confirm email para el piloto, asi las cuentas de prueba entran de inmediato
4. En Project Settings, API, copia dos valores, Project URL y anon public key

## Paso 2, correr en local (10 min)

1. `npm install`
2. Copia `.env.example` como `.env.local` y pega tus dos valores de Supabase
3. `npm run dev` y abre http://localhost:3000
4. Crea una cuenta, responde el cuestionario y verifica que aparezca tu path del dia
5. Corre `npm run typecheck`, `npm run lint` y `npm test`, todo debe pasar

## Paso 3, GitHub por etapas (el corazon de la rubrica)

Crea un repositorio publico vacio llamado safespace en github.com, sin README inicial. Despues, desde la carpeta del proyecto, sube el trabajo por etapas. Entre cada etapa, abre los archivos con Claude Code, pide que te explique lo que no sea claro, ajusta lo que quieras ajustar y prueba en local. Un ritmo natural es una o dos etapas por dia.

Etapa 1, fundacion
```
git init
git add package.json tsconfig.json next.config.mjs tailwind.config.ts postcss.config.mjs .eslintrc.json .gitignore .env.example vitest.config.ts CLAUDE.md app/globals.css app/layout.tsx app/page.tsx
git commit -m "Fundacion del proyecto, Next.js con TypeScript estricto, Tailwind con la paleta nocturna y convenciones en CLAUDE.md"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/safespace.git
git push -u origin main
```

Etapa 2, esquema de datos y seguridad
```
git add supabase/schema.sql src/lib/supabase/
git commit -m "Esquema de Supabase con RLS en todas las tablas personales, restriccion UNIQUE para idempotencia del path y datos semilla"
git push
```

Etapa 3, logica central pura con pruebas
```
git add src/lib/foro.ts src/lib/perfil.ts src/lib/path.ts src/lib/riesgo.ts tests/
git commit -m "Logica central como funciones puras, ventana horaria en zona oficial, motor del path y perfil del cuestionario, con 25 pruebas"
git push
```

Etapa 4, autenticacion y boton de emergencia
```
git add middleware.ts app/entrar/ app/salir/ app/emergencia/ src/components/BotonEmergencia.tsx
git commit -m "Autenticacion con Supabase, middleware de rutas protegidas y pagina de emergencia estatica con boton SOS global"
git push
```

Etapa 5, cuestionario y path del dia
```
git add app/acciones/ app/cuestionario/ app/hoy/ app/ruta/ src/components/Nav.tsx src/components/Encabezado.tsx
git commit -m "Cuestionario de 15 preguntas, server actions con validacion Zod y path del dia con actualizacion optimista y racha"
git push
```

Etapa 6, circulo y lecturas
```
git add app/circulo/ app/lecturas/
git commit -m "Circulo con ventana validada en servidor, sondeo pausado en pestana oculta, limite de frecuencia y deteccion de riesgo que marca sin bloquear, panel de lecturas por perfil"
git push
```

Etapa 7, calidad y documentacion
```
git add .github/ README.md GUIA_DE_DESPLIEGUE.md docs/
git commit -m "CI con GitHub Actions, typecheck, lint y pruebas en cada push, README con stack, prompts y alucinaciones de IA mitigadas"
git push
```

Desde la etapa 7, cada push mostrara una palomita verde de Actions en GitHub. Si algo sale rojo, corre las verificaciones en local, corrige y vuelve a subir, ese ciclo tambien es evidencia de proceso.

## Paso 4, Vercel (15 min)

1. Entra a vercel.com con tu cuenta de GitHub e importa el repositorio safespace
2. Antes de desplegar, en Environment Variables agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con tus valores
3. Deploy. En un par de minutos tendras tu dominio, algo como safespace-tuusuario.vercel.app
4. Prueba el flujo completo en el dominio publico, cuenta nueva, cuestionario, path, circulo, lecturas y boton SOS
5. Pega el dominio en el README donde dice PENDIENTE y sube ese cambio, ese sera un commit mas de tu historial

Con esto Vercel queda conectado a GitHub, cada push a main despliega solo y cada rama genera un preview, que es justo lo que pide el nivel 5.

## Paso 5, la entrega

En el forum entrega los tres enlaces, el repositorio publico, el dominio de Vercel y el README ya esta en la raiz del repositorio.

## Como trabajar con Claude Code sin perder el control

- Pidele cambios chicos y concretos, un archivo o una funcion por vez
- Antes de aceptar un cambio, pidele que te explique que hace y por que
- Despues de cada cambio corre `npm run typecheck` y `npm test`
- Los archivos de autenticacion, RLS y emergencia se revisan linea por linea, esta regla ya vive en CLAUDE.md y Claude Code la respeta
- Si algo que sugiere no compila o una prueba falla, ese momento vale oro, documentalo en la seccion de alucinaciones del README con que paso y como lo resolviste
