const CargarOtraFactura = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md p-6 rounded-lg text-center">
        <h2 className="text-xl font-semibold mb-4">¿Cargar otra factura?</h2>
        <div className="flex justify-center gap-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Sí
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default CargarOtraFactura;
