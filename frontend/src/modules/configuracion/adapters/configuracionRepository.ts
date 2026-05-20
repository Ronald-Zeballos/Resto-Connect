import { api, asString, withDemoFallback } from "../../../core/http/httpClient";
import type { ConfigField, ConfiguracionPort } from "../ports/configuracionPort";

const STORAGE_KEY = "restoconnect-settings";

const fallbackFields: ConfigField[] = [
  { key: "nombreComercial", label: "Nombre comercial", value: "RestoConnect Pro", group: "general" },
  { key: "razonSocial", label: "Razon social", value: "", group: "general" },
  { key: "nit", label: "NIT", value: "", group: "general" },
  { key: "telefono", label: "Telefono", value: "", group: "general" },
  { key: "direccion", label: "Direccion", value: "", group: "general" },
  { key: "email", label: "Email", value: "", type: "email", group: "general" },
  { key: "moneda", label: "Moneda", value: "BOB", type: "select", group: "general", options: [{ value: "BOB", label: "Bolivianos (BOB)" }, { value: "USD", label: "Dolares (USD)" }] },
  { key: "porcentajeImpuesto", label: "Impuesto %", value: "13.00", type: "number", group: "general" },
  { key: "pagosQrHabilitado", label: "Pagos QR habilitados", value: "true", type: "toggle", group: "pagosQr", helperText: "Activa o desactiva la generacion de cobros QR desde caja." },
  { key: "proveedorQr", label: "Proveedor QR", value: "PAGUI", type: "select", group: "pagosQr", options: [{ value: "PAGUI", label: "Pagui" }] },
  { key: "paguiBaseUrl", label: "URL del servicio QR", value: "http://localhost:3001", group: "pagosQr", helperText: "Endpoint del backend de tu proveedor QR interoperable." },
  { key: "paguiEmail", label: "Usuario Pagui", value: "admin@pagui.com", type: "email", group: "pagosQr", helperText: "Credencial de acceso al proveedor QR." },
  { key: "paguiPassword", label: "Password Pagui", value: "admin123", type: "password", group: "pagosQr", helperText: "Se usa para autenticar la generacion y consulta de QRs." },
  { key: "paguiBankId", label: "Banco QR", value: "1", type: "select", group: "pagosQr", helperText: "Banco que el proveedor usara al emitir el QR.", options: [{ value: "1", label: "Banco Economico" }] },
  { key: "qrCuentaTitular", label: "Titular de la cuenta", value: "", group: "cuentaQr", helperText: "Nombre o razon social de la cuenta receptora." },
  { key: "qrCuentaBanco", label: "Banco receptor", value: "", group: "cuentaQr", helperText: "Banco donde recibiras las acreditaciones QR." },
  { key: "qrCuentaNumero", label: "Numero de cuenta", value: "", group: "cuentaQr", helperText: "Cuenta o identificador principal de abono." },
  { key: "qrCuentaTipo", label: "Tipo de cuenta", value: "CAJA_DE_AHORRO", type: "select", group: "cuentaQr", helperText: "Sirve como referencia operativa para tu equipo.", options: [{ value: "CAJA_DE_AHORRO", label: "Caja de ahorro" }, { value: "CUENTA_CORRIENTE", label: "Cuenta corriente" }] },
  { key: "qrComercioCodigo", label: "Codigo o alias de comercio", value: "", group: "cuentaQr", helperText: "Alias, merchant id o codigo interno del comercio en tu proveedor." },
  { key: "grokModelo", label: "Modelo de Grok", value: "grok-4.20-reasoning", group: "iaGrok", helperText: "Modelo por defecto para el analisis asistido." },
  { key: "grokSystemPrompt", label: "Instruccion base para IA", value: "Eres un analista de operaciones para restaurantes. Resume hallazgos, riesgos y acciones concretas.", group: "iaGrok", helperText: "Contexto fijo que la app enviara junto a cada analisis." }
];

function applyBankOptions(fields: ConfigField[], banks: Array<Record<string, unknown>>) {
  const options = banks.map((bank) => ({
    value: String(bank.id ?? ""),
    label: asString(bank.nombre, `Banco ${bank.id ?? ""}`)
  })).filter((option) => option.value);

  if (!options.length) {
    return fields;
  }

  return fields.map((field) => field.key === "paguiBankId"
    ? { ...field, options }
    : field);
}

function toFields(source: Record<string, string>) {
  return fallbackFields.map((field) => ({
    ...field,
    value: source[field.key] ?? field.value
  }));
}

function readCachedSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Record<string, string> : null;
  } catch {
    return null;
  }
}

function persistFields(fields: ConfigField[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(fields.map((field) => [field.key, field.value]))));
  return fields;
}

export const configuracionPort: ConfiguracionPort = {
  async list() {
    return withDemoFallback(async () => {
      const [raw, banks] = await Promise.all([api.configuracion(), api.bancosQr()]);
      const fields = applyBankOptions(fallbackFields, banks).map((field) => ({
        ...field,
        value: field.type === "toggle"
          ? String(Boolean(raw[field.key] ?? field.value === "true"))
          : asString(raw[field.key], field.value)
      }));
      return persistFields(fields);
    }, async () => persistFields(toFields(readCachedSettings() ?? Object.fromEntries(fallbackFields.map((field) => [field.key, field.value])))));
  },
  async save(values) {
    return withDemoFallback(async () => {
      const raw = await api.guardarConfiguracion({
        nombreComercial: values.nombreComercial ?? "",
        razonSocial: values.razonSocial ?? "",
        nit: values.nit ?? "",
        telefono: values.telefono ?? "",
        direccion: values.direccion ?? "",
        email: values.email ?? "",
        moneda: values.moneda ?? "BOB",
        porcentajeImpuesto: Number(values.porcentajeImpuesto ?? "0"),
        pagosQrHabilitado: values.pagosQrHabilitado === "true",
        proveedorQr: values.proveedorQr ?? "PAGUI",
        paguiBaseUrl: values.paguiBaseUrl ?? "",
        paguiEmail: values.paguiEmail ?? "",
        paguiPassword: values.paguiPassword ?? "",
        paguiBankId: Number(values.paguiBankId ?? "1"),
        qrCuentaTitular: values.qrCuentaTitular ?? "",
        qrCuentaBanco: values.qrCuentaBanco ?? "",
        qrCuentaNumero: values.qrCuentaNumero ?? "",
        qrCuentaTipo: values.qrCuentaTipo ?? "CAJA_DE_AHORRO",
        qrComercioCodigo: values.qrComercioCodigo ?? "",
        grokModelo: values.grokModelo ?? "grok-4.20-reasoning",
        grokSystemPrompt: values.grokSystemPrompt ?? ""
      });

      return persistFields(toFields({
        nombreComercial: asString(raw.nombreComercial, values.nombreComercial ?? ""),
        razonSocial: asString(raw.razonSocial, values.razonSocial ?? ""),
        nit: asString(raw.nit, values.nit ?? ""),
        telefono: asString(raw.telefono, values.telefono ?? ""),
        direccion: asString(raw.direccion, values.direccion ?? ""),
        email: asString(raw.email, values.email ?? ""),
        moneda: asString(raw.moneda, values.moneda ?? "BOB"),
        porcentajeImpuesto: String(raw.porcentajeImpuesto ?? values.porcentajeImpuesto ?? "0"),
        pagosQrHabilitado: String(Boolean(raw.pagosQrHabilitado ?? values.pagosQrHabilitado === "true")),
        proveedorQr: asString(raw.proveedorQr, values.proveedorQr ?? "PAGUI"),
        paguiBaseUrl: asString(raw.paguiBaseUrl, values.paguiBaseUrl ?? ""),
        paguiEmail: asString(raw.paguiEmail, values.paguiEmail ?? ""),
        paguiPassword: asString(raw.paguiPassword, values.paguiPassword ?? ""),
        paguiBankId: String(raw.paguiBankId ?? values.paguiBankId ?? "1"),
        qrCuentaTitular: asString(raw.qrCuentaTitular, values.qrCuentaTitular ?? ""),
        qrCuentaBanco: asString(raw.qrCuentaBanco, values.qrCuentaBanco ?? ""),
        qrCuentaNumero: asString(raw.qrCuentaNumero, values.qrCuentaNumero ?? ""),
        qrCuentaTipo: asString(raw.qrCuentaTipo, values.qrCuentaTipo ?? "CAJA_DE_AHORRO"),
        qrComercioCodigo: asString(raw.qrComercioCodigo, values.qrComercioCodigo ?? ""),
        grokModelo: asString(raw.grokModelo, values.grokModelo ?? "grok-4.20-reasoning"),
        grokSystemPrompt: asString(raw.grokSystemPrompt, values.grokSystemPrompt ?? "")
      }));
    }, async () => persistFields(toFields(values)));
  }
};
