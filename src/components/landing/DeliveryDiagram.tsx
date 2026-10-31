import { Check, MessageCircle } from "lucide-react";

/** Illustrative message flow, not a live connection or delivery status. */
export function DeliveryDiagram() {
  return (
    <figure className="delivery-diagram" aria-label="Exemplo ilustrativo de requisição HTTP e entrega de mensagem">
      <div className="delivery-terminal">
        <div className="mb-3 flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-destructive" />
          <span className="size-2 rounded-full bg-chart-4" />
          <span className="size-2 rounded-full bg-primary" />
        </div>
        <pre className="text-xs leading-relaxed"><code>POST <span className="text-primary">/send-text</span>{'\n{\n  "phone": "<número>",\n  "message": "Olá!"\n}'}</code></pre>
      </div>
      <div className="delivery-connection" aria-hidden="true">
        <span className="connection-line" />
        <span className="connection-icon"><MessageCircle className="size-7 text-primary" /></span>
        <span className="connection-line" />
      </div>
      <div className="delivery-result">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-5" aria-hidden="true" /></span>
        <div><p className="text-sm font-semibold">Mensagem entregue</p><p className="mt-1 text-xs text-muted-foreground">webhook 200</p></div>
      </div>
    </figure>
  );
}