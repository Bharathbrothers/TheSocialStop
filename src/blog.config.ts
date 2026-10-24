/**
 * The Social Stop - Central Blog Configuration
 * 
 * Edit this file to customize your publication title, tagline, and connect your
 * Google Sheets backend. Once you commit this file to GitHub, EVERY reader visiting
 * your site will automatically load your articles without having to configure anything!
 */

export interface BlogConfig {
  publicationName: string;
  publicationTagline: string;
  authorName: string;
  authorEmail: string;
  authorBio: string;
  authorAvatar: string;
  /**
   * Your deployed Google Apps Script Web App URL.
   * Format: https://script.google.com/macros/s/AKfycbx.../exec
   * When set, all readers automatically fetch your published posts and can leave comments!
   */
  appsScriptUrl: string;
  /**
   * Optional: Your public Google Spreadsheet ID if reading directly.
   */
  spreadsheetId: string;
  /**
   * Local preview author passkey (for testing before connecting Apps Script)
   */
  defaultPasskey: string;
}

export const BLOG_CONFIG: BlogConfig = {
  publicationName: "The Social Stop",
  publicationTagline: "Curated essays, cultural commentary, and ideas at the intersection of technology and society.",
  authorName: "Bharath Sathuri",
  authorEmail: "bharathsathuri@gmail.com",
  authorBio: "Writer, engineer, and editor at The Social Stop.",
  authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
  // You can paste your Google Apps Script URL here or set VITE_APPS_SCRIPT_URL in your environment:
  appsScriptUrl: (import.meta.env.VITE_APPS_SCRIPT_URL as string) || "",
  spreadsheetId: (import.meta.env.VITE_SPREADSHEET_ID as string) || "",
  defaultPasskey: "writer2026"
};
