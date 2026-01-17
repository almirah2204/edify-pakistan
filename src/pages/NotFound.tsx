import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle, LanguageToggle } from '@/components/common/SettingsToggles';
import { Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRoleDashboard } from '@/components/auth/ProtectedRoute';

export default function NotFound() {
  const { t, isRTL } = useLanguage();
  const { user, profile } = useAuth();

  const homeLink = user && profile ? getRoleDashboard(profile.role) : '/';

  return (
    <div className={cn('min-h-screen flex flex-col bg-background', isRTL && 'font-urdu')}>
      {/* Header */}
      <header className="flex justify-end gap-2 p-4">
        <ThemeToggle />
        <LanguageToggle />
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-[120px] md:text-[180px] font-bold text-gradient-primary leading-none">
              404
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {isRTL ? 'صفحہ نہیں ملا' : 'Page Not Found'}
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-8">
            {isRTL 
              ? 'معذرت، آپ جس صفحے کی تلاش کر رہے ہیں وہ موجود نہیں ہے یا منتقل کر دیا گیا ہے۔'
              : "Sorry, the page you're looking for doesn't exist or has been moved."
            }
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to={homeLink}>
                <Home className="h-5 w-5" />
                {isRTL ? 'ہوم پر جائیں' : 'Go to Home'}
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
              {isRTL ? 'واپس جائیں' : 'Go Back'}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © 2026 {t('app.name')}
      </footer>
    </div>
  );
}
