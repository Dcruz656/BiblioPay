import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Plus, Search, Library, Receipt, FileText, Hash, LogOut, FileSpreadsheet, 
  Sparkles, Loader2, AlertCircle, ChevronUp, ChevronDown, PlusCircle, X, 
  Upload, Trash2, Calendar, DollarSign, TrendingUp, BookOpen, Clock, 
  Lock, User, ArrowRight 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- TYPES ---
enum TransactionCategory {
  MULTAS = 'Multas',
  IMPRESIONES = 'Impresiones/Fotocopias',
  CARNETS = 'Reposición de Carnets',
  ESPACIOS = 'Alquiler de Espacios',
  VENTAS = 'Venta de Materiales',
  DONACIONES = 'Donaciones',
  OTROS = 'Otros'
}

interface Transaction {
  id: string;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string;
  branch: string;
  receipt?: string;
  referenceNumber?: string;
}

interface AIInsight {
  summary: string;
  recommendations: string[];
  trend: 'up' | 'down' | 'stable';
}

// --- CONSTANTS ---
const UNIVERSITY_BRANCHES = [
  'Biblioteca Central', 'Facultad de Ingeniería', 'Facultad de Medicina', 'Campus Norte', 'Ciencias Sociales'
];

const CATEGORY_COLORS: Record<string, string> = {
  [TransactionCategory.MULTAS]: '#ef4444',
  [TransactionCategory.IMPRESIONES]: '#3b82f6',
  [TransactionCategory.CARNETS]: '#10b981',
  [TransactionCategory.ESPACIOS]: '#f59e0b',
  [TransactionCategory.VENTAS]: '#8b5cf6',
  [TransactionCategory.DONACIONES]: '#ec4899',
  [TransactionCategory.OTROS]: '#64748b'
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', amount: 15.50, category: TransactionCategory.MULTAS, description: 'Multa retraso: El Aleph', date: new Date().toISOString(), branch: 'Biblioteca Central' },
  { id: '2', amount: 45.00, category: TransactionCategory.IMPRESIONES, description: 'Copias examen Medicina', date: new Date().toISOString(), branch: 'Facultad de Medicina' }
];

// --- SERVICES ---
const analyzeLibraryIncome = async (transactions: Transaction[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dataSummary = transactions.map(t => ({ amount: t.amount, category: t.category, branch: t.branch }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza estos ingresos bibliotecarios: ${JSON.stringify(dataSummary)}. Resume desempeño y da 3 consejos.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            trend: { type: Type.STRING, enum: ["up", "down", "stable"] }
          },
          required: ["summary", "recommendations", "trend"]
        }
      }
    });
    return JSON.parse(response.text?.trim() || "{}");
  } catch (error) {
    console.error(error);
    return null;
  }
};

// --- COMPONENTS ---
const LoginForm = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user === 'admin' && pass === 'admin') onLogin();
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white mb-4 shadow-lg"><Library size={32} /></div>
        <h1 className="text-3xl font-black text-slate-900 mb-6">BiblioPay</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Usuario" className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500" value={user} onChange={e => setUser(e.target.value)} required />
          <input type="password" placeholder="Contraseña" className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500" value={pass} onChange={e => setPass(e.target.value)} required />
          {err && <div className="text-red-500 text-xs font-bold animate-shake">Credenciales inválidas</div>}
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">Entrar <ArrowRight size={18} /></button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ transactions }) => {
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  const stats = [
    { title: 'Total Periodo', value: `$${total.toFixed(2)}`, icon: <TrendingUp />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Operaciones', value: transactions.length, icon: <Clock />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Sedes Activas', value: '5', icon: <BookOpen />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Promedio Op.', value: `$${(total / (transactions.length || 1)).toFixed(2)}`, icon: <DollarSign />, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
          <p className="text-gray-500 text-xs font-medium">{s.title}</p>
          <p className="text-xl font-bold text-gray-900">{s.value}</p>
        </div>
      ))}
    </div>
  );
};

const IncomeForm = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({ amount: '', category: TransactionCategory.MULTAS, description: '', branch: UNIVERSITY_BRANCHES[0], date: new Date().toISOString().split('T')[0] });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...formData, amount: Number(formData.amount) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
          <h3 className="text-xl font-bold">Nuevo Registro</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="number" step="0.01" placeholder="Monto" className="w-full p-3 border rounded-xl" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
          <select className="w-full p-3 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as TransactionCategory})}>
            {Object.values(TransactionCategory).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="w-full p-3 border rounded-xl" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})}>
            {UNIVERSITY_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <textarea placeholder="Descripción" className="w-full p-3 border rounded-xl h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all">Guardar</button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [auth, setAuth] = useState(false);
  const [txs, setTxs] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [showForm, setShowForm] = useState(false);
  const [aiResult, setAiResult] = useState<AIInsight | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('biblio_txs');
    if (saved) setTxs(JSON.parse(saved));
    if (localStorage.getItem('biblio_auth') === 'true') setAuth(true);
  }, []);

  useEffect(() => { localStorage.setItem('biblio_txs', JSON.stringify(txs)); }, [txs]);

  const handleLogin = () => { setAuth(true); localStorage.setItem('biblio_auth', 'true'); };
  const handleLogout = () => { setAuth(false); localStorage.removeItem('biblio_auth'); };
  const addTx = (data) => setTxs([{ ...data, id: Math.random().toString(36).substr(2, 9) }, ...txs]);

  const runAi = async () => {
    setLoadingAi(true);
    const res = await analyzeLibraryIncome(txs);
    if (res) setAiResult(res);
    setLoadingAi(false);
  };

  if (!auth) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b sticky top-0 z-40 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><Library size={20} /></div>
          <div><h1 className="font-bold text-slate-900 leading-none">BiblioPay</h1><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Administración</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all"><Plus size={18} /></button>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <Dashboard transactions={txs} />

        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2"><Sparkles className="text-yellow-400" /> BiblioAI Insights</h3>
            <button onClick={runAi} disabled={loadingAi} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              {loadingAi ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Analizar
            </button>
          </div>
          {aiResult ? (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm opacity-90">{aiResult.summary}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiResult.recommendations.map((r, i) => (
                  <div key={i} className="bg-white/10 p-3 rounded-xl text-xs border border-white/10">{r}</div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm opacity-60 text-center py-4">Pulsa analizar para obtener sugerencias de la IA.</p>}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b font-bold text-slate-800 flex items-center gap-2"><Receipt className="text-blue-500" size={18} /> Historial Reciente</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                <tr><th className="px-6 py-4">Detalle</th><th className="px-6 py-4">Categoría</th><th className="px-6 py-4 text-right">Monto</th></tr>
              </thead>
              <tbody className="divide-y">
                {txs.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{t.description || 'Sin descripción'}</div>
                      <div className="text-[10px] text-slate-400">{t.branch} • {new Date(t.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 rounded text-[9px] font-bold text-white" style={{backgroundColor: CATEGORY_COLORS[t.category]}}>{t.category}</span></td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">${t.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showForm && <IncomeForm onAdd={addTx} onClose={() => setShowForm(false)} />}
    </div>
  );
};

// --- MOUNT ---
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
