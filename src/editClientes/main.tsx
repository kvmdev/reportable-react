"use client"

import { useEffect, useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, /* CardFooter, */ CardHeader } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { Save, X } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../lib/api"
import { CardFooter } from "react-bootstrap"
import { useNotifications } from "../context/NotificationContext"

interface Cliente {
  razon_social: string
  pagaIVA: boolean
  pagaIRE: boolean
  pagaIRP: boolean
}

export default function ClienteEditor() {
    const {id} = useParams<{id: string}>()
  const [formData, setFormData] = useState<Cliente>({
    razon_social: "",
    pagaIVA: false,
    pagaIRE: false,
    pagaIRP: false
  })    
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotifications()                                                                                          

  useEffect(()=> {
    const fetchClient = async ()=> {
        try {
            const response = await api.get<Cliente>(`/api/getClient/${id}`)
            setFormData(response.data)
        } catch (error) {
            console.error("Error al obtener el cliente:", error)
        }
    }
    fetchClient()
  }, [id])

  const handleInputChange = (field: keyof Cliente, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

  }

  /* const validateForm = () => {
    
  } */

  const handleSave = async () => {
    try {
      const data = {
        id: id,
        razonSocial: formData.razon_social,
        pagaIVA: formData.pagaIVA,
        pagaIRE: formData.pagaIRE,
        pagaIRP: formData.pagaIRP
      }
      const response = await api.post('/v0/api/cliente/edit', data)
      if(response.status === 200) {
        showSuccess("Cliente actualizado correctamente")
        // Aquí puedes redirigir a otra página o mostrar un mensaje de éxito
      } else {
        showError("Error al actualizar el cliente")
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        showError("Ocurrió un error al actualizar el cliente")
      } else {
        showError("Error desconocido al actualizar el cliente")
      }
    }
  }

  const onCancel = () => {
    // Aquí puedes manejar la lógica para cancelar la edición, como redirigir a otra página
    navigate('/clientes')
  }


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardDescription>Modifica los datos del cliente y su configuración de impuestos</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Razón Social */}
        <div className="space-y-2">
          <Label htmlFor="razon-social">Razón Social *</Label>
          <Input
            id="razon-social"
            type="text"
            value={formData.razon_social}
            onChange={(e) => handleInputChange("razon_social", e.target.value)}
            placeholder="Ingrese la razón social"
          />
          {/* {errors.razon_social && <p className="text-sm text-red-500">{errors.razon_social}</p>} */}
        </div>

        {/* Configuración de Impuestos */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Configuración de Impuestos</Label>

          <div className="space-y-3">
            {/* IVA */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paga-iva"
                checked={formData.pagaIVA}
                onCheckedChange={(checked) => handleInputChange("pagaIVA", checked === true)}
              />
              <Label htmlFor="paga-iva" className="text-sm font-normal cursor-pointer">
                Paga IVA (Impuesto al Valor Agregado)
              </Label>
            </div>

            {/* IRE */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paga-ire"
                checked={formData.pagaIRE}
                onCheckedChange={(checked) => handleInputChange("pagaIRE", checked === true)}
              />
              <Label htmlFor="paga-ire" className="text-sm font-normal cursor-pointer">
                Paga IRE (Impuesto a la Renta Empresarial)
              </Label>
            </div>

            {/* IRP */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paga-irp"
                checked={formData.pagaIRP}
                onCheckedChange={(checked) => handleInputChange("pagaIRP", checked === true)}
              />
              <Label htmlFor="paga-irp" className="text-sm font-normal cursor-pointer">
                Paga IRP (Impuesto a la Renta Personal)
              </Label>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button onClick={handleSave} className="flex-1" disabled={!formData.razon_social.trim()}>
          <Save className="w-4 h-4 mr-2" />
          Guardar
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1 bg-white text-gray-700">
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </CardFooter>
    </Card>
  )
}