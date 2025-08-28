import React, { useState, useRef } from 'react';

const CargarFacturasCliente: React.FC = () => {
  const [facturas, setFacturas] = useState<string[]>([]);
  const [imagenCapturada, setImagenCapturada] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Abrir la cámara
  const handleAbrirCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setImagenCapturada(null); // Resetear imagen previa
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert("No se pudo acceder a la cámara. Asegúrate de otorgar los permisos necesarios.");
    }
  };

  // 2. Tomar la foto
  const handleTomarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const imagenURL = canvas.toDataURL('image/png');
        setImagenCapturada(imagenURL);
        
        // Detener el stream de la cámara
        const stream = video.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    }
  };

  // 3. Aceptar y agregar a la lista
  const handleAceptarFoto = () => {
    if (imagenCapturada) {
      setFacturas([...facturas, imagenCapturada]);
      setImagenCapturada(null);
    }
  };

  // 4. Cancelar y volver a la cámara
  const handleReemplazarFoto = () => {
    setImagenCapturada(null);
    handleAbrirCamara();
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Cargar Facturas</h2>

      {/* Visor de la cámara y botones */}
      <div className="card mb-4">
        <div className="card-body text-center">
          {/* Si no hay imagen capturada, mostrar el video de la cámara */}
          {!imagenCapturada && (
            <>
              <video ref={videoRef} autoPlay style={{ width: '100%', maxHeight: '400px', backgroundColor: '#eee' }}></video>
              <button className="btn btn-primary mt-3" onClick={handleTomarFoto}>
                <i className="bi bi-camera me-2"></i>Tomar Foto
              </button>
            </>
          )}

          {/* Si hay una imagen capturada, mostrar la previsualización y los botones */}
          {imagenCapturada && (
            <>
              <img src={imagenCapturada} alt="Factura capturada" style={{ width: '100%', maxHeight: '400px' }} className="img-thumbnail" />
              <div className="d-flex justify-content-center mt-3">
                <button className="btn btn-success me-2" onClick={handleAceptarFoto}>
                  <i className="bi bi-check me-2"></i>Aceptar
                </button>
                <button className="btn btn-secondary" onClick={handleReemplazarFoto}>
                  <i className="bi bi-arrow-counterclockwise me-2"></i>Reemplazar
                </button>
              </div>
            </>
          )}
          
          {/* Canvas oculto para capturar la imagen */}
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
      </div>
      
      {/* Botón para abrir la cámara (si no está abierta) */}
      {!videoRef.current?.srcObject && !imagenCapturada && (
        <div className="text-center">
          <button className="btn btn-dark" onClick={handleAbrirCamara}>
            <i className="bi bi-camera me-2"></i>Abrir Cámara
          </button>
        </div>
      )}

      <hr />

      {/* Lista de facturas cargadas */}
      <div className="mt-4">
        <h3 className="mb-3">Facturas Cargadas</h3>
        {facturas.length > 0 ? (
          <div className="row">
            {facturas.map((factura, index) => (
              <div key={index} className="col-md-4 mb-4">
                <div className="card shadow-sm">
                  <img src={factura} className="card-img-top" alt={`Factura ${index + 1}`} style={{ height: '200px', objectFit: 'cover' }} />
                  <div className="card-body">
                    <p className="card-text text-muted">Factura {index + 1}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info text-center">
            No hay facturas cargadas.
          </div>
        )}
      </div>
    </div>
  );
};

export default CargarFacturasCliente;