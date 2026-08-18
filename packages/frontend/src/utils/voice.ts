/**
 * 语音能力封装：优先火山方舟 TTS（更自然，走后端 /api/voice/tts 代理，不暴露 key），
 * 失败时回退浏览器原生 SpeechSynthesis。ASR 用浏览器原生（Chrome 中文）。
 *
 * 火山接入点说明：
 * - TTS: 后端 /api/voice/tts → 火山 ark /api/v3/tts（doubao-tts，共用 LLM_API_KEY）
 * - 如需更自然音色，可在服务器 .env 配置 TTS_MODEL / TTS_VOICE
 */

export interface SpeechOptions {
  onStart?: () => void;
  onEnd?: () => void;
  rate?: number;
}

let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

/** 从 localStorage 取 JWT，构造鉴权头（voice 用原生 fetch，需手动带 token） */
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** 选一个中文语音（浏览器回退用） */
function pickChineseVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const zh = voices.filter((v) => v.lang.toLowerCase().startsWith("zh"));
  if (!zh.length) return undefined;
  return (
    zh.find((v) => /xiaoxiao|huihui|tingting|yating|female/i.test(v.name)) ||
    zh.find((v) => v.lang.toLowerCase() === "zh-cn") ||
    zh[0]
  );
}

/** 预加载语音列表（Chrome 首次 getVoices 为空） */
export function preloadVoices(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
}

function base64ToBlob(base64: string, mime: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** 优先火山 TTS；返回是否已用火山成功播放 */
async function speakViaVolcano(
  text: string,
  opts: SpeechOptions,
): Promise<boolean> {
  try {
    const res = await fetch("/api/voice/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as {
      ok?: boolean;
      base64?: string;
      format?: string;
    };
    if (json.ok !== true || !json.base64) return false;

    stopSpeaking();
    const mime = json.format === "mp3" ? "audio/mpeg" : "audio/mp3";
    const url = URL.createObjectURL(base64ToBlob(json.base64, mime));
    const audio = new Audio(url);
    currentAudio = audio;

    return await new Promise<boolean>((resolve) => {
      const done = (ok: boolean) => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        opts.onEnd?.();
        resolve(ok);
      };
      audio.onended = () => done(true);
      audio.onerror = () => done(false);
      audio
        .play()
        .then(() => opts.onStart?.())
        .catch(() => done(false));
    });
  } catch {
    return false;
  }
}

/** TTS：播报一段文本（火山优先，浏览器回退） */
export async function speak(
  text: string,
  opts: SpeechOptions = {},
): Promise<boolean> {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return false;

  const volcanoOk = await speakViaVolcano(clean, opts);
  if (volcanoOk) return true;

  // 回退：浏览器原生语音
  if (!("speechSynthesis" in window)) return false;
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "zh-CN";
  utterance.rate = opts.rate ?? 1;
  utterance.pitch = 1;
  const voice = pickChineseVoice();
  if (voice) utterance.voice = voice;
  utterance.onstart = () => opts.onStart?.();
  utterance.onend = () => {
    currentUtterance = null;
    opts.onEnd?.();
  };
  utterance.onerror = () => {
    currentUtterance = null;
    opts.onEnd?.();
  };
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

/** 停止当前播报 */
export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (currentUtterance) {
    currentUtterance = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

export interface ListeningOptions {
  onResult: (text: string) => void;
  onError?: (message: string) => void;
  onStart?: () => void;
}

/** ASR：浏览器原生语音识别（Chrome 支持中文） */
export function startListening(opts: ListeningOptions): (() => void) | null {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    opts.onError?.("当前浏览器不支持语音识别，请使用 Chrome 或改用文字输入");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => opts.onStart?.();
  recognition.onresult = (event: any) => {
    const text = event.results?.[0]?.[0]?.transcript ?? "";
    if (text.trim()) opts.onResult(text.trim());
  };
  recognition.onerror = (event: any) => {
    if (event?.error && event.error !== "no-speech") {
      opts.onError?.(`语音识别失败：${event.error}`);
    }
  };

  try {
    recognition.start();
  } catch {
    opts.onError?.("语音识别启动失败，请重试");
    return null;
  }
  return () => {
    try {
      recognition.stop();
    } catch {
      /* ignore */
    }
  };
}

/* ===== 录音 + 后端 ASR（国内可用，走火山） ===== */

let recorder: MediaRecorder | null = null;
let recorderChunks: Blob[] = [];

export interface RecordingOptions {
  onStart?: () => void;
  onStop?: (blob: Blob) => void;
  onError?: (message: string) => void;
}

/** 开始录音（MediaRecorder，输出 wav/webm） */
export async function startRecording(opts: RecordingOptions): Promise<boolean> {
  if (recorder) return true;
  if (!navigator.mediaDevices?.getUserMedia) {
    opts.onError?.("当前浏览器不支持录音");
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";
    recorder = mime
      ? new MediaRecorder(stream, { mimeType: mime })
      : new MediaRecorder(stream);
    recorderChunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recorderChunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(recorderChunks, {
        type: recorder?.mimeType || "audio/webm",
      });
      recorder = null;
      stream.getTracks().forEach((t) => t.stop());
      opts.onStop?.(blob);
    };
    recorder.onerror = () => {
      opts.onError?.("录音出错");
      recorder = null;
      stream.getTracks().forEach((t) => t.stop());
    };
    recorder.start();
    opts.onStart?.();
    return true;
  } catch {
    opts.onError?.("无法访问麦克风，请检查权限或改用文字输入");
    return false;
  }
}

/** 停止录音并返回 blob */
export function stopRecording(): void {
  if (recorder && recorder.state !== "inactive") {
    try {
      recorder.stop();
    } catch {
      /* ignore */
    }
  }
}

/** 上传录音到后端火山 ASR，转文字 */
export async function transcribeAudio(
  blob: Blob,
  opts?: { onError?: (message: string) => void },
): Promise<string> {
  try {
    const base64 = await blobToBase64(blob);
    const format = blob.type.includes("mp4")
      ? "mp4"
      : blob.type.includes("ogg")
        ? "ogg"
        : "wav";
    const res = await fetch("/api/voice/asr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ audio: base64, format }),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      text?: string;
      message?: string;
    };
    if (res.ok && json.ok === true && json.text) return json.text;
    throw new Error(json.message || `语音识别失败（${res.status}）`);
  } catch (error: any) {
    opts?.onError?.(error?.message || "语音识别失败");
    return "";
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("读取录音失败"));
    reader.readAsDataURL(blob);
  });
}
