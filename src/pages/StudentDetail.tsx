import React, { useState, useEffect } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import type { FileUploadStatus } from '../types';

const Upload: React.FC = () => {
  const dragActive =false;
  const [files, setFiles] = useState<FileUploadStatus[]>([]); // vacío al inicio
  const [isUploading, setIsUploading] = useState(false);

  // --- Cargar historial desde la DB al montar el componente
  useEffect(() => {
  const fetchFiles = async () => {
    try {
      const res = await fetch('https://assistanceback-1.vercel.app/historial');
      if (!res.ok) throw new Error('Error al cargar historial');
      const data: string[] = await res.json();

      // Convertimos cada string en un objeto con valores por defecto
      const formattedFiles = data.map((monthName, index) => ({
        id: index.toString(),
        fileName: monthName,
        status: "success" as const,
        progress: 100,
        date: "" // opcional, puedes poner null o algún valor
      }));

      setFiles(formattedFiles);

    } catch (err) {
      console.error('Error al obtener archivos:', err);
    }
  };

  fetchFiles();
}, []);

  const handleFiles = async (file: File) => {
    if (!file) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://assistanceback-1.vercel.app/subir", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Respuesta API:", data);

      // Actualizar historial con el nuevo archivo subido
      setFiles(prev => [
        {
          id: Date.now().toString(),
          fileName: file.name,
          status: res.ok ? "success" : "error",
          progress: 100,
          date: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Error al subir archivo:", err);
      setFiles(prev => [
        {
          id: Date.now().toString(),
          fileName: file.name,
          status: "error",
          progress: 0,
          date: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Carga de Asistencia</h2>
          <p className="text-slate-500 mt-1">Sube los archivos Excel generados por el reloj checador.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <div 
            className={`
              relative flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all
              ${dragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50'}
            `}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFiles(e.target.files[0]);
                }
              }}
            />
            
            <div className="flex flex-col items-center pointer-events-none p-6 text-center">
              {isUploading ? (
                <div className="animate-pulse flex flex-col items-center">
                   <div className="w-16 h-16 bg-brand-200 rounded-full mb-4 flex items-center justify-center">
                     <UploadCloud className="w-8 h-8 text-brand-600 animate-bounce" />
                   </div>
                   <p className="text-lg font-medium text-slate-700">Procesando archivo...</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-brand-100 rounded-full mb-4 flex items-center justify-center">
                    <UploadCloud className="w-8 h-8 text-brand-600" />
                  </div>
                  <p className="text-xl font-medium text-slate-800">Arrastra tu archivo aquí</p>
                  <p className="text-slate-500 mt-2">o haz clic para seleccionar</p>
                  <p className="text-xs text-slate-400 mt-4">Soporta: .xlsx, .xls (Máx 25MB)</p>
                </>
              )}
            </div>
          </div>

         
        </div>

        {/* File History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Historial de Cargas</h3>
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className={`
                  p-2 rounded-lg mr-3
                  ${file.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                `}>
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.fileName}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-slate-500">{file.date}</span>
                    <span className="mx-2 text-slate-300">•</span>
                    <span className={`text-xs font-medium ${file.status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {file.status === 'success' ? 'Completado' : 'Error en filas'}
                    </span>
                  </div>
                </div>
                {file.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 ml-2" />
                ) : (
                   <AlertCircle className="w-5 h-5 text-rose-500 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
