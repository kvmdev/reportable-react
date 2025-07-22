import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Alert, Button } from "react-bootstrap";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import api from "../lib/api"; // tu instancia axios o fetch configurada
import type { Factura } from "../interfaces/Factura";
import type { Cliente } from "../interfaces/Cliente";
import { Input } from "../components/ui/input";
import FacturaFilters from "../components/InvoicesFilter";
import Header from "../components/Header";
import type { Filters } from "../interfaces/Filters";
import { useNotifications } from "../context/NotificationContext";
import type { FacturaContent } from "../interfaces/FacturaContent";


dayjs.extend(utc);
dayjs.extend(timezone);

const Facturas: React.FC = () => {
  const { id } = useParams<{ id: string}>()
  const navigate = useNavigate()

  const [client, setClient] = useState<Cliente>({})
  const [facturas, setFacturas] = useState<Factura>({facturasClientes: [], facturasVendedor: []})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterState, setFilterState] = useState(false)
  const [filters, setFilters] = useState<Filters>({ timbrado: '', fechaDesde: '', fechaHasta: '', rol: 'COMPRAS', idClient: id })
  const { showError, showSuccess } = useNotifications()

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Traer cliente
        const clientResp = await api.get(`/api/getClient/${id}`);
        setClient(clientResp.data);

        // Traer facturas
        const facturasResp = await api.get(`/api/getFacturas/${id}`);
        setFacturas(facturasResp.data);

        setError(null);
      } catch (e: unknown) {
        if (e instanceof Error) {
          showError(e.message);
        } else {
          showError("Error desconocido al cargar los datos");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFilter = (filters: {
    idClient: string | undefined;
    timbrado: string;
    rol: string;
    fechaDesde: string;
    fechaHasta: string;
  }) => {
    setFilters(filters)
  };

  const handleDownload = async ()=> {
    try {
      const res = await api.post('/downloadFacturas', filters)
      console.log(res.data)
      showSuccess('Se envio la solicitud de descarga')
    } catch (error: unknown) {
      if (error instanceof Error) {
        showError('Hubo un error al descargar');
      } else {
        showError("Error desconocido al descargar");
      }
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="py-3">
      <Header></Header>
    <div className="container mt-5">
    <Button onClick={()=> {navigate('/cargarfactura/'+id)}}>Cargar Facturas</Button>
      <div className=" flex justify-between">
        <h1 style={{ fontSize: "20px" }}>Cliente: {client?.razon_social}</h1>
        <span>
          <Button onClick={()=> setFilterState(!filterState)}>Filtros</Button>
          <Button style={{marginLeft: '20px'}} onClick={handleDownload}>Descargar</Button>
        </span>
        {filterState && (
        <FacturaFilters
          onFilter={handleFilter}
          filters={filters}
          onClose={() => setFilterState(false)} // cierra al clickear fuera
        />
      )}
      </div>
      <div className={`relative`}>
        <Input
          type="text"
          placeholder='Buscar...'
          value={searchTerm}
          onChange={ (e) => setSearchTerm(e.target.value) }
          /* onKeyDown={} */
          className="pl-20 mt-2"
        />
      </div>
        <Table striped className="mt-3" id="myTable">
        <thead className="sticky">
          <tr>
            <th>Nombre</th>
            <th>RUC</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Timbrado</th>
            <th>N° Factura</th>
            <th>Condicion</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody id="facturaTableBody">
  {(() => {
    const term = searchTerm.toLowerCase();

    const matchFactura = (factura: FacturaContent, rol: "vendedor" | "cliente") => {
      const razon_social = rol === "vendedor" ? factura.userClient?.razon_social : factura.userVendedor?.razon_social;
      const base = rol === "vendedor" ? factura.userClient?.base : factura.userVendedor?.base;
      const fecha = dayjs.utc(factura.fecha_emision).format('DD/MM/YYYY')
      const rolStr = rol === "vendedor" ? "Vendedor" : "Comprador";

      return (
        (razon_social || "").toLowerCase().includes(term) ||
        (base || "").toLowerCase().includes(term) ||
        (fecha || "").toLowerCase().includes(term) ||
        (factura.valor?.toString() || "").includes(term) ||
        (factura.timbrado?.toString() || "").includes(term) ||
        (factura.numeroFactura?.toString() || "").includes(term) ||
        (factura.condicion?.toLowerCase() || "").includes(term) ||
        rolStr.toLowerCase().includes(term)
      );
    };

    const filteredVendedor = facturas.facturasVendedor.filter(f => matchFactura(f, "vendedor"));
    const filteredClientes = facturas.facturasClientes.filter(f => matchFactura(f, "cliente"));

    const hasResults = filteredVendedor.length > 0 || filteredClientes.length > 0;

    return (
      <>
        {filteredVendedor.map((factura, index) => (
          <tr key={`v-${index}`}>
            <td>{factura.userClient?.razon_social || "-"}</td>
            <td>{factura.userClient?.base + '-' + factura.userClient?.guion || "-"}</td>
            <td>{dayjs.utc(factura.fecha_emision).format("DD/MM/YYYY")}</td>
            <td>{factura.valor}</td>
            <td>{factura.timbrado}</td>
            <td>{factura.numeroFactura}</td>
            <td>{factura.condicion}</td>
            <td>Venta</td>
            <td><Button onClick={()=> {navigate('/factura/' + factura.id + '/' + id)}}>Editar</Button></td>
          </tr>
        ))}

        {filteredClientes.map((factura, index) => (
          <tr key={`c-${index}`}>
            <td>{factura.userVendedor?.razon_social || "-"}</td>
            <td>{factura.userVendedor?.base + '-' + factura.userVendedor?.guion || "-"}</td>
            <td>{dayjs.utc(factura.fecha_emision).format("DD/MM/YYYY")}</td>
            <td>{factura.valor}</td>
            <td>{factura.timbrado}</td>
            <td>{factura.numeroFactura}</td>
            <td>{factura.condicion}</td>
            <td>Compra</td>
            <td><Button onClick={()=> {navigate('/factura/' + factura.id + '/' + id)}}>Editar</Button></td>
          </tr>
        ))}

        {!hasResults && (
          <tr>
            <td colSpan={8} className="text-center">
              No se encontraron facturas que coincidan con la búsqueda.
            </td>
          </tr>
        )}
      </>
    );
  })()}
</tbody>

      </Table>
    </div>
    </div>
  );
};

export default Facturas;
