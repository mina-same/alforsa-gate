import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, MessageSquare, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('notfound')
  const isRTL = i18n.language === 'ar'

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* 404 Number with animation */}
        <div className="relative">
          <h1 className="text-[180px] sm:text-[220px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary/80 to-primary/60 leading-none select-none animate-in fade-in zoom-in duration-700">
            404
          </h1>

          {/* Floating icons around 404 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            <MessageSquare className="absolute top-0 left-1/4 w-12 h-12 text-primary/30 animate-float" />
            <Search className="absolute bottom-10 right-1/4 w-10 h-10 text-primary/20 animate-float-delayed" />
            <div className="absolute top-1/3 right-10 w-8 h-8 rounded-full bg-primary/10 animate-ping" />
            <div className="absolute bottom-1/3 left-10 w-6 h-6 rounded-full bg-primary/20 animate-bounce" />
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {t('page_not_found')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {t('page_not_found_description')}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="group gap-2 min-w-[160px]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t('go_back')}
          </Button>

          <Button
            onClick={() => navigate(`/${i18n.language}/`)}
            size="lg"
            className="group gap-2 min-w-[160px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
            {t('home_page')}
          </Button>
        </div>

        {/* Fun fact or tip */}
        <div className="pt-8 animate-in fade-in duration-700 delay-500">
          <div className="inline-block px-6 py-3 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50">
            <p className="text-sm text-muted-foreground">
              💡 {t('tip')}
            </p>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}
