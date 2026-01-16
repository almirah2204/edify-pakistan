import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle, LanguageToggle } from '@/components/common/SettingsToggles';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraduationCap, Shield, BookOpen, Users, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  { icon: <Shield className="h-6 w-6" />, title: 'Role-Based Access', desc: 'Secure dashboards for every user type' },
  { icon: <BookOpen className="h-6 w-6" />, title: 'Complete ERP', desc: 'Fees, attendance, exams & more' },
  { icon: <Users className="h-6 w-6" />, title: 'Bilingual', desc: 'English & Urdu with RTL support' },
];

export default function Index() {
  const { t, isRTL } = useLanguage();

  return (
    <div className={cn('min-h-screen bg-background', isRTL && 'font-urdu')}>
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">{t('app.name')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
            <Link to="/auth">
              <Button>{t('auth.login')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Check className="h-4 w-4" /> Production-Ready School ERP
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {t('app.name')}
            <span className="block text-gradient-primary">{t('app.tagline')}</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            A complete, modern School ERP system designed for Pakistani educational institutions. Manage students, teachers, fees, attendance, and more — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Get Started <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline">
                View Demo Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="card-elevated p-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 {t('app.name')}. Built with ❤️ for Pakistani Schools.
        </div>
      </footer>
    </div>
  );
}
