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
  { key: "proveedorQr", label: "Proveedor QR", value: "PAGUI", type: "select", group: "pagosQr", options: [{ value: "PAGUI", label: "Pagui" }] },
  { key: "paguiBaseUrl", label: "URL del servicio QR", value: "http://localhost:3001", group: "pagosQr" },
  { key: "paguiEmail", label: "Usuario Pagui", value: "admin@pagui.com", type: "email", group: "pagosQr" },
  { key: "paguiPassword", label: "Password Pagui", value: "admin123", type: "password", group: "pagosQr" },
  { key: "paguiBankId", label: "Banco QR", value: "1", type: "select", group: "pagosQr", options: [{ value: "1", label: "Banco Economico" }] },
  { key: "qrCuentaTitular", label: "Titular de la cuenta", value: "", group: "cuentaQr" },
  { key: "qrCuentaBanco", label: "Banco receptor", value: "", group: "cuentaQr" },
  { key: "qrCuentaNumero", label: "Numero de cuenta", value: "", group: "cuentaQr" },
  { key: "qrCuentaTipo", label: "Tipo de cuenta", value: "CAJA_DE_AHORRO", type: "select", group: "cuentaQr", options: [{ value: "CAJA_DE_AHORRO", label: "Caja de ahorro" }, { value: "CUENTA_CORRIENTE", label: "Cuenta corriente" }] },
  { key: "qrComercioCodigo", label: "Codigo o alias de comercio", value: "", group: "cuentaQr" },
  { key: "grokModelo", label: "Modelo de Grok", value: "grok-4.20-reasoning", group: "iaGrok" },
  { key: "grokSystemPrompt", label: "Instruccion base para IA", value: "Eres un analista de operaciones para restaurantes. Resume hallazgos, riesgos y acciones concretas.", group: "iaGrok" }
];

export function useConfiguracionViewModel() {
  return useAsyncViewModel(() => configuracionPort.list(), fallbackFields, []);
}
