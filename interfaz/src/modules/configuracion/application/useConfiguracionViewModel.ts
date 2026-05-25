import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { configuracionPort } from "../adapters/configuracionRepository";
import type { ConfigField } from "../ports/configuracionPort";

const fallbackFields: ConfigField[] = [
  { key: "nombreComercial", label: "Nombre comercial", value: "RestoConnect Pro", group: "general" },
  { key: "razonSocial", label: "Razon social", value: "", group: "general" },
  { key: "nit", label: "NIT", value: "", group: "general" },
  { key: "telefono", label: "Telefono", value: "", group: "general" },
  { key: "direccion", label: "Direccion", value: "", group: "general" },
  { key: "email", label: "Email", value: "", type: "email", group: "general" },
  { key: "moneda", label: "Moneda", value: "BOB", type: "select", group: "general", options: [{ value: "BOB", label: "Bolivianos (BOB)" }, { value: "USD", label: "Dolares (USD)" }] },
  { key: "porcentajeImpuesto", label: "Impuesto %", value: "13.00", type: "number", group: "general" },
  { key: "pagosQrHabilitado", label: "Pagos QR habilitados", value: "true", type: "toggle", group: "pagosQr" },
  { key: "proveedorQr", label: "Proveedor QR", value: "LOCAL", type: "select", group: "pagosQr", options: [{ value: "LOCAL", label: "Local" }] },
  { key: "qrCuentaTitular", label: "Titular de la cuenta", value: "", group: "cuentaQr" },
  { key: "qrCuentaBanco", label: "Banco receptor", value: "", group: "cuentaQr" },
  { key: "qrCuentaNumero", label: "Numero de cuenta", value: "", group: "cuentaQr" },
  { key: "qrCuentaTipo", label: "Tipo de cuenta", value: "CAJA_DE_AHORRO", type: "select", group: "cuentaQr", options: [{ value: "CAJA_DE_AHORRO", label: "Caja de ahorro" }, { value: "CUENTA_CORRIENTE", label: "Cuenta corriente" }] },
  { key: "qrComercioCodigo", label: "Codigo o alias de comercio", value: "", group: "cuentaQr" }
];

export function useConfiguracionViewModel() {
  return useAsyncViewModel(() => configuracionPort.list(), fallbackFields, []);
}
