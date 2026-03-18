import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sensei.sh"),
  title: "Sensei — AI Agent Qualification Engine",
  description:
    "The open-source qualification engine for AI agents. Test. Evaluate. Certify.",
  openGraph: {
    title: "Sensei — AI Agent Qualification Engine",
    description:
      "Test. Evaluate. Certify. Before you hire an agent, ask the Sensei.",
    type: "website",
    siteName: "Sensei",
    url: "https://sensei.sh",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sensei — AI Agent Qualification Engine",
    description:
      "Test. Evaluate. Certify. Before you hire an agent, ask the Sensei.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
