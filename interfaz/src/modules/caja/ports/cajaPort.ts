import type { CajaGasto, CierreCaja } from "../../../types";

export type CajaSnapshot = {
  abierto: CierreCaja | null;
  historial: CierreCaja[];
};

export type CajaPort = {
  getSnapshot: () => Promise<CajaSnapshot>;
  abrir: (saldoInicial: number) => Promise<CierreCaja>;
  cerrar: (id: string, saldoRealDeclarado: number, observaciones?: string) => Promise<CierreCaja>;
  registrarGasto: (cierreId: string, payload: {
    descripcion: string;
    categoriaGasto: string;
    monto: number;
    metodoPago?: string;
    comprobante?: string;
  }) => Promise<CajaGasto>;
};
