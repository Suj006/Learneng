import "server-only";

/**
 * Optional neural text-to-speech for character voices (Azure AI Speech, "Neural" voices with expressive styles).
 * OFF unless AZURE_SPEECH_KEY and AZURE_SPEECH_REGION are set; the browser's own voices are used otherwise.
 * Keys stay on the server. Only PING VIBE's own lines and learning content are sent — never children's writing.
 */
export type Who = "lexi" | "grammy" | "speaky" | "story" | "max" | "narrator";
interface VoiceCfg { voice: string; style?: string; degree?: number; rate?: string; pitch?: string }

/** Default character casting. Override with AZURE_TTS_VOICES='{"lexi":{"voice":"en-IN-NeerjaNeural"}}'. */
const DEFAULT_VOICES: Record<Who, VoiceCfg> = {
  lexi:     { voice: "en-IN-NeerjaNeural", style: "cheerful", degree: 1.3, rate: "+4%", pitch: "+8%" },
  grammy:   { voice: "en-US-JennyNeural", style: "cheerful", degree: 1.1, rate: "-2%", pitch: "+4%" },
  speaky:   { voice: "en-US-AnaNeural", rate: "+2%", pitch: "+2%" },              // child voice
  story:    { voice: "en-GB-SoniaNeural", style: "cheerful", degree: 0.8, rate: "-10%", pitch: "+0%" },
  max:      { voice: "en-US-GuyNeural", style: "excited", degree: 1.2, rate: "+6%", pitch: "+6%" },
  narrator: { voice: "en-IN-NeerjaNeural", rate: "-6%" },
};

export const ttsEnabled = () => Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);

function voices(): Record<Who, VoiceCfg> {
  try { return { ...DEFAULT_VOICES, ...(process.env.AZURE_TTS_VOICES ? JSON.parse(process.env.AZURE_TTS_VOICES) : {}) }; } catch { return DEFAULT_VOICES; }
}

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export function ssml(who: Who, text: string) {
  const v = voices()[who] ?? DEFAULT_VOICES.narrator;
  const lang = v.voice.slice(0, 5);
  const prosody = `<prosody rate="${v.rate ?? "+0%"}" pitch="${v.pitch ?? "+0%"}">${esc(text)}</prosody>`;
  const inner = v.style ? `<mstts:express-as style="${v.style}" styledegree="${v.degree ?? 1}">${prosody}</mstts:express-as>` : prosody;
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${lang}"><voice name="${v.voice}">${inner}</voice></speak>`;
}

// Small in-memory cache: character lines repeat a lot, so most requests never reach the provider.
const cache = new Map<string, ArrayBuffer>();

export async function synthesize(who: Who, text: string): Promise<ArrayBuffer> {
  const key = `${who}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const res = await fetch(`https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY!,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "ping-vibe",
    },
    body: ssml(who, text),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`tts ${res.status}`);
  const buf = await res.arrayBuffer();
  if (cache.size > 300) cache.delete(cache.keys().next().value!);
  cache.set(key, buf);
  return buf;
}
