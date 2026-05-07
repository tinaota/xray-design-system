import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Design System",
  description: "Mobile X-Ray Operations & Billing Platform — Design System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
