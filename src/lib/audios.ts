// ============================================================
// Biblioteca de audios con la voz de SafeSpace, grabados por
// la fundadora. Los archivos viven en Supabase Storage, en el
// bucket publico "audios", nombrados por numero, 01.mp3 a 10.mp3.
// ============================================================

export const BASE_AUDIOS =
  "https://afsubzfcplrrcbbbfgqm.supabase.co/storage/v1/object/public/audios";

export interface AudioGuia {
  archivo: string;
  titulo: string;
  duracion: string;
}

export const AUDIOS: AudioGuia[] = [
  { archivo: "01.mp3", titulo: "Afirmaciones para sentirte mejor contigo mismo", duracion: "3:29" },
  { archivo: "02.mp3", titulo: "Afirmaciones para sentirte mejor contigo misma", duracion: "4:30" },
  { archivo: "03.mp3", titulo: "Cuando tu mente no se detiene", duracion: "5:15" },
  { archivo: "04.mp3", titulo: "Cuando sientes que tienes que poder con todo", duracion: "4:45" },
  { archivo: "05.mp3", titulo: "Lo que hoy necesitabas escuchar", duracion: "4:45" },
  { archivo: "06.mp3", titulo: "Para esos días en los que dudas de ti", duracion: "1:34" },
  { archivo: "07.mp3", titulo: "Aprende a hablarte bonito", duracion: "1:39" },
  { archivo: "08.mp3", titulo: "Un recordatorio para ti", duracion: "2:26" },
  { archivo: "09.mp3", titulo: "Una pausa para volver a ti", duracion: "9:07" },
  { archivo: "10.mp3", titulo: "Descansa, meditación guiada para dormir", duracion: "14:39" },
];
