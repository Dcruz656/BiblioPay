
import React, { useState, useRef } from 'react';
import { TransactionCategory, Transaction } from '../types';
import { UNIVERSITY_BRANCHES } from '../constants';
import { PlusCircle, X, Upload, FileText, Image as ImageIcon, Trash2, Calendar, Hash } from 'lucide-react';

interface IncomeFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onAdd, onClose }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.MULTAS);
  const [description, setDescription] = useState('');
  const [branch, setBranch] = useState(UNIVERSITY_BRANCHES[0]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receipt, setReceipt] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    onAdd({
      amount: Number(amount),
      category,
      description,
      branch,
      date: new Date(selectedDate).toISOString(),
      receipt,
      referenceNumber: referenceNumber.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <PlusCircle size={24} /> Registro de Ingreso
          </h3>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar size={14} className="text-blue-500" /> Fecha
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto (MXN)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Hash size={14} className="text-blue-500" /> Nº de Comprobante / Referencia
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Ej: REC-2024-001"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                {Object.values(TransactionCategory).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sede / Biblioteca</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                {UNIVERSITY_BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none text-sm"
              placeholder="Detalles adicionales..."
            ></textarea>
          </div>

          {/* Sección de Adjuntar Comprobante */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold text-xs uppercase tracking-wider">Documento Digital (Opcional)</label>
            {!receipt ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <Upload className="text-gray-400 group-hover:text-blue-500 mb-1" size={24} />
                <p className="text-xs text-gray-500 group-hover:text-blue-600">Subir foto o PDF del comprobante</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-2">
                <div className="flex items-center gap-3 p-1">
                  {receipt.startsWith('data:image/') ? (
                    <div className="w-10 h-10 rounded bg-white overflow-hidden border border-blue-200">
                      <img src={receipt} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded bg-blue-200 flex items-center justify-center text-blue-700">
                      <FileText size={20} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-900 truncate">Archivo listo</p>
                    <p className="text-[10px] text-blue-700">Toca para cambiar</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setReceipt(undefined)}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Guardar Registro
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncomeForm;
