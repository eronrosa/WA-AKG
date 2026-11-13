'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgot');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setMessage({ type: 'error', text: t('tooMany') });
      } else {
        setMessage({ type: 'ok', text: t('sent') });
      }
    } catch {
      setMessage({ type: 'error', text: t('sent') });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-16 w-16 mb-4 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-primary text-white shadow-lg shadow-primary/30">
            <Bot className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t('subtitle')}</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/40">
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm text-center font-medium ${message.type === 'ok' ? 'bg-primary/10 border border-primary/20 text-foreground' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-5">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 px-4 rounded-xl bg-background/50"
              placeholder="you@example.com"
            />
            <Button type="submit" size="lg" className="w-full h-12 rounded-xl" disabled={loading}>
              {loading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('submitting')}</>) : t('submit')}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm">
          <Link href="/auth/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">{t('back')}</Link>
        </div>
      </div>
    </div>
  );
}
