
import { Transaction, TransactionCategory } from './types';

export const UNIVERSITY_BRANCHES = [
  'Biblioteca Central',
  'Facultad de Ingeniería',
  'Facultad de Medicina',
  'Campus Norte',
  'Ciencias Sociales'
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    amount: 15.50,
    category: TransactionCategory.MULTAS,
    description: 'Multa por retraso - Libro: Don Quijote',
    date: new Date().toISOString(),
    branch: 'Biblioteca Central'
  },
  {
    id: '2',
    amount: 45.00,
    category: TransactionCategory.IMPRESIONES,
    description: 'Impresión de tesis (150 páginas)',
    date: new Date().toISOString(),
    branch: 'Facultad de Ingeniería'
  },
  {
    id: '3',
    amount: 120.00,
    category: TransactionCategory.ESPACIOS,
    description: 'Reserva Sala de Conferencias B',
    date: new Date().toISOString(),
    branch: 'Campus Norte'
  }
];

export const CATEGORY_COLORS: Record<string, string> = {
  [TransactionCategory.MULTAS]: '#ef4444',
  [TransactionCategory.IMPRESIONES]: '#3b82f6',
  [TransactionCategory.CARNETS]: '#10b981',
  [TransactionCategory.ESPACIOS]: '#f59e0b',
  [TransactionCategory.VENTAS]: '#8b5cf6',
  [TransactionCategory.DONACIONES]: '#ec4899',
  [TransactionCategory.OTROS]: '#64748b'
};
