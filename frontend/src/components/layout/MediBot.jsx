import { useState, useRef, useEffect, useCallback } from "react";
import api from "../../services/api";
import botImage from "../../assets/images/bot.png";

/* ─── Language config ─── */
const LANGS = {
  en: {
    label: "EN",
    greeting:
      "Hi! I'm MediBot, your AI health assistant. 🩺\n\nDescribe your symptoms, send a photo, or use the mic — I'll help you find the right medicine.\n\nYou can also ask about orders, prescriptions, delivery, and payment.",
    cleared: "Chat cleared! How can I help you today? 🩺",
    placeholder: "Describe symptoms or ask anything...",
    disclaimer: "AI assistant — not a substitute for professional medical advice",
    photoHint: "📷 Photo attached",
    speechLang: "en-US",
  },
  ne: {
    label: "ने",
    greeting:
      "नमस्ते! म MediBot हुँ, तपाईंको AI स्वास्थ्य सहायक। 🩺\n\nआफ्नो लक्षणहरू बताउनुहोस्, फोटो पठाउनुहोस्, वा माइक प्रयोग गर्नुहोस् — म तपाईंलाई सही औषधि खोज्न मद्दत गर्छु।\n\nअर्डर, प्रेस्क्रिप्सन, डेलिभरी, र भुक्तानीको बारेमा पनि सोध्न सक्नुहुन्छ।",
    cleared: "च्याट सफा भयो! म कसरी मद्दत गर्न सक्छु? 🩺",
    placeholder: "लक्षण बताउनुहोस् वा केही सोध्नुहोस्...",
    disclaimer: "AI सहायक — व्यावसायिक चिकित्सा सल्लाहको विकल्प होइन",
    photoHint: "📷 फोटो संलग्न",
    speechLang: "ne-NP",
  },
};

/* ─── Helpers ─── */
const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const HAS_NATIVE_SPEECH = !!SpeechRecognition;
const HAS_MEDIA_RECORDER =
  typeof window !== "undefined" && typeof window.MediaRecorder !== "undefined";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1]; // strip data:...;base64,
      resolve({ mimeType: file.type, data: base64 });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function MediBot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const t = LANGS[lang];

  const [messages, setMessages] = useState([
    { role: "bot", text: LANGS.en.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState(null); // { mimeType, data, preview }
  const [listening, setListening] = useState(false);

  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ─── Language switch ─── */
  const switchLang = () => {
    const next = lang === "en" ? "ne" : "en";
    setLang(next);
    setMessages([{ role: "bot", text: LANGS[next].greeting }]);
  };

  /* ─── Send message ─── */
  const send = useCallback(
    async (overrideText, audioPayload) => {
      const text = (overrideText ?? input).trim();
      if (!text && !pendingImage && !audioPayload) return;
      if (loading) return;
      if (!overrideText) setInput("");

      // Build user message for display
      const userMsg = {
        role: "user",
        text:
          text ||
          (pendingImage ? t.photoHint : "") ||
          (audioPayload
            ? lang === "ne"
              ? "🎤 भ्वाइस सन्देश पठाइयो"
              : "🎤 Voice message sent"
            : ""),
        image: pendingImage?.preview || null,
      };
      setMessages((prev) => [...prev, userMsg]);

      const imagePayload = pendingImage
        ? { mimeType: pendingImage.mimeType, data: pendingImage.data }
        : undefined;
      setPendingImage(null);
      setLoading(true);

      try {
        const history = messages.slice(1).map((m) => ({
          role: m.role === "user" ? "user" : "model",
          text: m.text,
        }));

        const res = await api.chatWithBot(text, history, {
          image: imagePayload,
          audio: audioPayload,
          language: lang,
        });
        const reply =
          res.data?.reply ||
          "Sorry, I couldn't process that. Please try again.";
        setMessages((prev) => [...prev, { role: "bot", text: reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text:
              lang === "ne"
                ? "माफ गर्नुहोस्, अहिले जडान समस्या छ। कृपया पुन: प्रयास गर्नुहोस्।"
                : "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, pendingImage, loading, messages, lang, t],
  );

  const clearChat = () => {
    setMessages([{ role: "bot", text: t.cleared }]);
    setPendingImage(null);
  };

  /* ─── Photo upload ─── */
  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Max 4 MB
    if (file.size > 4 * 1024 * 1024) {
      alert("Image must be under 4 MB");
      return;
    }
    try {
      const { mimeType, data } = await fileToBase64(file);
      const preview = URL.createObjectURL(file);
      setPendingImage({ mimeType, data, preview });
    } catch {
      // ignore
    }
    // Reset file input
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ─── Microphone (Speech-to-text) ─── */
  /* Uses native Web Speech API on Chrome/Edge, falls back to
     MediaRecorder → Gemini transcription on Firefox/Safari/others */

  const stopMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Pick a supported mime type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
            ? "audio/ogg;codecs=opus"
            : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks so browser releases mic
        stream.getTracks().forEach((tr) => tr.stop());
        setListening(false);

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 1000) return; // too short, ignore

        // Send audio directly to Gemini (voice message)
        try {
          const base64 = await blobToBase64(blob);
          const baseMime = mimeType.split(";")[0];
          send("", { mimeType: baseMime, data: base64 });
        } catch {
          // silent fail
        }
      };

      recorder.onerror = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setListening(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setListening(true);
    } catch {
      alert(
        lang === "ne"
          ? "माइक्रोफोन पहुँच दिनुहोस्।"
          : "Please allow microphone access.",
      );
    }
  }, [lang, send]);

  const toggleMic = useCallback(() => {
    // ── Currently recording → stop ──
    if (listening) {
      if (HAS_NATIVE_SPEECH && recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopMediaRecorder();
      setListening(false);
      return;
    }

    // ── Try native Web Speech API first (Chrome, Edge) ──
    if (HAS_NATIVE_SPEECH) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = t.speechLang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onresult = (event) => {
          const transcript = event.results[0]?.[0]?.transcript || "";
          if (transcript) {
            // Auto-send the voice transcript
            send(transcript);
          }
        };
        recognition.onerror = (e) => {
          setListening(false);
          // If native speech fails (e.g. "not-allowed", "network"), fall back to MediaRecorder
          if (e.error !== "aborted" && HAS_MEDIA_RECORDER) {
            startMediaRecorder();
          }
        };
        recognition.onend = () => setListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
        return;
      } catch {
        // If constructor or start() throws, fall through to MediaRecorder
      }
    }

    // ── Fallback: MediaRecorder → Gemini transcription (Firefox, Safari, etc.) ──
    if (HAS_MEDIA_RECORDER) {
      startMediaRecorder();
      return;
    }

    alert(
      lang === "ne"
        ? "यो ब्राउजरमा माइक समर्थित छैन।"
        : "Microphone is not supported in this browser.",
    );
  }, [listening, t.speechLang, lang, send, startMediaRecorder, stopMediaRecorder]);

  /* ─── Camera / Gallery access ─── */
  const openCamera = () => fileRef.current?.click();

  /* ─── Format bot text ─── */
  const formatBotText = (text) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
      return (
        <span key={i}>
          {i > 0 && <br />}
          {parts}
        </span>
      );
    });
  };

  return (
    <>
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-charcoal/10 bg-white shadow-card-hover transition-all duration-300 ${
          open ? "h-[520px] w-[380px]" : "h-0 w-0 overflow-hidden opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal/10 px-4 py-3 bg-primary/10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <img src={botImage} alt="MediBot" className="h-6 w-6 rounded-full object-cover" />
            <span className="font-fraunces font-semibold text-charcoal">
              MediBot
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
              AI
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Language toggle */}
            <button
              type="button"
              onClick={switchLang}
              className="rounded px-2 py-1 text-xs font-semibold hover:bg-charcoal/10 text-charcoal/60 border border-charcoal/15 transition-colors"
              title={lang === "en" ? "Switch to Nepali" : "English मा बदल्नुहोस्"}
            >
              {lang === "en" ? "ने" : "EN"}
            </button>
            <button
              type="button"
              onClick={clearChat}
              className="rounded p-1.5 hover:bg-charcoal/10 text-charcoal/50 text-xs"
              title="Clear chat"
            >
              🗑️
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1.5 hover:bg-charcoal/10 text-charcoal/70"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "bot" && (
                <img src={botImage} alt="MediBot" className="mr-1.5 mt-1 h-5 w-5 shrink-0 rounded-full object-cover" />
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-white"
                    : "bg-charcoal/[0.06] text-charcoal"
                }`}
              >
                {/* Image preview in user message */}
                {m.image && (
                  <img
                    src={m.image}
                    alt="Shared"
                    className="mb-1.5 max-h-32 rounded-lg object-cover"
                  />
                )}
                {m.role === "bot" ? formatBotText(m.text) : m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <img src={botImage} alt="MediBot" className="mr-1.5 mt-1 h-5 w-5 rounded-full object-cover" />
              <div className="bg-charcoal/[0.06] rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <span
                    className="h-2 w-2 bg-charcoal/30 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 bg-charcoal/30 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-2 w-2 bg-charcoal/30 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Pending image preview */}
        {pendingImage && (
          <div className="px-3 pb-1 flex items-center gap-2">
            <img
              src={pendingImage.preview}
              alt="Preview"
              className="h-12 w-12 rounded-lg object-cover border border-charcoal/20"
            />
            <span className="text-xs text-charcoal/50">{t.photoHint}</span>
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="ml-auto text-xs text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-1.5 px-3 py-2.5 border-t border-charcoal/10"
        >
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handlePhoto}
            className="hidden"
          />

          {/* Camera / Gallery button */}
          <button
            type="button"
            onClick={openCamera}
            disabled={loading}
            className="shrink-0 rounded-lg p-2 text-charcoal/50 hover:bg-charcoal/10 hover:text-charcoal/80 transition-colors disabled:opacity-40"
            title={lang === "en" ? "Send a photo" : "फोटो पठाउनुहोस्"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
          </button>

          {/* Mic button */}
          <button
            type="button"
            onClick={toggleMic}
            disabled={loading}
            className={`shrink-0 rounded-lg p-2 transition-colors disabled:opacity-40 ${
              listening
                ? "bg-red-100 text-red-600 animate-pulse"
                : "text-charcoal/50 hover:bg-charcoal/10 hover:text-charcoal/80"
            }`}
            title={
              listening
                ? lang === "en"
                  ? "Stop listening"
                  : "सुन्न बन्द गर्नुहोस्"
                : lang === "en"
                  ? "Speak"
                  : "बोल्नुहोस्"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
          </button>

          {/* Text input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            disabled={loading}
            className="flex-1 min-w-0 rounded-lg border border-charcoal/20 px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={loading || (!input.trim() && !pendingImage)}
            className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "➤"}
          </button>
        </form>

        {/* Disclaimer */}
        <p className="px-3 pb-2 text-[10px] text-charcoal/40 text-center">
          {t.disclaimer}
        </p>
      </div>

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-card-hover hover:bg-primary-dark transition-all hover:scale-105"
        aria-label="Open MediBot"
      >
        {open ? "✕" : <img src={botImage} alt="MediBot" className="h-8 w-8 rounded-full object-cover" />}
      </button>
    </>
  );
}
