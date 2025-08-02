import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react'
import type { Factura } from '../interfaces/Factura';

interface FacturaContextType {
    facturas: Factura;
    setFacturas: React.Dispatch<React.SetStateAction<Factura>>;
    month: number | string;
    setMonth: React.Dispatch<React.SetStateAction<number | string>>;
    year: number | string;
    setYear: React.Dispatch<React.SetStateAction<number | string>>;
    rol: string;
    setRol: React.Dispatch<React.SetStateAction<string>>;
}

const FacturaContext = createContext<FacturaContextType | undefined>(undefined);

export const FacturaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [facturas, setFacturas] = useState<Factura>({ facturasClientes: [], facturasVendedor: [] });
    const [month, setMonth] = useState<number | string>("");
    const [year, setYear] = useState<number | string>("");
    const [rol, setRol] = useState<string>('SELECCIONE');

    return (
        <FacturaContext.Provider value={{ facturas, setFacturas, month, setMonth, year, setYear, rol, setRol }}>
            {children}
        </FacturaContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFacturaContext = () => {
    const context = useContext(FacturaContext);
    if (context === undefined) {
        throw new Error('useFacturaContext debe ser usado dentro de un FacturaProvider');
    }
    return context;
};