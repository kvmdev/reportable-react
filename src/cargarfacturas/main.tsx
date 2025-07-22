"use client"

import { useEffect, useState, useRef } from "react"
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
import dayjs from "dayjs"

export default function CargarFacturas() {
  const { id } = useParams()

  const { showError, showSuccess } = useNotifications()
  const [impuesto10, setImpuesto10] = useState("")
  const [impuesto5, setImpuesto5] = useState("")
  const siButtonRef = useRef<HTMLButtonElement>(null)
  const noButtonRef = useRef<HTMLButtonElement>(null)
  const [client, setClient] = useState<Cliente>({})
  const [creditoCheck, setCreditoCheck] = useState(false)
  const [contadoCheck, setContadoCheck] = useState(true)
  const [nombreRazon, setNombreRazon] = useState("")
  const [pregunta, setPregunta] = useState(false)
  const [selected, setSelected] = useState("si")
  const navigate = useNavigate()

  useEffect(() => {
    // cuando pregunta se activa, focus en "si"
    if (pregunta && siButtonRef.current) {
      siButtonRef.current.focus()
    }
  }, [pregunta])

  useEffect(() => {
    // cambia el focus cuando cambia selected
    if (pregunta) {
      if (selected === "si" && siButtonRef.current) {
        siButtonRef.current.focus()
      } else if (selected === "no" && noButtonRef.current) {
        noButtonRef.current.focus()
      }
    }
  }, [selected, pregunta])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, pregunta]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if(pregunta) {
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
  }

  const [formData, setFormData] = useState<FormData>({
    tipoComprobante: 'factura',
    rolUsuario: 'compra',
    fechaEmision: dayjs().startOf('day'),
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
  })


  const volverACargar = ()=> {
    limpiar()
    setPregunta(false)
  }

  const formatNumber = (value: string | number) => {
  const clean = typeof value === "string"
    ? value.replace(/[^\d]/g, "") // elimina todo lo que no sea número
    : value.toString()

  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const guardar = async () => {
  try {
    const cleanFormData: FormData = {
      ...formData,
      idClient: id,
      fechaEmision: typeof formData.fechaEmision !== 'string' ? dayjs(formData.fechaEmision).startOf('day').utc().toString() : formData.fechaEmision,
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
    setPregunta(true)
  } catch (error: unknown) {
    if (error instanceof Error) {
      showError(error.message);
    } else {
      showError("Error desconocido al guardar la factura");
    }
  }
};

useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(pregunta) {
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

const limpiar = () => {
  setFormData({
    tipoComprobante: 'factura',
    rolUsuario: 'compra',
    fechaEmision: dayjs().startOf('day'),
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
  })
  setNombreRazon('')
  setImpuesto10('')
  setImpuesto5('')
  window.scrollTo({
    top: 0
  })
}


  const handleBlurGravado10 = () => {
    const value = parseFloat(formData.montoGravado10.replace(/\./g, "").replace(",", "."))
    if (!isNaN(value)) {
      setImpuesto10((value / 11).toFixed(0))
    }
  }

  const loadNombreRazon = async () => {
    try {
      const res = await api.get(`/api/getClientByRuc/${formData.ruc}`);
      if(res.status !== 200) {
        showError("Cliente no encontrado");
        setNombreRazon("No encontrado");
      } else {
        setFormData({...formData, ruc: formData.ruc + '-' + res.data.guion})
        setNombreRazon(res.data.razon_social);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setNombreRazon("Error");
      showError('Hubo un error')
    }
  }

  const handleBlurGravado5 = () => {
    const value = parseFloat(formData.montoGravado5.replace(/\./g, "").replace(",", "."))
    if (!isNaN(value)) {
      setImpuesto5((value / 21).toFixed(0))
    }
  }

  useEffect(() => {
    if(formData.tipoIdentificacion === 'sin nombre') {
      setNombreRazon("SIN NOMBRE")
      setFormData({...formData, ruc: 'x'})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tipoIdentificacion])

  useEffect(()=> {
    console.log(formData)
  }, [formData])

  useEffect(()=> {

    if(!id) return;
    const fetchClient = async () => {
      try {
        const response = await api.get(`/api/getClient/${id}`)
        setClient(response.data)
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      catch (error) {
        showError('Hubo un error al traer el cliente')
      }
    }
    fetchClient()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(()=> {
    if(!formData.imputaIRE && !formData.imputaIRP && !formData.imputaIVA) {
      setFormData({...formData, noImputar: true})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.imputaIRE, formData.imputaIRP, formData.imputaIVA])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {
        pregunta && ( 
        <div className="w-screen h-screen flex items-center justify-center fixed top-0 left-0">
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
        <div className="bg-gray-600 text-white p-3 text-center font-semibold">DATOS DEL COMPROBANTE ({client.razon_social} Ruc: {client.base + '-' + client.guion})</div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 d-flex gap-5">
          <div className="space-y-2">
            <Label htmlFor="tipo-comprobante" className="text-sm font-medium text-gray-700">
              Tipo Comprobante
            </Label>
            <Select value={formData.tipoComprobante} onValueChange={(value)=> {setFormData({...formData, tipoComprobante: value})} }>
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
            <Select value={formData.rolUsuario} onValueChange={(value)=> {setFormData({...formData, rolUsuario: value})} }>
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
            <Select value={formData.origen} onValueChange={(value)=> {setFormData({...formData, origen: value})} }>
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
                type="date"
                placeholder="Elegir Fecha"
                value={typeof formData.fechaEmision === 'string' ? dayjs(formData.fechaEmision).format('YYYY-MM-DD') : formData.fechaEmision.format('YYYY-MM-DD')}
                onChange={(e) => setFormData({ ...formData, fechaEmision: dayjs(e.target.value).startOf('day') })}
                className="bg-yellow-50 border-yellow-200 pr-10"
              />
            </div>
          </div>

          {
            formData.origen === 'ELECTRONICO' && (
              <div className="space-y-2">
              <Label htmlFor="timbrado" className="text-sm font-medium text-gray-700">
                CDC
              </Label>
              <Input className="bg-yellow-50 border-yellow-200" value={formData.cdc} onChange={(e)=> setFormData({...formData, cdc: e.target.value})}/>
          </div>
            )
          }

          <div className="space-y-2">
            <Label htmlFor="timbrado" className="text-sm font-medium text-gray-700">
              Timbrado
            </Label>
            <Input className="bg-yellow-50 border-yellow-200" value={formData.timbrado} onChange={(e)=> setFormData({...formData, timbrado: e.target.value})}/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero-comprobante" className="text-sm font-medium text-gray-700">
              Número del Comprobante
            </Label>
            <Input value={formData.numeroFactura} onChange={(e)=> setFormData({...formData, numeroFactura: e.target.value})} className="bg-yellow-50 border-yellow-200" />
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
                onCheckedChange={(checked)=> setFormData({...formData, foreignCurrency: checked})}
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
                    setFormData({...formData, condicion: 'contado'})
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
                    setFormData({...formData, condicion: 'credito'})
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
            <Select value={formData.tipoIdentificacion} onValueChange={(value) => setFormData({...formData, tipoIdentificacion: value})}>
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
            <Input className="bg-yellow-50 border-yellow-200" value={formData.ruc} onChange={(e)=> setFormData({...formData, ruc: e.target.value})}/>
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
        onChange={(e) => setFormData({...formData, montoGravado10: formatNumber(e.target.value)})}
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
        onChange={(e) => setFormData({...formData, montoGravado5: formatNumber(e.target.value)})}
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
      <Input value={formData.montoExento} className="text-center bg-green-50" onChange={(e)=> setFormData({...formData, montoExento: formatNumber(e.target.value)})} />
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
                  onCheckedChange={e => { if(e) setFormData({...formData, imputaIVA: e, noImputar: !e}); else setFormData({...formData, imputaIVA: e}) }}
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
                <Switch checked={formData.imputaIRE} onCheckedChange={e => { if(e) setFormData({...formData, imputaIRE: e, noImputar: !e}); else setFormData({...formData, imputaIRE: e}) }} className="data-[state=checked]:bg-red-500" />
              </div>
            </div>
            )}

            { client.pagaIRP && (
              <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium text-gray-700">IRP</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Imputa</span>
                <Switch checked={formData.imputaIRP} onCheckedChange={e => { if(e) setFormData({...formData, imputaIRP: e, noImputar: !e}); else setFormData({...formData, imputaIRP: e}) }} className="data-[state=checked]:bg-red-500" />
              </div>
            </div>
            )}

            <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium text-gray-700">NO IMPUTAR</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Imputa</span>
                <Switch
                  checked={formData.noImputar}
                  onCheckedChange={e => { if(e) setFormData({...formData, imputaIRP: !e, noImputar: e, imputaIRE: !e, imputaIVA: !e}) }}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex justify-between">
          <div className="flex space-x-4">
            <Button variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">
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
  )
}
