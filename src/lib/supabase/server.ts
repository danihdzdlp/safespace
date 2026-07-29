// Cliente de Supabase para componentes y acciones de servidor.
// Usa la clave anon publica, toda la seguridad real esta en las politicas RLS.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (lista: { name: string; value: string; options: CookieOptions }[]) => {
          try {
            lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Los Server Components no pueden escribir cookies, el middleware refresca la sesion
          }
        },
      },
    }
  );
}
