import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CopilotKit Workbench - A2A Agent Registry",
  description: "Test your A2A agents with CopilotKit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
