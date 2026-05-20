const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const EXTERNAL_SOURCE = /^(?:https?:|data:|blob:)/i;
const BACKEND_PATH = /^(?:\/)?(?:uploads|storage|files)\//i;
const FILE_REFERENCE = /\.[a-z0-9]+(?:\?.*)?$/i;

export function resolveImageSrc(source?: string | null, fallback = "/images/restaurant-hero.png") {
  const candidate = source?.trim() ?? "";

  if (!candidate) return fallback;
  if (EXTERNAL_SOURCE.test(candidate)) return candidate;
  if (candidate.startsWith("/images/")) return candidate;
  if (candidate.startsWith("images/")) return `/${candidate}`;
  if (BACKEND_PATH.test(candidate)) return new URL(candidate.replace(/^\//, ""), `${API_BASE_URL}/`).toString();
  if (candidate.startsWith("/")) return candidate;
  if (candidate.includes("/") || FILE_REFERENCE.test(candidate)) {
    return new URL(candidate.replace(/^\.\//, ""), `${API_BASE_URL}/`).toString();
  }
  return fallback;
}
