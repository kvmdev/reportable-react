"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch"
import { CalendarIcon, Trash2, Edit3, Save } from "lucide-react"

export default function InvoiceForm() {
  const [foreignCurrency, setForeignCurrency] = useState(false)
  /* const [operationCondition, setOperationCondition] = useState("contado") */
  const [ivaGeneral, setIvaGeneral] = useState(true)
  const [ire, setIre] = useState(true)
  const [noImputar, setNoImputar] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white shadow-lg">
        {/* Header Section - DATOS DEL COMPROBANTE */}
        <div className="bg-gray-600 text-white p-3 text-center font-semibold">DATOS DEL COMPROBANTE</div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tipo-comprobante" className="text-sm font-medium text-gray-700">
              Tipo Comprobante
            </Label>
            <Select defaultValue="factura">
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
            <Label htmlFor="fecha-emision" className="text-sm font-medium text-gray-700">
              Fecha de Emisión
            </Label>
            <div className="relative">
              <Input type="text" placeholder="Elegir Fecha" className="bg-yellow-50 border-yellow-200 pr-10" />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timbrado" className="text-sm font-medium text-gray-700">
              Timbrado
            </Label>
            <Input className="bg-yellow-50 border-yellow-200" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero-comprobante" className="text-sm font-medium text-gray-700">
              Número del Comprobante
            </Label>
            <Input className="bg-yellow-50 border-yellow-200" />
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
                checked={foreignCurrency}
                onCheckedChange={setForeignCurrency}
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
                  /* checked={operationCondition === "contado"} */
                  /* onCheckedChange={(checked) => setOperationCondition(checked ? "contado" : "credito")} */
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Crédito</span>
                <Switch
                  /* checked={operationCondition === "credito"} */
                  /* onCheckedChange={(checked) => setOperationCondition(checked ? "credito" : "contado")} */
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
            <Select defaultValue="ruc">
              <SelectTrigger className="bg-yellow-50 border-yellow-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ruc">RUC</SelectItem>
                <SelectItem value="ci">CI</SelectItem>
                <SelectItem value="pasaporte">PASAPORTE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero-identificacion" className="text-sm font-medium text-gray-700">
              Número de Identificación
            </Label>
            <Input className="bg-yellow-50 border-yellow-200" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nombre-razon" className="text-sm font-medium text-gray-700">
              Nombre o Razón Social
            </Label>
            <Input className="bg-gray-100 border-gray-300" />
          </div>
        </div>

        {/* Operation Amount Section */}
        <div className="bg-gray-600 text-white p-3 text-center font-semibold">IMPORTE DE LA OPERACIÓN</div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto Gravado 10%</Label>
              <Input defaultValue="15.000" className="text-center" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto Impuesto 10%</Label>
              <Input defaultValue="1.364" className="text-center" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto Gravado 5%</Label>
              <Input defaultValue="20.000" className="text-center" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto Impuesto 5%</Label>
              <Input defaultValue="952" className="text-center" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto No Gravado / Exento</Label>
              <Input defaultValue="0" className="text-center bg-green-50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-right">
            <div></div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total IVA:</span>
                <span className="font-bold">2.316</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Comprobante:</span>
                <span className="font-bold">35.000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Associated Obligations Section */}
        <div className="bg-gray-600 text-white p-3 text-center font-semibold">IMPUTACIÓN A OBLIGACIONES ASOCIADAS</div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium text-gray-700">IVA GENERAL</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Imputa</span>
                <Switch
                  checked={ivaGeneral}
                  onCheckedChange={setIvaGeneral}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium text-gray-700">IRE</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Imputa</span>
                <Switch checked={ire} onCheckedChange={setIre} className="data-[state=checked]:bg-red-500" />
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium text-gray-700">NO IMPUTAR</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Imputa</span>
                <Switch
                  checked={noImputar}
                  onCheckedChange={setNoImputar}
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
            <Button variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">
              <Edit3 className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>

          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            Guardar e Ingresar Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
