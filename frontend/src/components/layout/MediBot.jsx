import { useState, useRef, useEffect } from 'react';

const KEYWORD_REPLIES = {
  medicine: [
    'You can browse all medicines in the Medicine Catalog. Use the search bar or category filters to find what you need.',
    'We have a wide range of medicines from pain relief to vitamins. Some items require a prescription — look for the prescription badge.',
  ],
  medicines: [],
  order: [
    'Check "My Orders" to see all your orders. Use "Track Order" to see real-time status: Pending → Verified → Packed → Shipped → Delivered.',
    'Your order history and status are in the My Orders page. Need help with a specific order? Tell me the order ID.',
  ],
  orders: [],
  prescription: [
    'Upload your prescription in the Prescriptions page. Our pharmacists will verify it — you\'ll see status: Pending, Approved, or Rejected.',
    'Go to Prescriptions and drag-and-drop your prescription image. Once approved, you can order prescription-only medicines.',
  ],
  prescriptions: [],
  delivery: [
    'We deliver across Nepal. Delivery fee is usually Rs. 50. You can choose your address at checkout and track the order once shipped.',
    'Delivery typically takes 1–3 business days in Kathmandu Valley and 3–5 days elsewhere. Track your order from the Track Order page.',
  ],
  payment: [
    'We accept Cash on Delivery (COD), eSewa, and Khalti. Select your preferred method at checkout.',
    'Payment options: COD, eSewa, and Khalti. All are secure. You can pay when your order is delivered if you choose COD.',
  ],
  default: [
    'Hi! I\'m MediBot. Ask me about medicines, orders, prescriptions, delivery, or payment. How can I help?',
    'I can help with medicine search, order tracking, prescription uploads, delivery info, and payment methods. What do you need?',
  ],
};

function getReply(message) {
  const lower = (message || '').toLowerCase();
  for (const [key, replies] of Object.entries(KEYWORD_REPLIES)) {
    if (replies.length && lower.includes(key)) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  const def = KEYWORD_REPLIES.default;
  return def[Math.floor(Math.random() * def.length)];
}

export default function MediBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm MediBot. Ask about medicines, orders, prescriptions, delivery, or payment." },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setTimeout(() => {
      const reply = getReply(text);
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <>
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-charcoal/10 bg-white shadow-card-hover transition-all duration-300 ${
          open ? 'h-[420px] w-[340px]' : 'h-0 w-0 overflow-hidden opacity-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-charcoal/10 px-4 py-3 bg-primary/10">
          <span className="font-fraunces font-semibold text-charcoal">MediBot</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded p-1 hover:bg-charcoal/10 text-charcoal/70"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-charcoal/10 text-charcoal'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-2 p-3 border-t border-charcoal/10"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about medicines, orders..."
            className="flex-1 rounded-lg border border-charcoal/20 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Send
          </button>
        </form>
      </div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-card-hover hover:bg-primary-dark transition-all hover:scale-105"
        aria-label="Open MediBot"
      >
        💬
      </button>
    </>
  );
}
