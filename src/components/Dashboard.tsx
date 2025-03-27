import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Complaint } from '../types';
import { PieChart as ChartPie, Clock, FileText } from 'lucide-react';

interface DashboardProps {
  complaints: Complaint[];
}

export function Dashboard({ complaints }: DashboardProps) {
  // Calculate average SLA for all complaints
  const averageSLA = useMemo(() => {
    if (complaints.length === 0) return 0;
    const totalSLA = complaints.reduce((acc, complaint) => {
      const startDate = new Date(complaint.receivedDate);
      const endDate = complaint.conclusion?.dataEncerramento 
        ? new Date(complaint.conclusion.dataEncerramento)
        : new Date();
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const sla = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + sla;
    }, 0);
    return Math.round(totalSLA / complaints.length);
  }, [complaints]);

  // Monthly trend data grouped by year
  const monthlyData = useMemo(() => {
    const data = {};
    
    complaints.forEach(complaint => {
      const date = new Date(complaint.receivedDate);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      if (!data[year]) {
        data[year] = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'short' }),
          count: 0
        }));
      }
      
      data[year][month].count++;
    });

    // Convert to format suitable for stacked bar chart
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'short' }),
      ...Object.keys(data).reduce((acc, year) => ({
        ...acc,
        [year]: data[year][i].count
      }), {})
    }));

    return months;
  }, [complaints]);

  // Categories data
  const categoriesData = useMemo(() => {
    const categories = {};
    complaints.forEach(complaint => {
      categories[complaint.category] = (categories[complaint.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  // Characteristics data
  const characteristicsData = useMemo(() => {
    const chars = {};
    complaints.forEach(complaint => {
      chars[complaint.characteristic] = (chars[complaint.characteristic] || 0) + 1;
    });
    return Object.entries(chars).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  // Procedência data
  const procedenciaData = useMemo(() => {
    const proc = {};
    complaints.forEach(complaint => {
      if (complaint.conclusion?.procedencia) {
        proc[complaint.conclusion.procedencia] = (proc[complaint.conclusion.procedencia] || 0) + 1;
      }
    });
    return Object.entries(proc).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  // Status data
  const statusData = useMemo(() => {
    const status = {
      'Nova Denúncia': 0,
      'Em Investigação': 0,
      'Concluída': 0,
      'Arquivada': 0
    };

    complaints.forEach(complaint => {
      switch (complaint.status) {
        case 'nova':
          status['Nova Denúncia']++;
          break;
        case 'investigacao':
          status['Em Investigação']++;
          break;
        case 'concluida':
          status['Concluída']++;
          break;
        case 'arquivada':
          status['Arquivada']++;
          break;
      }
    });

    return Object.entries(status).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  // Action status data
  const actionStatusData = useMemo(() => {
    const status = {};
    complaints.forEach(complaint => {
      complaint.actions?.forEach(action => {
        status[action.status] = (status[action.status] || 0) + 1;
      });
    });
    return Object.entries(status).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  // Action types data
  const actionTypesData = useMemo(() => {
    const types = {};
    complaints.forEach(complaint => {
      complaint.actions?.forEach(action => {
        types[action.type] = (types[action.type] || 0) + 1;
      });
    });
    return Object.entries(types)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 10);
  }, [complaints]);

  // Calculate total complaints across all statuses
  const totalComplaints = useMemo(() => 
    statusData.reduce((acc, curr) => acc + curr.value, 0),
    [statusData]
  );

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FF7C7C', '#A4DE6C', '#D0ED57', '#FFC658'
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Get years for the stacked bar chart
  const years = useMemo(() => 
    Array.from(new Set(complaints.map(c => 
      new Date(c.receivedDate).getFullYear()
    ))).sort(),
    [complaints]
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard de Denúncias</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total de Denúncias</h3>
              <p className="text-2xl font-bold text-gray-900">{totalComplaints}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">SLA Médio</h3>
              <p className="text-2xl font-bold text-gray-900">{averageSLA} dias</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ChartPie className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Taxa de Conclusão</h3>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((complaints.filter(c => c.status === 'concluida').length / 
                  (complaints.length || 1)) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Denúncias</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {years.map((year, index) => (
                  <Bar 
                    key={year}
                    dataKey={year.toString()} 
                    name={`${year}`} 
                    stackId="a"
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorias</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Characteristics */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Características</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={characteristicsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Denúncias" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Procedência */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Procedência</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={procedenciaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {procedenciaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Ações</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {actionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Types */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Tipos de Ações</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={actionTypesData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Ações" fill="#8884D8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}