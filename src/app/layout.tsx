import type { Metadata } from "next";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WalletProvider } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: { default: "GROUND | A real-world side to your wallet", template: "%s | GROUND" },
  description: "Explore real-world asset tokens on Solana, understand what they represent, and build your own allocation blueprint.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth"><body><WalletProvider><a href="#main" className="skip-link">Skip to content</a><Header /><main id="main">{children}</main><Footer /></WalletProvider></body></html>;
}
