import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bright CRM",
  description: "Open source CRM for leads, contacts, accounts, and deals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
