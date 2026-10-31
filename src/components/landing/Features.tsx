import { Clock3, Code2, Globe2, MessageSquareText, ShieldCheck, Zap, type LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FEATURES: readonly Feature[] = [
  {
    title: "API e Webhooks em tempo real",
    description: "Envie mensagens e arquivos de mídia e receba eventos instantaneamente por meio de uma API REST robusta.",
    icon: Zap,
  },
  {
    title: "Respostas automáticas inteligentes",
    description: "Configure respostas automáticas baseadas em palavras-chave para automatizar as interações com seus clientes, 24 horas por dia, 7 dias por semana.",
    icon: MessageSquareText,
  },
  {
    title: "Agendamento de mensagens",
    description: "Programe mensagens direcionadas para envio futuro. Ideal para campanhas e lembretes no momento certo.",
    icon: Clock3,
  },
  {
    title: "Segurança e privacidade",
    description: "Arquitetura auto-hospedada para manter seus dados e sessões sob seu controle.",
    icon: ShieldCheck,
  },
  {
    title: "Experiência para desenvolvedores",
    description: "Desenvolvido em TypeScript, com tipagem estrita e documentação completa no Swagger para facilitar sua integração.",
    icon: Code2,
  },
  {
    title: "Gestão de múltiplas sessões",
    description: "Conecte, monitore e gerencie diferentes números de WhatsApp em um único painel centralizado.",
    icon: Globe2,
  },
];

export interface FeaturesProps extends ComponentProps<"section"> {}

export function Features({ className, ...props }: FeaturesProps) {
  return (
    <section
      {...props}
      id="recursos"
      aria-labelledby="features-title"
      className={cn("border-y border-border bg-secondary/30", className)}
    >
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="features-title" className="text-3xl font-bold md:text-5xl">Zuuping: desenvolvido para escalar</h2>
          <p className="mt-4 text-muted-foreground">Recursos pensados para sua operação, reunidos em uma interface intuitiva e de alto desempenho.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40 md:p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-accent text-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold leading-snug">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}