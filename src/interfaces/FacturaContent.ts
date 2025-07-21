import type { Cliente } from "./Cliente";

export interface FacturaContent {
  id: number;
  numeroFactura: string;
  timbrado: string;
  condicion: string;
  fecha_emision: Date;
  valor: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  userIdClient: number;
  userIdVendedor: number;

  montoGravado10: number;
  montoGravado5: number;
  montoImpuesto10: number;
  montoImpuesto5: number;
  montoExento: number;
  montoIVA: number;

  periodo: string;
  imputaIvaVendedor: boolean;
  imputaIvaCliente: boolean;
  imputaIrpVendedor: boolean;
  imputaIrpCliente: boolean;
  imputaIreVendedor: boolean;
  imputaIreCliente: boolean;
  noImputaCliente: boolean;
  noImputaVendedor: boolean;
  cdc: string;

  userClient?: Cliente;
  userVendedor?: Cliente;
  origen: string;
  tipoComprobante: string;
  tipoIdentificacion?: string;

  origenInformacion: string;
  timbradoComprobanteAsociado: string;
  numeroComprobanteAsociado: string;
  fechaRegistro: Date;

  foreignCurrency: boolean;

  is_read: boolean;
}