import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Portada() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  redirect(user ? "/hoy" : "/entrar");
}
