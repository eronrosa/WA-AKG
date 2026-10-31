"use client";

import { Check, X, ArrowRight, Code2, Layers, Server, Headphones } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LINKS } from "@/components/landing/links";

const PERSONAS = [
  { t: "Desenvolvedores", d: "Integre de forma simples e rápida via API REST.", icon: Code2 },
  { t: "Software houses", d: "Ganhe escala e agilidade nas integrações de seus clientes.", icon: Layers },
  { t: "SaaS, ERP e CRM", d: "Adicione mensageria ao seu produto com estabilidade e suporte nacional.", icon: Server },
  { t: "Atendimento e CX", d: "Automatize, centralize e escale a comunicação com seus clientes.", icon: Headphones },
];

export function Personas() {
  return (
    <section id="solucao" className="site-container audience-section pb-16 pt-10 md:pb-20 md:pt-12">
      <h2 className="text-3xl font-bold md:text-4xl">Para quem a Zuuping é indicada?</h2>
      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PERSONAS.map(({ t, d, icon: Icon }) => (
          <Button asChild key={t} variant="outline" className="audience-card group h-auto min-h-[188px] whitespace-normal rounded-2xl bg-card px-7 py-6 text-left">
            <a href={LINKS.signup}>
              <Icon className="mb-3 size-7 text-primary" aria-hidden="true" />
              <h3 className="text-lg font-bold text-foreground">{t}</h3>
              <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">{d}</p>
            </a>
          </Button>
        ))}
      </div>
    </section>
  );
}

const STATS = [["+100 mil", "Clientes"], ["99.98%", "Uptime médio"], ["38ms", "Latência por envio"], ["2 min", "Primeira mensagem"]];
const EVENTS = ["order.created", "cart.abandoned", "payment.due", "support.reply"];

export function Flow() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h2 className="text-3xl font-bold md:text-5xl">Em produção, em menos<br />de uma chamada HTTP</h2>
      <p className="mt-4 text-muted-foreground">Seu sistema envia, o Zuuping entrega, o cliente responde.<br />Webhooks em tempo real fecham o ciclo.</p>
      <div className="mt-12 grid grid-cols-1 gap-4 text-left md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs tracking-widest text-muted-foreground">SEU SISTEMA</p>
          <p className="mb-4 font-semibold">CRM / ERP / SaaS</p>
          {EVENTS.map((e) => <p key={e} className="mb-2 rounded-lg bg-secondary px-3 py-2 font-mono text-xs"><span className="text-primary">POST</span> {e}</p>)}
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/40 bg-card bg-glow p-6 text-center">
          <span className="text-4xl font-extrabold"><span className="text-primary">Zuu</span>ping</span>
          <p className="mt-2 text-sm text-muted-foreground">Gateway de mensagens</p>
          <div className="mt-4 flex gap-2 font-mono text-xs">{["queue", "retry", "38ms"].map((x) => <span key={x} className="rounded-full border border-border px-2 py-1">{x}</span>)}</div>
          <p className="mt-3 text-xs text-primary">99.98% uptime</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs tracking-widest text-muted-foreground">MENSAGENS</p>
          <p className="mb-4 font-semibold">Conversa entregue</p>
          <p className="ml-auto mb-2 w-fit rounded-xl bg-accent px-3 py-2 text-sm">Seu pedido #A8721 foi confirmado ✓<span className="block text-[10px] text-muted-foreground">12:43 • entregue</span></p>
          <p className="w-fit rounded-xl bg-secondary px-3 py-2 text-sm">Obrigado! Quando chega?<span className="block text-[10px] text-muted-foreground">12:43</span></p>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {STATS.map(([v, l]) => <div key={l}><p className="text-3xl font-bold text-primary md:text-4xl">{v}</p><p className="text-sm text-muted-foreground">{l}</p></div>)}
      </div>
    </section>
  );
}

const USES = [
  { n: "01 / Vendas", t: "Vendas e conversão", d: "Construa fluxos de captação de leads, recuperação de carrinho abandonado, envio de catálogo, cupons e ofertas segmentadas.", i: ["Captação de leads", "Recuperação de carrinho abandonado", "Envio de catálogo", "Cupons e ofertas segmentadas"] },
  { n: "02 / CX", t: "Atendimento e CX", d: "SAC automatizado, múltiplos agentes no mesmo número, chatbot, pesquisa NPS e avaliação pós-atendimento.", i: ["SAC automatizado", "Múltiplos agentes no mesmo número", "Chatbot integrado", "Pesquisa NPS"] },
  { n: "03 / Operações", t: "Operações e notificações", d: "Dispare confirmações de pedido, tracking de entrega, cobranças, lembretes e agendamentos direto na conversa.", i: ["Confirmação de pedido", "Tracking de entrega", "Cobranças e lembretes", "Agendamentos"] },
  { n: "04 / Produto", t: "Produto e integrações", d: "Conecte seu sistema via REST e Webhooks. Compatível com CRM, ERP, n8n, Make, Zapier e qualquer stack HTTP.", i: ["REST e Webhooks", "CRM, ERP e plataformas", "n8n, Make e Zapier", "Qualquer stack via HTTP"] },
];

export function UseCases() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="max-w-3xl text-3xl font-bold md:text-5xl">O que empresas e desenvolvedores constroem com a API REST de mensageria do Zuuping</h2>
      <p className="mt-4 text-muted-foreground">Veja casos reais de uso para vendas, atendimento, operações, notificações e integrações.</p>
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {USES.map((u) => (
          <article key={u.n} className="rounded-3xl border border-border bg-card p-8">
            <p className="font-mono text-xs text-primary">{u.n}</p>
            <h3 className="mt-2 text-2xl font-bold">{u.t}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{u.d}</p>
            <ul className="mt-5 space-y-2">{u.i.map((x) => <li key={x} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{x}</li>)}</ul>
          </article>
        ))}
      </div>
    </section>
  );
}

const TOOLS = ["n8n", "Make", "Zapier", "HubSpot", "RD Station", "Bling", "Shopify", "WooCommerce", "Pipedrive", "Omie"];

export function Integrations() {
  return (
    <section id="integracoes" className="overflow-hidden py-20 text-center">
      <h2 className="px-4 text-3xl font-bold md:text-5xl">Funciona com tudo que sua stack precisa</h2>
      <p className="mt-4 px-4 text-muted-foreground">REST e Webhooks plugam em mais de 100 ferramentas — CRMs, ERPs, e-commerces e automações no-code.</p>
      <div className="mt-10 flex w-max animate-marquee gap-4">
        {[...TOOLS, ...TOOLS].map((t, i) => <span key={`${t}-${i}`} className="rounded-2xl border border-border bg-card px-8 py-5 font-semibold">{t}</span>)}
      </div>
      <a href={LINKS.integrations} className="mt-10 inline-block rounded-full border border-border px-6 py-3 text-sm font-semibold">Ver todas as integrações</a>
    </section>
  );
}

const BAD = ["API caindo no pior momento", "Suporte que some", "Retrabalho constante para manter integração", "Custo oculto com servidor e falhas", "Medo de fechar contratos maiores", "Roadmap travado"];
const GOOD = ["Estabilidade para operar em produção", "Time técnico nacional disponível", "Infraestrutura pronta, você foca no produto", "Preço fixo, sem surpresa no boleto", "Escala com previsibilidade", "Mensageria nativa em dias, não meses"];

export function Compare() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h2 className="text-3xl font-bold md:text-5xl">O que muda quando você para de improvisar na mensageria?</h2>
      <div className="mt-10 grid grid-cols-1 gap-4 text-left md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-8"><h3 className="mb-5 text-xl font-bold text-muted-foreground">API qualquer</h3>{BAD.map((b) => <p key={b} className="mb-3 flex gap-2 text-sm text-muted-foreground"><X className="h-4 w-4 text-destructive" />{b}</p>)}</div>
        <div className="rounded-3xl border border-primary/50 bg-card bg-glow p-8"><h3 className="mb-5 text-xl font-bold text-primary">Com Zuuping</h3>{GOOD.map((b) => <p key={b} className="mb-3 flex gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{b}</p>)}</div>
      </div>
      <a href={LINKS.signup} className="mt-10 inline-block rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground shadow-glow">Começar teste grátis por 2 dias</a>
    </section>
  );
}

const STEPS = [10, 50, 100, 200, 500, 1000, 2000];
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [idx, setIdx] = useState(0);
  const qty = STEPS[idx] ?? 10;
  return (
    <section id="planos" className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-center text-3xl font-bold md:text-5xl">Escolha o plano certo para o seu momento</h2>
      <p className="mt-4 text-center text-muted-foreground">Sem letras miúdas, sem custo por mensagem.</p>
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative rounded-3xl border border-primary/50 bg-card p-8">
          <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Mais escolhido</span>
          <h3 className="text-xl font-bold">Plano Ultimate</h3>
          <p className="mt-3 text-4xl font-bold">R$ 99,99<span className="text-sm font-normal text-muted-foreground">/mês por instância</span></p>
          <div className="mt-5 inline-flex rounded-full border border-border p-1 text-sm">
            {["Mensal", "Anual"].map((m, i) => (
               <Button key={m} variant={annual === (i === 1) ? "default" : "ghost"} aria-pressed={annual === (i === 1)} onClick={() => setAnnual(i === 1)} className="h-8 rounded-full px-4">{m}{i === 1 && " · 10% OFF"}</Button>
            ))}
          </div>
          {annual && <p className="mt-3 text-sm text-muted-foreground">Pagamento único anual: <b className="text-foreground">R$ 1.079,89</b></p>}
          <ul className="mt-6 space-y-2">{["Sem limite de mensagens", "Arquivos até 100MB", "Fila de mensagens", "Webhooks em tempo real", "Suporte técnico nacional"].map((x) => <li key={x} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{x}</li>)}</ul>
          <a href={LINKS.signup} className="mt-8 block rounded-full bg-primary py-4 text-center font-semibold text-primary-foreground">Começar agora com 2 dias grátis</a>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8">
          <h3 className="text-xl font-bold">Plano Partner</h3>
          <p className="mt-3 text-4xl font-bold">R$ 89,99<span className="text-sm font-normal text-muted-foreground">/mês por instância</span></p>
          <p className="mt-5 text-sm">Quantas instâncias? <b className="text-primary">{qty.toLocaleString("pt-BR")}</b></p>
          <input aria-label="Instâncias" type="range" min={0} max={STEPS.length - 1} value={idx} onChange={(e) => setIdx(Number(e.target.value))} className="mt-2 w-full accent-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Total mensal estimado <b className="text-foreground">{brl(qty * 89.99)}</b></p>
          <ul className="mt-6 space-y-2">{["Tudo do Plano Ultimate", "API de gestão de instâncias", "Faturamento pós-pago"].map((x) => <li key={x} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{x}</li>)}</ul>
          <a href={LINKS.partners} className="mt-8 block rounded-full border border-border py-4 text-center font-semibold">Conhecer o Programa Partner</a>
        </div>
      </div>
    </section>
  );
}
