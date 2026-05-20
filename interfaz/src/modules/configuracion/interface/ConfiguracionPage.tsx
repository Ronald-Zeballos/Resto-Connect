import { useEffect, useState } from "react";
import { Building2, ClipboardCheck, Sparkles, WalletCards, X } from "lucide-react";
import { InlineFeedback, ModulePanel, PageHeader } from "../../../shared/ui/primitives";
import { configuracionPort } from "../adapters/configuracionRepository";
import { useConfiguracionViewModel } from "../application/useConfiguracionViewModel";
import type { ConfigField } from "../ports/configuracionPort";

export function ConfiguracionPage() {
  const { data, loading, error } = useConfiguracionViewModel();
  const [values, setValues] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [isBankWindowOpen, setIsBankWindowOpen] = useState(false);

  useEffect(() => {
    setValues(Object.fromEntries(data.map((field) => [field.key, field.value])));
  }, [data]);

  const businessFields = data.filter((field) => field.group === "general");
  const qrFields = data.filter((field) => field.group === "pagosQr");
  const bankFields = data.filter((field) => field.group === "cuentaQr");
  const aiFields = data.filter((field) => field.group === "iaGrok");

  function renderField(field: ConfigField) {
    const value = values[field.key] ?? "";

    if (field.type === "toggle") {
      return (
        <label key={field.key} className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-3">
          <div>
            <span className="block text-sm font-bold">{field.label}</span>
            {field.helperText ? <span className="mt-1 block text-xs text-stone-500">{field.helperText}</span> : null}
          </div>
          <select className="input max-w-[160px]" value={value} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </label>
      );
    }

    if (field.type === "select") {
      return (
        <label key={field.key}>
          <span className="mb-1 block text-sm font-bold">{field.label}</span>
          {field.helperText ? <span className="mb-2 block text-xs text-stone-500">{field.helperText}</span> : null}
          <select className="input" value={value} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}>
            {(field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      );
    }

    const useTextarea = field.key === "grokSystemPrompt";
    const inputType = field.type === "password" ? "password" : field.type === "number" ? "number" : field.type === "email" ? "email" : "text";

    return (
      <label key={field.key} className={useTextarea ? "md:col-span-2" : undefined}>
        <span className="mb-1 block text-sm font-bold">{field.label}</span>
        {field.helperText ? <span className="mb-2 block text-xs text-stone-500">{field.helperText}</span> : null}
        {useTextarea ? (
          <textarea
            className="input min-h-28 resize-y"
            value={value}
            onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
          />
        ) : (
          <input
            className="input"
            type={inputType}
            step={field.type === "number" ? "0.01" : undefined}
            value={value}
            onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
          />
        )}
      </label>
    );
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const fields = await configuracionPort.save(values);
      setValues(Object.fromEntries(fields.map((field) => [field.key, field.value])));
      setNotice("Datos del restaurante guardados.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo guardar la configuracion.");
    } finally {
      setSaving(false);
    }
  }

  const accountConfigured = Boolean(values.qrCuentaTitular || values.qrCuentaBanco || values.qrCuentaNumero);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ajustes del negocio"
        eyebrow="Datos comerciales, fiscales, QR e inteligencia artificial"
        action={<button className="btn-primary rounded-2xl" disabled={saving} onClick={() => void saveSettings()}><ClipboardCheck size={17} /> {saving ? "Guardando..." : "Guardar ajustes"}</button>}
      />
      <InlineFeedback loading={loading} error={error} />
      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}

      <ModulePanel title="Datos del restaurante" port="Configuracion general" description="Manten actualizada la informacion base que usaran caja, reportes y facturacion.">
        <form className="grid gap-4 md:grid-cols-2">
          {businessFields.map(renderField)}
        </form>
      </ModulePanel>

      <ModulePanel
        title="Pagos QR"
        port="Conexion con Pagui"
        description="Configura el proveedor, la URL del servicio y el banco que se usara al generar cobros QR."
        action={<button className="btn-secondary rounded-2xl" type="button" onClick={() => setIsBankWindowOpen(true)}><WalletCards size={16} /> {accountConfigured ? "Editar cuenta bancaria" : "Configurar cuenta bancaria"}</button>}
      >
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-herb" />
              <div>
                <p className="text-sm font-bold text-ink">Cuenta receptora QR</p>
                <p className="text-xs text-stone-500">La vinculacion real se hace en tu banco o proveedor QR; aqui dejamos la referencia operativa del negocio.</p>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-stone-600">
              <p><b>Titular:</b> {values.qrCuentaTitular || "Sin configurar"}</p>
              <p><b>Banco:</b> {values.qrCuentaBanco || "Sin configurar"}</p>
              <p><b>Cuenta:</b> {values.qrCuentaNumero || "Sin configurar"}</p>
            </div>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
            <p className="font-bold text-ink">Como se conecta normalmente</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5">
              <li>Registras tu comercio y cuenta receptora en el proveedor QR o banco.</li>
              <li>Guardas aqui el banco, credenciales de Pagui y la referencia de la cuenta.</li>
              <li>Desde caja generas el QR y el sistema consulta el estado del cobro.</li>
            </ol>
          </div>
        </div>
        <form className="grid gap-4 md:grid-cols-2">
          {qrFields.map(renderField)}
        </form>
      </ModulePanel>

      <ModulePanel title="IA con Grok" port="Analisis asistido" description="La API key de xAI se toma del archivo .env. Aqui ajustas el modelo y la instruccion base para los analisis.">
        <div className="mb-4 rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-tomato" />
            <div>
              <p className="font-bold text-ink">La API key de Grok ahora vive solo en variables de entorno</p>
              <p>Usa `APP_GROK_API_KEY` en tu archivo `.env`. Desde esta pantalla solo definimos el modelo y la instruccion base para el analisis.</p>
            </div>
          </div>
        </div>
        <form className="grid gap-4 md:grid-cols-2">
          {aiFields.map(renderField)}
        </form>
      </ModulePanel>

      {isBankWindowOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-stone-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Cuenta para pagos QR</p>
                <h2 className="mt-2 text-2xl font-black text-ink">Configura la cuenta bancaria receptora</h2>
                <p className="mt-2 text-sm text-stone-500">Esta ventana te deja guardar los datos operativos del banco y del comercio para que el equipo tenga claro donde aterrizan los pagos.</p>
              </div>
              <button className="btn-secondary rounded-2xl" type="button" onClick={() => setIsBankWindowOpen(false)}><X size={16} /> Cerrar</button>
            </div>
            <div className="space-y-5 p-6">
              <form className="grid gap-4 md:grid-cols-2">
                {bankFields.map(renderField)}
              </form>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Si tu banco exige alta previa del comercio, merchant id, token o una app externa, ese paso se hace fuera de RestoConnect. Aqui guardamos la referencia visible y en el panel QR sigues usando el banco y las credenciales del proveedor.
              </div>
              <div className="flex justify-end">
                <button className="btn-primary rounded-2xl" disabled={saving} type="button" onClick={() => { void saveSettings(); setIsBankWindowOpen(false); }}>
                  <ClipboardCheck size={17} /> {saving ? "Guardando..." : "Guardar cuenta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
