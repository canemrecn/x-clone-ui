export function getClientIP(): string {
    if (typeof window !== "undefined") return "";
    const forwarded = process.env.X_FORWARDED_FOR;
    return forwarded || "::1"; // Geliştirme ortamında ::1, sunucuda gerçek IP
  }
  