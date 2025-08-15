import React from 'react';
import { Form } from 'react-bootstrap';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { Filters } from '../interfaces/Filters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

type Props = {
  onFilter: (filters: Filters) => void;
  filters: Filters
  onClose: () => void;
  download: () => void;
  setDownloading: () => void;
};

const FacturaFilters: React.FC<Props> = ({ onFilter, filters, onClose, download }) => {

  return (
    <div
      className='w-full h-screen fixed top-0 left-0 flex justify-center items-center bg-opacity-30 z-40'
      // si clickeas en el overlay, se cierra
      onClick={onClose}
    >
      <Form
        onClick={(e) => e.stopPropagation()} // evita que al hacer click dentro se cierre
        className="bg-white p-4 rounded-lg shadow-md space-y-4"
        onSubmit={onClose}
      >
        <h2 className="text-xl font-semibold">Filtros de Facturas</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">ROL</label>
          <Select value={filters.rol} onValueChange={(e)=> onFilter({ ...filters, rol: e })}>
              <SelectTrigger className="bg-yellow-50 border-yellow-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPRAS">COMPRAS</SelectItem>
                <SelectItem value="VENTAS">VENTAS</SelectItem>
              </SelectContent>
            </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha Desde</label>
          <Input
            type="date"
            value={filters.fechaInicio}
            onChange={(e) => onFilter({ ...filters, fechaInicio: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha Hasta</label>
          <Input
            type="date"
            value={filters.fechaFin}
            onChange={(e) => onFilter({ ...filters, fechaFin: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
            onClick={download}
          >
            Descargar
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default FacturaFilters;
