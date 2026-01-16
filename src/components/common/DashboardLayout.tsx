import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { ThemeToggle, LanguageToggle } from '@/components/common/SettingsToggles';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  User,
  Wallet,
  Clock,
  BarChart3,
  UserCheck,
  Building2,
  Baby,
} from 'lucide-react';
import { NotificationBadge } from './DashboardWidgets';

interface NavItem {
  label: string;
  labelKey: string;
  icon: ReactNode;
  href: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', labelKey: 'nav.dashboard', icon: <LayoutDashboard className="h-5 w-5" />, href: '/dashboard', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Students', labelKey: 'nav.students', icon: <GraduationCap className="h-5 w-5" />, href: '/students', roles: ['admin', 'teacher'] },
  { label: 'Teachers', labelKey: 'nav.teachers', icon: <Users className="h-5 w-5" />, href: '/teachers', roles: ['admin'] },
  { label: 'Parents', labelKey: 'nav.parents', icon: <Baby className="h-5 w-5" />, href: '/parents', roles: ['admin'] },
  { label: 'Classes', labelKey: 'nav.classes', icon: <Building2 className="h-5 w-5" />, href: '/classes', roles: ['admin', 'teacher'] },
  { label: 'My Children', labelKey: 'nav.children', icon: <Baby className="h-5 w-5" />, href: '/children', roles: ['parent'] },
  { label: 'Attendance', labelKey: 'nav.attendance', icon: <ClipboardCheck className="h-5 w-5" />, href: '/attendance', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Homework', labelKey: 'nav.homework', icon: <BookOpen className="h-5 w-5" />, href: '/homework', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Exams', labelKey: 'nav.exams', icon: <FileText className="h-5 w-5" />, href: '/exams', roles: ['admin', 'teacher'] },
  { label: 'Results', labelKey: 'nav.results', icon: <BarChart3 className="h-5 w-5" />, href: '/results', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Fees', labelKey: 'nav.fees', icon: <DollarSign className="h-5 w-5" />, href: '/fees', roles: ['admin', 'student', 'parent'] },
  { label: 'Salaries', labelKey: 'nav.salaries', icon: <Wallet className="h-5 w-5" />, href: '/salaries', roles: ['admin', 'teacher'] },
  { label: 'Timetable', labelKey: 'nav.timetable', icon: <Calendar className="h-5 w-5" />, href: '/timetable', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Notices', labelKey: 'nav.notices', icon: <Bell className="h-5 w-5" />, href: '/notices', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Leave Requests', labelKey: 'nav.leaves', icon: <Clock className="h-5 w-5" />, href: '/leaves', roles: ['admin', 'teacher'] },
  { label: 'User Management', labelKey: 'nav.users', icon: <UserCheck className="h-5 w-5" />, href: '/users', roles: ['admin'] },
  { label: 'Analytics', labelKey: 'nav.analytics', icon: <BarChart3 className="h-5 w-5" />, href: '/analytics', roles: ['admin'] },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Demo role for now - will be replaced with actual role from profile
  const currentRole: UserRole = (profile?.role as UserRole) || 'admin';

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentRole));

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">{t('app.name')}</h1>
            <p className="text-xs text-muted-foreground">{t(`role.${currentRole}`)}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'nav-item',
                    isActive && 'active'
                  )}
                >
                  {item.icon}
                  <span>{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.full_name || user?.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{t(`role.${currentRole}`)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('min-h-screen bg-background', isRTL && 'font-urdu')}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'right' : 'left'} className="p-0 w-64 bg-sidebar">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">{t('app.name')}</span>
          </Link>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        'lg:ps-64 min-h-screen',
        'pt-16 lg:pt-0'
      )}>
        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-40 h-16 items-center justify-between gap-4 px-6 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex-1">
            {/* Breadcrumbs or page title could go here */}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <NotificationBadge count={3} />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="font-medium text-sm">{profile?.full_name || user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{t(`role.${currentRole}`)}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="h-4 w-4 me-2" />
                    {t('common.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 me-2" />
                    {t('common.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 me-2" />
                  {t('common.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
