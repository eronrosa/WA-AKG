"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

type SessionInfo = { name: string; sessionId: string; status: string };

const ENV_NAMES = {
    url: "ZUUPING_API_URL",
    session: "ZUUPING_SESSION_ID",
    key: "ZUUPING_API_KEY",
    secret: "ZUUPING_WEBHOOK_SECRET",
};

function randomSecret() {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return "whsec_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function copy(text: string, what: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${what} copiado`);
}

function Field({ envName, hint, value, onCopy, children }: { envName: string; hint: string; value: string; onCopy?: () => void; children?: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
                <code className="text-sm font-semibold">{envName}</code>
                <span className="text-xs text-muted-foreground">{hint}</span>
            </div>
            <div className="flex gap-2">
                <Input readOnly value={value} className="font-mono text-sm" />
                <Button type="button" variant="outline" size="icon" onClick={onCopy ?? (() => copy(value, envName))} disabled={!value}>
                    <Copy className="h-4 w-4" />
                </Button>
                {children}
            </div>
        </div>
    );
}

export default function IntegrationPage() {
    const [baseUrl, setBaseUrl] = useState("");
    const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [showKey, setShowKey] = useState(false);
    const [loadingKey, setLoadingKey] = useState(true);
    const [secret, setSecret] = useState("");

    useEffect(() => {
        setBaseUrl(window.location.origin);
        setSecret(randomSecret());
        fetch("/api/sessions")
            .then((r) => r.json())
            .then((j) => setSessions((j.data || []).map((s: any) => ({ name: s.name, sessionId: s.sessionId, status: s.status }))))
            .catch(() => setSessions([]));
        fetch("/api/user/api-key")
            .then((r) => r.json())
            .then((j) => setApiKey(j?.data?.apiKey || null))
            .finally(() => setLoadingKey(false));
    }, []);

    const regenerateKey = async () => {
        if (!confirm("Gerar uma nova chave? A chave atual deixa de funcionar em todas as integrações.")) return;
        const res = await fetch("/api/user/api-key", { method: "POST" });
        const data = await res.json();
        if (data?.data?.apiKey) {
            setApiKey(data.data.apiKey);
            setShowKey(true);
            toast.success("Nova chave gerada. Atualize-a em todos os sistemas.");
        }
    };

    const envBlock = (sessionId: string) =>
        [
            `${ENV_NAMES.url}=${baseUrl}`,
            `${ENV_NAMES.session}=${sessionId}`,
            `${ENV_NAMES.key}=${apiKey ?? ""}`,
            `${ENV_NAMES.secret}=${secret}`,
        ].join("\n");

    const maskedKey = apiKey ? (showKey ? apiKey : apiKey.slice(0, 8) + "•".repeat(20)) : "";
    const firstSession = sessions?.[0]?.sessionId ?? "";

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold">Integração API</h1>
                <p className="text-sm text-muted-foreground">
                    Os 4 dados que qualquer sistema precisa para conectar. Copie cada um para as configurações do sistema, com os mesmos nomes.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da integração</CardTitle>
                    <CardDescription>Use exatamente estes nomes nas configurações do sistema.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Field envName={ENV_NAMES.url} hint="sem barra no final" value={baseUrl} />

                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                            <code className="text-sm font-semibold">{ENV_NAMES.session}</code>
                            <span className="text-xs text-muted-foreground">ID da sessão de WhatsApp</span>
                        </div>
                        {sessions === null ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : sessions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhuma sessão ainda. Crie uma em Sessões e leia o QR code.</p>
                        ) : (
                            <div className="space-y-2">
                                {sessions.map((s) => (
                                    <div key={s.sessionId} className="flex items-center gap-2">
                                        <Input readOnly value={s.sessionId} className="font-mono text-sm" />
                                        <Badge variant={s.status === "CONNECTED" ? "default" : "secondary"}>{s.status}</Badge>
                                        <Button type="button" variant="outline" size="icon" onClick={() => copy(s.sessionId, ENV_NAMES.session)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{s.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                            <code className="text-sm font-semibold">{ENV_NAMES.key}</code>
                            <span className="text-xs text-muted-foreground">começa com wag_</span>
                        </div>
                        {loadingKey ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : apiKey ? (
                            <div className="flex gap-2">
                                <Input readOnly value={maskedKey} className="font-mono text-sm" />
                                <Button type="button" variant="outline" size="icon" onClick={() => setShowKey((v) => !v)}>
                                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button type="button" variant="outline" size="icon" onClick={() => copy(apiKey, ENV_NAMES.key)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="outline" size="icon" onClick={regenerateKey} title="Gerar nova chave">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button type="button" onClick={regenerateKey}>Gerar chave de API</Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                            <code className="text-sm font-semibold">{ENV_NAMES.secret}</code>
                            <span className="text-xs text-muted-foreground">opcional: só se o sistema recebe mensagens</span>
                        </div>
                        <div className="flex gap-2">
                            <Input readOnly value={secret} className="font-mono text-sm" />
                            <Button type="button" variant="outline" size="icon" onClick={() => copy(secret, ENV_NAMES.secret)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="outline" size="icon" onClick={() => setSecret(randomSecret())} title="Gerar outro segredo">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Cole este mesmo valor ao criar o webhook em Webhooks.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Copiar tudo de uma vez</CardTitle>
                    <CardDescription>Cola as 4 variáveis prontas no arquivo de configuração do sistema.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button
                        type="button"
                        disabled={!apiKey || !firstSession}
                        onClick={() => copy(envBlock(firstSession), "As 4 variáveis")}
                    >
                        <Copy className="h-4 w-4 mr-2" /> Copiar as 4 variáveis
                    </Button>
                    {(!apiKey || !firstSession) && (
                        <p className="text-xs text-muted-foreground">Gere a chave e crie uma sessão para liberar esta opção.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Teste rápido</CardTitle>
                    <CardDescription>Cole no terminal para enviar uma mensagem de teste. Troque o número pelo seu.</CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{`curl -X POST "${baseUrl}/api/messages/${firstSession || "SESSAO"}/5511999998888%40s.whatsapp.net/send" \\
  -H "x-api-key: ${apiKey ? (showKey ? apiKey : "wag_...") : "wag_..."}" \\
  -H "Content-Type: application/json" \\
  -d '{"message":{"text":"Teste da integração"}}'`}</pre>
                </CardContent>
            </Card>
        </div>
    );
}
