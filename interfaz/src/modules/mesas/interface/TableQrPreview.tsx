import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { SafeImage } from "../../../shared/ui/primitives";

export function TableQrPreview({ value, alt }: { value: string; alt: string }) {
  const [src, setSrc] = useState<string>("/images/qr-table.png");

  useEffect(() => {
    let alive = true;

    QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 160,
      color: {
        dark: "#16211a",
        light: "#ffffff"
      }
    }).then((dataUrl) => {
      if (alive) setSrc(dataUrl);
    }).catch(() => {
      if (alive) setSrc("/images/qr-table.png");
    });

    return () => {
      alive = false;
    };
  }, [value]);

  return <SafeImage className="mx-auto mb-4 h-32 w-32 rounded-2xl border border-stone-200 bg-white p-2" src={src} alt={alt} fallback="/images/qr-table.png" />;
}
