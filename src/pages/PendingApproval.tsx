import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle, LanguageToggle } from '@/components/common/SettingsToggles';
import { Clock, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingApproval() {
  const { t, isRTL } = useLanguage();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

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
          {/* Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="h-12 w-12 text-warning" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {isRTL ? 'منظوری زیر التواء' : 'Approval Pending'}
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-4">
            {isRTL 
              ? 'آپ کا اکاؤنٹ فی الحال ایڈمنسٹریٹر کی منظوری کا انتظار کر رہا ہے۔ منظوری ملنے کے بعد آپ کو مطلع کیا جائے گا۔'
              : 'Your account is currently awaiting administrator approval. You will be notified once your account has been approved.'
            }
          </p>

          {/* User Info */}
          {profile && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Role: <span className="capitalize font-medium text-foreground">{profile.role}</span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={handleLogout}>
              {isRTL ? 'لاگ آؤٹ' : 'Logout'}
            </Button>
            <p className="text-xs text-muted-foreground">
              {isRTL 
                ? 'مدد کے لیے ایڈمنسٹریٹر سے رابطہ کریں'
                : 'Contact your administrator for assistance'
              }
            </p>
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
