export interface Cliente {
  razon_social?: string | undefined;
  base?: string | undefined;
  contadorId?: string;
  id?: string;
  pagaIVA?: boolean;
  pagaIRE?: boolean;
  pagaIRP?: boolean;
  guion?: string;
  currentTimbrado?: string | undefined;
}