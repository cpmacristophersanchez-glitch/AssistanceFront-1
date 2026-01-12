import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Edit2, 
  Save,  
  Briefcase, 
  TrendingUp,
  GraduationCap,
  Users,
  Sun,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

import type { Student } from '../types';

type TimeRange = '1M' | '3M' | '1Y';

// Interfaz para el formato específico de datos proporcionado


const StudentDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
const studentFromState = location.state?.student; // Esto viene del navigate en StudentList

const [student, setStudent] = useState<Student | null>(studentFromState ?? null);

  const [isEditingAvg, setIsEditingAvg] = useState(false);
  const [tempAvg, setTempAvg] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [selectedMonth, setSelectedMonth] = useState('');

 useEffect(() => {
  if (student) {
    console.log(student.months);
    
    setTempAvg(student.averageAttendance ?? 0);
  }
}, [student]);

  const handleSaveAvg = async () => {
    try {
      if (student) {
        const res =await fetch(`https://assistanceback-s8jr.vercel.app/subirpromedio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            persona: student.name,
            promedio: tempAvg
          })
        });
        if (res.ok) {
          setStudent({ ...student, averageAttendance: tempAvg });
        } else {
          
        }
      }
    } catch (error) {
      
    }finally {
    setIsEditingAvg(false);
  }};

  // Determine chart configuration based on selected time range
 const chartConfig = useMemo(() => {
  if (!student?.months) return {
    title: '',
    data: [],
    dataKey: 'value',
    yDomain: [0, 0],
    yUnit: '',
    barColor: () => '#000',
    showRefLine: false
  };

  switch (timeRange) {
    case '1M': {
      // Mostrar días del mes seleccionado, si no hay selección usar el último mes
      const monthData = student.months.find(m => m.key === selectedMonth) || student.months[student.months.length - 1];
      const dailyData = Object.entries(monthData.hoursperday).map(([day, hours]:[any,any]) => ({
        name: day.split('-')[0], // Día
        fullDate: day,
        value: parseInt(hours.split(':')[0]) + parseInt(hours.split(':')[1])/60, // convertir "HH:MM" a horas decimales
        rawHours: hours
      }));

      return {
        title: `Progreso Diario (${monthData.key.replace(/_/g, ' ')})`,
        data: dailyData,
        dataKey: 'value',
        yDomain: [0, 12],
        yUnit: 'hrs',
        xLabel: 'Día',
        showRefLine: true,
        barColor: () => '#3b82f6'
      };
    }
    case '3M': {
  // Últimos 3 meses
  const last3Months = student.months.slice(-3);
  const monthlyData = last3Months.map(m => {
    const [h, min] = m.hourstotal.split(':').map(Number);
    return {
      name: m.key.replace(/_/g, ' '),
      value: h + min / 60,
    };
  });

  return {
    title: 'Tendencia Trimestral (Horas)',
    data: monthlyData,
    dataKey: 'value',
    yDomain: [0, Math.max(...monthlyData.map(d => d.value)) + 2], // agregar margen arriba
    yUnit: 'hrs',
    xLabel: 'Mes',
    showRefLine: false,
    barColor: () => '#3b82f6'
  };
}
    case '1Y': {
      // Todos los meses disponibles
      const yearlyData = student.months.map(m => {
    const [h, min] = m.hourstotal.split(':').map(Number);
    return {
      name: m.key.replace(/_/g, ' '),
      value: h + min / 60, // para graficar
      label: m.hourstotal  // para mostrar texto HH:MM
    };
  });

      return {
        title: 'Historial Anual (%)',
        data: yearlyData,
        dataKey: 'value',
        yDomain: [0, 50],
        yUnit: '%',
        xLabel: 'Mes',
        showRefLine: false,
        barColor: () => '#3b82f6'
      };
    }
    default:
      return {
        title: '',
        data: [],
        dataKey: 'value',
        yDomain: [0, 0],
        yUnit: '',
        barColor: () => '#000',
        showRefLine: false
      };
  }
}, [timeRange, student, selectedMonth]);

 if (!student) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="w-12 h-12 border-4 border-slate-300 border-t-brand-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-600 text-lg font-medium">
        Cargando perfil del alumno...
      </p>
      <p className="text-slate-400 text-sm mt-1">
        Por favor, espera un momento
      </p>
    </div>
  );
}


  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/students')}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver al listado
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start gap-6">
  
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                  {student.team}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {student.area}
                </span>
              </div>
            </div>

            {/* Editable Average Widget */}
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Promedio General</span>
              {isEditingAvg ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={tempAvg} 
                    onChange={(e) => setTempAvg(Number(e.target.value))}
                    className="w-16 text-center font-bold border rounded p-1 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <button onClick={handleSaveAvg} className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600">
                    <Save className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${student.averageAttendance >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {student.averageAttendance}
                  </span>
                  <button onClick={() => {
                    
                    setIsEditingAvg(true)}} className="text-slate-400 hover:text-brand-600">
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* New Demographics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 mt-2">
             <div className="flex items-center gap-2 text-slate-600">
               <GraduationCap className="w-4 h-4 text-slate-400" />
               <div className="flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-slate-400">Nivel</span>
                 <span className="text-sm font-medium">{student.level}</span>
               </div>
             </div>
             <div className="flex items-center gap-2 text-slate-600">
               <Users className="w-4 h-4 text-slate-400" />
               <div className="flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-slate-400">Grupo</span>
                 <span className="text-sm font-medium">{student.group}</span>
               </div>
             </div>
             <div className="flex items-center gap-2 text-slate-600">
               <Sun className="w-4 h-4 text-slate-400" />
               <div className="flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-slate-400">Turno</span>
                 <span className="text-sm font-medium">{student.turn}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-slate-400" />
              {chartConfig.title}
            </h3>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setTimeRange('1M')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === '1M' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Este Mes
              </button>
              <button
                onClick={() => setTimeRange('3M')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === '3M' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                3 Meses
              </button>
              <button
                onClick={() => setTimeRange('1Y')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === '1Y' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Anual
              </button>
            </div>
            {timeRange === '1M' && (
  <select
  value={selectedMonth}
  onChange={(e) => setSelectedMonth(e.target.value)}
  className="mt-2 block w-40 rounded-md border border-slate-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
>
  <option value="">Selecciona un mes</option>
  {student.months?.map((month) => (
    <option key={month.key} value={month.key}>
      {month.key.replace(/_/g, ' ')}
    </option>
  ))}
</select>
)}
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartConfig.data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  domain={chartConfig.yDomain as [number, number]}
                />
                <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                         />
                {chartConfig.showRefLine && (
                  <ReferenceLine y={8} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Obj: 8h', position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
                )}
                <Bar dataKey={chartConfig.dataKey} radius={[4, 4, 0, 0]} barSize={timeRange === '1Y' ? 20 : 32}>
                  {chartConfig.data.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={chartConfig.barColor()} 
                      className="transition-all hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Performance Cards (Replacing Table) */}
        {/* Monthly Performance Cards */}
<div className="lg:col-span-1 flex flex-col gap-4">
  <h3 className="text-lg font-bold text-slate-900 flex items-center">
    <Activity className="w-5 h-5 mr-2 text-slate-400" />
    Resumen Mensual
  </h3>
  
  <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
    {(student.months ?? []).map((monthData) => (
  <div key={monthData.key} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-brand-300 transition-colors">
    <div className="flex justify-between items-center mb-3">
      <h4 className="font-bold text-slate-800 capitalize">{monthData.key.replace(/_/g, ' ')}</h4>
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
        monthData.attendance >= 80 ? 'bg-emerald-50 text-emerald-700' :
        monthData.attendance >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
      }`}>
        {monthData.attendance}%
      </span>
    </div>

    {/* Progress Bar */}
    <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
      <div 
        className={`h-2 rounded-full transition-all duration-500 ${
          monthData.attendance >= 80 ? 'bg-emerald-500' :
          monthData.attendance >= 50 ? 'bg-amber-500' : 'bg-rose-500'
        }`}
        style={{ width: `${monthData.attendance}%` }}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
        <div className="p-1.5 bg-white rounded-md shadow-sm text-slate-500">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase">Días</p>
          <p className="font-bold text-slate-800">{Object.keys(monthData.hoursperday).length}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
        <div className="p-1.5 bg-white rounded-md shadow-sm text-slate-500">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase">Horas Totales</p>
          <p className="font-bold text-slate-800">{monthData.hourstotal}</p>
        </div>
      </div>
    </div>
  </div>
))}
  </div>
</div>

      </div>
    </div>
  );
};

export default StudentDetail;