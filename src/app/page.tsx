import type { Metadata } from "next";
import { Header, Hero } from "@/components/landing/Hero";
import { Personas, Flow, UseCases, Integrations, Compare, Pricing } from "@/components/landing/Sections";
import { Faq, FinalCta } from "@/components/landing/Faq";
import { Features } from "@/components/landing/Features";
import "./landing.css";

const TITLE = "Zuuping — API REST de Mensageria nº 1 do Brasil";
const DESC = "Conecte seu software à API REST de mensageria com +100 mil clientes, suporte nacional e integração plug & play.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  openGraph: { title: TITLE, description: DESC, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export default function Home() {
  return (
    <main className="zuuping-landing min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Personas />
      <Flow />
      <Features />
      <UseCases />
      <Integrations />
      <Compare />
      <Pricing />
      <Faq />
      <FinalCta />
    </main>
  );
}
