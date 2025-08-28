import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Spinner } from "react-bootstrap";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import 'dayjs/locale/es';
import api from "../lib/api";
import type { Cliente } from "../interfaces/Cliente";
import { Input } from "../components/ui/input";
import Header from "../components/Header";
import type { FacturaContent } from "../interfaces/FacturaContent";
import { useNotifications } from "../context/NotificationContext";
import { useFacturaContext } from '../context/FacturaContext';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

const Facturas: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { facturas, setFacturas, month, setMonth, year, setYear, rol, setRol } = useFacturaContext();

    const [client, setClient] = useState<Cliente | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { showError } = useNotifications();
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [isDownloadingRG90, setIsDownloadingRG90] = useState<boolean>(false);
    const [isLoadingFacturas, setIsLoadingFacturas] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const clientResp = await api.get(`/api/getClient/${id}`);
                setClient(clientResp.data);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    showError(e.message);
                } else {
                    showError("Error desconocido al cargar los datos");
                }
            }
        };

        fetchData();
    }, [id, showError]);

    const fetchFacturas = async (pageToLoad: number) => {
        if (!id || !month || !year || rol === 'SELECCIONE') {
            showError("Por favor, seleccione Mes, Año y Rol para mostrar las facturas.");
            return;
        }

        if (pageToLoad > 1) {
            setIsLoadingMore(true);
        } else {
            setIsLoadingFacturas(true);
        }

        try {
            const facturasResp = await api.get(`/api/getFacturas/${id}`, {
                params: { month, year, rol, page: pageToLoad }
            });

            const newFacturas = facturasResp.data;

            setFacturas(prevFacturas => ({
                facturasVendedor: pageToLoad === 1 ? newFacturas.facturasVendedor : [...prevFacturas.facturasVendedor, ...newFacturas.facturasVendedor],
                facturasClientes: pageToLoad === 1 ? newFacturas.facturasClientes : [...prevFacturas.facturasClientes, ...newFacturas.facturasClientes]
            }));
            setHasMore(newFacturas.hasMore);
            setPage(pageToLoad);

        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message);
                showError(e.message);
            } else {
                showError("Error desconocido al cargar las facturas.");
            }
        } finally {
            setIsLoadingMore(false);
            setIsLoadingFacturas(false);
        }
    };

    const handleLoadFacturas = () => {
        setFacturas({ facturasVendedor: [], facturasClientes: [] });
        fetchFacturas(1);
    };

    const handleLoadMoreFacturas = () => {
        fetchFacturas(page + 1);
    };

    const handleDownload = async () => {
        if (!id || !month || !year || rol === 'SELECCIONE') {
            showError("Por favor, seleccione Mes, Año y Rol para descargar el reporte.");
            return;
        }

        try {
            setIsDownloading(true);
            const res = await api.post('/api/report/excel', { idClient: id, month, year, rol });

            const checkStatusInterval = setInterval(async () => {
                try {
                    const response = await api.get('/api/verify/' + res.data.id);
                    if (response.data.link) {
                        clearInterval(checkStatusInterval);
                        setIsDownloading(false);
                        const a = document.createElement('a');
                        a.href = response.data.link;
                        a.download = `reporte-${res.data.id}.xlsx`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }
                } catch (error: unknown) {
                    clearInterval(checkStatusInterval);
                    setIsDownloading(false);
                    if (error instanceof Error) {
                        showError(`Error al verificar el estado: ${error.message}`);
                    } else {
                        showError("Error desconocido al verificar el estado del reporte.");
                    }
                }
            }, 3000);
        } catch (error: unknown) {
            setIsDownloading(false);
            if (error instanceof Error) {
                showError(error.message);
            } else {
                showError("Error desconocido al descargar");
            }
        }
    };

    const handleDownloadRG90 = async () => {
        if (!id || !month || !year || rol === 'SELECCIONE') {
            showError("Por favor, seleccione Mes, Año y Rol para descargar el reporte.");
            return;
        }

        try {
            setIsDownloadingRG90(true);
            const res = await api.post('/api/report/excel-rg90', { idClient: id, month, year, rol });

            const checkStatusInterval = setInterval(async () => {
                try {
                    const response = await api.get('/api/verify/' + res.data.id);
                    if (response.data.link) {
                        clearInterval(checkStatusInterval);
                        setIsDownloadingRG90(false);
                        const a = document.createElement('a');
                        a.href = response.data.link;
                        a.download = `reporte-rg90-${res.data.id}.xlsx`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }
                } catch (error: unknown) {
                    clearInterval(checkStatusInterval);
                    setIsDownloadingRG90(false);
                    if (error instanceof Error) {
                        showError(`Error al verificar el estado: ${error.message}`);
                    } else {
                        showError("Error desconocido al verificar el estado del reporte.");
                    }
                }
            }, 3000);
        } catch (error: unknown) {
            setIsDownloadingRG90(false);
            if (error instanceof Error) {
                showError(error.message);
            } else {
                showError("Error desconocido al descargar");
            }
        }
    };

    const matchFactura = (factura: FacturaContent) => {
        const term = searchTerm.toLowerCase();
        const rolStr = factura.userIdVendedor === Number(id) ? "VENTA" : "COMPRA";
        const isVendedor = rolStr === "VENTA";
        const counterparty = isVendedor ? factura.userClient : factura.userVendedor;

        const searchString = [
            (counterparty?.razon_social || "").toLowerCase(),
            (counterparty?.base || "").toLowerCase(),
            (dayjs.utc(factura.fecha_emision).format('DD/MM/YYYY') || "").toLowerCase(),
            (factura.valor?.toString() || ""),
            (factura.timbrado?.toString() || ""),
            (factura.numeroFactura?.toString() || ""),
            (factura.condicion?.toLowerCase() || ""),
            rolStr.toLowerCase(),
        ].join(" ");

        return searchString.includes(term);
    };

    const allFacturas = [...facturas.facturasVendedor, ...facturas.facturasClientes];
    
    // Filtra y luego ordena las facturas, primero las no leídas (Pendiente), luego las leídas (Revisado)
    const combinedFilteredFacturas = allFacturas
        .filter(f => matchFactura(f))
        .sort((a, b) => {
            if (a.is_read && !b.is_read) {
                return 1; // b (no leído) va primero
            }
            if (!a.is_read && b.is_read) {
                return -1; // a (no leído) va primero
            }
            return 0; // mantener el orden original si ambos son iguales
        });
        
    const hasResults = combinedFilteredFacturas.length > 0;

    return (
        <div className="py-3">
            <Header />
            <div className="container-fluid mt-5">
                <Button onClick={() => { navigate('/cargarfactura/' + id) }}>Cargar Facturas</Button>
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <h1 style={{ fontSize: "20px" }}>Cliente: {client?.razon_social || "Cargando..."}</h1>
                </div>
                <div className="d-flex align-items-center gap-4 mt-3">
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="form-control w-auto"
                    >
                        <option value="">Seleccione Mes</option>
                        {Array.from({ length: 12 }, (_, i) => {
                            const monthName = dayjs().month(i).format("MMMM");
                            const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                            return (
                                <option key={i + 1} value={i + 1}>
                                    {capitalizedMonthName}
                                </option>
                            );
                        })}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="form-control w-auto"
                    >
                        <option value="">Seleccione Año</option>
                        {Array.from({ length: 5 }, (_, i) => (
                            <option key={dayjs().year() - i} value={dayjs().year() - i}>
                                {dayjs().year() - i}
                            </option>
                        ))}
                    </select>
                    <select
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                        className="form-control w-auto"
                    >
                        <option value={'SELECCIONE'}>Seleccione</option>
                        <option value="COMPRA">Compras</option>
                        <option value="VENTA">Ventas</option>
                    </select>
                    <Button onClick={handleLoadFacturas} disabled={!month || !year || rol === 'SELECCIONE' || isLoadingFacturas}>
                        {isLoadingFacturas ? "Cargando..." : "Mostrar Facturas"}
                    </Button>
                    {hasResults && (
                        <>
                            <Button onClick={handleDownload} disabled={isDownloading}>
                                {isDownloading ? (
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                ) : (
                                    "Descargar (planilla)"
                                )}
                            </Button>
                            <Button onClick={handleDownloadRG90} disabled={isDownloadingRG90}>
                                {isDownloadingRG90 ? (
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                ) : (
                                    "Descargar (RG90)"
                                )}
                            </Button>
                        </>
                    )}
                </div>

                <div className="position-relative mt-3">
                    <Input
                        type="text"
                        placeholder='Buscar...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-20 mt-2 w-100"
                    />
                </div>
                
                <div className="table-responsive">
                    <Table 
                        striped 
                        bordered 
                        hover 
                        className="mt-3" 
                        style={{ fontSize: '0.8rem', tableLayout: 'fixed' }}
                    >
                        <thead className="sticky-top bg-white">
                            <tr>
                                <th style={{ width: '6%' }}>RUC del Informante</th>
                                <th style={{ width: '12%' }}>Nombre o Razón Social del Informante</th>
                                <th style={{ width: '7%' }}>RUC / N° de Identificación del Informado</th>
                                <th style={{ width: '11%' }}>Nombre o Razón Social del Informado</th>
                                <th style={{ width: '7%' }}>Tipo de Registro</th>
                                <th style={{ width: '7%' }}>Tipo de Comprobante</th>
                                <th style={{ width: '7%' }}>Fecha de Emisión</th>
                                <th style={{ width: '7%' }}>Período de Emisión</th>
                                <th style={{ width: '7%' }}>N° de Comprobante</th>
                                <th style={{ width: '7%' }}>Timbrado</th>
                                <th style={{ width: '7%' }}>Origen del Comprobante</th>
                                <th style={{ width: '180px', maxWidth: '180px' }}>CDC</th>
                                <th style={{ width: '7%' }}>Estado</th>
                                <th style={{ width: '90px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="facturaTableBody">
                            {(() => {
                                if (isLoadingFacturas) {
                                    return (
                                        <tr>
                                            <td colSpan={14} className="text-center">
                                                <Spinner animation="border" role="status" variant="primary">
                                                    <span className="visually-hidden">Cargando...</span>
                                                </Spinner>
                                            </td>
                                        </tr>
                                    );
                                }

                                if (!hasResults) {
                                    return (
                                        <tr>
                                            <td colSpan={14} className="text-center">
                                                {month && year ? 'No se encontraron facturas para el período seleccionado.' : 'Por favor, seleccione el período y haga clic en "Mostrar Facturas".'}
                                            </td>
                                        </tr>
                                    );
                                }

                                return (
                                    <>
                                        {combinedFilteredFacturas.map((factura, index) => {
                                            const isVendedor = factura.userIdVendedor === Number(id);
                                            const counterparty = isVendedor ? factura.userClient : factura.userVendedor;
                                            
                                            const rucInformante = `${client?.base || "-"}-${client?.guion || "-"}`;
                                            const razonSocialInformante = client?.razon_social || "-";
                                            const rucInformado = `${counterparty?.base || "-"}-${counterparty?.guion || "-"}`;
                                            const razonSocialInformado = counterparty?.razon_social || "-";
                                            const tipoRegistro = isVendedor ? 'VENTAS' : 'COMPRAS';
                                            const tipoComprobante = factura.tipoComprobante?.toUpperCase() || "-";
                                            const fechaEmision = dayjs.utc(factura.fecha_emision).format("DD/MM/YYYY");
                                            const periodoEmision = dayjs.utc(factura.fecha_emision).format("MM/YYYY");
                                            const numeroComprobante = factura.numeroFactura || "";
                                            const timbrado = factura.timbrado || "";
                                            const origenComprobante = factura.origenInformacion || "-";
                                            const cdc = factura.cdc || "-";

                                            const statusClass = factura.is_read ? 'bg-success text-white' : 'bg-warning text-dark';

                                            return (
                                                <tr key={`f-${index}`}>
                                                    <td className="text-truncate" title={rucInformante}>{rucInformante}</td>
                                                    <td className="text-truncate" title={razonSocialInformante}>{razonSocialInformante}</td>
                                                    <td className="text-truncate" title={rucInformado}>{rucInformado}</td>
                                                    <td className="text-truncate" title={razonSocialInformado}>{razonSocialInformado}</td>
                                                    <td className="text-truncate" title={tipoRegistro}>{tipoRegistro}</td>
                                                    <td className="text-truncate" title={tipoComprobante}>{tipoComprobante}</td>
                                                    <td className="text-truncate" title={fechaEmision}>{fechaEmision}</td>
                                                    <td className="text-truncate" title={periodoEmision}>{periodoEmision}</td>
                                                    <td className="text-truncate" title={numeroComprobante}>{numeroComprobante}</td>
                                                    <td className="text-truncate" title={timbrado}>{timbrado}</td>
                                                    <td className="text-truncate" title={origenComprobante}>{origenComprobante}</td>
                                                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cdc}>
                                                        {cdc}
                                                    </td>
                                                    <td className={statusClass} style={{ width: '7%' }}>
                                                        {factura.is_read ? 'Revisado' : 'Pendiente'}
                                                    </td>
                                                    <td style={{ width: '90px' }} className="text-truncate">
                                                        <Button onClick={() => { navigate('/factura/' + factura.id + '/' + id); }}>Editar</Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </>
                                );
                            })()}
                        </tbody>
                    </Table>
                </div>
                {hasMore && (
                    <div className="d-flex justify-content-center mt-3">
                        <Button onClick={handleLoadMoreFacturas} disabled={isLoadingMore}>
                            {isLoadingMore ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span className="ml-2">Cargando más...</span>
                                </>
                            ) : (
                                "Ver más"
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Facturas;