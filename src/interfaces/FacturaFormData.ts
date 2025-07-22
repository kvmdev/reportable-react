import dayjs from 'dayjs'

export interface FormData {
  tipoComprobante: string;
  rolUsuario: string;
  fechaEmision: dayjs.Dayjs | string;
  timbrado: string;
  numeroFactura: string;
  foreignCurrency: boolean;
  condicion: string;
  ruc: string | undefined;
  montoGravado10: string;
  montoGravado5: string;
  montoExento: string;
  idClient: string | undefined;
  origen: string;
  tipoIdentificacion?: string;
  imputaIVA?: boolean;
  imputaIRE?: boolean;
  imputaIRP?: boolean;
  noImputar?: boolean;
  cdc: string;
}