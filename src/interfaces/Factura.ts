import type { FacturaContent } from "./FacturaContent";

export interface Factura {
  facturasClientes: FacturaContent[];
  facturasVendedor: FacturaContent[];
}