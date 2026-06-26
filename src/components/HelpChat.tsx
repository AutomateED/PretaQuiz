import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PAGE_SUGGESTIONS: Record<string, string[]> = {
  '/dashboard/overview': [
    'How do I complete my setup checklist?',
    'Where is my quiz link?',
    'How do I share my quiz?',
  ],
  '/dashboard/branding': [
    'How do I upload my logo?',
    'What size should my logo be?',
    'Can I use more than one brand colour?',
  ],
  '/dashboard/questions': [
    'Help me write quiz questions for my niche',
    'How does the A/B/C/D mapping work?',
    'Can I change the number of questions?',
  ],
  '/dashboard/results': [
    'Help me write my result descriptions',
    'How long should each result be?',
    'What makes a good result title?',
  ],
  '/dashboard/cta': [
    'What should my CTA button say?',
    'Can I link to my Calendly?',
    'What is the tagline field for?',
  ],
  '/dashboard/integrations': [
    'How do I connect HighLevel?',
    'I don\'t have Zapier — can I still get leads?',
    'How do I download my leads as CSV?',
  ],
  '/dashboard/leads': [
    'How do I download leads for a specific result?',
    'How do I import my leads into Mailchimp?',
    'Why are no leads showing up?',
  ],
  '/dashboard/share': [
    'How do I embed my quiz on my website?',
    'Can I share my quiz on social media?',
    'How do I get my quiz link?',
  ],
};

const DEFAULT_SUGGESTIONS = [
  'How do I set up my quiz?',
  'How do I get my leads into my CRM?',
  'Help me write my quiz questions',
];

const SUPABASE_URL = 'https://sgllwxhabdhjldhpnnsg.supabase.co/functions/v1/chat-assistant';

export default function HelpChat() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Only show on dashboard pages
  const isDashboardPage = location.pathname.startsWith('/dashboard');
  if (!isDashboardPage) return null;

  const currentPage = location.pathname;
  const suggestions = PAGE_SUGGESTIONS[currentPage] || DEFAULT_SUGGESTIONS;

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(SUPABASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          currentPage,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Sorry, something went wrong. Please try again or email hello@pretaquiz.com.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't connect. Please try again or email hello@pretaquiz.com.",
      }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 flex flex-col"
          style={{
            width: '340px',
            height: '480px',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(217,70,239,0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(15,10,30,0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ backgroundColor: '#F020B0' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">PretaQuiz Help</p>
                <p className="text-[10px] text-white/70 mt-0.5">Ask me anything</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div>
                <p className="text-sm text-center mb-4" style={{ color: '#6B5F80' }}>
                  Hi! What can I help you with?
                </p>
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="w-full text-left text-sm px-3 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'rgba(217,70,239,0.06)',
                        color: '#4A4060',
                        border: '1px solid rgba(217,70,239,0.15)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[80%] rounded-2xl px-3 py-2 text-[15px] leading-relaxed"
                  style={msg.role === 'user'
                    ? { backgroundColor: '#F020B0', color: '#FFFFFF', borderBottomRightRadius: '4px', lineHeight: '1.6' }
                    : { backgroundColor: 'rgba(217,70,239,0.08)', color: '#0F0A1E', borderBottomLeftRadius: '4px', lineHeight: '1.6' }
                  }
                >
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl px-3 py-2"
                  style={{ backgroundColor: 'rgba(217,70,239,0.08)', borderBottomLeftRadius: '4px' }}
                >
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#D946EF' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 flex items-center gap-2 px-3 py-3"
            style={{ borderTop: '1px solid rgba(217,70,239,0.12)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your question..."
              disabled={loading}
              className="flex-1 text-sm px-3 py-2 rounded-lg outline-none"
              style={{
                backgroundColor: 'rgba(217,70,239,0.05)',
                border: '1px solid rgba(217,70,239,0.2)',
                color: '#0F0A1E',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-40"
              style={{ backgroundColor: '#F020B0' }}
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5 text-white" />
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#D946EF' }}
        aria-label="Open help chat"
      >
        {open ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        {!open && 'Need help?'}
      </button>
    </>
  );
}
