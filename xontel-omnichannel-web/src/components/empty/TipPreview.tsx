import React from 'react';
import { Button } from '@components/ui/button';
import { Calendar } from '@components/ui/calendar';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  AtSign,
  Calendar as CalendarIcon,
  Download,
  Bell,
  ChevronDown,
  ChevronUp,
  Code2,
  CornerUpLeft,
  Lightbulb,
  MessageCircle,
  Mic,
  Paperclip,
  Search,
  Slash,
  Smile,
  Sparkles,
  X,
} from 'lucide-react';
import { TipKey } from './types';

type TipPreviewProps = {
  tip: TipKey;
  handlePwaInstall: () => void;
  handleAllowNotifications: () => void;
  deferredInstallPrompt: any;
  isPwaInstalled: boolean;
  isNotificationsSupported: boolean;
  notificationPermission: string;
  isRequestingNotificationPermission: boolean;
  installError?: string | null;
  handleMobileInstall?: () => void;
};

const normalizeCodeExample = (example: string) => {
  const trimmed = String(example || '').trim();
  const inlineFence = /^```([\w-]+)\s+([\s\S]*?)```$/;
  const match = inlineFence.exec(trimmed);
  if (!match) return example;
  const lang = match[1];
  const body = match[2].trim();
  return `\n\n\
\`\`\`${lang}\n${body}\n\`\`\`\n\n`;
};

const PreviewMarkdown = ({ text }: { text: string }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        pre: ({ children }: any) => {
          if (React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, { isBlock: true });
          }
          return <>{children}</>;
        },
        code: ({
          className,
          children,
          ...props
        }: any) => {
          const inline = !props.isBlock;

          if (inline) {
            return (
              <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">
                {children}
              </code>
            );
          }

          const raw = String(children ?? '').replace(/\n$/, '');
          const match = /language-([\w-]+)/.exec(className || '');
          const detected = (match?.[1] || 'text').toLowerCase();
          const normalizedLanguage =
            detected === 'ts'
              ? 'typescript'
              : detected === 'js'
                ? 'javascript'
                : detected;

          return (
            <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#0b1020]">
              <div className="flex items-center justify-between px-3 py-1 text-[11px] bg-black/5 dark:bg-white/5">
                <span className="uppercase tracking-wide opacity-70">
                  {detected}
                </span>
              </div>
              <SyntaxHighlighter
                language={normalizedLanguage}
                style={isDarkMode ? oneDark : oneLight}
                showLineNumbers
                wrapLongLines
                customStyle={{
                  margin: 0,
                  background: 'transparent',
                  padding: '12px',
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
                lineNumberStyle={{
                  opacity: 0.5,
                  paddingRight: '12px',
                  minWidth: '2.5em',
                }}
              >
                {raw}
              </SyntaxHighlighter>
            </div>
          );
        },
      }}
    >
      {normalizeCodeExample(text)}
    </ReactMarkdown>
  );
};

export default function TipPreview({
  tip,
  handlePwaInstall,
  handleAllowNotifications,
  deferredInstallPrompt,
  isPwaInstalled,
  isNotificationsSupported,
  notificationPermission,
  isRequestingNotificationPermission,
  installError,
  handleMobileInstall,
}: TipPreviewProps) {
  const { t } = useTranslation('chat');
  const bubbleBase =
    'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm border';
  const received =
    'bg-muted/40 border-border text-foreground';
  const sent =
    'bg-primary/10 border-primary/15 text-foreground';

  if (tip === 'code') {
    return (
      <div className="space-y-3">
        <div className={`self-start ${bubbleBase} ${received}`}>
          Here is the snippet:
        </div>
        <div className="rounded-2xl border border-border bg-background p-3">
          <PreviewMarkdown text={t(`empty.tips.${tip}.example`)} />
        </div>
      </div>
    );
  }

  if (tip === 'canned') {
    return (
      <div className="space-y-3">
        <div className={`self-start ${bubbleBase} ${received}`}>
          Can you send a quick reply?
        </div>

        <div className="rounded-2xl border border-border bg-background p-3">
          <div className="text-[11px] text-muted-foreground">Typing</div>
          <div className="mt-1 rounded-xl border border-border bg-muted/20 px-3 py-2 font-mono text-xs">
            /thank
            <span className="opacity-50">-you</span>
          </div>

          <div className="mt-2 rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-3 py-2 text-[11px] text-muted-foreground border-b border-border">
              Canned responses
            </div>
            <div className="p-2 space-y-1">
              <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/15 px-2 py-1">
                <div className="min-w-0">
                  <div className="text-xs font-medium">/thank-you</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    Thanks! We're happy to help.
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground">Enter</div>
              </div>
              {/* <div className="flex items-center justify-between rounded-lg border border-transparent px-2 py-1">
                <div className="min-w-0">
                  <div className="text-xs font-medium">/follow-up</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    Just checking in…
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        <div className={`ml-auto ${bubbleBase} ${sent}`}>
          Thank you! We're happy to help.
        </div>
      </div>
    );
  }

  if (tip === 'mentions') {
    return (
      <div className="space-y-3">
        <div className={`self-start ${bubbleBase} ${received}`}>
          Who can take this?
        </div>
        <div className="rounded-2xl border border-border bg-background p-3">
          <div className="text-[11px] text-muted-foreground">Typing</div>
          <div className="mt-1 rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs">
            <span className="text-blue-600 dark:text-blue-400 font-medium">@ahmed</span>
            <span> can you check this?</span>
          </div>

          <div className="mt-2 rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-3 py-2 text-[11px] text-muted-foreground border-b border-border">
              Mentions
            </div>
            <div className="p-2 space-y-1">
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/15 px-2 py-1">
                <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/15" />
                <div className="min-w-0">
                  <div className="text-xs font-medium">Ahmed</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    ahmed@company.com
                  </div>
                </div>
              </div>
              {/* <div className="flex items-center gap-2 rounded-lg px-2 py-1">
                <div className="h-7 w-7 rounded-full bg-foreground/10 border border-border" />
                <div className="min-w-0">
                  <div className="text-xs font-medium">Sara</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    sara@company.com
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
        <div className={`ml-auto ${bubbleBase} ${sent}`}>
          <span className="text-blue-600 dark:text-blue-400 font-medium">@ahmed</span>
          <span> can you check this?</span>
        </div>
      </div>
    );
  }

  if (tip === 'attachments') {
    return (
      <div className="space-y-3">
        <div className={`self-start ${bubbleBase} ${received}`}>
          Please share the document.
        </div>
        <div className={`ml-auto ${bubbleBase} ${sent}`}>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/15 flex items-center justify-center">
              <Paperclip className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium">invoice.pdf</div>
              <div className="text-[11px] text-muted-foreground">245 KB</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tip === 'voice') {
    return (
      <div className="space-y-3">
        <div className={`self-start ${bubbleBase} ${received}`}>
          Can you explain quickly?
        </div>
        <div className={`ml-auto ${bubbleBase} ${sent}`}>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/15" />
            <div className="flex-1">
              <div className="h-2 rounded bg-foreground/10" />
              <div className="mt-2 h-2 w-1/2 rounded bg-foreground/10" />
            </div>
            <div className="text-[11px] text-muted-foreground">0:12</div>
          </div>
        </div>
      </div>
    );
  }

  if (tip === 'emoji') {
    return (
      <div className="space-y-3">
        <div className={`self-start ${bubbleBase} ${received}`}>
          Great job!
        </div>
        <div className={`ml-auto ${bubbleBase} ${sent}`}>
          Great news! 🎉
        </div>
        <div className="rounded-2xl border border-border bg-background p-3">
          <div className="text-[11px] text-muted-foreground">Emoji</div>
          <div className="mt-2 grid grid-cols-6 gap-2 text-lg">
            <div className="h-9 rounded-xl bg-muted/30 flex items-center justify-center">😀</div>
            <div className="h-9 rounded-xl bg-muted/30 flex items-center justify-center">👍</div>
            <div className="h-9 rounded-xl bg-muted/30 flex items-center justify-center">🎉</div>
            <div className="h-9 rounded-xl bg-muted/30 flex items-center justify-center">❤️</div>
            <div className="h-9 rounded-xl bg-muted/30 flex items-center justify-center">🙏</div>
            <div className="h-9 rounded-xl bg-muted/30 flex items-center justify-center">😂</div>
          </div>
        </div>
      </div>
    );
  }

  if (tip === 'reply') {
    return (
      <div className="space-y-3">
        <div className={`self-start ${bubbleBase} ${received}`}>
          Meeting at 3pm.
        </div>
        <div className={`ml-auto ${bubbleBase} ${sent}`}>
          <div className="mb-2 border-l-2 border-primary pl-2 text-[11px] text-muted-foreground">
            Replying to: Meeting at 3pm.
          </div>
          Yes, let's do it.
        </div>
      </div>
    );
  }

  if (tip === 'ai_suggestions') {
    return (
      <div className="space-y-3">
        <div className={`self-start ${bubbleBase} ${received}`}>
          {t('empty.tips.ai_suggestions.preview.customer')}
        </div>

        <div className="rounded-2xl border border-border bg-background p-3">
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-2 border-b border-border flex items-center justify-between bg-muted/20">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                <Lightbulb className="h-3 w-3" />
                {t('empty.tips.ai_suggestions.preview.title')}
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div className="w-full text-left px-4 py-3 flex flex-col gap-1 border-l-2 border-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">
                    {t('empty.tips.ai_suggestions.preview.suggestion_label', { index: 1 })}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded">
                    {t('empty.tips.ai_suggestions.preview.enter_hint')}
                  </span>
                </div>
                <span className="text-xs text-foreground/80 line-clamp-2">
                  {t('empty.tips.ai_suggestions.preview.suggestion1')}
                </span>
              </div>

              <div className="w-full text-left px-4 py-3 flex flex-col gap-1 border-l-2 border-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">
                    {t('empty.tips.ai_suggestions.preview.suggestion_label', { index: 2 })}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded">
                    {t('empty.tips.ai_suggestions.preview.enter_hint')}
                  </span>
                </div>
                <span className="text-xs text-foreground/80 line-clamp-2">
                  {t('empty.tips.ai_suggestions.preview.suggestion2')}
                </span>
              </div>

              <div className="w-full text-left px-4 py-3 flex flex-col gap-1 border-l-2 bg-muted/20 border-primary">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">
                    {t('empty.tips.ai_suggestions.preview.suggestion_label', { index: 3 })}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded">
                    {t('empty.tips.ai_suggestions.preview.enter_hint')}
                  </span>
                </div>
                <span className="text-xs text-foreground/80 line-clamp-2">
                  {t('empty.tips.ai_suggestions.preview.suggestion3')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={`ml-auto ${bubbleBase} ${sent}`}>
          {t('empty.tips.ai_suggestions.preview.selected')}
        </div>
      </div>
    );
  }

  if (tip === 'search') {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-background p-3">
          <div className="border border-border bg-background px-3 py-2 flex items-center gap-2 rounded-2xl">
            <div className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm">
              invoice
            </div>

            <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              1 of 12
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              title="Previous result"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              title="Next result"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              title="Show calendar"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              title="Close search"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] items-start">
            <div className="space-y-2">
              <div className="rounded-xl border border-border bg-muted/10 px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-foreground">Invoice #1293</div>
                  <div className="text-[11px] text-muted-foreground">Yesterday</div>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Payment status: <span className="text-foreground font-medium">invoice</span> pending
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-foreground">Invoice attached</div>
                  <div className="text-[11px] text-muted-foreground">2 days ago</div>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Found in file name: <span className="text-foreground font-medium">invoice</span>.pdf
                </div>
              </div>
            </div>

            {/* <div className="justify-self-end">
              <div className="rounded-xl border border-border bg-background shadow-sm">
                <Calendar daysWithResults={[2, 5, 12, 18, 22, 27]} />
              </div>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  if (tip === 'pwa_install') {
    return (
      <div className="space-y-3">
        <div className={`self-start ${bubbleBase} ${received}`}>
          {t('empty.tips.pwa_install.preview.customer')}
        </div>

        <div className="rounded-2xl border border-border bg-background p-3">
          <div className="rounded-xl border border-border bg-muted/10 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground">
                  {t('empty.tips.pwa_install.preview.title')}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {t('empty.tips.pwa_install.preview.subtitle')}
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={deferredInstallPrompt ? handlePwaInstall : (handleMobileInstall || handlePwaInstall)}
                  disabled={isPwaInstalled}
                  className="shrink-0 h-auto px-2 py-1 rounded-lg border border-primary/20 bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/15 hover:text-primary [&_svg]:size-3"
                >
                  <Download />
                  {deferredInstallPrompt ? t('empty.tips.pwa_install.preview.cta') : 'Install Guide'}
                </Button>
                
                {installError && (
                  <div className="text-[10px] text-orange-600 dark:text-orange-400 max-w-[200px] text-center leading-tight">
                    {installError}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-border bg-background px-2 py-2 text-[11px] text-muted-foreground">
                {t('empty.tips.pwa_install.preview.step1')}
              </div>
              <div className="rounded-lg border border-border bg-background px-2 py-2 text-[11px] text-muted-foreground">
                {t('empty.tips.pwa_install.preview.step2')}
              </div>
              <div className="rounded-lg border border-border bg-background px-2 py-2 text-[11px] text-muted-foreground">
                {t('empty.tips.pwa_install.preview.step3')}
              </div>
            </div>
          </div>
        </div>

        <div className={`ml-auto ${bubbleBase} ${sent}`}>
          {t('empty.tips.pwa_install.preview.selected')}
        </div>
      </div>
    );
  }

  if (tip === 'notifications') {
    return (
      <div className="space-y-3">
        <div className={`self-start ${bubbleBase} ${received}`}>
          {t('empty.tips.notifications.preview.customer')}
        </div>

        <div className="rounded-2xl border border-border bg-background p-3">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/15">
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  {t('empty.tips.notifications.preview.title')}
                </div>
                <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {t('empty.tips.notifications.preview.description')}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAllowNotifications}
                disabled={
                  !isNotificationsSupported ||
                  notificationPermission !== 'default' ||
                  isRequestingNotificationPermission
                }
                className="h-auto px-2 py-1 rounded-lg border border-primary/20 bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/15 hover:text-primary"
              >
                {t('empty.tips.notifications.preview.allow')}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 rounded-lg border border-border bg-muted/10 text-foreground text-[11px] font-medium hover:bg-muted/20"
              >
                {t('empty.tips.notifications.preview.later')}
              </Button>
            </div>
          </div>
        </div>

        <div className={`ml-auto ${bubbleBase} ${sent}`}>
          {t('empty.tips.notifications.preview.selected')}
        </div>
      </div>
    );
  }

  return null;
}
