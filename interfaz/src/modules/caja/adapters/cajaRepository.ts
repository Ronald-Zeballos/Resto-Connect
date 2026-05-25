import { api, asNumber, asString, toRecordArray, withDemoFallback } from "../../../core/http/httpClient";
import type { CajaGasto, CierreCaja } from "../../../types";
import type { CajaPort, CajaSnapshot } from "../ports/cajaPort";

function mapCierre(raw: Record<string, unknown>): CierreCaja {
  return {
    id: asString(raw.id),
    fechaApertura: asString(raw.fechaApertura),
    fechaCierre: asString(raw.fechaCierre) || undefined,
    estado: asString(raw.estado),
    usuarioAperturaNombre: asString(raw.usuarioAperturaNombre),
    usuarioCierreNombre: asString(raw.usuarioCierreNombre) || undefined,
    saldoInicial: asNumber(raw.saldoInicial),
    saldoEsperado: asNumber(raw.saldoEsperado) || undefined,
    saldoRealDeclarado: asNumber(raw.saldoRealDeclarado) || undefined,
    diferencia: asNumber(raw.diferencia) || undefined,
    observaciones: asString(raw.observaciones) || undefined,
    detallePagos: asString(raw.detallePagos) || undefined,
    totalPedidos: asNumber(raw.totalPedidos),
    totalVentas: asNumber(raw.totalVentas),
    totalImpuesto: asNumber(raw.totalImpuesto),
    totalPropinas: asNumber(raw.totalPropinas),
    totalDescuentos: asNumber(raw.totalDescuentos),
    totalGastos: asNumber(raw.totalGastos),
  };
}

const demoSnapshot: CajaSnapshot = {
  abierto: null,
  historial: []
};

export const cajaPort: CajaPort = {
  async getSnapshot(): Promise<CajaSnapshot> {
    return withDemoFallback(async () => {
      const [abierto, historial] = await Promise.all([
        api.cierreAbierto().catch(() => null),
        api.cierresCaja(),
      ]);
      return {
        abierto: abierto ? mapCierre(abierto as Record<string, unknown>) : null,
        historial: toRecordArray(historial).map(mapCierre)
      };
    }, async () => demoSnapshot);
  },

  async abrir(saldoInicial: number): Promise<CierreCaja> {
    const raw = await api.abrirCaja({ saldoInicial });
    return mapCierre(raw as Record<string, unknown>);
  },

  async cerrar(id: string, saldoRealDeclarado: number, observaciones?: string): Promise<CierreCaja> {
    const raw = await api.cerrarCaja(id, { saldoRealDeclarado, observaciones });
    return mapCierre(raw as Record<string, unknown>);
  },

  async registrarGasto(cierreId, payload) {
    const raw = await api.registrarGasto(cierreId, payload as Record<string, unknown>);
    const r = raw as Record<string, unknown>;
    return {
      id: asString(r.id),
      cierreCajaId: asString(r.cierreCajaId),
      descripcion: asString(r.descripcion),
      categoriaGasto: asString(r.categoriaGasto),
      monto: asNumber(r.monto),
      metodoPago: asString(r.metodoPago),
      comprobante: asString(r.comprobante) || undefined,
    };
  }
};
