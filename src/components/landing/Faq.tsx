import { LINKS } from "@/components/landing/links";
import { Button } from "@/components/ui/button";

const FAQ: [string, string][] = [
  ["Qual a diferença entre o Zuuping e a API oficial?", "A API oficial exige aprovação de templates e cobra por conversa. O Zuuping foca em integração rápida, preço fixo e sem fila de aprovação."],
  ["Quanto tempo leva para integrar?", "Minutos para o primeiro envio e poucos dias para um cenário completo. Há REST, Webhooks, Postman, Swagger e SDKs."],
  ["Preciso de um número de celular novo?", "Não obrigatoriamente. Recomendamos um número exclusivo para automação, separado do pessoal."],
  ["Funciona para alto volume de mensagens?", "Sim. Fila inteligente, retry e infraestrutura dimensionada para volume."],
  ["Consigo integrar com n8n, Make, CRM e ERP?", "Sim. Nodes para n8n e Make, conectores Zapier e endpoints REST genéricos."],
  ["O que acontece se minha instância cair?", "Você recebe alerta automático via Webhook e dashboard, e o suporte nacional atua rapidamente."],
  ["Posso usar para múltiplos clientes?", "Sim, pelo programa Partner: 10+ instâncias com painel unificado e condições por volume."],
  ["Como funciona o teste grátis?", "São 2 dias, sem cartão de crédito e sem renovação automática."],
];

export function Faq() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20">
      <h2 className="text-center text-3xl font-bold md:text-5xl">Perguntas frequentes</h2>
      <div className="mt-10 space-y-3">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group rounded-2xl border border-border bg-card px-6 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold focus-visible:outline-2 focus-visible:outline-ring">{q}<span aria-hidden="true" className="shrink-0 text-2xl text-primary transition group-open:rotate-45">+</span></summary>
            <p className="mt-3 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="border-t border-border bg-secondary/30 px-4 pb-12">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold md:text-5xl">Pronto para conectar seu sistema ao Zuuping?</h2>
        <p className="mt-4 text-muted-foreground">2 dias grátis. Sem cartão de crédito. Sem complicação.</p>
        <Button asChild className="mt-8 h-[52px] rounded-full px-8 font-semibold"><a href={LINKS.signup}>Começar teste grátis</a></Button>
      </div>
      <footer className="mx-auto max-w-6xl border-t border-border pt-8 text-center text-sm text-muted-foreground">© 2026 Zuuping. Todos os direitos reservados.</footer>
    </section>
  );
}
