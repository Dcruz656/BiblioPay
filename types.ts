
export enum TransactionCategory {
  MULTAS = 'Multas',
  IMPRESIONES = 'Impresiones/Fotocopias',
  CARNETS = 'Reposición de Carnets',
  ESPACIOS = 'Alquiler de Espacios',
  VENTAS = 'Venta de Materiales',
  DONACIONES = 'Donaciones',
  OTROS = 'Otros'
}

export interface Transaction {
  id: string;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string;
  branch: string;
  receipt?: string; // Propiedad para almacenar el comprobante (Base64)
  referenceNumber?: string; // Nuevo: Folio o número de comprobante físico
}

export interface DailySummary {
  date: string;
  total: number;
  byCategory: Record<TransactionCategory, number>;
}

export interface AIInsight {
  summary: string;
  recommendations: string[];
  trend: 'up' | 'down' | 'stable';
}
