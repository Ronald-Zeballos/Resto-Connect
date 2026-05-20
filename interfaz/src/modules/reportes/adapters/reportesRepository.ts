import { salesData } from "../../../data/demo";
import { withDemoFallback } from "../../../core/http/httpClient";
import type { ReportesPort } from "../ports/reportesPort";

const fallbackData = {
  sales: salesData,
  paymentMix: [
    { name: "Efectivo", value: 52 },
    { name: "Tarjeta", value: 31 },
    { name: "QR", value: 17 }
  ]
};

export const reportesPort: ReportesPort = {
  async getSnapshot() {
    return withDemoFallback(async () => fallbackData, async () => fallbackData);
  }
};
