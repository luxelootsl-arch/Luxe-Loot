import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decodeAudioData, base64ToBytes } from '../services/audioUtils';

const LiveSupport: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null); // Type 'LiveSession' is internal to SDK
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Refs for visuals
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startSession = async () => {
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      audioContextRef.current = audioCtx;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Visualizer setup
      const analyser = outputCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      // Connect to analyser for visualization
      outputNode.connect(analyser);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Session opened");
            setConnected(true);

            // Audio Input Processing
            const source = audioCtx.createMediaStreamSource(stream);
            sourceRef.current = source;
            const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputCtx.currentTime
              );
              
              const audioBuffer = await decodeAudioData(
                base64ToBytes(base64Audio),
                outputCtx,
                24000,
                1
              );

              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            const interrupted = msg.serverContent?.interrupted;
            if (interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log("Session closed");
            setConnected(false);
          },
          onerror: (err) => {
            console.error("Session error", err);
            setError("Connection error.");
            setConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: "You are a friendly, helpful AI assistant for Digital Boost Pro. You help clients with social media, hotel management, and web services. Keep answers concise."
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (e) {
      console.error(e);
      setError("Failed to start audio session. Please allow microphone access.");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      // SDK doesn't always expose close directly in the resolved type depending on version, 
      // but usually does.
       try { sessionRef.current.close(); } catch(e) {}
    }
    
    // Cleanup Audio
    streamRef.current?.getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();

    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();

    setConnected(false);
    sessionRef.current = null;
  };

  // Visualizer Loop
  useEffect(() => {
    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 200)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
      
      if (connected) {
         animationFrameRef.current = requestAnimationFrame(draw);
      }
    };

    if (connected) {
      draw();
    } else {
       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
       // Clear canvas
       const cvs = canvasRef.current;
       if(cvs) cvs.getContext('2d')?.clearRect(0,0, cvs.width, cvs.height);
    }

    return () => {
       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, [connected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center h-[calc(100vh-64px)] flex flex-col justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 relative overflow-hidden">
        
        {/* Status Indicator */}
        <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-300'}`} />

        <div className="mb-6">
          <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            🎙️
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Live Support</h2>
          <p className="text-slate-500 text-sm mt-2">
            Speak naturally with our AI assistant.<br/>Powered by Gemini Live API.
          </p>
        </div>

        {/* Visualizer Canvas */}
        <div className="h-32 w-full bg-slate-50 rounded-xl mb-6 flex items-end justify-center overflow-hidden border border-slate-200">
           <canvas ref={canvasRef} width="300" height="128" className="w-full h-full" />
        </div>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        {!connected ? (
          <button
            onClick={startSession}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-brand-200"
          >
            Start Conversation
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-red-200"
          >
            End Call
          </button>
        )}
      </div>
      <p className="mt-8 text-xs text-slate-400">
        Requires microphone access. Audio is processed in real-time.
      </p>
    </div>
  );
};

export default LiveSupport;