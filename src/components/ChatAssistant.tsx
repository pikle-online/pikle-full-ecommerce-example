import { useEffect, useRef, useState } from 'react';
import { chatWithAssistant } from '../lib/api';
import { isIntegrationsEnabled, INTEGRATIONS_EVENT } from '../lib/integrations';
import type { ChatMessage, ChatResponse } from '../lib/api';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: ChatResponse['products'];
}

export default function ChatAssistant() {
  const [active, setActive] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<DisplayMessage[]>([
    { role: 'assistant', content: 'Hi! I can help you find products, compare options, or answer questions about our catalog. What are you looking for?' },
  ]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(isIntegrationsEnabled());

    const handler = (e: Event) => {
      setActive((e as CustomEvent<{ enabled: boolean }>).detail.enabled);
    };
    document.addEventListener(INTEGRATIONS_EVENT, handler);
    return () => document.removeEventListener(INTEGRATIONS_EVENT, handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: DisplayMessage = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setSending(true);

    const apiMessages: ChatMessage[] = updated.map((m) => ({ role: m.role, content: m.content }));
    const response = await chatWithAssistant(apiMessages);

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: response.reply, products: response.products },
    ]);
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (!active) {
    return (
      <button className="chat-fab chat-fab--placeholder" disabled tabIndex={-1} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );
  }

  if (!expanded) {
    return (
      <button
        className="chat-fab"
        onClick={() => setExpanded(true)}
        aria-label="Open AI assistant"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <div className="chat-panel__header-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Pikle Assistant</span>
        </div>
        <button
          className="chat-panel__close"
          onClick={() => setExpanded(false)}
          aria-label="Close assistant"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="chat-panel__messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
            <div className="chat-msg__bubble">{msg.content}</div>
            {msg.products && msg.products.length > 0 && (
              <div className="chat-msg__products">
                {msg.products.map((p) => (
                  <a
                    key={p.slug}
                    href={`/${p.category}/${p.subcategory}/${p.slug}`}
                    className="chat-msg__product-link"
                  >
                    {p.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className="chat-msg chat-msg--assistant">
            <div className="chat-msg__bubble chat-msg__typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      <div className="chat-panel__input-area">
        <input
          type="text"
          className="chat-panel__input"
          placeholder="Ask about products…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          aria-label="Chat message"
        />
        <button
          className="chat-panel__send"
          onClick={send}
          disabled={sending || !input.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
