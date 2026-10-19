import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, LoaderCircle, MessageCircle, Mic, MicOff, Send, Volume2, X } from 'lucide-react';
import { getStoredToken } from '../lib/api';

type Language = 'en' | 'hi' | 'kn';
type ChatMessage = { role: 'user' | 'assistant'; text: string; records?: Array<{ id: string; title: string; status: string; expiry: string }> };
type RecognitionAlternative = { transcript: string };
type RecognitionResult = ArrayLike<RecognitionAlternative> & { isFinal: boolean };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type RecognitionErrorEvent = { error: string };
interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;
declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}
const labels: Record<Language, { name: string; welcome: string; placeholder: string; listeningStatus: string; send: string; listen: string; stopListening: string; readAloud: string; unsupportedVoice: string; microphoneDenied: string; voiceError: string; speechVoiceUnavailable: string; suggestions: string[] }> = {
  en: { name: 'English', welcome: 'Hi! I’m the FoodBridge assistant. Ask me about donations, registration, pickups, or food safety.', placeholder: 'Type your message…', listeningStatus: 'Listening… speak now', send: 'Send', listen: 'Speak your message', stopListening: 'Stop voice input', readAloud: 'Read reply aloud', unsupportedVoice: 'Voice input is not supported in this browser. You can still type your message.', microphoneDenied: 'Microphone access was blocked. Allow microphone access in your browser and try again.', voiceError: 'Voice input could not be captured. Please try again or type your message.', speechVoiceUnavailable: 'No English speech voice is available in this browser. The reply is still shown as text.', suggestions: ['How do I donate food?', 'How does NGO approval work?', 'Food safety guidance'] },
  hi: { name: 'हिन्दी', welcome: 'नमस्ते! मैं FoodBridge सहायक हूँ। दान, पंजीकरण, पिकअप या खाद्य सुरक्षा के बारे में पूछें।', placeholder: 'अपना संदेश लिखें…', listeningStatus: 'सुन रहा हूँ… बोलें', send: 'भेजें', listen: 'अपना संदेश बोलें', stopListening: 'आवाज़ सुनना रोकें', readAloud: 'जवाब सुनें', unsupportedVoice: 'इस ब्राउज़र में आवाज़ से संदेश देना उपलब्ध नहीं है। आप संदेश लिख सकते हैं।', microphoneDenied: 'माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र सेटिंग में अनुमति दें और फिर कोशिश करें।', voiceError: 'आवाज़ समझ नहीं आई। फिर कोशिश करें या संदेश लिखें।', speechVoiceUnavailable: 'इस ब्राउज़र में हिन्दी आवाज़ उपलब्ध नहीं है। जवाब टेक्स्ट में दिखेगा।', suggestions: ['भोजन दान कैसे करें?', 'NGO मंज़ूरी कैसे मिलती है?', 'खाद्य सुरक्षा'] },
  kn: { name: 'ಕನ್ನಡ', welcome: 'ನಮಸ್ಕಾರ! ನಾನು FoodBridge ಸಹಾಯಕ. ದೇಣಿಗೆ, ನೋಂದಣಿ, ಪಿಕಪ್ ಅಥವಾ ಆಹಾರ ಸುರಕ್ಷತೆ ಬಗ್ಗೆ ಕೇಳಿ.', placeholder: 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಬರೆಯಿರಿ…', listeningStatus: 'ಕೇಳುತ್ತಿದ್ದೇನೆ… ಮಾತನಾಡಿ', send: 'ಕಳುಹಿಸಿ', listen: 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಮಾತನಾಡಿ', stopListening: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ನಿಲ್ಲಿಸಿ', readAloud: 'ಉತ್ತರವನ್ನು ಕೇಳಿ', unsupportedVoice: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಲಭ್ಯವಿಲ್ಲ. ನೀವು ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಬಹುದು.', microphoneDenied: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಅನುಮತಿ ನೀಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', voiceError: 'ಧ್ವನಿಯನ್ನು ಗುರುತಿಸಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ.', speechVoiceUnavailable: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಕನ್ನಡ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ. ಉತ್ತರ ಪಠ್ಯವಾಗಿ ಕಾಣಿಸುತ್ತದೆ.', suggestions: ['ಆಹಾರ ದೇಣಿಗೆ ಹೇಗೆ ನೀಡುವುದು?', 'NGO ಅನುಮೋದನೆ ಹೇಗೆ?', 'ಆಹಾರ ಸುರಕ್ಷತೆ'] }
};

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const draftBeforeRecognitionRef = useRef('');
  const receivedSpeechRef = useRef(false);
  const recognitionFailedRef = useRef(false);
  const voiceConversationRef = useRef(false);
  const copy = labels[language];
  const SpeechRecognition = typeof window === 'undefined' ? undefined : window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy, open]);
  useEffect(() => () => {
    recognitionRef.current?.stop();
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
  }, []);

  function speak(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;
    const synthesis = window.speechSynthesis;
    const locale = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
    const languageCode = locale.slice(0, 2).toLowerCase();
    const playWithMatchingVoice = () => {
      const voices = synthesis.getVoices();
      const voice = voices.find((candidate) => candidate.lang.toLowerCase() === locale.toLowerCase())
        || voices.find((candidate) => candidate.lang.toLowerCase().startsWith(`${languageCode}-`));
      if (!voice) {
        setError(copy.speechVoiceUnavailable);
        return;
      }
      synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      synthesis.speak(utterance);
    };

    if (synthesis.getVoices().length > 0) {
      playWithMatchingVoice();
      return;
    }
    synthesis.addEventListener('voiceschanged', playWithMatchingVoice, { once: true });
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    if (!SpeechRecognition) {
      setError(copy.unsupportedVoice);
      return;
    }

    setError('');
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
    recognition.interimResults = true;
    draftBeforeRecognitionRef.current = draft;
    receivedSpeechRef.current = false;
    recognitionFailedRef.current = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript.trim())
        .filter(Boolean)
        .join(' ');
      const prefix = draftBeforeRecognitionRef.current.trimEnd();
      if (transcript) receivedSpeechRef.current = true;
      setDraft(transcript ? (prefix ? `${prefix} ${transcript}` : transcript) : prefix);
    };
    recognition.onerror = (event) => {
      recognitionFailedRef.current = true;
      voiceConversationRef.current = false;
      setError(event.error === 'not-allowed'
        ? copy.microphoneDenied
        : copy.voiceError);
      setListening(false);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      if (!receivedSpeechRef.current && !recognitionFailedRef.current) {
        voiceConversationRef.current = false;
        setError(copy.voiceError);
      }
    };
    recognitionRef.current = recognition;
    voiceConversationRef.current = true;
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      voiceConversationRef.current = false;
      setListening(false);
      setError('Voice input could not start. Please try again or type your message.');
    }
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setMessages((current) => [...current, { role: 'user', text: message }]);
    setDraft(''); setError(''); setBusy(true);
    try {
      const token = getStoredToken();
      const response = await fetch('/api/chatbot', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ message, language }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not get a reply. Please try again.');
      const answer = data.answer as string;
      setMessages((current) => [...current, { role: 'assistant', text: answer, records: data.records }]);
      if (voiceConversationRef.current) speak(answer);
      voiceConversationRef.current = false;
    } catch (err) { voiceConversationRef.current = false; setError(err instanceof Error ? err.message : 'Could not get a reply. Please try again.'); }
    finally { setBusy(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void send(draft); }

  return <>
    {open && <section aria-label="FoodBridge support chat" className="fixed bottom-24 right-4 z-50 flex h-[min(620px,calc(100dvh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl sm:right-6">
      <header className="flex items-center justify-between bg-[#1F1B18] px-4 py-4 text-white">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-[#E8630A] p-2"><Bot size={20} /></div><div><h2 className="font-bold">FoodBridge Support</h2><p className="text-xs text-stone-300">English · हिन्दी · ಕನ್ನಡ</p></div></div>
        <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-300"><X size={19} /></button>
      </header>
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-2"><label htmlFor="chat-language" className="text-xs font-semibold text-stone-600">Response language</label><select id="chat-language" value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">{(Object.keys(labels) as Language[]).map((lang) => <option key={lang} value={lang}>{labels[lang].name}</option>)}</select></div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#FFF9F5] p-4" aria-live="polite">
        {messages.length === 0 && <><div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm leading-relaxed text-stone-700 shadow-sm">{copy.welcome}</div><div className="flex flex-wrap gap-2">{copy.suggestions.map((suggestion) => <button key={suggestion} onClick={() => void send(suggestion)} className="rounded-full border border-orange-200 bg-white px-3 py-2 text-left text-xs text-[#9A3C08] hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-400">{suggestion}</button>)}</div></>}
        {messages.map((entry, index) => <div key={index} className={`max-w-[90%] whitespace-pre-wrap rounded-2xl p-3 text-sm leading-relaxed ${entry.role === 'user' ? 'ml-auto rounded-tr-sm bg-[#E8630A] text-white' : 'rounded-tl-sm bg-white text-stone-700 shadow-sm'}`}><span>{entry.text}</span>{entry.role === 'assistant' && <button type="button" onClick={() => speak(entry.text)} aria-label={copy.readAloud} title={copy.readAloud} className="ml-2 inline-flex rounded-md p-1 text-stone-500 hover:bg-orange-50 hover:text-[#9A3C08] focus:outline-none focus:ring-2 focus:ring-orange-400"><Volume2 size={16} /></button>}{entry.records?.map((record) => <div key={record.id} className="mt-2 rounded-xl border border-stone-100 bg-[#FFF9F5] p-2 text-xs"><strong>{record.title}</strong><div className="mt-1">{record.status} · {new Date(record.expiry).toLocaleDateString()}</div></div>)}</div>)}
        {busy && <div className="flex items-center gap-2 text-sm text-stone-500"><LoaderCircle className="animate-spin" size={16} />{language === 'hi' ? 'जवाब तैयार हो रहा है…' : language === 'kn' ? 'ಉತ್ತರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ…' : 'Preparing a reply…'}</div>}
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}<button onClick={() => { const last = [...messages].reverse().find((m) => m.role === 'user'); if (last) { setMessages((all) => all.slice(0, -1)); void send(last.text); } }} className="ml-2 font-bold underline">{language === 'hi' ? 'फिर कोशिश करें' : language === 'kn' ? 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 'Retry'}</button></div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="flex items-end gap-2 border-t border-stone-100 bg-white p-3"><textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(draft); } }} maxLength={2000} rows={1} aria-label="Chat message" placeholder={listening ? copy.listeningStatus : copy.placeholder} className="max-h-24 min-h-11 flex-1 resize-y rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" /><button type="button" onClick={toggleListening} aria-pressed={listening} aria-label={listening ? copy.stopListening : copy.listen} title={listening ? copy.stopListening : copy.listen} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-400 ${listening ? 'border-red-200 bg-red-50 text-red-700' : 'border-stone-200 text-stone-600 hover:bg-orange-50'}`}>{listening ? <MicOff size={18} /> : <Mic size={18} />}</button><button type="submit" disabled={busy || !draft.trim()} aria-label={copy.send} className="flex h-11 items-center gap-2 rounded-xl bg-[#E8630A] px-3 text-sm font-bold text-white hover:bg-[#C2410C] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"><Send size={16} /><span className="sr-only">{copy.send}</span></button></form>
    </section>}
    <button onClick={() => setOpen(!open)} aria-label={open ? 'Close FoodBridge chat' : 'Open FoodBridge chat'} aria-expanded={open} className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8630A] text-white shadow-xl transition hover:scale-105 hover:bg-[#C2410C] focus:outline-none focus:ring-4 focus:ring-orange-200 sm:bottom-6 sm:right-6">{open ? <ChevronDown size={23} /> : <MessageCircle size={23} />}</button>
  </>;
}
