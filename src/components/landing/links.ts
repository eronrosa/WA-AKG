/**
 * Central links for the Zuuping landing page — every button points here.
 * To change where a button goes, edit ONLY this file.
 */
export const LINKS = {
  /** Sign-up / free trial (public registration must be enabled in System Settings) */
  signup: "/auth/register",
  /** Dashboard login */
  login: "/auth/login",
  /** API documentation (Swagger UI) */
  docs: "/docs",
  /** Integrations section on this page */
  integrations: "#integracoes",
  /** Partner plan section on this page */
  partners: "#planos",
} as const;
