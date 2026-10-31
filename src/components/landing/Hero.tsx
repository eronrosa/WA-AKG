"use client";

import { ArrowRight, ChevronDown, Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeliveryDiagram } from "@/components/landing/DeliveryDiagram";
import { LINKS } from "@/components/landing/links";
import { cn } from "@/lib/utils";

const NAV = ["Solução", "Zuuping Omni", "Desenvolvedor", "Partners", "Planos", "Integrações", "Blog"];

// Where each menu item goes; items without a page yet stay on "#"
const NAV_HREF: Record<string, string> = {
  "Solução": "#solucao",
  "Zuuping Omni": "#recursos",
  "Desenvolvedor": LINKS.docs,
  "Partners": LINKS.partners,
  "Planos": "#planos",
  "Integrações": LINKS.integrations,
};

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header sticky top-0 z-50 bg-background/90 backdrop-blur-md">
      <div className="site-container flex h-[72px] items-center justify-between gap-4">
        <a href="/" aria-label="Zuuping — início" className="text-2xl font-extrabold text-foreground">
          <span className="text-primary">Zuu</span>ping
        </a>
        <nav aria-label="Principal" className="hidden items-center gap-5 xl:flex">
          {NAV.map((n) => (
            <a key={n} href={NAV_HREF[n] ?? "#"} className={cn("flex items-center gap-1 whitespace-nowrap text-xs transition-colors hover:text-foreground", n === "Zuuping Omni" ? "font-medium text-primary" : "text-muted-foreground")}>
              {n}
              {(n === "Solução" || n === "Desenvolvedor") && <ChevronDown className="h-3.5 w-3.5" />}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-2 text-xs md:flex">
            <Globe className="h-4 w-4 text-primary" /> PT <ChevronDown className="h-3 w-3" />
          </span>
          <a href={LINKS.login} className="hidden text-sm md:block">Entrar</a>
          <Button asChild className="h-10 rounded-full px-5 font-semibold"><a href={LINKS.signup}>Começar Grátis</a></Button>
          <Button variant="ghost" size="icon" className="xl:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-navigation" aria-label="Menu móvel" className="site-container grid gap-1 border-t border-border py-4 xl:hidden">
        {NAV.map((n) => <Button asChild key={n} variant="ghost" className={cn("justify-start", n === "Zuuping Omni" && "text-primary")}><a href={NAV_HREF[n] ?? "#"} onClick={() => setMenuOpen(false)}>{n}</a></Button>)}
        <Button asChild variant="ghost" className="justify-start"><a href={LINKS.login}>Entrar</a></Button>
        <span className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground"><Globe className="size-4 text-primary" /> PT</span>
      </nav>}
    </header>
  );
}

export function Hero() {
  return (
    <section className="premium-hero relative overflow-hidden">
      <div className="hero-plane hero-plane-left" aria-hidden="true" />
      <div className="hero-plane hero-plane-right" aria-hidden="true" />
      <div className="site-container relative pt-10 text-center md:pt-11">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[11px] font-medium">
          <span className="size-2 rounded-full bg-primary" aria-hidden="true" /> API REST DE MENSAGERIA
        </div>
        <div className="relative text-center">
          <h1 className="hero-title mx-auto max-w-5xl font-bold">
            Conecte seu software<br className="hidden sm:block" />{" "}à API REST de Mensageria<br className="hidden sm:block" />{" "}
            <span className="text-primary">número 1 do Brasil.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            +100 mil clientes. Menos complexidade, suporte nacional e integração plug &amp; play.
          </p>
          <div className="mx-auto mt-7 flex max-w-lg flex-col justify-center gap-3 sm:flex-row sm:gap-5">
            <Button asChild className="h-[52px] rounded-full px-8 text-sm font-semibold"><a href={LINKS.signup}>Começar teste grátis <ArrowRight /></a></Button>
            <Button asChild variant="outline" className="h-[52px] rounded-full bg-transparent px-8 text-sm font-semibold"><a href={LINKS.docs} target="_blank" rel="noreferrer">Ver documentação</a></Button>
          </div>
        </div>
        <DeliveryDiagram />
      </div>
    </section>
  );
}
