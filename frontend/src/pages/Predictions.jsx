import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Predictions = () => {
  const [symptoms, setSymptoms] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/ai/predict-disease', { symptoms });
      setPrediction(response.data.diagnosis);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch prediction from AI. Make sure your Gemini API Key is configured in the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f1712] rounded-3xl shadow-2xl h-[calc(100vh-8rem)] flex flex-col overflow-hidden border border-white/10 relative p-8">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex items-center space-x-4 mb-8 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-10">
        <div className="p-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-wide">AI Disease Prediction</h2>
          <p className="text-sm text-gray-400 mt-1">Instant veterinary diagnostics powered by Gemini AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col">
          <form onSubmit={handlePredict} className="space-y-6 flex-1 flex flex-col">
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                Describe the symptoms
              </label>
              <textarea
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 flex-1 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] text-white placeholder-gray-600 resize-none"
                placeholder="E.g., High fever, lethargy, reduced milk yield for the past 2 days..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading || !symptoms}
              className="w-full bg-accent hover:bg-white disabled:bg-white/10 disabled:text-gray-500 text-dark font-black tracking-wide py-5 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(212,163,115,0.4)] flex justify-center items-center text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  ANALYZING WITH AI...
                </>
              ) : 'PREDICT DISEASE'}
            </button>
            {error && <p className="text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm mt-4 font-bold tracking-wide">{error}</p>}
          </form>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col overflow-hidden relative group transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all duration-500"></div>
          {prediction ? (
            <div className="h-full flex flex-col relative z-10">
              <h3 className="text-xl font-black text-white mb-6 flex items-center tracking-wide border-b border-white/10 pb-4">
                <AlertTriangle className="w-6 h-6 text-accent mr-3" /> 
                AI Diagnosis Report
              </h3>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/10 flex-1 overflow-y-auto custom-scrollbar shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{prediction}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-2xl p-8 bg-black/20 relative z-10">
              <Activity className="w-16 h-16 mb-4 text-white/20 drop-shadow-lg" />
              <h3 className="text-xl font-bold text-white tracking-wide mb-2">Awaiting Input</h3>
              <p className="text-center text-sm font-medium">Enter symptoms and run prediction to see the AI diagnostic report here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predictions;
