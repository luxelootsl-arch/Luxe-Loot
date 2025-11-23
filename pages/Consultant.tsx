import React, { useState } from 'react';
import { askConsultant, generateSpeech } from '../services/geminiService';
import { ChatMessage } from '../types';

const Consultant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'search' | 'thinking'>('search');
  const [playingAudio, setPlayingAudio] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setPrompt('');

    try {
      const result = await askConsultant(userMsg.text, mode);
      const modelMsg: ChatMessage = {
        role: 'model',
        text: result.text || "I couldn't generate a response.",
        groundingUrls: result.groundingChunks?.map(c => c.web?.uri || '').filter(Boolean) as string[]
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (playingAudio) return;
    try {
      setPlayingAudio(true);
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Use standard decode for base64 file data returned by TTS
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => setPlayingAudio(false);
        source.start();
      } else {
        setPlayingAudio(false);
      }
    } catch (e) {
      console.error("TTS Error", e);
      setPlayingAudio(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">AI Business Consultant</h1>
        <p className="text-slate-600">Get strategic advice tailored for your business.</p>
      </div>

      <div className="flex space-x-4 mb-4 bg-slate-100 p-1 rounded-lg self-start">
        <button
          onClick={() => setMode('search')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${mode === 'search' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}
        >
          🌐 Search (Live Info)
        </button>
        <button
          onClick={() => setMode('thinking')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${mode === 'thinking' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}
        >
          🧠 Deep Thinking (Complex)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-20">
            <p>Try asking:</p>
            <p className="italic">"What are the trending travel destinations in Sri Lanka right now?"</p>
            <p className="italic mt-2">or</p>
            <p className="italic">"Draft a 3-month marketing strategy for a luxury villa."</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              
              {/* Grounding Sources */}
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-300/50">
                  <p className="text-xs font-semibold mb-1 opacity-70">Sources:</p>
                  <ul className="text-xs space-y-1">
                    {msg.groundingUrls.map((url, idx) => (
                      <li key={idx}>
                        <a href={url} target="_blank" rel="noreferrer" className="underline opacity-80 hover:opacity-100 truncate block">
                          {new URL(url).hostname}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TTS Button for Model */}
              {msg.role === 'model' && (
                <button 
                  onClick={() => handleSpeak(msg.text)}
                  disabled={playingAudio}
                  className="mt-2 text-xs flex items-center gap-1 opacity-70 hover:opacity-100 bg-black/5 p-1 rounded"
                >
                  {playingAudio ? '🔊 Playing...' : '🔈 Read Aloud'}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl p-4 flex items-center gap-2 text-slate-500">
              <span className="animate-spin text-xl">✨</span>
              {mode === 'thinking' ? 'Analyzing deeply...' : 'Searching...'}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={mode === 'search' ? "Search for real-time info..." : "Ask for a complex business plan..."}
          className="flex-1 rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Consultant;