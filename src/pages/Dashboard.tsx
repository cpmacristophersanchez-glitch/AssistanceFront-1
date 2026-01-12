import React, { useMemo, useState, useEffect } from 'react';
import { 
  Users,
  Layout,
  ArrowUp,
  ArrowDown,
  Briefcase,
  Calendar,
  Database,
  AlertTriangle,
  RefreshCw,
  UploadCloud
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { mockStudents, TEAMS, AREAS } from '../services/mockData';

// Colores por equipo para consistencia visual
const TEAM_COLORS = {
  'FTC': '#f59e0b', // Amber
  'A1': '#3b82f6',  // Blue
  'A2': '#8b5cf6',  // Purple
  'A3': '#10b981',  // Emerald
};

type TimeRange = '1M' | '3M' | '1Y';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbCollectionExists, setDbCollectionExists] = useState(true);
  const [currentPeriodName, setCurrentPeriodName] = useState('');

  // Simulación de Sincronización con Base de Datos
  useEffect(() => {
    const checkDatabase = async () => {
      setIsSyncing(true);
      
      // Obtenemos nombre del mes actual para la simulación
      const date = new Date();
      const monthName = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      setCurrentPeriodName(monthName);

      // SIMULACIÓN:
      // Si estamos en vista MENSUAL ('1M'), simulamos que NO existe la colección (false).
      // Si estamos en Trimestral o Anual, simulamos que SÍ existe historial (true).
      const shouldExist = timeRange !== '1M'; 

      setTimeout(() => {
        setDbCollectionExists(shouldExist);
        setIsSyncing(false);
      }, 800); // 800ms de delay para realismo
    };

    checkDatabase();
  }, [timeRange]);

  // Constantes derivadas del filtro para usar en todos los cálculos
  const multiplier = timeRange === '1M' ? 1 : timeRange === '3M' ? 3 : 10;
  const periodLabel = timeRange === '1M' ? 'Mensual' : timeRange === '3M' ? 'Trimestral' : 'Anual';

  // 1. Estadísticas por Equipo
  const teamStats = useMemo(() => {
    return TEAMS.map(team => {
      const students = mockStudents.filter(s => s.team === team);
      const avgAttendance = Math.round(students.reduce((acc, s) => acc + s.averageAttendance, 0) / students.length) || 0;
      const avgHoursBase = Math.round(students.reduce((acc, s) => acc + s.totalHoursMonth, 0) / students.length) || 0;
      const avgHours = avgHoursBase * multiplier;
      
      return {
        team,
        headcount: students.length,
        attendance: avgAttendance,
        hours: avgHours,
        color: TEAM_COLORS[team as keyof typeof TEAM_COLORS]
      };
    });
  }, [timeRange, multiplier]);

  // 2. Estadísticas por Área
  const areaStats = useMemo(() => {
    return AREAS.map(area => {
      const students = mockStudents.filter(s => s.area === area);
      const baseHours = students.reduce((acc, s) => acc + s.totalHoursMonth, 0);
      const totalHours = baseHours * multiplier;
      const avgAttendance = students.length 
        ? Math.round(students.reduce((acc, s) => acc + s.averageAttendance, 0) / students.length)
        : 0;

      return {
        area,
        headcount: students.length,
        totalHours,
        avgAttendance
      };
    }).sort((a, b) => b.totalHours - a.totalHours);
  }, [timeRange, multiplier]);

  // Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-xl">
          <p className="font-bold text-slate-900 mb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="w-2 h-2 rounded-full bg-brand-500"></span>
              <span>Horas ({periodLabel}):</span>
              <span className="font-bold text-slate-900">{data.totalHours.toLocaleString()}h</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span>Alumnos:</span>
              <span className="font-bold text-slate-900">{data.headcount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
               <span className={`w-2 h-2 rounded-full ${data.avgAttendance >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
               <span>Prom. Asistencia:</span>
               <span className="font-bold text-slate-900">{data.avgAttendance}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Renderizado del Header (siempre visible para poder cambiar filtros)
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Layout className="w-6 h-6 text-brand-600" />
          Resumen General
        </h1>
        <p className="text-slate-500 text-sm">Vista consolidada de rendimiento {periodLabel.toLowerCase()}.</p>
      </div>

      <div className="flex items-center gap-3">
        {isSyncing && (
          <span className="text-xs font-medium text-brand-600 flex items-center animate-pulse">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Sincronizando...
          </span>
        )}
        
        {/* Filtros */}
        <div className="flex bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
          <button
            onClick={() => setTimeRange('1M')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              timeRange === '1M' 
                ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Mes
          </button>
          <button
            onClick={() => setTimeRange('3M')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              timeRange === '3M' 
                ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Trimestre
          </button>
          <button
            onClick={() => setTimeRange('1Y')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              timeRange === '1Y' 
                ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Anual
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizado Condicional: Loading
  if (isSyncing) {
    return (
      <div className="space-y-8 pb-12">
        {renderHeader()}
        <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
           <RefreshCw className="w-10 h-10 animate-spin mb-4 text-brand-500" />
           <p className="text-sm font-medium">Verificando base de datos...</p>
        </div>
      </div>
    );
  }

  // Renderizado Condicional: No Data (Warning)
  if (!dbCollectionExists) {
    return (
      <div className="space-y-8 pb-12">
        {renderHeader()}
        
        <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-2xl border border-slate-200 border-dashed p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <Database className="w-10 h-10 text-amber-500" />
            <div className="absolute mt-8 ml-8 bg-white rounded-full p-1">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Sin datos para {currentPeriodName}
          </h2>
          
          <p className="text-slate-500 max-w-md mb-8">
            No se ha encontrado la colección de datos correspondiente al periodo seleccionado en la base de datos. Es necesario cargar el reporte de asistencia para visualizar esta información.
          </p>

          <div className="flex gap-4">
             <button 
               onClick={() => window.location.reload()}
               className="px-4 py-2 text-slate-600 bg-white border border-slate-300 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center"
             >
               <RefreshCw className="w-4 h-4 mr-2" />
               Reintentar
             </button>
             
             <button 
               onClick={() => navigate('/upload')}
               className="px-4 py-2 text-white bg-brand-600 font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm flex items-center shadow-brand-500/20"
             >
               <UploadCloud className="w-4 h-4 mr-2" />
               Cargar Archivo
             </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado Normal (Con Datos)
  return (
    <div className="space-y-8 pb-12">
      {renderHeader()}

      {/* Row 1: Tarjetas de Estado por Equipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
        {teamStats.map((stat) => (
          <div key={stat.team} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className={`absolute top-0 left-0 w-1.5 h-full`} style={{ backgroundColor: stat.color }} />
            
            <div className="flex justify-between items-center mb-4 pl-2">
              <h3 className="text-lg font-bold text-slate-800">{stat.team}</h3>
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-xs font-medium text-slate-500">
                <Users className="w-3 h-3" />
                {stat.headcount}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pl-2">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Asistencia</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-2xl font-bold text-slate-900">{stat.attendance}%</span>
                  {stat.attendance > 90 ? (
                    <ArrowUp className="w-4 h-4 text-emerald-500 mb-1.5" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-rose-500 mb-1.5" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Horas ({periodLabel})</p>
                <div className="flex items-end gap-1 mt-1">
                  <p className="text-2xl font-bold text-slate-900">{stat.hours.toLocaleString()}h</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Gráfica de Horas por Área */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-500" />
              Horas de Asistencia por Área
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Volumen acumulado: <span className="font-semibold text-brand-600">{periodLabel}</span>
            </p>
          </div>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={areaStats} 
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="area" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                unit="h"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="totalHours" radius={[6, 6, 0, 0]}>
                {areaStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" fillOpacity={0.8 + (index * 0.05)}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center text-xs text-slate-400 gap-6">
          <span className="flex items-center gap-1">
             <div className="w-2 h-2 bg-brand-500 rounded-sm"></div> 
             Horas registradas ({periodLabel.toLowerCase()})
          </span>
          <span className="flex items-center gap-1">
             <div className="w-2 h-2 border border-slate-300 rounded-sm"></div> Pasa el cursor para ver detalles
          </span>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;