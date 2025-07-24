/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState, useRef } from "react" // Renombrar KeyboardEvent de React
import type { ChangeEvent, FocusEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components/ui/switch"
import { Trash2, Edit3, Save } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../lib/api"
import { useNotifications } from "../context/NotificationContext"
import type { Cliente } from "../interfaces/Cliente"
import type { FormData } from "../interfaces/FacturaFormData"
import { AxiosError } from "axios"
import type { BackendErrorResponse } from "../interfaces/BackErrorResponse"

// --- Función de Utilidad para Formatear y Validar la Fecha (fuera del componente) ---
/**
 * Formatea una cadena DDMMAAAA a DD/MM/AAAA y la valida.
 * @param dateString La cadena de fecha en formato DDMMAAAA.
 * @returns Una cadena de fecha formateada (DD/MM/AAAA) si es válida, de lo contrario, null.
 */
function formatAndValidateDate(dateString: string): string | null {
    const cleanedDate = dateString.replace(/\D/g, '');

    if (cleanedDate.length !== 8) {
        return null; // No tiene 8 dígitos
    }

    const day = cleanedDate.substring(0, 2);
    const month = cleanedDate.substring(2, 4);
    const year = cleanedDate.substring(4, 8);

    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    // Validaciones básicas de rangos
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) { // Ajusta el rango de años según tu necesidad
        return null; // Fecha fuera de rango razonable
    }

    // Comprobar si la fecha es realmente válida (ej. 31 de febrero)
    const testDate = new Date(y, m - 1, d); // Meses en JS son 0-11
    if (
        isNaN(testDate.getTime()) || // Check for "Invalid Date"
        testDate.getFullYear() !== y ||
        testDate.getMonth() + 1 !== m ||
        testDate.getDate() !== d
    ) {
        return null; // Fecha inválida (ej. 31 de febrero, 31 de septiembre)
    }

    return `${day}/${month}/${year}`;
}

export default function CargarFacturas() {
  const { id } = useParams();
  const { showError, showSuccess } = useNotifications();

  // Estados relacionados con el formulario y la lógica de negocio
  const [impuesto10, setImpuesto10] = useState("");
  const [impuesto5, setImpuesto5] = useState("");
  const [client, setClient] = useState<Cliente>({});
  const [creditoCheck, setCreditoCheck] = useState(false);
  const [contadoCheck, setContadoCheck] = useState(true);
  const [nombreRazon, setNombreRazon] = useState("");
  const [dateInputError, setDateInputError] = useState<string | null>(null); // Nuevo estado para errores de fecha

  // Estados para la pregunta "Cargar otra factura?"
  const [pregunta, setPregunta] = useState(false);
  const [selected, setSelected] = useState("si");
  const siButtonRef = useRef<HTMLButtonElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    tipoComprobante: 'factura',
    rolUsuario: 'compra',
    fechaEmision: '', // Ahora guarda DD/MM/AAAA como string
    timbrado: '',
    numeroFactura: '',
    foreignCurrency: false,
    condicion: 'contado',
    tipoIdentificacion: 'ruc',
    ruc: '',
    montoGravado10: '',
    montoGravado5: '',
    montoExento: '',
    imputaIVA: false,
    imputaIRE: false,
    imputaIRP: false,
    noImputar: true,
    idClient: '',
    origen: 'MANUAL',
    cdc: ""
  });

  // --- Efectos para la navegación y focus de la pregunta ---
  useEffect(() => {
    if (pregunta && siButtonRef.current) {
      siButtonRef.current.focus();
    }
  }, [pregunta]);

  useEffect(() => {
    if (pregunta) {
      if (selected === "si" && siButtonRef.current) {
        siButtonRef.current.focus();
      } else if (selected === "no" && noButtonRef.current) {
        noButtonRef.current.focus();
      }
    }
  }, [selected, pregunta]);

  // FIX: Usar el tipo KeyboardEvent nativo del DOM
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => { // <-- Aquí el cambio: usar KeyboardEvent nativo
      if (pregunta) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          setSelected((prev) => (prev === "si" ? "no" : "si"));
        }
        if (e.key === "Enter") {
          if (selected === "si") {
            volverACargar();
          } else {
            navigate("/clientes");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDownGlobal);
    return () => window.removeEventListener("keydown", handleKeyDownGlobal);
  }, [selected, pregunta, navigate]); // Dependencias para handleKeyDownGlobal

  // --- Lógica del formulario ---

  // Efecto para auto-completar timbrado o dejar vacío según el rol
  useEffect(() => {
    if(formData.rolUsuario === 'compra') {
      setFormData(prev => ({ ...prev, timbrado: '' }));
    } else {
      setFormData(prev => ({ ...prev, timbrado: client.currentTimbrado || '' }));
    }
  }, [formData.rolUsuario, client.currentTimbrado]); // Añadir client.currentTimbrado a las dependencias

  // Función para reiniciar el formulario
  const volverACargar = () => {
    limpiar();
    setPregunta(false);
  };

  const formatNumber = (value: string | number) => {
    const clean = typeof value === "string"
      ? value.replace(/[^\d]/g, "") // elimina todo lo que no sea número
      : value.toString();
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Función para guardar la factura
  const guardar = async () => {
    // Validar que la fecha esté presente y sea válida
    if (!formData.fechaEmision || dateInputError) {
      showError('Por favor, ingrese una fecha de emisión válida.');
      return;
    }

    // Convertir la fecha de DD/MM/AAAA a YYYY-MM-DD para el backend
    const partesFecha = formData.fechaEmision.split('/');
    const fechaParaBackend = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`; // YYYY-MM-DD

    try {
      const cleanFormData: FormData = {
        ...formData,
        idClient: id,
        // Usar la fecha ya convertida a YYYY-MM-DD
        fechaEmision: fechaParaBackend, 
        montoGravado10: formData.montoGravado10.replace(/\./g, ''),
        montoGravado5: formData.montoGravado5.replace(/\./g, ''),
        montoExento: formData.montoExento.replace(/\./g, ''),
      };

      if (cleanFormData.rolUsuario === 'venta') {
        const response = await api.post('/v0/api/facturas-ventas', cleanFormData);
        showSuccess(response.data.message);
      } else if (cleanFormData.rolUsuario === 'compra') {
        const response = await api.post('/v0/api/facturas-compras', cleanFormData);
        showSuccess(response.data.message);
      }
      setPregunta(true); // Mostrar la pregunta de "Cargar otra factura?"
    } catch (error) {
      const axiosError = error as AxiosError<BackendErrorResponse>;
      showError(axiosError.response?.data?.message || 'Error al guardar la factura');
    }
  };

  // Función para limpiar el formulario
  const limpiar = () => {
    setFormData({
      ...formData,
      tipoComprobante: 'factura',
      rolUsuario: formData.rolUsuario, // Mantiene el rol actual
      fechaEmision: '', // Reinicia a la fecha actual en formato DD/MM/YYYY
      numeroFactura: '',
      foreignCurrency: false,
      condicion: 'contado',
      tipoIdentificacion: 'ruc',
      ruc: '',
      montoGravado10: '',
      montoGravado5: '',
      montoExento: '',
      imputaIVA: false,
      imputaIRE: false,
      imputaIRP: false,
      noImputar: true,
      idClient: '', // idClient se setea en guardar, no se limpia
      origen: 'MANUAL',
      cdc: ""
    });
    setNombreRazon('');
    setImpuesto10('');
    setImpuesto5('');
    setCreditoCheck(false); // Reiniciar checks de condición
    setContadoCheck(true);
    setDateInputError(null); // Limpiar error de fecha
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Handlers para la lógica de fechas DDMMAAAA ---
  const handleDateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/\D/g, ''); // Solo números
    setFormData(prev => ({ ...prev, fechaEmision: rawValue.substring(0, 8) })); // Limitar a 8 caracteres
    setDateInputError(null); // Limpiar error al empezar a escribir de nuevo
  };

  const handleDateInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length === 8) { // Solo intentar formatear si tiene 8 dígitos
      const formattedDate = formatAndValidateDate(value);
      if (formattedDate) {
        setFormData(prev => ({ ...prev, fechaEmision: formattedDate })); // Actualiza el input con el formato DD/MM/AAAA
        setDateInputError(null);
      } else {
        setDateInputError('Formato de fecha incorrecto o fecha inválida (DDMMAAAA).');
        setFormData(prev => ({ ...prev, fechaEmision: '' })); // Limpiar el valor si es inválido
      }
    } else if (value.length > 0 && value.length < 8) {
        setDateInputError('La fecha debe tener 8 dígitos (DDMMAAAA).');
        setFormData(prev => ({ ...prev, fechaEmision: '' })); // Limpiar el valor si incompleto
    } else {
        // Si el campo está vacío al salir
        setFormData(prev => ({ ...prev, fechaEmision: '' })); // Puedes dejarlo como dayjs().format('DD/MM/YYYY') si quieres que reinicie al salir
        setDateInputError(null);
    }
  };

  const handleDateInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => { // <-- Aquí el cambio: usar ReactKeyboardEvent
    if (event.key === 'Enter') {
      event.preventDefault(); // Previene el envío del formulario si está dentro de uno
      (event.target as HTMLInputElement).blur(); // Dispara el evento blur para el formateo
    }
  };


  // --- Otros Handlers y Efectos del Componente ---

  const handleBlurGravado10 = () => {
    const value = parseFloat(formData.montoGravado10.replace(/\./g, "").replace(",", "."));
    if (!isNaN(value)) {
      setImpuesto10((value / 11).toFixed(0));
    } else {
      setImpuesto10("");
    }
  };

  const handleBlurGravado5 = () => {
    const value = parseFloat(formData.montoGravado5.replace(/\./g, "").replace(",", "."));
    if (!isNaN(value)) {
      setImpuesto5((value / 21).toFixed(0));
    } else {
      setImpuesto5("");
    }
  };

  const loadNombreRazon = async () => {
    if (!formData.ruc || formData.ruc.trim() === '') {
      setNombreRazon("Ingrese un RUC/CI");
      return;
    }
    try {
      const res = await api.get(`/api/getClientByRuc/${formData.ruc}`);
      if(res.status !== 200 || !res.data) {
        showError("Cliente no encontrado.");
        setNombreRazon("No encontrado");
      } else {
        setFormData(prev => ({...prev, ruc: `${formData.ruc}-${res.data.guion}`}));
        setNombreRazon(res.data.razon_social);
      }
    } catch (err) {
      setNombreRazon("Error al cargar");
      showError('Hubo un error al buscar el cliente');
    }
  };

  useEffect(() => {
    if(formData.tipoIdentificacion === 'sin nombre') {
      setNombreRazon("SIN NOMBRE");
      setFormData(prev => ({...prev, ruc: 'x'})); // RUC 'x' o '0' para "sin nombre"
    } else if (formData.ruc === 'x' && formData.tipoIdentificacion !== 'sin nombre') {
        // Limpiar RUC si venía de "sin nombre" y se cambia el tipo de identificación
        setFormData(prev => ({...prev, ruc: ''}));
        setNombreRazon('');
    }
  }, [formData.tipoIdentificacion]); // Agrega formData.ruc a las dependencias si quieres que reaccione a cambios de RUC al cambiar tipoIdentificacion

  // console.log para depuración, puedes eliminarlo en producción
  useEffect(()=> {
    console.log(formData);
  }, [formData]);

  // Carga inicial del cliente por ID
  useEffect(()=> {
    if(!id) return;
    const fetchClient = async () => {
      try {
        const response = await api.get(`/api/getClient/${id}`);
        setClient(response.data);
        // Al cargar el cliente, si es rol de venta, establecer el timbrado del cliente
        if (formData.rolUsuario === 'venta') {
             setFormData(prev => ({ ...prev, timbrado: response.data.currentTimbrado || '' }));
        }
      } catch (error) {
        showError('Hubo un error al traer el cliente');
      }
    };
    fetchClient();
  }, [id, formData.rolUsuario]); // Añadir formData.rolUsuario para que el timbrado se setee correctamente al cargar la pagina

  // Lógica para el switch "NO IMPUTAR"
  useEffect(()=> {
    if(!formData.imputaIRE && !formData.imputaIRP && !formData.imputaIVA) {
      setFormData(prev => ({...prev, noImputar: true}));
    } else {
      setFormData(prev => ({...prev, noImputar: false}));
    }
  }, [formData.imputaIRE, formData.imputaIRP, formData.imputaIVA]);

  // Renderizado del componente
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {
        pregunta && (
        <div className="w-screen h-screen flex items-center justify-center fixed top-0 left-0 bg-black bg-opacity-50 z-50">
          <div className="bg-white shadow-md p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-4">¿Cargar otra factura?</h2>
            <div className="flex justify-center gap-4">
              <Button
                ref={siButtonRef}
                onClick={volverACargar}
                className={`px-4 py-2 rounded ${
                  selected === "si"
                    ? "bg-green-700 text-white"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                Sí
              </Button>
              <Button
                ref={noButtonRef}
                onClick={() => navigate("/clientes")}
                className={`px-4 py-2 rounded ${
                  selected === "no"
                    ? "bg-red-700 text-white"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                No
              </Button>
            </div>
          </div>
        </div>
        )
      }
      <div className="max-w-6xl mx-auto bg-white shadow-lg">
        {/* Header Section - DATOS DEL COMPROBANTE */}
        <div className="bg-gray-600 text-white p-3 text-center font-semibold">DATOS DEL COMPROBANTE ({client.razon_social} RUC: {client.base + '-' + client.guion})</div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 d-flex gap-5"> {/* Changed d-flex to flex flex-col */}
            <div className="space-y-2">
              <Label htmlFor="tipo-comprobante" className="text-sm font-medium text-gray-700">
                Tipo Comprobante
              </Label>
              <Select value={formData.tipoComprobante} onValueChange={(value)=> {setFormData(prev => ({...prev, tipoComprobante: value}))}}>
                <SelectTrigger className="bg-yellow-50 border-yellow-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="factura">FACTURA</SelectItem>
                  <SelectItem value="boleta">BOLETA</SelectItem>
                  <SelectItem value="recibo">RECIBO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo-comprobante" className="text-sm font-medium text-gray-700">
                Rol Usuario
              </Label>
              <Select value={formData.rolUsuario} onValueChange={(value)=> {setFormData(prev => ({...prev, rolUsuario: value}))}}>
                <SelectTrigger className="bg-yellow-50 border-yellow-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compra">COMPRADOR</SelectItem>
                  <SelectItem value="venta">VENDEDOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo-comprobante" className="text-sm font-medium text-gray-700">
                Origen
              </Label>
              <Select value={formData.origen} onValueChange={(value)=> {setFormData(prev => ({...prev, origen: value}))}}>
                <SelectTrigger className="bg-yellow-50 border-yellow-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">MANUAL</SelectItem>
                  <SelectItem value="ELECTRONICO">ELECTRONICO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha-emision" className="text-sm font-medium text-gray-700">
              Fecha de Emisión
            </Label>
            <div className="relative">
              <Input
                type="text" // Cambiado a 'text' para permitir DDMMAAAA
                id="fecha-emision"
                placeholder="DDMMAAAA"
                maxLength={10} // Permitir 10 para DD/MM/AAAA
                value={formData.fechaEmision}
                onChange={handleDateInputChange}
                onBlur={handleDateInputBlur}
                onKeyDown={handleDateInputKeyDown}
                className="bg-yellow-50 border-yellow-200 pr-10"
              />
              {dateInputError && (
                <p className="text-red-500 text-xs mt-1">{dateInputError}</p>
              )}
            </div>
          </div>

          {
            formData.origen === 'ELECTRONICO' && (
              <div className="space-y-2">
              <Label htmlFor="timbrado" className="text-sm font-medium text-gray-700">
                CDC
              </Label>
              <Input className="bg-yellow-50 border-yellow-200" value={formData.cdc} onChange={(e)=> setFormData(prev => ({...prev, cdc: e.target.value}))}/>
          </div>
            )
          }

          <div className="space-y-2">
            <Label htmlFor="timbrado" className="text-sm font-medium text-gray-700">
              Timbrado
            </Label>
            <Input readOnly className="bg-yellow-50 border-yellow-200 mb-3" value={formData.timbrado} onChange={(e)=> setFormData(prev => ({...prev, timbrado: e.target.value}))}/>
            { !client.currentTimbrado && formData.rolUsuario === 'venta' && (
              <>
                <span className="text-red-600 mr-2">Falta cargar timbrado</span>
                <Button style={{fontSize: '15px'}} className="bg-gray-400 p-2" onClick={()=> navigate(`/edit/cliente/${client.id}`)}>Cargar Timbrado</Button>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero-comprobante" className="text-sm font-medium text-gray-700">
              Número del Comprobante
            </Label>
            <Input value={formData.numeroFactura} onChange={(e)=> setFormData(prev => ({...prev, numeroFactura: e.target.value}))} className="bg-yellow-50 border-yellow-200" />
          </div>
        </div>

        {/* Operation Information Section */}
        <div className="bg-gray-600 text-white p-3 text-center font-semibold">INFORMACIÓN DE LA OPERACIÓN</div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-gray-300 p-6 rounded-lg">
            <h3 className="text-center font-medium text-gray-700 mb-4">Operación realizada en moneda extranjera:</h3>
            <div className="flex items-center justify-center space-x-4">
              <span className="text-sm text-gray-600">No</span>
              <Switch
                checked={formData.foreignCurrency}
                onCheckedChange={(checked)=> setFormData(prev => ({...prev, foreignCurrency: checked}))}
                className="data-[state=checked]:bg-red-500"
              />
              <span className="text-sm text-gray-600">Sí</span>
            </div>
          </div>

          <div className="border border-gray-300 p-6 rounded-lg">
            <h3 className="text-center font-medium text-gray-700 mb-4">Condición de la operación:</h3>
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Contado</span>
                <Switch
                  checked={contadoCheck}
                  onCheckedChange={(checked)=> {
                    setFormData(prev => ({...prev, condicion: 'contado'}))
                    setCreditoCheck(!checked)
                    setContadoCheck(checked)
                  }}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Crédito</span>
                <Switch
                  checked={creditoCheck}
                  onCheckedChange={(checked)=> {
                    setFormData(prev => ({...prev, condicion: 'credito'}))
                    setCreditoCheck(checked)
                    setContadoCheck(!checked)
                  }}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Provider Information Section */}
        <div className="bg-gray-600 text-white p-3 text-center font-semibold">INFORMACIÓN DE PROVEEDOR/VENDEDOR</div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tipo-identificacion" className="text-sm font-medium text-gray-700">
              Tipo de Identificación
            </Label>
            <Select value={formData.tipoIdentificacion} onValueChange={(value) => setFormData(prev => ({...prev, tipoIdentificacion: value}))}>
              <SelectTrigger className="bg-yellow-50 border-yellow-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ruc">RUC</SelectItem>
                <SelectItem value="ci">CI</SelectItem>
                <SelectItem value="pasaporte">PASAPORTE</SelectItem>
                <SelectItem value="sin nombre">SIN NOMBRE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero-identificacion" className="text-sm font-medium text-gray-700">
              Número de Identificación
            </Label>
            <Input className="bg-yellow-50 border-yellow-200" value={formData.ruc} onChange={(e)=> setFormData(prev => ({...prev, ruc: e.target.value}))}/>
            <span></span>
            { formData.tipoIdentificacion !== 'sin nombre' && (
              <Button onClick={loadNombreRazon}>Cargar</Button>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nombre-razon" className="text-sm font-medium text-gray-700">
              Nombre o Razón Social
            </Label>
            <Input className="bg-gray-100 border-gray-300" value={nombreRazon} readOnly/>
          </div>
        </div>

        {/* Operation Amount Section */}
        <div className="bg-gray-600 text-white p-3 text-center font-semibold">IMPORTE DE LA OPERACIÓN</div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto Gravado 10%</Label>
              <Input
                className="text-center"
                value={formData.montoGravado10}
                onChange={(e) => setFormData(prev => ({...prev, montoGravado10: formatNumber(e.target.value)}))}
                onBlur={handleBlurGravado10}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto Impuesto 10%</Label>
              <Input
                className="text-center"
                value={formatNumber(impuesto10)}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto Gravado 5%</Label>
              <Input
                className="text-center"
                value={formData.montoGravado5}
                onChange={(e) => setFormData(prev => ({...prev, montoGravado5: formatNumber(e.target.value)}))}
                onBlur={handleBlurGravado5}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto Impuesto 5%</Label>
              <Input
                className="text-center"
                value={formatNumber(impuesto5)}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto No Gravado / Exento</Label>
              <Input value={formData.montoExento} className="text-center bg-green-50" onChange={(e)=> setFormData(prev => ({...prev, montoExento: formatNumber(e.target.value)}))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-right">
            <div></div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total IVA:</span>
                <span className="font-bold">
                  {formatNumber(
                    (parseInt(impuesto10.replace(/\./g, "") || "0") +
                    parseInt(impuesto5.replace(/\./g, "") || "0")).toString()
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Comprobante:</span>
                <span className="font-bold">
                  {formatNumber(
                    (parseInt(formData.montoGravado10.replace(/\./g, "") || "0") +
                    parseInt(formData.montoGravado5.replace(/\./g, "") || "0") +
                    parseInt(formData.montoExento.replace(/\./g, "") || "0"))
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Associated Obligations Section */}
        <div className="bg-gray-600 text-white p-3 text-center font-semibold">IMPUTACIÓN A OBLIGACIONES ASOCIADAS</div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">

            { client.pagaIVA && (
              <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium text-gray-700">IVA GENERAL</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Imputa</span>
                <Switch
                  checked={formData.imputaIVA}
                  onCheckedChange={e => {
                      if(e) setFormData(prev => ({...prev, imputaIVA: e, noImputar: false})); // Si imputa, noImputar es false
                      else setFormData(prev => ({...prev, imputaIVA: e})); // Si deselecciona, solo actualiza
                  }}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>
            </div>
            )}

            { client.pagaIRE && (
              <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium text-gray-700">IRE</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Imputa</span>
                <Switch
                    checked={formData.imputaIRE}
                    onCheckedChange={e => {
                        if(e) setFormData(prev => ({...prev, imputaIRE: e, noImputar: false}));
                        else setFormData(prev => ({...prev, imputaIRE: e}));
                    }}
                    className="data-[state=checked]:bg-red-500"
                />
              </div>
            </div>
            )}

            { client.pagaIRP && (
              <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium text-gray-700">IRP</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Imputa</span>
                <Switch
                    checked={formData.imputaIRP}
                    onCheckedChange={e => {
                        if(e) setFormData(prev => ({...prev, imputaIRP: e, noImputar: false}));
                        else setFormData(prev => ({...prev, imputaIRP: e}));
                    }}
                    className="data-[state=checked]:bg-red-500"
                />
              </div>
            </div>
            )}

            <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium text-gray-700">NO IMPUTAR</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Imputa</span>
                <Switch
                  checked={formData.noImputar}
                  onCheckedChange={e => {
                    if(e) { // Si se activa "NO IMPUTAR"
                        setFormData(prev => ({
                            ...prev,
                            imputaIRP: false,
                            imputaIRE: false,
                            imputaIVA: false,
                            noImputar: true
                        }));
                    }
                  }}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex justify-between">
          <div className="flex space-x-4">
            <Button variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white" onClick={() => navigate("/clientes")}> {/* Añadido navigate para cancelar */}
              <Trash2 className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={limpiar} variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">
              <Edit3 className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>

          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={guardar}>
            <Save className="w-4 h-4 mr-2" />
            Guardar e Ingresar Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}