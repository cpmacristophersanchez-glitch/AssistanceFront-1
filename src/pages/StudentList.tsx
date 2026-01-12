import React, { useState, useMemo, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Clock, BarChart2 } from 'lucide-react';
import { TEAMS, AREAS } from '../services/mockData';
import type { TeamType } from '../types.ts';

interface Student {
  name: string;
  team: string;
  area: string;
  averageAttendance: number;
  totalHoursMonth: string;
  id: string;
}
const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<TeamType | 'All'>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://assistanceback-s8jr.vercel.app/leeralumnos');
      const data = await res.json();

      const studentsArray: Student[] = Object.keys(data).map((key, index) => {
        const alumno = data[key];

        // Extraer meses
        const months = Object.keys(alumno)
          .filter(m => m !== 'datos personales')
          .sort()
          .reverse()
          .map(mes => ({
            key: mes,
            ...alumno[mes], // hoursweek, attendance, etc.
          }));

        return {
          id: index.toString(),
          name: key,
          team: alumno['datos personales'].Equipo,
          area: alumno['datos personales'].Área,
          group: alumno['datos personales'].Grupo,
          level: alumno['datos personales'].Nivel,
          turn: alumno['datos personales'].Turno,
          averageAttendance: alumno['datos personales'].Promedio,
          totalHoursMonth: months[0]?.hourstotal || '0:00',
          months,
        };
      });

      setStudents(studentsArray);
    } catch (err) {
      console.error('Error al cargar alumnos:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchStudents();
}, []);
  // Filter Logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeam = selectedTeam === 'All' || student.team === selectedTeam;
      const matchesArea = selectedArea === 'All' || student.area === selectedArea;
      return matchesSearch && matchesTeam && matchesArea;
    });
  }, [searchTerm, selectedTeam, selectedArea, students]);
 const getTeamColor = (team: string) => {
    switch (team) {
      case 'FRC': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Aztech 1': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Aztech 2': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Aztech 3': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-slate-50 text-slate-700';
    }
  };
  const getAttendanceColor = (score: number) => score >= 90 ? 'text-emerald-600' : score >= 75 ? 'text-amber-600' : 'text-rose-600';
  const getAttendanceBg = (score: number) => score >= 90 ? 'bg-emerald-50 border-emerald-100' : score >= 75 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100';

  if (loading) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Header skeleton */}
          <div className="p-5 flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-slate-100" />

          {/* Metrics skeleton */}
          <div className="p-5 grid grid-cols-2 gap-4">
            <div className="h-16 bg-slate-200 rounded-lg" />
            <div className="h-16 bg-slate-200 rounded-lg" />
          </div>

          {/* Footer skeleton */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="w-8 h-8 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Listado de Alumnos</h2>
          <p className="text-slate-500">Gestión y monitoreo de asistencia individual.</p>
        </div>
      
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 sticky top-0 z-10 backdrop-blur-sm bg-white/90">
       <div className="flex-1 relative">
  
  <input 
    type="text" 
    placeholder="Buscar por nombre..." 
    className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
        
        <div className="flex gap-4 overflow-x-auto pb-1 lg:pb-0">
          <div className="relative min-w-[160px]">
            <select 
              className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value as TeamType | 'All')}
            >
              <option value="All">Todos los Equipos</option>
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
               </div>

          <div className="relative min-w-[160px]">
            <select 
              className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="All">Todas las Áreas</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
    </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div 
              key={student.id} 
            onClick={() => navigate(`/students/${student.id}`, { state: { student } })}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-brand-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                 
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center">
                      {student.area}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${getTeamColor(student.team)}`}>
                  {student.team}
                </span>
              </div>

              {/* Metrics Divider */}
              <div className="w-full h-px bg-slate-100" />

              {/* Card Metrics */}
              <div className="p-5 grid grid-cols-2 gap-4 bg-slate-50/50">
                <div className={`rounded-lg p-3 border ${getAttendanceBg(student.averageAttendance)}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 uppercase">Promedio</span>
                  </div>
                  <span className={`text-xl font-bold ${getAttendanceColor(student.averageAttendance)}`}>
                    {student.averageAttendance}
                  </span>
                </div>

                <div className="rounded-lg p-3 border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 uppercase">Horas Mes</span>
                  </div>
                  <span className="text-xl font-bold text-slate-700">
                    {student.totalHoursMonth}h
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-auto px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-brand-50/30 transition-colors">
                <span className="text-xs font-medium text-slate-400 group-hover:text-brand-500">Ver historial completo</span>
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-brand-300 group-hover:text-brand-600 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No se encontraron resultados</h3>
            <p className="text-slate-500 mt-1 max-w-xs mx-auto">
              Intenta ajustar los filtros o buscar con otro nombre.
            </p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedTeam('All'); setSelectedArea('All'); }}
              className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
         <span className="text-sm text-slate-500">
           Mostrando <span className="font-bold text-slate-800">{filteredStudents.length}</span> alumnos
         </span>
         <div className="flex gap-2">
           <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all" disabled>
             Anterior
           </button>
           <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition-all">
             Siguiente
           </button>
         </div>
      </div>
    </div>
  );
};

export default StudentList;