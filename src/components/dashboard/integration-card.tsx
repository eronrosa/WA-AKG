"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, KeyRound, Plug, RefreshCw, Loader2 } from "lucide-react";

interface IntegrationCardProps {
    sessionId: string;
    sessionName?: string;
    apiKey: string | null;
    onGenerateKey: () => void;
    onWebhookCreated: () => void;
}

/**
 * One place with everything an external platform asks for:
 * API URL, session ID, API key, and the webhook (URL + secret) registration.
 */
export function IntegrationCard({ sessionId, sessionName, apiKey, onGenerateKey, onWebhookCreated }: IntegrationCardProps) {
    const t = useTranslations("webhooks.integration");
    const tCommon = useTranslations("common");
    const [apiUrl, setApiUrl] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setApiUrl(`${window.location.origin}/api`);
    }, []);

    const copy = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(tCommon("copied"));
    };

    const generateSecret = () => {
        const bytes = new Uint8Array(32);
        window.crypto.getRandomValues(bytes);
        setSecret(Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(""));
    };

    const registerWebhook = async () => {
        if (!sessionId) return toast.error(t("noSession"));
        if (!/^https:\/\//i.test(webhookUrl.trim())) return toast.error(t("invalidUrl"));

        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                name: t("defaultName"),
                url: webhookUrl.trim(),
                events: ["message.received"],
            };
            if (secret) payload.secret = secret;

            const res = await fetch(`/api/webhooks/${sessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                toast.success(t("registered"));
                setWebhookUrl("");
                onWebhookCreated();
            } else {
                const data = await res.json().catch(() => null);
                toast.error(data?.message || t("registerFailed"));
            }
        } catch {
            toast.error(t("registerFailed"));
        } finally {
            setSaving(false);
        }
    };

    const Row = ({ label, value, hint, masked }: { label: string; value: string; hint?: string; masked?: boolean }) => (
        <div className="space-y-1">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-md px-3 py-2 font-mono text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
                    {value ? (masked && !showKey ? "••••••••••••••••••••••••••••••••" : value) : <span className="text-muted-foreground">—</span>}
                </div>
                {masked && value && (
                    <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)} aria-label={t("toggleKey")}>
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => copy(value)} disabled={!value}>
                    <Copy className="h-4 w-4 mr-1" /> {t("copy")}
                </Button>
            </div>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );

    return (
        <Card className="border-primary/40">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plug className="h-5 w-5" /> {t("title")}
                </CardTitle>
                <CardDescription>{t("description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold">{t("step1")}</h3>
                    <Row label={t("apiUrl")} value={apiUrl} hint={t("apiUrlHint")} />
                    <Row label={t("sessionId")} value={sessionId} hint={sessionName ? t("sessionIdHint", { name: sessionName }) : t("noSession")} />
                    {apiKey ? (
                        <Row label={t("apiKey")} value={apiKey} hint={t("apiKeyHint")} masked />
                    ) : (
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("apiKey")}</Label>
                            <div>
                                <Button onClick={onGenerateKey}><KeyRound className="h-4 w-4 mr-2" /> {t("generateKey")}</Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4 border-t pt-5">
                    <h3 className="text-sm font-semibold">{t("step2")}</h3>
                    <p className="text-xs text-muted-foreground">{t("step2Desc")}</p>
                    <div className="space-y-1">
                        <Label htmlFor="integration-webhook-url">{t("webhookUrl")}</Label>
                        <Input id="integration-webhook-url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="integration-webhook-secret">{t("webhookSecret")}</Label>
                        <div className="flex items-center gap-2">
                            <Input id="integration-webhook-secret" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={t("webhookSecretPlaceholder")} className="font-mono text-xs sm:text-sm" />
                            <Button variant="outline" size="sm" onClick={generateSecret}><RefreshCw className="h-4 w-4 mr-1" /> {t("generate")}</Button>
                            <Button variant="outline" size="sm" onClick={() => copy(secret)} disabled={!secret}><Copy className="h-4 w-4 mr-1" /> {t("copy")}</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("webhookSecretHint")}</p>
                    </div>
                    <Button onClick={registerWebhook} disabled={saving || !sessionId}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plug className="h-4 w-4 mr-2" />}
                        {t("register")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
