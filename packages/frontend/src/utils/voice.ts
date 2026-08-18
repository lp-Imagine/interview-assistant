/**
 * 语音能力封装：浏览器原生 TTS/ASR（零依赖），预留火山方舟语音接口。
 *
 * 火山接入点（后续可替换）：
 * - TTS: POST https://ark.cn-beijing.volces.com/api/v3/tts  (豆包语音合成)
 * - ASR: POST https://ark.cn-beijing.volces.com/api/v3/asr  (豆包语音识别)
 * 需要 ark key 具备语音模型权限；接入时替换 speak()/startListening() 内部实现即可。
 */

export interface SpeechOptions {
  /** 播报开始 */
  onStart?: () => void;
  /** 播报结束 */
  onEnd?: () => void;
  /** 语速 0.1-2（默认 1） */
  rate?: number;
}

/** 选中一个中文语音（优先普通话女声） */
function pickChineseVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const zh = voices.filter((v) => v.lang.toLowerCase().startsWith("zh"));
  if (!zh.length) return undefined;
  return (
    zh.find((v) => /xiaoxiao|huihui|yating|female/i.test(v.name)) ||
    zh.find((v) => v.lang.toLowerCase() === "zh-cn") ||
    zh[0]
  );
}

/** 预加载语音列表（Chrome 首次 getVoices 为空，需触发加载） */
export function preloadVoices(): void {
  if (!("speechSynthesis" in window)) return;
  // 触发异步加载
  window.speechSynthesis.getVoices();
}

/** TTS：播报一段文本（浏览器原生；失败返回 false） */
export function speak(text: string, opts: SpeechOptions = {}): boolean {
  if (!("speechSynthesis" in window)) return false;
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return false;

  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "zh-CN";
  utterance.rate = opts.rate ?? 1;
  utterance.pitch = 1;
  const voice = pickChineseVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = () => opts.onStart?.();
  utterance.onend = () => {
    opts.onEnd?.();
  };
  utterance.onerror = () => {
    opts.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

/** 停止当前播报 */
export function stopSpeaking(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export interface ListeningOptions {
  /** 识别到最终结果（一次说话结束） */
  onResult: (text: string) => void;
  /** 识别失败/不支持 */
  onError?: (message: string) => void;
  /** 开始监听 */
  onStart?: () => void;
}

/** ASR：开始语音识别（浏览器原生 webkitSpeechRecognition，Chrome 支持中文） */
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
    // no-speech（用户没说话）静默，其余报错
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
