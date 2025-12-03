import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, CheckCircle, Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  createChatSession, 
  sendMessage, 
  buildPodcastContext, 
  getChatErrorMessage,
  ChatSession,
  startChatSession,
  sendMessageToGemini,
  parseGeminiResponse
} from '../services/geminiService';
import { saveLead, storageService } from '../services/storageService';
import { PODCAST_EPISODES, PRICING_PLANS } from '../constants';
import { ChatMessage } from '../types';
import { logError, createAppError } from '../services/errorService';

export const Chatbot: React.FC = () => {
    const { lang, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Chat session stored in React state (Comment 3)
    const [chatSession, setChatSession] = useState<ChatSession | null>(null);
    const chatInstanceRef = useRef<ReturnType<typeof startChatSession> | null>(null);
    
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const podcastContext = buildPodcastContext(PODCAST_EPISODES);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Create new session per user (Comment 3)
            const session = createChatSession(lang);
            setChatSession(session);
            chatInstanceRef.current = startChatSession(lang);
            setMessages([{ id: '0', role: 'model', text: t.chatbot_welcome }]);
        }
    }, [isOpen, lang, t]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || !chatSession) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            // Use the chat instance for this session
            if (chatInstanceRef.current) {
                const response = await sendMessageToGemini(chatInstanceRef.current, textToSend);
                const { text: modelText, functionCalls } = parseGeminiResponse(response);
                
                if (modelText) {
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: modelText }]);
                }
                
                if (functionCalls && functionCalls.length > 0) {
                    for (const call of functionCalls) {
                        if (call.name === 'show_lead_form') {
                            setMessages(prev => [...prev, { 
                                id: (Date.now() + 1).toString(), 
                                role: 'model', 
                                text: lang === 'cs-CZ' ? "Ráda tě propojím se Zuzanou a jejím týmem. Vyplň prosím kontaktní údaje:" : "I'd love to connect you with Zuzana and her team. Please fill in your contact details:", 
                                type: 'ui-form' 
                            }]);
                        } else if (call.name === 'show_pricing') {
                            setMessages(prev => [...prev, { 
                                id: (Date.now() + 2).toString(), 
                                role: 'model', 
                                text: lang === 'cs-CZ' ? "Zde jsou možnosti spolupráce a mentoringu:" : "Here are the mentoring options:", 
                                type: 'ui-pricing' 
                            }]);
                        } else if (call.name === 'recommend_podcast') {
                            const episodeId = call.args.episodeId as string;
                            const reason = (call.args.reason as string) || (lang === 'cs-CZ' ? "Myslím, že tato epizoda se ti bude líbit!" : "I think you'll love this episode!");
                            setMessages(prev => [...prev, {
                                 id: (Date.now() + 3).toString(),
                                 role: 'model',
                                 text: reason,
                                 type: 'ui-card',
                                 data: { episodeId }
                            }]);
                        }
                    }
                } else if (!modelText) {
                     setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: lang === 'cs-CZ' ? "Rozumím." : "I understand." }]);
                }
            }
        } catch (error) {
            const appError = createAppError(error, 'GEMINI_ERROR', { action: 'chatSend' });
            logError(appError);
            const errorMsg = getChatErrorMessage(appError, lang);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: errorMsg }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        
        try {
            const { error } = await saveLead({ 
                name, 
                email: formData.get('email') as string, 
                phone: formData.get('phone') as string || undefined, 
                interest: 'Chatbot Conversation',
                source: 'chatbot',
                notes: 'Captured via AI Assistant',
                tags: ['AI Lead']
            });
            
            if (error) {
                throw error;
            }
            
            setNotification(lang === 'cs-CZ' ? "Úspěšně odesláno! Děkujeme." : "Successfully sent! Thank you.");
            setTimeout(() => setNotification(null), 3000);
            
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: lang === 'cs-CZ' ? `Děkuji, ${name}. Údaje jsem předala. Ozveme se co nejdříve! ✨` : `Thank you, ${name}. I've passed on your details. We'll be in touch soon! ✨`,
                type: 'ui-notification'
            }]);
        } catch (error) {
            logError(createAppError(error, 'UNKNOWN_ERROR', { action: 'chatLeadSubmit' }));
            setNotification(lang === 'cs-CZ' ? "Něco se pokazilo. Zkuste to znovu." : "Something went wrong. Please try again.");
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 ${isOpen ? 'bg-iconic-black text-white' : 'bg-iconic-pink text-white'} border-4 border-white`}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200 overflow-hidden animate-fade-in-up font-sans">
                    <div className="bg-gradient-to-r from-iconic-pink to-[#890451] p-4 flex items-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={60} />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-3 border border-white/30 backdrop-blur-sm shadow-inner">
                            <span className="font-serif font-bold italic text-xl">I</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">ICONIC Assistant</h3>
                            <div className="flex items-center text-xs text-white/80">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                Online • AI Powered
                            </div>
                        </div>
                    </div>

                    {notification && (
                        <div className="absolute top-20 left-4 right-4 bg-iconic-blue text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center justify-center animate-bounce z-20">
                            <CheckCircle size={18} className="mr-2" /> {notification}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9F9]">
                        {messages.map((msg, index) => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-message-in`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${
                                    msg.role === 'user' 
                                    ? 'bg-iconic-black text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                    {msg.text && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                                    
                                    {index === 0 && msg.role === 'model' && messages.length === 1 && (
                                        <div className="mt-4 flex flex-wrap gap-2 animate-fade-in-up">
                                            {t.chatbot_starters.map((starter: string, idx: number) => (
                                                 <button 
                                                     key={idx}
                                                     onClick={() => handleSend(starter)}
                                                     className="bg-white border border-iconic-pink/20 text-iconic-black text-xs font-bold py-2 px-3 rounded-full shadow-sm hover:bg-iconic-pink hover:text-white transition-all transform hover:scale-105 hover:shadow-md"
                                                 >
                                                     {starter}
                                                 </button>
                                            ))}
                                        </div>
                                    )}

                                    {msg.type === 'ui-form' && (
                                        <form onSubmit={handleLeadSubmit} className="mt-4 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <input required name="name" type="text" placeholder={lang === 'cs-CZ' ? "Jméno a Příjmení" : "Full Name"} className="w-full p-3 text-sm border border-gray-200 rounded-lg bg-white focus:border-iconic-pink focus:outline-none transition-colors" />
                                            <input required name="email" type="email" placeholder="Email" className="w-full p-3 text-sm border border-gray-200 rounded-lg bg-white focus:border-iconic-pink focus:outline-none transition-colors" />
                                            <input name="phone" type="tel" placeholder={lang === 'cs-CZ' ? "Telefon (+420...)" : "Phone"} className="w-full p-3 text-sm border border-gray-200 rounded-lg bg-white focus:border-iconic-pink focus:outline-none transition-colors" />
                                            <button type="submit" disabled={isSubmitting} className="w-full bg-iconic-pink text-white py-3 rounded-lg text-sm font-bold hover:bg-pink-700 transition-colors disabled:opacity-50">
                                                {isSubmitting ? '...' : (lang === 'cs-CZ' ? 'Odeslat' : 'Submit')}
                                            </button>
                                        </form>
                                    )}
                                    {msg.type === 'ui-pricing' && (
                                        <div className="mt-4 flex flex-col gap-3 overflow-y-auto max-h-60 pr-1 custom-scrollbar">
                                            {PRICING_PLANS.map((plan, i) => (
                                                <div key={i} className={`p-4 rounded-xl border ${plan.recommended ? 'border-iconic-pink bg-pink-50/50' : 'border-gray-200 bg-white'}`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="font-bold text-sm text-iconic-black">{plan.name}</div>
                                                        {plan.recommended && <span className="bg-iconic-pink text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">Best</span>}
                                                    </div>
                                                    <div className="text-lg font-bold text-iconic-pink mb-2">{plan.price}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {msg.type === 'ui-card' && msg.data?.episodeId && (
                                        <div className="mt-4">
                                            {(() => {
                                                const ep = PODCAST_EPISODES.find(p => p.id === msg.data.episodeId);
                                                if (!ep) return null;
                                                return (
                                                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md">
                                                        <img src={ep.imageUrl} alt={ep.title} className="w-full h-32 object-cover" />
                                                        <div className="p-3">
                                                            <div className="font-bold text-sm leading-tight mb-2">{ep.title}</div>
                                                            <Link to={`/episodes/${ep.id}`} className="text-xs text-iconic-pink font-bold flex items-center">{lang === 'cs-CZ' ? 'Poslechnout' : 'Listen'} <ChevronRight size={12} /></Link>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start animate-fade-in-up">
                                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 items-center flex gap-3">
                                   <Sparkles size={12} className="text-iconic-pink animate-spin" />
                                   <div className="flex space-x-1.5">
                                        <div className="w-1.5 h-1.5 bg-iconic-pink rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-iconic-pink rounded-full animate-bounce delay-100"></div>
                                        <div className="w-1.5 h-1.5 bg-iconic-pink rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={lang === 'cs-CZ' ? "Zeptejte se na cokoliv..." : "Ask anything..."}
                            className="flex-1 p-3.5 pl-5 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:border-iconic-pink transition-colors"
                        />
                        <button onClick={() => handleSend()} disabled={!input.trim() || isThinking} className="p-3.5 bg-iconic-black text-white rounded-full hover:bg-iconic-pink disabled:opacity-50 transition-colors">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
