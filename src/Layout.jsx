import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ErrorBoundary from "@/components/common/ErrorBoundary";
import CookieConsent from "@/components/common/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import tracker from "@/components/tracking/ActivityTracker";
import {
  Home, Settings, Package, Palette, Layers, ShoppingCart, Users,
  BarChart3, Menu, X, Wrench, FileText, Scaling, Sprout, Users2,
  Briefcase, CalendarCheck, Building2, Target, LogIn, LogOut, ExternalLink, Percent, CreditCard,
  Users as UsersIcon, History as HistoryIcon, ScrollText, TrendingUp,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import LanguageSelector from "./components/LanguageSelector";
import DarkModeToggle from "./components/DarkModeToggle";
import { TranslationProvider, useTranslation } from "./components/translations/TranslationProvider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Breadcrumbs from "./components/admin/Breadcrumbs";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const { t, currentLanguage } = useTranslation();
  const { user: contextUser, isLoadingAuth, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [footerContent, setFooterContent] = useState(null);

  const isAdminPage = currentPageName?.includes('Admin') || currentPageName?.includes('Manager') || currentPageName?.includes('Content') || currentPageName?.includes('CRM') || currentPageName === 'Analytics' || currentPageName === 'PriceManagement';

  // MOBILE FIX - Prevent zoom and improve touch experience
  useEffect(() => {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    }
  }, []);

  // Track page views - folosim ref pentru a evita duplicate page views
  const lastTrackedPage = React.useRef(null);

  useEffect(() => {
    if (currentPageName && currentPageName !== 'OrderPDF' && lastTrackedPage.current !== currentPageName) {
      tracker.trackPageView(currentPageName);
      tracker.sendPendingDuration();
      lastTrackedPage.current = currentPageName;

      return () => {
        tracker.trackPageLeave();
      };
    }
  }, [currentPageName]);

  // Sync context user to Layout state
  useEffect(() => {
    setUser(contextUser);
    setIsCheckingUser(isLoadingAuth);
  }, [contextUser, isLoadingAuth]);

  useEffect(() => {
    if (isAdminPage && contextUser) {
      if (contextUser.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      // Log admin access if not yet logged
      const logAdminAccess = async () => {
        if (contextUser.id === 'local_admin_id') return; // Skip logging for local bypass
        try {
          const key = `admin-login-logged-${contextUser.id}`;
          if (!sessionStorage.getItem(key)) {
             await base44.entities.UserLog.create({
               user_id: contextUser.id,
               action: 'login',
               details: 'Acces panou Admin'
             });
             sessionStorage.setItem(key, '1');
          }
        } catch (e) {
          console.error('Failed to log admin access', e);
        }
      };
      logAdminAccess();
    }
  }, [isAdminPage, contextUser]);

  useEffect(() => {
    const fetchFooterContent = async () => {
      try {
        let content = await base44.entities.HomePageContent.filter({ language_code: currentLanguage });
        if (!content || content.length === 0) {
          content = await base44.entities.HomePageContent.filter({ language_code: 'ro' });
        }
        if (content && content.length > 0) {
          setFooterContent(content[0]);
        } else {
          setFooterContent(null);
        }
      } catch (error) {
        console.error("Failed to fetch footer content:", error);
        setFooterContent(null);
      }
    };

    if (!isAdminPage) {
      fetchFooterContent();
    } else {
      setFooterContent(null);
    }
  }, [currentLanguage, isAdminPage]);

  if (currentPageName === 'OrderPDF') {
    return <>{children}</>;
  }

  if (isLoading && isAdminPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950 z-[100]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 dark:border-slate-700 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">{t('loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  if (isAdminPage) {
    const adminNavigation = [
      { title: "Dashboard", url: createPageUrl("AdminDashboard"), icon: BarChart3 },
      { title: "Analytics & Tracking", url: createPageUrl("Analytics"), icon: TrendingUp },
      { title: "CRM", url: "", icon: Users2, isSection: true },
      { title: t('leadManager.title'), url: createPageUrl("LeadManager"), icon: Target },
      { title: t('dealManager.title'), url: createPageUrl("DealManager"), icon: Briefcase },
      { title: t('activityManager.title'), url: createPageUrl("ActivityManager"), icon: CalendarCheck },
      { title: t('contactManager.title'), url: createPageUrl("ContactManager"), icon: Building2 },
      { title: "Catalog", url: "", icon: Package, isSection: true },
      { title: t('productManager.title'), url: createPageUrl("ProductManager"), icon: Package },
      { title: "Profile", url: createPageUrl("ProfileManager"), icon: Layers },
      { title: t('materialManager.title'), url: createPageUrl("MaterialManager"), icon: Layers },
      { title: "Sub-Materiale", url: createPageUrl("SubMaterialManager"), icon: Sprout },
      { title: t('colorManager.title'), url: createPageUrl("ColorManager"), icon: Palette },
      { title: t('glazingManager.title'), url: createPageUrl("GlazingManager"), icon: Settings },
      { title: "Mecanisme", url: createPageUrl("MechanismManager"), icon: Settings },
      { title: t('accessoryManager.title'), url: createPageUrl("AccessoryManager"), icon: Wrench },
      { title: t('presetDimensionManager.title'), url: createPageUrl("PresetDimensionManager"), icon: Scaling },
      { title: "Management", url: "", icon: Settings, isSection: true },
      { title: "Bon Consum", url: createPageUrl("PriceManagement"), icon: BarChart3 },
      { title: "Promoții", url: createPageUrl("PromotionManager"), icon: Percent },
      { title: "Procesatori Plăți", url: createPageUrl("PaymentProcessorManager"), icon: CreditCard },
      { title: "Utilizatori", url: createPageUrl("UserManager"), icon: UsersIcon },
      { title: "Jurnal Admin", url: createPageUrl("AdminLogs"), icon: ScrollText },
      { title: t('contentManager.title'), url: createPageUrl("ContentManager"), icon: FileText },
      { title: "Date Companie", url: createPageUrl("CompanySettingsManager"), icon: Building2 },
      { title: "Template-uri Email", url: createPageUrl("EmailTemplateManager"), icon: FileText },
      { title: "Companii Montaj", url: createPageUrl("InstallationCompanyManager"), icon: Wrench },
      { title: "Comenzi", url: createPageUrl("OrderManager"), icon: ShoppingCart }
    ];

    return (
      <>
        <GoogleAnalytics />
        <style>{`
          :root {
            --sidebar-width: 260px;
          }
          
          /* MOBILE FIX - Prevent zoom and improve touch */
          * {
            -webkit-tap-highlight-color: transparent;
          }
          
          html, body {
            -webkit-overflow-scrolling: touch;
          }
          
          /* GREEN THEME */
          [role="switch"][data-state="checked"] {
            background-color: #16a34a !important;
            border-color: #16a34a !important;
          }
          [role="switch"]:focus-visible {
            outline-color: #16a34a !important;
          }
          [role="checkbox"][data-state="checked"] {
            background-color: #16a34a !important;
            border-color: #16a34a !important;
          }
          [role="checkbox"][data-state="checked"] svg {
            color: #ffffff !important;
          }
          input[type="checkbox"]:checked { accent-color: #16a34a; }
          input[type="radio"]:checked { accent-color: #16a34a; }

          @media (max-width: 768px) {
            .admin-content { padding: 1rem !important; }
            .admin-content .responsive-scroll {
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
            }
            .admin-content table {
              min-width: 720px;
            }
            .admin-content .card-padding { padding: 0.75rem !important; }
            .admin-content button { min-height: 40px; }
          }
        `}</style>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <SidebarProvider>
            <div className="flex w-full">
              <Sidebar className="border-r-0 bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl">
                <SidebarHeader className="border-b border-gray-100 dark:border-slate-800 p-5">
                  <Link to={createPageUrl("AdminDashboard")} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:shadow-xl group-hover:shadow-green-500/40 transition-all duration-200">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-xl text-gray-900 dark:text-gray-100 group-hover:text-green-600 transition-colors">RoWood</span>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">PRO Admin</p>
                    </div>
                  </Link>
                </SidebarHeader>
                <SidebarContent className="p-3">
                  <SidebarGroup>
                    <SidebarGroupContent>
                      <SidebarMenu className="space-y-0.5">
                        {adminNavigation.map((item, index) => (
                          item.isSection ? (
                            <SidebarGroupLabel key={index} className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-5 mb-2 px-3 flex items-center gap-2">
                              {item.icon && <item.icon className="w-3.5 h-3.5" />}
                              {item.title}
                            </SidebarGroupLabel>
                          ) : (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton asChild className={`macos-menu-item text-sm h-9 ${location.pathname === item.url ? 'active' : ''}`}>
                                <Link to={item.url} className="flex items-center gap-3">
                                  <item.icon className="w-4 h-4" />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="p-3 space-y-2 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <DarkModeToggle />
                    <Button asChild variant="outline" size="sm" className="flex-1 h-9 rounded-xl border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-xs font-semibold">Vezi Site-ul</span>
                      </Link>
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (user?.id) {
                        await base44.entities.UserLog.create({
                          user_id: user.id,
                          action: 'logout',
                          details: 'Logout din panoul Admin'
                        });
                        tracker.trackLogout(user.email);
                      }
                      await base44.auth.logout(createPageUrl('Home'));
                    }}
                    className="w-full h-9 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="text-xs font-semibold">Logout</span>
                  </Button>
                </SidebarFooter>
              </Sidebar>
              <main className="flex-1 bg-transparent">
                <header className="bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 px-5 py-3 md:hidden sticky top-0 z-40">
                  <div className="flex items-center gap-3">
                    <SidebarTrigger className="hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors" />
                    <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">RoWood PRO</h1>
                  </div>
                </header>
                <div className="p-5 admin-content">
                  <Breadcrumbs currentPageName={currentPageName} />
                  <div className="responsive-scroll">
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </div>
                </div>
                <div className="fixed bottom-4 right-4 md:hidden z-50">
                  <SidebarTrigger className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 hover:scale-110 transition-all duration-200">
                    <Menu className="w-5 h-5" />
                  </SidebarTrigger>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </div>
      </>
    );
  }

  const customerNavigation = [
    { title: t('home'), url: createPageUrl("Home"), icon: Home },
    { title: t('products'), url: createPageUrl("Products"), icon: Package },
    { title: t('configurator'), url: createPageUrl("Configurator"), icon: Settings },
    { title: t('myOrders'), url: createPageUrl("MyOrders"), icon: FileText },
    { title: t('cart'), url: createPageUrl("ShoppingCart"), icon: ShoppingCart, isIconOnly: true }
  ];

  const handleLogin = () => {
    // Use only pathname+search (without any existing from_url nesting)
    // to prevent infinite redirect loops where from_url keeps growing
    const currentPath = window.location.pathname;
    if (currentPath === '/login') {
      // Already on login page, redirect to home after login
      base44.auth.redirectToLogin(window.location.origin + '/');
    } else {
      const nextUrl = window.location.origin + currentPath + window.location.search;
      base44.auth.redirectToLogin(nextUrl);
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.role === 'admin' && user?.id && user?.id !== 'local_admin_id') {
        await base44.entities.UserLog.create({
          user_id: user.id,
          action: 'logout',
          details: 'Logout (public header)'
        });
      }
      if (user?.email) {
        tracker.trackLogout(user.email);
      }
      logout(true); // use context logout
    } catch (error) {
      console.error("Logout error:", error);
      logout(true); // force logout fallback
    }
  };

  const UserAuthBlock = ({ inSheet = false }) => {
    if (isCheckingUser) {
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (user) {
      return (
        <div className={`${inSheet ? 'space-y-3 w-full' : 'flex items-center gap-2'}`}>
          <div className={`p-3 rounded-xl ${inSheet ? 'bg-gray-50 dark:bg-slate-800 w-full' : ''}`}>
            <span className="text-sm font-semibold text-foreground">
              Bună, {user.full_name || user.email}!
            </span>
          </div>

          {user.role === 'admin' && !inSheet && (
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link to={createPageUrl("AdminDashboard")}>
                Admin Panel
              </Link>
            </Button>
          )}

          {!inSheet && (
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      );
    } else {
      return (
        !inSheet && (
          <Button onClick={handleLogin} size="sm" className="bg-green-600 hover:bg-green-700 rounded-xl">
            <LogIn className="w-4 h-4 mr-2" /> Login
          </Button>
        )
      );
    }
  };

  return (
    <>
      <GoogleAnalytics />
      <CookieConsent />

      <style>{`
        :root {
          --header-height: 72px;
        }
        
        /* MOBILE FIX - Prevent zoom and improve touch */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        html, body {
          -webkit-overflow-scrolling: touch;
        }
        
        /* GREEN THEME */
        [role="switch"][data-state="checked"] {
          background-color: #16a34a !important;
          border-color: #16a34a !important;
        }
        [role="switch"]:focus-visible {
          outline-color: #16a34a !important;
        }
        [role="checkbox"][data-state="checked"] {
          background-color: #16a34a !important;
          border-color: #16a34a !important;
        }
        [role="checkbox"][data-state="checked"] svg {
          color: #ffffff !important;
        }
        input[type="checkbox"]:checked {
          accent-color: #16a34a;
        }
        input[type="radio"]:checked {
          accent-color: #16a34a;
        }
      `}</style>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <header className="bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:shadow-xl group-hover:shadow-green-500/40 transition-all duration-200">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-2xl text-gray-900 dark:text-gray-100 group-hover:text-green-600 transition-colors">RoWood</span>
              </Link>

              <nav className="hidden md:flex space-x-3">
                {customerNavigation.map((item) => (
                  <Link key={item.title} to={item.url} className={`macos-menu-item h-10 text-base font-medium ${location.pathname === item.url ? 'active' : ''}`}>
                    {item.isIconOnly ? (
                      <item.icon className="w-5 h-5" />
                    ) : (
                      item.title
                    )}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <DarkModeToggle />
                <LanguageSelector />

                <div className="hidden md:flex items-center gap-2">
                  <UserAuthBlock />
                </div>

                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-xl">
                        <Menu className="w-5 h-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-80 bg-white dark:bg-slate-900">
                      <SheetHeader>
                        <SheetTitle className="text-2xl font-bold text-green-600 dark:text-green-400">Meniu</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 flex flex-col gap-2">
                        <nav className="flex flex-col gap-1">
                          {customerNavigation.map((item) => (
                            <SheetClose asChild key={item.title}>
                              <Link to={item.url} className={`macos-menu-item h-11 text-base ${location.pathname === item.url ? 'active' : ''}`}>
                                <item.icon className="w-5 h-5" />
                                {item.title}
                              </Link>
                            </SheetClose>
                          ))}

                          {user?.role === 'admin' && (
                            <SheetClose asChild>
                              <Link to={createPageUrl("AdminDashboard")} className="macos-menu-item h-11 text-base bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 mt-2">
                                <Settings className="w-5 h-5" />
                                Admin Panel
                              </Link>
                            </SheetClose>
                          )}

                          {user && (
                            <>
                              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 w-full text-left mt-4">
                                <span className="text-sm font-semibold text-foreground">
                                  Bună, {user.full_name || user.email}!
                                </span>
                              </div>
                              <Button
                                onClick={handleLogout}
                                variant="destructive"
                                size="lg"
                                className="w-full justify-start mt-2 rounded-xl"
                              >
                                <LogOut className="w-5 h-5 mr-3" />
                                Logout
                              </Button>
                            </>
                          )}

                          {!user && !isCheckingUser && (
                            <Button
                              onClick={handleLogin}
                              size="lg"
                              className="bg-green-600 hover:bg-green-700 w-full justify-start mt-4 rounded-xl"
                            >
                              <LogIn className="w-5 h-5 mr-3" />
                              Login
                            </Button>
                          )}
                        </nav>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        <footer className="bg-slate-900 dark:bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">RoWood</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">{footerContent?.companyDescription || t('footer.companyDescriptionPlaceholder')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
                <ul className="space-y-2">
                  <li><Link to={createPageUrl("Home")} className="text-sm text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors">{t('home')}</Link></li>
                  <li><Link to={createPageUrl("Products")} className="text-sm text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors">{t('products')}</Link></li>
                  <li><Link to={createPageUrl("Configurator")} className="text-sm text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors">{t('configurator')}</Link></li>
                  <li><Link to={createPageUrl("MyOrders")} className="text-sm text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors">{t('myOrders')}</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
                {footerContent ? (
                  <>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {footerContent.contactAddress}{footerContent.contactAddress && footerContent.contactCity ? ', ' : ''}
                      {footerContent.contactCity}{footerContent.contactCity && footerContent.contactCountry ? ', ' : ''}
                      {footerContent.contactCountry}
                    </p>
                    {footerContent.contactPhone && <p className="text-sm text-gray-400 dark:text-gray-500">{t('footer.phone')}: {footerContent.contactPhone}</p>}
                    {footerContent.contactEmail && <p className="text-sm text-gray-400 dark:text-gray-500">{t('footer.email')}: {footerContent.contactEmail}</p>}
                    {footerContent.workingHours && <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{footerContent.workingHours}</p>}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t('footer.loadingData')}</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('footer.followUs')}</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors"><Users className="h-5 w-5" /></a>
                  <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors"><Users className="h-5 w-5" /></a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 dark:border-gray-900 mt-8 pt-8 text-center text-gray-500 dark:text-gray-600">
              <p>&copy; {new Date().getFullYear()} RoWood. {t('footer.allRightsReserved')}.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <TranslationProvider>
      <LayoutContent currentPageName={currentPageName}>{children}</LayoutContent>
    </TranslationProvider>
  );
}