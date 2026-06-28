import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Golding AI Operating System",
  description: "Sprint 1 executive dashboard shell for Golding AI OS.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
