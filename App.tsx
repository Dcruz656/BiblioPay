
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Library, Receipt, Download, FileCheck, Eye, X, FileText, Hash, LogOut, FileSpreadsheet, Smartphone } from 'lucide-react';
import { Transaction, TransactionCategory } from './types';
import { INITIAL_TRANSACTIONS, CATEGORY_COLORS, UNIVERSITY_BRANCHES } from './constants';
import Dashboard from './components/Dashboard';
import Charts from './components/Charts';
import IncomeForm from './components/IncomeForm';
import AIInsights from './components/AIInsights';
import LoginForm from './components/LoginForm';

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

    // Manejador para la instalación de PWA
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
    
    const fileName = `BiblioPay_Reporte_${filterBranch === 'all' ? 'General' : filterBranch.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Fecha", "Sede", "Categoría", "Descripción", "Monto (MXN)"];
    const tableRows: any[] = [];

    filteredTransactions.forEach(t => {
      const transactionData = [
        new Date(t.date).toLocaleDateString('es-MX'),
        t.branch,
        t.category,
        t.description,
        `$${t.amount.toFixed(2)}`
      ];
      tableRows.push(transactionData);
    });

    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text("Reporte de Ingresos Bibliotecarios", 14, 20);
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("BiblioPay Systems", 14, 28);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-MX')}`, 14, 38);
    doc.text(`Total registros: ${filteredTransactions.length}`, 14, 44);

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "bold");
    doc.text("Filtros aplicados:", 14, 54);
    doc.setFont("helvetica", "normal");
    
    let filterText = [];
    if (filterBranch !== 'all') filterText.push(`Sede: ${filterBranch}`);
    if (filterCategory !== 'all') filterText.push(`Categoría: ${filterCategory}`);
    if (searchTerm) filterText.push(`Búsqueda: "${searchTerm}"`);
    
    const filtersDisplay = filterText.length > 0 ? filterText.join(" | ") : "Ninguno (Reporte General)";
    doc.text(filtersDisplay, 14, 60);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 68,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 68 }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 68;
    const total = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, finalY + 5, 196, finalY + 5);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`TOTAL RECAUDADO:`, 130, finalY + 15);
    doc.text(`$${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`, 196, finalY + 15, { align: 'right' });

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
              <div className="hidden xs:block">
                <h1 className="text-lg font-bold text-gray-900 leading-none">BiblioPay</h1>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-0.5 uppercase">App v1.0</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                  title="Instalar como App"
                >
                  <Smartphone size={20} />
                  <span className="text-xs font-bold hidden md:inline">Instalar App</span>
                </button>
              )}

              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 font-bold text-sm shadow-md transition-all active:scale-90"
              >
                <Plus size={18} /> 
                <span className="hidden sm:inline">Nuevo</span>
              </button>
              
              <div className="w-px h-5 bg-gray-200 mx-1"></div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
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
              <Receipt className="text-blue-500" size={18} /> Historial
            </h3>
            
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full text-sm transition-all"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold appearance-none"
                >
                  <option value="all">Sedes</option>
                  {UNIVERSITY_BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold appearance-none"
                >
                  <option value="all">Categorías</option>
                  {Object.values(TransactionCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-5 py-4">Información</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="active:bg-gray-100 transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-xs font-bold text-gray-900">
                          {new Date(tx.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">{tx.branch}</div>
                        <div className="text-[10px] text-blue-600 mt-1 font-bold">{tx.description}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span 
                          className="px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase inline-block"
                          style={{ backgroundColor: CATEGORY_COLORS[tx.category] }}
                        >
                          {tx.category}
                        </span>
                        {tx.receipt && (
                          <button 
                            onClick={() => setViewReceipt(tx.receipt!)}
                            className="ml-2 inline-block text-blue-500 p-1"
                          >
                            <FileCheck size={14} />
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-xs font-black text-gray-900">${tx.amount.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-gray-400 text-xs font-bold italic">
                      Sin registros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between gap-2">
            <p className="text-[10px] text-gray-400 font-bold self-center uppercase">Reportes Rápidos</p>
            <div className="flex gap-2">
              <button onClick={exportToExcel} className="p-2 text-emerald-600 bg-emerald-100 rounded-lg transition-transform active:scale-90"><FileSpreadsheet size={18} /></button>
              <button onClick={exportToPDF} className="p-2 text-red-600 bg-red-100 rounded-lg transition-transform active:scale-90"><FileText size={18} /></button>
            </div>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <IncomeForm onAdd={handleAddTransaction} onClose={() => setIsFormOpen(false)} />
      )}

      {viewReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4 backdrop-blur-md" onClick={() => setViewReceipt(null)}>
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-xs text-gray-800 uppercase tracking-widest flex items-center gap-2"><Eye size={16} /> Visor</h3>
              <button onClick={() => setViewReceipt(null)} className="p-2 text-gray-400"><X size={20} /></button>
            </div>
            <div className="p-2 bg-gray-50">
              {viewReceipt.startsWith('data:image/') ? (
                <img src={viewReceipt} alt="Comprobante" className="w-full h-auto rounded-2xl" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 gap-4 py-12">
                  <FileText size={48} className="text-blue-200" />
                  <a href={viewReceipt} download className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold">Descargar PDF</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
