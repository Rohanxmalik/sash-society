import type { Metadata } from "next";
import { Radio_Canada, Radio_Canada_Big, Pathway_Gothic_One } from "next/font/google";
import "./globals.css";
import { Header } from "@/frontend/components/layout/header";
import { Footer } from "@/frontend/components/layout/footer";
import { Preloader } from "@/frontend/components/ui/preloader";

const radioCanada = Radio_Canada({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const radioCanadaBig = Radio_Canada_Big({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const pathwayGothicOne = Pathway_Gothic_One({
  variable: "--font-accent",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "South Asian Sociological Society (SASS)",
    template: "%s | SASS",
  },
  description:
    "Promoting excellence in research and academics. SASS enhances research collaboration through meaningful academic exchange, conferences, workshops, and scholarly publications.",
  keywords: [
    "sociology",
    "south asia",
    "academic society",
    "research",
    "conferences",
    "sociological society",
  ],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${radioCanada.variable} ${radioCanadaBig.variable} ${pathwayGothicOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Preloader />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
