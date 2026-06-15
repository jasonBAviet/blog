export function parseUserAgent(ua: string): { os: string; device: string; browser: string } {
  const os =
    /Windows NT 10/.test(ua) ? "Windows 10" :
    /Windows NT 6\.3/.test(ua) ? "Windows 8.1" :
    /Windows NT 6/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /iPhone|iPad/.test(ua) ? "iOS" :
    /Linux/.test(ua) ? "Linux" : "Unknown";

  const device =
    /iPhone|Android.*Mobile/.test(ua) ? "mobile" :
    /iPad|Android(?!.*Mobile)/.test(ua) ? "tablet" :
    "desktop";

  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) && !/Chrome/.test(ua) ? "Safari" : "Unknown";

  return { os, device, browser };
}

const PRIVATE_IP_RE = /^(::1|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

export async function getGeoFromIp(
  ip: string,
  request?: Request
): Promise<{ country?: string; city?: string }> {
  // Vercel injects geo headers automatically — use them when available (no external call needed)
  if (request) {
    const country = request.headers.get("x-vercel-ip-country");
    const city = request.headers.get("x-vercel-ip-city");
    if (country) {
      return {
        country,
        city: city ? decodeURIComponent(city) : undefined,
      };
    }
  }

  if (!ip || PRIVATE_IP_RE.test(ip)) {
    return { country: "Local", city: "Localhost" };
  }

  // Fallback: ip-api.com (free, HTTP only, works on non-Vercel environments)
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: AbortSignal.timeout(2000),
    });
    const data = await res.json();
    if (data.status === "success") {
      return { country: data.country, city: data.city };
    }
  } catch {}
  return {};
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
