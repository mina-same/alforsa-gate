import React, { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Database,
  Eye,
  Globe,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
} from 'lucide-react'
import authImage from '@assets/auth/image.png'
import logoDark from '@assets/logos/logoDark.svg'
import logoArDark from '@assets/logos/logoArDark.svg'
import { LanguageSwitcher } from '@components/ui/language-switcher'
import { ThemeToggle } from '@components/ui/theme-toggle'

const currentYear = new Date().getFullYear()

// ─── Shared nav bar ────────────────────────────────────────────────────────────
// Rendered both in the real content and in the loading skeleton so the controls
// are always visible — no fixed overlay, so nothing overlaps.
function HeroNavBar({ isRTL }: { isRTL: boolean }) {
  const BackArrow = isRTL ? ArrowRight : ArrowLeft
  const backLabel = isRTL ? 'العودة إلى تسجيل الدخول' : 'Back to login'

  return (
    <div className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
      <img
        src={isRTL ? logoArDark : logoDark}
        alt="Xontel"
        className="h-10 w-auto"
      />
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors duration-200"
        >
          <BackArrow className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>
    </div>
  )
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────
// Shown while the 'privacy' namespace is being fetched for the new language.
// Keeps the nav bar + controls visible so the user never sees the login page.
function PrivacyLoadingFallback({ isRTL }: { isRTL: boolean }) {
  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <img
          src={authImage}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-20 pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        <HeroNavBar isRTL={isRTL} />

        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-20 text-center animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-white/10 mx-auto mb-6" />
          <div className="h-10 bg-white/10 rounded-xl w-64 mx-auto mb-4" />
          <div className="h-4 bg-white/10 rounded-lg w-96 max-w-full mx-auto" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-xon-surface to-transparent pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-10 space-y-4 pb-16 animate-pulse">
        <div className="bg-xon-surface-container border border-xon-surface-outline rounded-2xl h-20" />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-xon-surface-container border border-xon-surface-outline rounded-2xl h-24"
          />
        ))}
      </div>
    </>
  )
}

// ─── Full page content ────────────────────────────────────────────────────────
// Uses 'privacy' namespace — may suspend on first load or language switch.
function PrivacyPolicyContent({ isRTL }: { isRTL: boolean }) {
  const { t } = useTranslation('privacy')

  const sections = [
    {
      icon: Database,
      color: '#1480c4',
      bg: '#e8f6ff',
      title: t('s1_title'),
      items: [
        { label: t('s1_account_label'), text: t('s1_account_text') },
        { label: t('s1_comms_label'),   text: t('s1_comms_text') },
        { label: t('s1_device_label'),  text: t('s1_device_text') },
        { label: t('s1_usage_label'),   text: t('s1_usage_text') },
      ],
    },
    {
      icon: Camera,
      color: '#a855f7',
      bg: '#faf5ff',
      title: t('s2_title'),
      body: t('s2_body'),
    },
    {
      icon: Eye,
      color: '#f97316',
      bg: '#fff7ed',
      title: t('s3_title'),
      items: [
        { text: t('s3_item1') },
        { text: t('s3_item2') },
        { text: t('s3_item3') },
        { text: t('s3_item4') },
        { text: t('s3_item5') },
      ],
    },
    {
      icon: Globe,
      color: '#6366f1',
      bg: '#eef2ff',
      title: t('s4_title'),
      note: t('s4_note'),
      items: [
        { label: t('s4_providers_label'), text: t('s4_providers_text') },
        { label: t('s4_org_label'),       text: t('s4_org_text') },
        { label: t('s4_legal_label'),     text: t('s4_legal_text') },
      ],
    },
    {
      icon: Lock,
      color: '#1bb092',
      bg: '#e5fdfb',
      title: t('s5_title'),
      body: t('s5_body'),
    },
    {
      icon: Trash2,
      color: '#ef4444',
      bg: '#ffecf3',
      title: t('s6_title'),
      body: t('s6_body'),
    },
    {
      icon: UserCheck,
      color: '#1480c4',
      bg: '#e8f6ff',
      title: t('s7_title'),
      body: t('s7_body'),
    },
    {
      icon: RefreshCw,
      color: '#f97316',
      bg: '#fff7ed',
      title: t('s8_title'),
      body: t('s8_body'),
    },
  ]

  return (
    <>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <img
          src={authImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-20 pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        <HeroNavBar isRTL={isRTL} />

        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6 shadow-xl pp-fade-up" style={{ animationDelay: '80ms' }}>
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 pp-fade-up" style={{ animationDelay: '150ms' }}>
            {t('hero_title')}
          </h1>
          <p className="text-zinc-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed pp-fade-up" style={{ animationDelay: '220ms' }}>
            {t('hero_subtitle')}
          </p>
          <p className="mt-4 text-xs text-zinc-400 pp-fade-up" style={{ animationDelay: '290ms' }}>
            {t('hero_date')}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-xon-surface to-transparent pointer-events-none" />
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-10">

        {/* Intro card */}
        <div className="bg-xon-surface-container border border-xon-surface-outline rounded-2xl shadow-sm p-6 mb-10 flex items-start gap-4 pp-fade-up" style={{ animationDelay: '340ms' }}>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-xon-container-blue flex items-center justify-center">
            <Shield className="h-5 w-5 text-xon-text-blue" />
          </div>
          <p className="text-sm text-xon-text-secondary leading-relaxed">{t('intro')}</p>
        </div>

        {/* Section cards */}
        <div className="space-y-4 mb-10">
          {sections.map((section, idx) => {
            const Icon = section.icon
            return (
              <div
                key={section.title}
                className="bg-xon-surface-container border border-xon-surface-outline rounded-2xl shadow-sm overflow-hidden pp-fade-up"
                style={{ animationDelay: `${400 + idx * 60}ms` }}
              >
                <div className="flex items-center gap-4 px-6 py-4 border-b border-xon-surface-outline">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 hover:scale-105"
                    style={{ backgroundColor: section.bg }}
                  >
                    <Icon size={20} color={section.color} strokeWidth={2} />
                  </div>
                  <h2 className="text-base font-semibold text-xon-text-primary">
                    {idx + 1}. {section.title}
                  </h2>
                </div>

                <div className="px-6 py-5 space-y-3">
                  {section.note && (
                    <p className="text-sm font-medium text-xon-primary">{section.note}</p>
                  )}
                  {section.body && (
                    <p className="text-sm text-xon-text-secondary leading-relaxed">{section.body}</p>
                  )}
                  {section.items && (
                    <ul className="space-y-2.5">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: section.color }}
                          />
                          <p className="text-sm text-xon-text-secondary leading-relaxed">
                            {item.label && (
                              <span className="font-semibold text-xon-text-primary">
                                {item.label}:{' '}
                              </span>
                            )}
                            {item.text}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact CTA */}
        <div
          className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl mb-16 pp-fade-up"
          style={{ animationDelay: `${400 + sections.length * 60}ms` }}
        >
          <img
            src={authImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-10 pointer-events-none"
          />
          <div className="absolute inset-0 bg-black/30 pointer-events-none rounded-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{t('contact_title')}</p>
                <p className="text-zinc-300 text-sm mt-0.5">{t('contact_subtitle')}</p>
              </div>
            </div>
            <a
              href="mailto:support@xontel.com"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-xon-primary hover:bg-xon-primary-hover text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg"
            >
              <Mail className="h-4 w-4" />
              support@xontel.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div
          className="border-t border-xon-surface-outline pt-6 pb-10 flex flex-col md:flex-row items-center justify-between gap-3 pp-fade-up"
          style={{ animationDelay: `${460 + sections.length * 60}ms` }}
        >
          <p className="text-xs text-xon-text-tertiary">
            {t('footer_rights', { year: currentYear })}
          </p>
          <p className="text-xs text-xon-text-tertiary">{t('footer_updated')}</p>
        </div>
      </div>
    </>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────
// Uses 'login' namespace (always loaded → never suspends) just to read the
// current language. The Suspense boundary here prevents the AppRoutes fallback
// (which looks like the login page) from appearing on language switch.
export default function PrivacyPolicyPage() {
  const { i18n } = useTranslation('login')
  const isRTL = i18n.language === 'ar'

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-xon-surface text-xon-text-primary">
      <style>{`
        @keyframes pp-fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pp-fade-up {
          opacity: 0;
          animation: pp-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      <Suspense fallback={<PrivacyLoadingFallback isRTL={isRTL} />}>
        <PrivacyPolicyContent isRTL={isRTL} />
      </Suspense>
    </div>
  )
}
