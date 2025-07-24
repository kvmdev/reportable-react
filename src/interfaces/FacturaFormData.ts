export interface FormData {
  tipoComprobante: string;
  rolUsuario: string;
  // Change fechaEmision to strictly 'string' as the input will now hold 'DD/MM/AAAA'
  fechaEmision: string; 
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