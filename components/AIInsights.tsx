
import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { analyzeLibraryIncome } from '../services/geminiService';
import { Transaction, AIInsight } from '../types';

interface AIInsightsProps {
  transactions: Transaction[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ transactions }) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeLibraryIncome(transactions);
      if (result) {
        setInsight(result);
      } else {
        setError("No se pudo obtener el análisis. Verifica tu conexión.");
      }
    } catch (err) {
      setError("Error al procesar la solicitud con IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
            <Sparkles className="text-amber-500" /> BiblioAI: Análisis Inteligente
          </h3>
          <p className="text-indigo-700 text-sm mt-1">Utiliza IA para encontrar patrones y optimizar la recaudación.</p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || transactions.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          {insight ? 'Actualizar Análisis' : 'Generar Insights'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {insight && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-gray-800">Resumen Ejecutivo</h4>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                insight.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 
                insight.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {insight.trend === 'up' ? <ChevronUp size={14} /> : insight.trend === 'down' ? <ChevronDown size={14} /> : null}
                {insight.trend.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">{insight.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insight.recommendations.map((rec, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border-l-4 border-l-amber-400 shadow-sm border border-gray-100">
                <span className="text-xs font-bold text-amber-600 block mb-1">RECOMENDACIÓN {i + 1}</span>
                <p className="text-gray-700 text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!insight && !loading && (
        <div className="text-center py-8 text-indigo-300">
          <p>Haz clic en el botón superior para analizar tus datos actuales con Gemini AI.</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
