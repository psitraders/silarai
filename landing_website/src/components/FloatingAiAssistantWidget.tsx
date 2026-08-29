import React, { useState } from 'react';
import { Bot, MessageSquare, X, Send, Sparkles, Check, ShoppingCart } from 'lucide-react';

export const FloatingAiAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; products?: any[] }>
  >([
    {
      sender: 'assistant',
      text: 'Hi there! I am the SilarAI Shopping Assistant. Ask me anything about our AI commerce platform or catalog capabilities!',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const quickQuestions = [
    'How does SilarAI integrate with Shopify or SAP?',
    'Can AI Assistant handle 50,000+ SKUs?',
    'What conversion lift can we expect?',
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputVal('');

    setTimeout(() => {
      let replyText = 'SilarAI indexes your spec sheets and ERP catalog using high-dimensional vector embeddings to deliver sub-100ms conversational responses.';
      let products = undefined;

      if (text.toLowerCase().includes('shopify') || text.toLowerCase().includes('sap')) {
        replyText = 'SilarAI includes 1-click connectors for Shopify, WooCommerce, SAP, Salesforce, and Dynamics with live 2-way webhooks!';
      } else if (text.toLowerCase().includes('conversion') || text.toLowerCase().includes('lift')) {
        replyText = 'Across 200+ deployments, brands achieve an average +45% conversion uplift and 3.4x faster time-to-checkout.';
      } else if (text.toLowerCase().includes('sku')) {
        replyText = 'Yes! SilarAI supports unlimited SKUs with real-time inventory and custom B2B contract tier pricing.';
        products = [
          { name: 'SilarAI Enterprise Engine', price: '$499/mo', stock: 'Ready to sync' },
        ];
      }

      setMessages((prev) => [...prev, { sender: 'assistant', text: replyText, products }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-plum-700 hover:bg-plum-800 text-white font-extrabold text-xs rounded-full shadow-2xl shadow-plum-950/40 hover:scale-105 transition-all focus:outline-none border border-plum-600"
        >
          <div className="w-6 h-6 rounded-full bg-peach-300 text-plum-950 flex items-center justify-center font-black">
            <Bot className="w-4 h-4" />
          </div>
          <span>Test SilarAI AI Live</span>
          <span className="w-2.5 h-2.5 bg-peach-300 rounded-full animate-ping" />
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white rounded-saas border border-slate-200 shadow-2xl flex flex-col justify-between h-[450px] overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-plum-950 text-white p-3.5 flex items-center justify-between border-b border-plum-900">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-plum-700 flex items-center justify-center text-peach-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1">
                  SilarAI Copilot Widget <Sparkles className="w-3 h-3 text-peach-300" />
                </div>
                <div className="text-[10px] text-plum-200">Live Assistant Demo</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-plum-300 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-plum-700 text-white rounded-br-none font-medium'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-2xs'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.products && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      {m.products.map((p, pIdx) => (
                        <div key={pIdx} className="bg-peach-100 p-2 rounded-lg text-plum-950 flex justify-between items-center text-[11px] font-extrabold border border-peach-200">
                          <span>{p.name}</span>
                          <span className="text-plum-800">{p.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-white border-t border-slate-100 flex flex-col gap-1">
            <div className="text-[10px] font-bold text-slate-400 px-1">Quick Questions:</div>
            <div className="flex flex-wrap gap-1">
              {quickQuestions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleSend(q)}
                  className="text-[10px] bg-slate-100 hover:bg-peach-100 hover:text-plum-950 font-medium text-slate-700 px-2 py-1 rounded-md text-left transition-colors truncate max-w-full"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputVal);
            }}
            className="p-2 bg-white border-t border-slate-100 flex gap-1.5"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-plum-700"
            />
            <button
              type="submit"
              className="bg-plum-700 hover:bg-plum-800 text-peach-300 p-2 rounded-xl transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
