import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Library, Receipt, Download, FileCheck, Eye, X, FileText, Hash, LogOut, FileSpreadsheet, Smartphone } from 'lucide-react';
import { Transaction, TransactionCategory } from './types.ts';
import { INITIAL_TRANSACTIONS, CATEGORY_COLORS, UNIVERSITY_BRANCHES } from './constants.tsx';
import Dashboard from './components/Dashboard.tsx';
import Charts from './components/Charts.tsx';
import IncomeForm from './components/IncomeForm.tsx';
import AIInsights from './components/AIInsights.tsx';
import LoginForm from './components/LoginForm.tsx';

// Importación de librerías para exportación
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const auth = localStorage.getItem('biblio_auth');
    if (auth === 'true') setIsAuthenticated(true);

    const saved = localStorage.getItem('biblio_transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('biblio_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('biblio_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('biblio_auth');
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9)
    };
    setTransactions(prev => [tx, ...prev]);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.referenceNumber && t.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesBranch = filterBranch === 'all' || t.branch === filterBranch;
    
    return matchesSearch && matchesCategory && matchesBranch;
  });

  const exportToExcel = () => {
    const dataToExport = filteredTransactions.map(t => ({
      Fecha: new Date(t.date).toLocaleDateString('es-MX'),
      Sede: t.branch,
      Categoría: t.category,
      Descripción: t.description,
      'Referencia/Folio': t.referenceNumber || 'N/A',
      Monto: t.amount
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos Filtrados");
    XLSX.writeFile(workbook, `BiblioPay_Reporte_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Fecha", "Sede", "Categoría", "Descripción", "Monto"];
    const tableRows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString('es-MX'),
      t.branch,
      t.category,
      t.description,
      `$${t.amount.toFixed(2)}`
    ]);

    doc.text("Reporte de Ingresos Bibliotecarios", 14, 20);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });
    doc.save(`Reporte_BiblioPay_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow-blue-200 shadow-lg">
                <Library size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-none">BiblioPay</h1>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-0.5 uppercase">Gestión Universitaria</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 font-bold text-sm shadow-md transition-all active:scale-90">
                <Plus size={18} /> <span className="hidden sm:inline">Nuevo</span>
              </button>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        <Dashboard transactions={transactions} />
        <AIInsights transactions={transactions} />
        <Charts transactions={transactions} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <h3 className="text-md font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="text-blue-500" size={18} /> Historial de Transacciones
            </h3>
            
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar descripción o sede..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full text-sm transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold">
                  <option value="all">Todas las sedes</option>
                  {UNIVERSITY_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold">
                  <option value="all">Categorías</option>
                  {Object.values(TransactionCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-5 py-4">Detalle</th>
                  <th className="px-5 py-4">Categoría</th>
                  <th className="px-5 py-4 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-gray-900">{new Date(tx.date).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-500">{tx.branch}</div>
                      <div className="text-[11px] text-blue-600 font-medium">{tx.description}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold text-white" style={{ backgroundColor: CATEGORY_COLORS[tx.category] }}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-black text-gray-900 text-sm">
                      ${tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={exportToExcel} className="p-2 text-emerald-600 bg-emerald-100 rounded-lg"><FileSpreadsheet size={18} /></button>
            <button onClick={exportToPDF} className="p-2 text-red-600 bg-red-100 rounded-lg"><FileText size={18} /></button>
          </div>
        </div>
      </main>

      {isFormOpen && <IncomeForm onAdd={handleAddTransaction} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default App;