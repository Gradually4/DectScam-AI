import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Bot, Send, User, Shield, Loader2, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';
 
export default function ChatAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Halo! Saya **DectScam AI Security Assistant** 🛡️. \n\nSaya siap memberikan panduan keamanan siber, membantu merespons ancaman digital, atau memberikan langkah darurat jika Anda mencurigai adanya penipuan. \n\nSilakan pilih topik di bawah atau ketik pertanyaan Anda langsung di kotak pesan!',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef(null);
 
  // Quick suggestions for the user
  const suggestions = [
    { label: 'Saya baru saja tertipu uang', value: 'Saya baru saja tertipu uang dan transfer ke rekening penipu' },
    { label: 'Amankan OTP & PIN', value: 'Bagaimana cara menjaga kerahasiaan kode OTP dan PIN?' },
    { label: 'Akun medsos diretas', value: 'Akun media sosial saya diretas atau di-hack orang lain' },
    { label: 'Analisis link palsu', value: 'Bagaimana cara menganalisis link atau tautan palsu?' },
  ];
 
  // Scroll to bottom whenever messages update
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
 
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
 
  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || inputValue.trim();
    if (!messageText) return;
 
    // Add user message to history
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };
 
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);
 
    try {
      const response = await api.post('/api/v1/chat', { message: messageText });
      
      if (response.data?.status === 'error') {
        const errorMsg = {
          id: `error-${Date.now()}`,
          sender: 'bot',
          text: response.data.message || 'Terjadi kesalahan pada sistem AI.',
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: response.data.bot_reply || 'Maaf, saya tidak menerima tanggapan yang valid dari sistem AI.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: err.response?.data?.message || 'Gagal terhubung ke asisten keamanan. Pastikan server AI dan backend aktif.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };
 
  // Format message text with basic bolding and bullet lists
  const formatMessageText = (text) => {
    if (!text) return '';
    
    // Split lines
    return text.split('\n').map((line, idx) => {
      // Bold syntax **text**
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      
      // Parse list items starting with numbers (e.g., "1. ")
      const listRegex = /^(\d+\.\s)(.*)/;
      const bulletRegex = /^([\-\*]\s)(.*)/;
      
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        // Add preceding text
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        // Add bolded match
        parts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
 
      // Render formatting structure
      const renderedContent = parts.length > 0 ? parts : formattedLine;
      
      if (listRegex.test(line)) {
        const match = line.match(listRegex);
        return (
          <div key={idx} className="pl-4 py-1.5 flex items-start space-x-1.5 text-slate-700">
            <span className="font-bold text-brand-primary text-sm min-w-[20px]">{match[1]}</span>
            <span className="text-sm leading-relaxed">{match[2]}</span>
          </div>
        );
      }
 
      if (bulletRegex.test(line)) {
        const match = line.match(bulletRegex);
        return (
          <div key={idx} className="pl-6 py-1 flex items-start space-x-2 text-slate-700">
            <span className="text-brand-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-primary block shrink-0" />
            <span className="text-sm leading-relaxed">{match[2]}</span>
          </div>
        );
      }
 
      return (
        <p key={idx} className="text-sm leading-relaxed min-h-[1.25rem] text-slate-700">
          {renderedContent}
        </p>
      );
    });
  };
 
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />
 
      {/* Main Container */}
      <div className="flex-grow flex flex-col min-h-screen">
        <Navbar title="AI Security Assistant" />
 
        {/* Main Content Area */}
        <main className="p-8 flex-grow flex flex-col max-w-4xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                <Shield className="h-6 w-6 text-brand-primary animate-pulse" />
                <span>Asisten Keamanan Siber AI</span>
              </h3>
              <p className="text-sm text-slate-400 font-semibold mt-1">
                Tanyakan panduan keamanan siber atau langkah darurat menghindari penipuan secara interaktif.
              </p>
            </div>
            <div className="bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 border border-brand-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Didukung DectScam AI</span>
            </div>
          </div>
 
          {/* Chat Window */}
          <div className="flex-grow bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
            {/* Messages Pane */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-slate-50/30">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start ${isBot ? 'justify-start' : 'justify-end'} space-x-3`}
                  >
                    {/* Avatar for Bot */}
                    {isBot && (
                      <div className={`p-2.5 rounded-2xl shrink-0 shadow-sm ${msg.isError ? 'bg-brand-red/10 text-brand-red border border-brand-red/20' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'}`}>
                        <Bot className="h-5 w-5" />
                      </div>
                    )}
 
                    {/* Message Bubble */}
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-4 border shadow-sm space-y-2 ${
                        isBot
                          ? msg.isError
                            ? 'bg-brand-red/5 border-brand-red/10 text-slate-800'
                            : 'bg-white border-slate-100 text-slate-800'
                          : 'bg-brand-primary text-white border-transparent'
                      }`}
                    >
                      {/* Sender Label */}
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${isBot ? 'text-slate-400' : 'text-blue-100'}`}>
                        {isBot ? (msg.isError ? 'Error System' : 'DectScam Bot') : user?.name || 'Anda'}
                      </span>
 
                      {/* Message Content */}
                      <div className={`space-y-1 ${!isBot && 'text-white'}`}>
                        {isBot ? formatMessageText(msg.text) : <p className="text-sm leading-relaxed">{msg.text}</p>}
                      </div>
                    </div>
 
                    {/* Avatar for User */}
                    {!isBot && (
                      <div className="p-2.5 bg-brand-primary text-white rounded-2xl shrink-0 shadow-sm">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                );
              })}
 
              {/* Bot Typing Indicator */}
              {isLoading && (
                <div className="flex items-start justify-start space-x-3 animate-pulse">
                  <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-2xl border border-brand-primary/20 shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="bg-white border border-slate-100 max-w-[70%] rounded-2xl px-5 py-4 shadow-sm flex items-center space-x-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                    <span className="text-xs font-semibold">Bot sedang menyusun panduan keamanan...</span>
                  </div>
                </div>
              )}
 
              <div ref={chatEndRef} />
            </div>
 
            {/* Message Input & Suggestions Pane */}
            <div className="border-t border-slate-200/60 p-6 space-y-4 bg-white">
              {/* Suggestions list when history is fresh or user wants ideas */}
              {messages.length === 1 && !isLoading && (
                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-brand-primary" />
                    <span>Rekomendasi Pertanyaan</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(s.value)}
                        className="px-4 py-2 bg-slate-50 hover:bg-brand-primary/5 border border-slate-200/80 hover:border-brand-primary/20 rounded-xl text-xs font-bold text-slate-600 hover:text-brand-primary transition-all duration-150 cursor-pointer shadow-sm"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
 
              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-3"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ketik pertanyaan atau ancaman digital yang Anda hadapi..."
                  disabled={isLoading}
                  className="flex-grow px-5 py-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-slate-50/50 disabled:bg-slate-100 transition-all font-medium placeholder-slate-400 text-slate-700"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="p-3.5 bg-brand-primary hover:bg-brand-hover text-white rounded-xl shadow-md shadow-brand-primary/10 disabled:bg-slate-200 disabled:shadow-none hover:shadow-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
