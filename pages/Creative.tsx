import React, { useState, useRef, useEffect } from 'react';
import { generateProImage, editImage, generateVeoVideo } from '../services/geminiService';
import { ImageSize, AspectRatio } from '../types';

const LOADING_MESSAGES = [
  "Conceptualizing scene...",
  "Setting up the camera...",
  "Rendering frames...",
  "Applying lighting effects...",
  "Polishing pixels...",
  "Almost ready...",
];

const Creative: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'video'>('generate');
  
  // Gen Image State
  const [genPrompt, setGenPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit Image State
  const [editPrompt, setEditPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  // Video Loading Message Cycle
  useEffect(() => {
    let interval: number;
    if (isVideoGenerating) {
      interval = window.setInterval(() => {
        setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 4000);
    } else {
      setLoadingMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [isVideoGenerating]);

  // Handlers
  const handleGenerate = async () => {
    if (!genPrompt) return;
    setIsGenerating(true);
    try {
      const img = await generateProImage(genPrompt, size, ratio);
      setGeneratedImage(img);
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Ensure you select an API Key if prompted.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !editPrompt) return;
    setIsEditing(true);
    try {
      // Remove header from base64 string
      const base64Data = sourceImage.split(',')[1];
      const mimeType = sourceImage.substring(sourceImage.indexOf(':') + 1, sourceImage.indexOf(';'));
      
      const result = await editImage(base64Data, editPrompt, mimeType);
      if (result) {
        setEditedImage(result);
      } else {
        alert("The model didn't return an image. Try a different prompt.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to edit image.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt) return;
    setIsVideoGenerating(true);
    setGeneratedVideoUrl(null);
    try {
      const url = await generateVeoVideo(videoPrompt, videoRatio, videoResolution);
      setGeneratedVideoUrl(url);
    } catch (error) {
      console.error(error);
      alert("Failed to generate video. This process can take a few minutes. Ensure you have a paid API key selected.");
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const tabButtonClass = (tab: typeof activeTab) => 
    `px-6 py-2 rounded-md font-medium transition ${activeTab === tab ? 'bg-white shadow text-brand-600' : 'text-slate-600'}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Creative Studio</h1>
        <p className="text-slate-600">Power your visuals with Gemini Nano, Pro & Veo.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-slate-200 p-1 rounded-lg inline-flex">
          <button onClick={() => setActiveTab('generate')} className={tabButtonClass('generate')}>
            Generate (Pro)
          </button>
          <button onClick={() => setActiveTab('edit')} className={tabButtonClass('edit')}>
            Edit (Flash)
          </button>
          <button onClick={() => setActiveTab('video')} className={tabButtonClass('video')}>
            Video (Veo)
          </button>
        </div>
      </div>

      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Prompt</label>
              <textarea
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                placeholder="A futuristic hotel lobby with neon lights..."
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 h-32"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value as ImageSize)}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  {Object.values(ImageSize).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ratio</label>
                <select
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value as AspectRatio)}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !genPrompt}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </button>
            <p className="text-xs text-slate-400 mt-2 text-center">Uses Gemini 3 Pro Image Preview</p>
          </div>

          <div className="lg:col-span-2 bg-slate-100 rounded-xl flex items-center justify-center min-h-[400px] border-2 border-dashed border-slate-300 p-4">
            {generatedImage ? (
              <img src={generatedImage} alt="Generated" className="max-w-full max-h-[600px] rounded shadow-lg object-contain" />
            ) : (
              <div className="text-slate-400">Image will appear here</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 transition"
             >
                {sourceImage ? (
                  <img src={sourceImage} alt="Source" className="max-h-64 mx-auto rounded" />
                ) : (
                  <div className="py-8">
                    <p className="text-slate-500">Click to upload an image to edit</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Edit Instruction</label>
                <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder='e.g., "Add a retro filter", "Remove the person"'
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2"
                />
             </div>

             <button
              onClick={handleEdit}
              disabled={isEditing || !sourceImage || !editPrompt}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isEditing ? 'Editing...' : 'Apply Magic Edit'}
            </button>
            <p className="text-xs text-slate-400 mt-2 text-center">Uses Gemini 2.5 Flash Image</p>
          </div>

          <div className="bg-slate-100 rounded-xl flex items-center justify-center min-h-[400px] border-2 border-dashed border-slate-300 p-4">
            {editedImage ? (
              <img src={editedImage} alt="Edited" className="max-w-full max-h-[600px] rounded shadow-lg object-contain" />
            ) : (
              <div className="text-slate-400">Edited result will appear here</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Video Description</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="A drone shot of a tropical beach at sunset..."
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 h-32"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Aspect Ratio</label>
                <select
                  value={videoRatio}
                  onChange={(e) => setVideoRatio(e.target.value as any)}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  <option value="16:9">Landscape (16:9)</option>
                  <option value="9:16">Portrait (9:16)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Resolution</label>
                <select
                  value={videoResolution}
                  onChange={(e) => setVideoResolution(e.target.value as any)}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  <option value="720p">720p (Fast)</option>
                  <option value="1080p">1080p (HQ)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isVideoGenerating || !videoPrompt}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-bold hover:bg-pink-700 transition disabled:opacity-50"
            >
              {isVideoGenerating ? 'Creating...' : 'Generate Video'}
            </button>
            <p className="text-xs text-slate-400 mt-2 text-center">Uses Veo (Requires Paid Key)</p>
          </div>

          <div className="lg:col-span-2 bg-slate-100 rounded-xl flex items-center justify-center min-h-[400px] border-2 border-dashed border-slate-300 p-4">
            {isVideoGenerating ? (
              <div className="text-center">
                 <div className="animate-spin text-4xl mb-4">🎬</div>
                 <p className="text-slate-600 font-medium animate-pulse">{LOADING_MESSAGES[loadingMsgIndex]}</p>
                 <p className="text-xs text-slate-400 mt-2">This usually takes 1-2 minutes.</p>
              </div>
            ) : generatedVideoUrl ? (
              <div className="w-full flex flex-col items-center gap-4">
                <video controls className="w-full max-h-[600px] rounded shadow-lg bg-black" src={generatedVideoUrl} />
                <a 
                  href={generatedVideoUrl} 
                  download={`veo-video-${Date.now()}.mp4`}
                  className="bg-slate-800 text-white px-6 py-2 rounded-full font-medium hover:bg-slate-900 transition flex items-center gap-2"
                >
                  ⬇️ Download Video
                </a>
              </div>
            ) : (
              <div className="text-slate-400">Video preview will appear here</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Creative;