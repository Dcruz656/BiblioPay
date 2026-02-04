
import React from 'react';
import { Transaction } from '../types';
import { DollarSign, TrendingUp, BookOpen, Clock } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const totalToday = transactions
    .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMonthly = transactions.reduce((sum, t) => sum + t.amount, 0);
  const countToday = transactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).length;

  const stats = [
    {
      title: 'Ingresos Hoy',
      value: `$${totalToday.toFixed(2)}`,
      icon: <DollarSign className="text-emerald-600" />,
      bg: 'bg-emerald-50',
      description: 'Total generado el día de hoy'
    },
    {
      title: 'Acumulado Total',
      value: `$${totalMonthly.toFixed(2)}`,
      icon: <TrendingUp className="text-blue-600" />,
      bg: 'bg-blue-50',
      description: 'Ingresos en el periodo actual'
    },
    {
      title: 'Transacciones Hoy',
      value: countToday.toString(),
      icon: <Clock className="text-orange-600" />,
      bg: 'bg-orange-50',
      description: 'Nº de operaciones registradas'
    },
    {
      title: 'Bibliotecas Activas',
      value: '5',
      icon: <BookOpen className="text-purple-600" />,
      bg: 'bg-purple-50',
      description: 'Sedes reportando ingresos'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              {stat.icon}
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          <p className="text-xs text-gray-400 mt-2">{stat.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
