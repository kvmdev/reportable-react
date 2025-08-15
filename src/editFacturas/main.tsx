/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components/ui/switch"
import { Trash2, Edit3, Save } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../lib/api"
import { useNotifications } from "../context/NotificationContext"
import type { FormData } from "../interfaces/FacturaFormData"
import type { FacturaContent } from "../interfaces/FacturaContent"
import type { Cliente } from "../interfaces/Cliente"
import dayjs from "dayjs"
import { useFacturaContext } from "../context/FacturaContext"

export default function EditFacturas() {
  const { id, idClient } = useParams<{ id: string; idClient: string }>()
  const navigate = useNavigate()
  const { showError, showSuccess } = useNotifications()
  const [impuesto10, setImpuesto10] = useState("")
  const [impuesto5, setImpuesto5] = useState("")
  const { facturas, setFacturas } = useFacturaContext()
  const [client, setClient] = useState<Cliente>({
    razon_social: '',
    base: '',
    contadorId: '',
    id: '',
    pagaIVA: false,
    pagaIRE: false,
    pagaIRP: false,
    guion: ''
  })
  const [client2, setClient2] = useState<Cliente>({
    razon_social: '',
    base: '',
    contadorId: '',
    id: '',
    pagaIVA: false,
    pagaIRE: false,
    pagaIRP: false,
    guion: ''
  })
  const [creditoCheck, setCreditoCheck] = useState(false)
  const [contadoCheck, setContadoCheck] = useState(true)
  const [nombreRazon, setNombreRazon] = useState<string | undefined>("")

  const [factura, setFactura] = useState<FacturaContent>({
    id: 0,
    numeroFactura: "",
    timbrado: "",
    condicion: "",
    fecha_emision: dayjs(),
    valor: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 0,
    userIdClient: 0,
    userIdVendedor: 0,

    montoGravado10: 0,
    montoGravado5: 0,
    montoImpuesto10: 0,
    montoImpuesto5: 0,
    montoExento: 0,
    montoIVA: 0,

    periodo: '',
    imputaIvaVendedor: false,
    imputaIvaCliente: false,
    imputaIrpVendedor: false,
    imputaIrpCliente: false,
    imputaIreVendedor: false,
    imputaIreCliente: false,
    noImputaCliente: true,
    noImputaVendedor: true,
    cdc: "",
    tipoComprobante: 'factura',
    tipoIdentificacion: 'ruc',
    origen: 'MANUAL',

    origenInformacion: "",
    timbradoComprobanteAsociado: "",
    numeroComprobanteAsociado: "",
    fechaRegistro: new Date(),

    foreignCurrency: true,

    is_read: true,
  })

  const [formData, setFormData] = useState<FormData>({
    tipoComprobante: 'factura',
    rolUsuario: 'compra',
    fechaEmision: '',
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

  const cancelar = ()=> {
    navigate(-1)
  }

  const fetchClient = async (id: string) => {
    try {
      const response = await api.get(`/api/getClient/${id}`)
      
      return response.data as Cliente
    } catch (error) {
      console.error("Error fetching client data:", error)
    }
  }

  const fetchFactura = async () => {
    try {
      const facturaResponse = await api.get('/factura/' + id)

      if (!facturaResponse.data) {
        showError("Factura no encontrada")
        return
      }
      
      setFactura(facturaResponse.data)
    } catch (error) {
      console.error("Error fetching factura data:", error)
    }
  }

  useEffect(() => {
    if(formData.tipoIdentificacion === 'sin nombre') {
      setNombreRazon("SIN NOMBRE")
      setFormData({...formData, ruc: 'x'})
    }
  }, [formData.tipoIdentificacion])

  useEffect(() => {
    setFormData({...formData, ruc: client2.base})
    setNombreRazon(client2.razon_social)
  }, [client2])

  useEffect(() => {
    fetchFactura()
  }, [id])

  useEffect(() => {
    const actualizarFormData = async () => {
      if (!idClient) return

      let rolUsuario = ''
      const fechaFormateada = dayjs(factura.fecha_emision).format('YYYY-MM-DD')

      if (factura.userIdClient == Number(idClient)) {
        rolUsuario = 'compra'
        console.log('IVACliente: ', factura.imputaIvaCliente, ' IRECliente: ', factura.imputaIreCliente, ' IRPCliente: ', factura.imputaIrpCliente)
        const data = await fetchClient(factura.userIdVendedor.toString())
        
        setFormData({
          rolUsuario,
          fechaEmision: fechaFormateada,
          timbrado: factura.timbrado,
          numeroFactura: factura.numeroFactura,
          foreignCurrency: factura.foreignCurrency,
          condicion: factura.condicion,
          tipoIdentificacion: 'ruc',
          ruc: client2.base,
          montoGravado10: factura.montoGravado10.toString(),
          montoGravado5: factura.montoGravado5.toString(),
          montoExento: factura.montoExento.toString(),
          imputaIVA: factura.imputaIvaCliente,
          imputaIRE: factura.imputaIreCliente,
          imputaIRP: factura.imputaIrpCliente,
          noImputar: factura.noImputaCliente,
          idClient,
          origen: factura.origenInformacion,
          cdc: factura.cdc,
          tipoComprobante: factura.tipoComprobante
        })
        
        if (data) setClient2(data)
      } else if (factura.userIdVendedor == Number(idClient)) {
        rolUsuario = 'venta'
        console.log('IVACliente: ', factura.imputaIvaCliente, ' IRECliente: ', factura.imputaIreCliente, ' IRPCliente: ', factura.imputaIrpCliente)
        const data = await fetchClient(factura.userIdClient.toString())
        
        setFormData(prev => ({
          ...prev,
          rolUsuario,
          fechaEmision: fechaFormateada,
          timbrado: factura.timbrado,
          numeroFactura: factura.numeroFactura,
          foreignCurrency: factura.foreignCurrency,
          condicion: factura.condicion,
          tipoIdentificacion: 'ruc',
          ruc: client2.base,
          montoGravado10: factura.montoGravado10.toString(),
          montoGravado5: factura.montoGravado5.toString(),
          montoExento: factura.montoExento.toString(),
          imputaIVA: factura.imputaIvaVendedor,
          imputaIRE: factura.imputaIreVendedor,
          imputaIRP: factura.imputaIrpVendedor,
          noImputar: factura.noImputaVendedor,
          idClient
        }))
        if (data) setClient2(data)
      }
      setContadoCheck(factura.condicion === 'contado' ? true : false)
      setCreditoCheck(factura.condicion === 'credito' ? true : false)
    }

    actualizarFormData()
  }, [factura])

  useEffect(()=> {
    const valueGravado10 = parseFloat(formData.montoGravado10.replace(/\./g, "").replace(",", "."))
    if (!isNaN(valueGravado10)) {
      setImpuesto10((valueGravado10 / 11).toFixed(0))
    }
    const valueGravado5 = parseFloat(formData.montoGravado5.replace(/\./g, "").replace(",", "."))
    if (!isNaN(valueGravado5)) {
      setImpuesto5((valueGravado5 / 11).toFixed(0))
    }
  }, [formData])

  useEffect(() => {
    if (!idClient) return
    fetchClient(idClient).then((data) => {
      if (data) setClient(data)
    })
  }, [idClient])

  const formatNumber = (value: string | number) => {
    const clean = typeof value === "string"
      ? value.replace(/[^\d]/g, "")
      : value.toString()

    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const loadNombreRazon = async () => {
    try {
      const res = await api.get(`/api/getClient/${client2.id}`)
      if(res.status !== 200) {
        showError("Cliente no encontrado")
        setNombreRazon("No encontrado")
        return;
      } else {
        console.log(res.data)
        setNombreRazon(res.data.razon_social)
      }
    } catch (err) {
      console.error(err);
      setNombreRazon("Error");
    }
  }

  const handleBlurGravado10 = () => {
    const value = parseFloat(formData.montoGravado10.replace(/\./g, "").replace(",", "."))
    if (!isNaN(value)) {
      setImpuesto10((value / 11).toFixed(0))
    }
  }

  const handleBlurGravado5 = () => {
    const value = parseFloat(formData.montoGravado5.replace(/\./g, "").replace(",", "."))
    if (!isNaN(value)) {
      setImpuesto5((value / 21).toFixed(0))
    }
  }

  const guardar = async () => {
    try {
      const res = await api.post('/v0/api/editFactura', {...formData, idFactura: id })
      if(res.status === 200) {
        showSuccess("Factura guardada correctamente")
        const facturasCopy = facturas
        for(let i = 0; i < facturasCopy[formData.rolUsuario == 'compra' ? 'facturasClientes' : 'facturasVendedor'].length; i++) {
          if(facturasCopy[formData.rolUsuario == 'compra' ? 'facturasClientes' : 'facturasVendedor'][i].id == factura.id) {
            facturasCopy[formData.rolUsuario == 'compra' ? 'facturasClientes' : 'facturasVendedor'][i].is_read = true
            break
          }
        }
        setFacturas(facturasCopy)
        navigate(-1)
      } else {
        showError("Error al guardar la factura")
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        showError('Error al guardar la factura')
      } else {
        showError("Error desconocido al guardar la factura")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white shadow-lg">
        {/* Header Section - DATOS DEL COMPROBANTE */}
        <div className="bg-gray-600 text-white p-3 text-center font-semibold">DATOS DEL COMPROBANTE ({client.razon_social} RUC: {client.base + '-' + client.guion})</div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 d-flex gap-5">
          <div className="space-y-2">
            <Label htmlFor="tipo-comprobante" className="text-sm font-medium text-gray-700">
              Tipo Comprobante
            </Label>
            <Select disabled value="factura" onValueChange={(value)=> {setFormData({...formData, tipoComprobante: value})} }>
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
            <Select disabled value={formData.rolUsuario} onValueChange={(value)=> {setFormData({...formData, rolUsuario: value})}}>
              <SelectTrigger className="bg-yellow-50 border-yellow-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compra">COMPRADOR</SelectItem>
                <SelectItem value="venta">VENDEDOR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          </div>
          

          <div className="space-y-2">
            <Label htmlFor="fecha-emision" className="text-sm font-medium text-gray-700">
              Fecha de Emisión
            </Label>
            <div className="relative">
              <Input readOnly type="date" placeholder="Elegir Fecha" value={typeof formData.fechaEmision !== 'string' ? dayjs.utc(formData.fechaEmision).format('DD-MM-YYYY') : formData.fechaEmision} onChange={(e)=> setFormData({...formData, fechaEmision: e.target.value})} className="bg-yellow-50 border-yellow-200 pr-10" />
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
            <Input readOnly className="bg-yellow-50 border-yellow-200" value={formData.timbrado} onChange={(e)=> setFormData({...formData, timbrado: e.target.value})}/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero-comprobante" className="text-sm font-medium text-gray-700">
              Número del Comprobante
            </Label>
            <Input readOnly value={formData.numeroFactura} onChange={(e)=> setFormData({...formData, numeroFactura: e.target.value})} className="bg-yellow-50 border-yellow-200" />
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
                disabled
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
                  disabled
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
                  disabled
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
            <Select disabled value="ruc" onValueChange={(value) => setFormData({...formData, tipoIdentificacion: value})}>
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
            <Input readOnly className="bg-yellow-50 border-yellow-200" value={"" + formData.ruc + '-' + client2.guion} onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}/>
            <span></span>
            <Button disabled onClick={loadNombreRazon}>Cargar</Button>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nombre-razon" className="text-sm font-medium text-gray-700">
              Nombre o Razón Social
            </Label>
            <Input disabled className="bg-gray-100 border-gray-300" value={nombreRazon} readOnly/>
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
        readOnly
        value={formatNumber(formData.montoGravado10)}
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
        readOnly
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
            <Button variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white" onClick={cancelar}>
              <Trash2 className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">
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
