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
  { key: "qrCuentaTitular", label: "Titular de la cuenta", value: "", group: "cuentaQr", helperText: "Nombre o razon social de la cuenta receptora." },
  { key: "qrCuentaBanco", label: "Banco receptor", value: "", group: "cuentaQr", helperText: "Banco donde recibiras las acreditaciones QR." },
  { key: "qrCuentaNumero", label: "Numero de cuenta", value: "", group: "cuentaQr", helperText: "Cuenta o identificador principal de abono." },
  { key: "qrCuentaTipo", label: "Tipo de cuenta", value: "CAJA_DE_AHORRO", type: "select", group: "cuentaQr", helperText: "Sirve como referencia operativa para tu equipo.", options: [{ value: "CAJA_DE_AHORRO", label: "Caja de ahorro" }, { value: "CUENTA_CORRIENTE", label: "Cuenta corriente" }] },
  { key: "qrComercioCodigo", label: "Codigo o alias de comercio", value: "", group: "cuentaQr", helperText: "Alias, merchant id o codigo interno del comercio en tu proveedor." },
  // -- NUEVOS CAMPOS DE ADAPTABILIDAD --
  { key: "paginasPorCarta", label: "Paginas del menu QR", value: "1", type: "number", group: "general", helperText: "Numero de paginas del menu digital para clientes." },
  { key: "idiomaDefecto", label: "Idioma por defecto", value: "es", type: "select", group: "general", options: [{ value: "es", label: "Espanol" }, { value: "en", label: "English" }, { value: "pt", label: "Portugues" }] },
  { key: "zonaHoraria", label: "Zona horaria", value: "America/La_Paz", type: "select", group: "general", options: [{ value: "America/La_Paz", label: "America/La Paz" }, { value: "America/Argentina/Buenos_Aires", label: "Argentina" }, { value: "America/Santiago", label: "Chile" }, { value: "America/Lima", label: "Peru" }, { value: "America/Mexico_City", label: "Mexico" }, { value: "America/New_York", label: "US Eastern" }] },
  { key: "formatoFecha", label: "Formato de fecha", value: "DD/MM/YYYY", type: "select", group: "general", options: [{ value: "DD/MM/YYYY", label: "DD/MM/YYYY" }, { value: "MM/DD/YYYY", label: "MM/DD/YYYY" }, { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }] },
  { key: "logoUrl", label: "URL del logo", value: "", type: "text", group: "general", helperText: "URL publica del logo del restaurante para facturas y menu QR." },
  { key: "mensajePieFactura", label: "Mensaje pie de factura", value: "", type: "text", group: "general", helperText: "Texto que aparece al final de las facturas (ej: gracias por su compra)." },
  { key: "tipoServicio", label: "Tipo de servicio", value: "MESA", type: "select", group: "general", options: [{ value: "MESA", label: "Mesa" }, { value: "BALCON", label: "Balcon" }, { value: "BARRA", label: "Barra" }, { value: "DOMICILIO", label: "Domicilio" }, { value: "PARA_LLEVAR", label: "Para llevar" }] },
  { key: "propinaPorcentaje", label: "Propina sugerida (%)", value: "0", type: "number", group: "general", helperText: "Porcentaje de propina sugerido al cliente." },
  { key: "propinaIncluida", label: "Propina incluida", value: "false", type: "toggle", group: "general", helperText: "Si la propina se incluye automaticamente en la cuenta." },
  { key: "inventarioValoracion", label: "Metodo de valoracion", value: "PROMEDIO_PONDERADO", type: "select", group: "general", options: [{ value: "PROMEDIO_PONDERADO", label: "Promedio ponderado" }, { value: "FIFO", label: "FIFO (First In, First Out)" }] },
  { key: "controlarVencimientos", label: "Controlar vencimientos", value: "false", type: "toggle", group: "general", helperText: "Activa alertas de proximos a vencer y lotes vencidos." },
  { key: "controlarLotes", label: "Controlar lotes", value: "false", type: "toggle", group: "general", helperText: "Activa trazabilidad por numero de lote en compras." },
];

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
      const raw = await api.configuracion();
      const fields = fallbackFields.map((field) => ({
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
        qrCuentaTitular: values.qrCuentaTitular ?? "",
        qrCuentaBanco: values.qrCuentaBanco ?? "",
        qrCuentaNumero: values.qrCuentaNumero ?? "",
        qrCuentaTipo: values.qrCuentaTipo ?? "CAJA_DE_AHORRO",
        qrComercioCodigo: values.qrComercioCodigo ?? "",
        paginasPorCarta: Number(values.paginasPorCarta ?? "1"),
        idiomaDefecto: values.idiomaDefecto ?? "es",
        zonaHoraria: values.zonaHoraria ?? "America/La_Paz",
        formatoFecha: values.formatoFecha ?? "DD/MM/YYYY",
        logoUrl: values.logoUrl ?? "",
        mensajePieFactura: values.mensajePieFactura ?? "",
        tipoServicio: values.tipoServicio ?? "MESA",
        propinaPorcentaje: Number(values.propinaPorcentaje ?? "0"),
        propinaIncluida: values.propinaIncluida === "true",
        inventarioValoracion: values.inventarioValoracion ?? "PROMEDIO_PONDERADO",
        controlarVencimientos: values.controlarVencimientos === "true",
        controlarLotes: values.controlarLotes === "true"
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
        qrCuentaTitular: asString(raw.qrCuentaTitular, values.qrCuentaTitular ?? ""),
        qrCuentaBanco: asString(raw.qrCuentaBanco, values.qrCuentaBanco ?? ""),
        qrCuentaNumero: asString(raw.qrCuentaNumero, values.qrCuentaNumero ?? ""),
        qrCuentaTipo: asString(raw.qrCuentaTipo, values.qrCuentaTipo ?? "CAJA_DE_AHORRO"),
        qrComercioCodigo: asString(raw.qrComercioCodigo, values.qrComercioCodigo ?? ""),
        paginasPorCarta: String(raw.paginasPorCarta ?? values.paginasPorCarta ?? "1"),
        idiomaDefecto: asString(raw.idiomaDefecto, values.idiomaDefecto ?? "es"),
        zonaHoraria: asString(raw.zonaHoraria, values.zonaHoraria ?? "America/La_Paz"),
        formatoFecha: asString(raw.formatoFecha, values.formatoFecha ?? "DD/MM/YYYY"),
        logoUrl: asString(raw.logoUrl, values.logoUrl ?? ""),
        mensajePieFactura: asString(raw.mensajePieFactura, values.mensajePieFactura ?? ""),
        tipoServicio: asString(raw.tipoServicio, values.tipoServicio ?? "MESA"),
        propinaPorcentaje: String(raw.propinaPorcentaje ?? values.propinaPorcentaje ?? "0"),
        propinaIncluida: String(Boolean(raw.propinaIncluida ?? values.propinaIncluida === "true")),
        inventarioValoracion: asString(raw.inventarioValoracion, values.inventarioValoracion ?? "PROMEDIO_PONDERADO"),
        controlarVencimientos: String(Boolean(raw.controlarVencimientos ?? values.controlarVencimientos === "true")),
        controlarLotes: String(Boolean(raw.controlarLotes ?? values.controlarLotes === "true"))
      }));
    }, async () => persistFields(toFields(values)));
  }
};
