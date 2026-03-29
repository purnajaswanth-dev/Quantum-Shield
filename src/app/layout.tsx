import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/animations/ParticleBackground";
import GlowCursor from "@/components/animations/GlowCursor";
import ParallaxBackground from "@/components/layout/ParallaxBackground";

export const metadata: Metadata = {
  title: "QuantumShield – Post-Quantum Secure Messaging Platform",
  description: "Experience the future of encryption. See why RSA fails against quantum computers and how CRYSTALS-Kyber keeps your data safe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className="text-[#e2e8f0]"
        style={{ 
          background: 'var(--bg-primary)', 
          minHeight: '100vh',
          perspective: 'var(--perspective)',
        }}
      >
        <div className="mesh-gradient-premium" />
        <ParallaxBackground />

        <GlowCursor />
        <ParticleBackground />
        <Navbar />
        <main style={{ position: 'relative', zIndex: 1, paddingTop: '100px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
