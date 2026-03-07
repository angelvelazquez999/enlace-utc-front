'use client';

import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from "@/components/ui/button";
import {
  Loader2, User, GraduationCap, Hash, BookOpen,
  FileText, Upload, Trash2, Download, CheckCircle2, AlertCircle
} from "lucide-react";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [cvList, setCvList] = useState([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingCvs, setIsLoadingCvs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    loadUserData();
  }, []);

  const getToken = () => localStorage.getItem('access_token');

  const loadUserData = async () => {
    try {
      setIsLoadingUser(true);
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/usuarios/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al obtener datos del usuario');

      const userData = await response.json();
      setUser(userData);
      loadUserCVs(userData.id);
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Error al cargar tu información: ' + err.message);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const loadUserCVs = async (userId) => {
    try {
      setIsLoadingCvs(true);
      const token = getToken();

      const response = await fetch(`${API_URL}/cv/usuario/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al cargar los CVs');

      const data = await response.json();
      setCvList(data);
    } catch (err) {
      console.error('Error loading CVs:', err);
      setError('Error al cargar tus CVs: ' + err.message);
    } finally {
      setIsLoadingCvs(false);
    }
  };

  const handleUploadCV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF.');
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      setSuccess("");
      const token = getToken();

      const formData = new FormData();
      formData.append('usuario_id', user.id);
      formData.append('archivo', file);

      const response = await fetch(`${API_URL}/cv/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Error al subir el CV');
      }

      setSuccess('CV subido exitosamente.');
      loadUserCVs(user.id);

      // Limpiar input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error uploading CV:', err);
      setError('Error al subir el CV: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCV = async (cvId) => {
    try {
      setDeletingId(cvId);
      setError("");
      setSuccess("");
      const token = getToken();

      const response = await fetch(`${API_URL}/cv/${cvId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al eliminar el CV');

      setSuccess('CV eliminado exitosamente.');
      setConfirmDeleteId(null);
      loadUserCVs(user.id);
    } catch (err) {
      console.error('Error deleting CV:', err);
      setError('Error al eliminar el CV: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadCV = async (cv) => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/cv/descargar/${cv.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al descargar el CV');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cv.nombre_archivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading CV:', err);
      setError('Error al descargar el CV: ' + err.message);
    }
  };

  // Limpiar mensajes de éxito después de 4 segundos
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <DashboardLayout
      title="Mi Perfil"
      currentPath="/dashboard/perfil"
      showLogo={false}
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Mensajes de feedback */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tarjeta de información del usuario */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
          <div className="p-1 bg-gradient-to-r from-[#0a6448] to-[#0f2755]"></div>
          <div className="p-8">
            {isLoadingUser ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#0a6448]" />
              </div>
            ) : user ? (
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0a6448] to-[#0f2755] flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {user.nombre?.[0]?.toUpperCase()}{user.apellidos?.[0]?.toUpperCase()}
                  </span>
                </div>

                {/* Datos */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {user.nombre} {user.apellidos}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0a6448]/10 flex items-center justify-center">
                        <Hash className="w-5 h-5 text-[#0a6448]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Matrícula</p>
                        <p className="text-sm font-semibold text-gray-900">{user.matricula}</p>
                      </div>
                    </div>
                    {user.carrera && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0f2755]/10 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-[#0f2755]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Carrera</p>
                          <p className="text-sm font-semibold text-gray-900">{user.carrera}</p>
                        </div>
                      </div>
                    )}
                    {user.cuatrimestre && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0a6448]/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-[#0a6448]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Cuatrimestre</p>
                          <p className="text-sm font-semibold text-gray-900">{user.cuatrimestre}°</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No se pudo cargar la información del usuario.</p>
            )}
          </div>
        </div>

        {/* Sección de CVs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0a6448]" />
                Mis CVs
              </h2>

              {/* Botón de subir */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleUploadCV}
                  className="hidden"
                  id="cv-upload-input"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || !user}
                  style={{
                    background: 'linear-gradient(135deg, #0a6448 0%, #0f2755 100%)',
                    color: 'white' 
                  }}
                  className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir CV
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Lista de CVs */}
            {isLoadingCvs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#0a6448]" />
              </div>
            ) : cvList.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  No tienes CVs subidos
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Sube tu CV en formato PDF para comenzar
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || !user}
                  variant="outline"
                  className="border-[#0a6448] bg-gradient-to-r from-[#0a6448] to-[#0f2755] cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir mi primer CV
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {cvList.map((cv) => (
                  <div
                    key={cv.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-[#0a6448]/30 hover:bg-gray-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border">
                        <FileText className="w-6 h-6 text-[#0a6448]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {cv.nombre_archivo}
                        </p>
                        <p className="text-sm text-gray-500">
                          Subido el {new Date(cv.fecha_subida).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      {/* Descargar */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCV(cv)}
                        className="bg-gradient-to-r from-[#0a6448] to-[#0f2755] hover:scale-105 transition-transform cursor-pointer"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      {/* Eliminar */}
                      {confirmDeleteId === cv.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCV(cv.id)}
                            disabled={deletingId === cv.id}
                            className="cursor-pointer hover:bg-red-700"
                          >
                            {deletingId === cv.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Confirmar"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmDeleteId(null)}
                            className="cursor-pointer"
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDeleteId(cv.id)}
                          className="text-red-500 bg-white hover:bg-red-500 border-red-200 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
}
