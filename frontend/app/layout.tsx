import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoPratle - Event Requirement Flow",
  description: "Multi-step requirement posting flow for Event Planners, Performers, and Crew",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}

