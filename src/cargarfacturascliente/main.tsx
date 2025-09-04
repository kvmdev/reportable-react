import React, { useState, useRef } from 'react';
import api from "../lib/api"; // Usando la importación solicitada

const CargarFacturasCliente: React.FC = () => {
  const [facturas, setFacturas] = useState<string[]>([]);
  const [imagenCapturada, setImagenCapturada] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- 1. Abrir la cámara ---
  const handleAbrirCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setImagenCapturada(null);
        setUploadError(null);
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      setUploadError("No se pudo acceder a la cámara. Asegúrate de otorgar los permisos necesarios.");
    }
  };

  // --- 2. Tomar la foto ---
  const handleTomarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const imagenURL = canvas.toDataURL('image/jpeg', 0.9);
        setImagenCapturada(imagenURL);

        // Detener el stream de la cámara
        const stream = video.srcObject as MediaStream | null;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  // --- 3. Enviar la foto al backend usando api.post ---
  const handleAceptarFoto = async () => {
    if (imagenCapturada) {
      setIsUploading(true);
      setUploadError(null);

      try {
        // Convertir la imagen de Base64 a Blob
        const blob = await fetch(imagenCapturada).then(res => res.blob());
        const file = new File([blob], `factura-${Date.now()}.jpeg`, { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('invoice', file);

        const result = await api.post('/api/upload-invoice', formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        console.log('Subida exitosa:', result);

        setFacturas(prev => [...prev, imagenCapturada]);
        setImagenCapturada(null);
      } catch (error: any) {
        console.error("Error al subir la factura:", error);
        setUploadError(`Error en la subida: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // --- 4. Cancelar y volver a la cámara ---
  const handleReemplazarFoto = () => {
    setImagenCapturada(null);
    handleAbrirCamara();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">Cargar Facturas</h2>

        {uploadError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
            <span className="block sm:inline">{uploadError}</span>
          </div>
        )}

        {/* Visor de la cámara y botones */}
        <div className="relative overflow-hidden rounded-xl bg-gray-200">
          {!imagenCapturada && (
            <>
              <video ref={videoRef} autoPlay className="w-full h-auto max-h-[500px] object-cover rounded-xl"></video>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  onClick={handleTomarFoto}
                >
                  📸
                </button>
              </div>
            </>
          )}

          {imagenCapturada && (
            <div className="relative">
              <img src={imagenCapturada} alt="Factura capturada" className="w-full h-auto max-h-[500px] object-cover rounded-xl" />
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full shadow-md transition-transform transform hover:scale-105"
                  onClick={handleAceptarFoto}
                  disabled={isUploading}
                >
                  {isUploading ? "Subiendo..." : "Aceptar"}
                </button>
                <button
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-full shadow-md transition-transform transform hover:scale-105"
                  onClick={handleReemplazarFoto}
                >
                  Reemplazar
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>

        {/* Botón para abrir la cámara */}
        {!videoRef.current?.srcObject && !imagenCapturada && (
          <div className="text-center mt-6">
            <button
              className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300"
              onClick={handleAbrirCamara}
            >
              Abrir Cámara
            </button>
          </div>
        )}

        {/* Lista de facturas cargadas */}
        {facturas.length > 0 && (
          <>
            <div className="border-t border-gray-300 pt-6 mt-6"></div>
            <h3 className="text-xl font-bold text-gray-800">Facturas Cargadas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {facturas.map((factura, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <img src={factura} alt={`Factura ${index + 1}`} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-500">Factura {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CargarFacturasCliente;
