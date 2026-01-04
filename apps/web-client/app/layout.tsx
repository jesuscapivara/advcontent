import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LegalAuto - Gerador de Posts",
  description: "Gere posts para Instagram com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <QueryClientProvider>{children}</QueryClientProvider>
      </body>
    </html>
  );
}
