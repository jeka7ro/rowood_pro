
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from '@/api/base44Client';
import ErrorBoundary from "@/components/common/ErrorBoundary";
import {
  Home, Settings, Package, Palette, Layers, ShoppingCart, Users,
  BarChart3, Menu, X, Wrench, FileText, Scaling, Sprout, Users2,
  Briefcase, CalendarCheck, Building2, Target, LogIn, LogOut, ExternalLink, Percent, CreditCard,
  Users as UsersIcon, History as HistoryIcon,
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
import LanguageSelector from "@/components/LanguageSelector";
import { TranslationProvider, useTranslation } from "@/components/translations/TranslationProvider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const { t, currentLanguage } = useTranslation();
  const { user: globalUser, isLoadingAuth } = useAuth();
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [footerContent, setFooterContent] = useState(null);

  const isAdminPage = currentPageName?.includes('Admin') || currentPageName?.includes('Manager') || currentPageName?.includes('Content') || currentPageName?.includes('CRM');

  useEffect(() => {
    if (isAdminPage) {
      setIsLoading(true);
      const checkAdminAuth = async () => {
        try {
          // Verificare autentificare locală (fără base44)
          const sessionRaw = localStorage.getItem('rowood_session');
          const session = sessionRaw ? JSON.parse(sessionRaw) : null;
          if (!session || !session.isAuthenticated) {
            window.location.href = createPageUrl('Login');
            return;
          }
          setAdminUser(session);
        } catch (error) {
          console.error('Auth check error:', error);
          window.location.href = createPageUrl('Login');
        } finally {
          setIsLoading(false);
        }
      };
      checkAdminAuth();
    }
  }, [isAdminPage, currentPageName]);

  useEffect(() => {
    if (isAdminPage) {
      setAdminUser(null);
    }
  }, [isAdminPage]);

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
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[100]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdminPage) {
    const adminNavigation = [
      { title: "Dashboard", url: createPageUrl("AdminDashboard"), icon: BarChart3 },
      { title: "CRM", url: "", icon: Users2, isSection: true },
      { title: t('leadManager.title'), url: createPageUrl("LeadManager"), icon: Target },
      { title: t('dealManager.title'), url: createPageUrl("DealManager"), icon: Briefcase },
      { title: t('activityManager.title'), url: createPageUrl("ActivityManager"), icon: CalendarCheck },
      { title: t('contactManager.title'), url: createPageUrl("ContactManager"), icon: Building2 },
      { title: "Catalog", url: "", icon: Package, isSection: true },
      { title: t('productManager.title'), url: createPageUrl("ProductManager"), icon: Package },
      { title: t('materialManager.title'), url: createPageUrl("MaterialManager"), icon: Layers },
      { title: "Sub-Materiale", url: createPageUrl("SubMaterialManager"), icon: Sprout },
      { title: t('colorManager.title'), url: createPageUrl("ColorManager"), icon: Palette },
      { title: t('glazingManager.title'), url: createPageUrl("GlazingManager"), icon: Settings },
      { title: t('accessoryManager.title'), url: createPageUrl("AccessoryManager"), icon: Wrench },
      { title: t('presetDimensionManager.title'), url: createPageUrl("PresetDimensionManager"), icon: Scaling },
      { title: "Management", url: "", icon: Settings, isSection: true },
      { title: "Promoții", url: createPageUrl("PromotionManager"), icon: Percent },
      { title: "Procesatori Plăți", url: createPageUrl("PaymentProcessorManager"), icon: CreditCard },
      { title: "Utilizatori", url: createPageUrl("UserManager"), icon: UsersIcon },
      { title: "Loguri Utilizatori", url: createPageUrl("UserLogs"), icon: HistoryIcon },
      { title: t('contentManager.title'), url: createPageUrl("ContentManager"), icon: FileText },
      { title: "Date Companie", url: createPageUrl("CompanySettingsManager"), icon: Building2 },
      { title: "Template-uri Email", url: createPageUrl("EmailTemplateManager"), icon: FileText },
      { title: "Companii Montaj", url: createPageUrl("InstallationCompanyManager"), icon: Wrench },
      { title: "Comenzi", url: createPageUrl("OrderManager"), icon: ShoppingCart }
    ];

    return (
      <>
        <style>{`
          :root {
            --sidebar-width: 280px;
          }
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
        <div className="min-h-screen bg-background">
          <SidebarProvider>
            <div className="flex w-full">
              <Sidebar className="border-r border-border">
                <SidebarHeader className="border-b border-border p-6">
                  <Link to={createPageUrl("AdminDashboard")} className="flex items-center gap-3">
                    <Package className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl text-primary">RoWood PRO</span>
                  </Link>
                </SidebarHeader>
                <SidebarContent className="p-4">
                  <SidebarGroup>
                    <SidebarGroupContent>
                      <SidebarMenu className="space-y-1">
                        {adminNavigation.map((item, index) => (
                          item.isSection ? (
                            <SidebarGroupLabel key={index} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2 px-3 flex items-center gap-2">
                              {item.icon && <item.icon className="w-4 h-4" />}
                              {item.title}
                            </SidebarGroupLabel>
                          ) : (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton asChild className={`hover:bg-green-100 hover:text-green-700 transition-all duration-200 rounded-lg px-3 py-2.5 ${location.pathname === item.url ? 'bg-green-100 text-green-700 font-bold border-l-4 border-green-600' : 'text-foreground/70'}`}>
                                <Link to={item.url} className="flex items-center gap-3">
                                  <item.icon className="w-5 h-5" />
                                  <span className="font-medium">{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="p-4 space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Vezi Site-ul
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      // Logout local
                      localStorage.removeItem('rowood_session');
                      window.location.href = createPageUrl('Login');
                    }}
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </SidebarFooter>
              </Sidebar>
              <main className="flex-1 bg-background">
                <header className="bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4 md:hidden">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="hover:bg-secondary p-2 rounded-lg transition-colors" />
                    <h1 className="text-xl font-bold text-primary">RoWood PRO</h1>
                  </div>
                </header>
                <div className="p-6 admin-content">
                  <Breadcrumbs currentPageName={currentPageName} />
                  <div className="responsive-scroll">
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </div>
                </div>
                <div className="fixed bottom-4 right-4 md:hidden">
                  <SidebarTrigger className="rounded-full bg-green-600 text-white p-4 shadow-lg hover:bg-green-700 transition-colors">
                    <Menu className="w-6 h-6" />
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
    { title: t('cart'), url: createPageUrl("ShoppingCart"), icon: ShoppingCart, isIconOnly: true },
    { title: t('myOrders'), url: createPageUrl("MyOrders"), icon: FileText }
  ];

  const handleLogin = () => {
    window.location.href = createPageUrl('Login');
  };

  const handleLogout = () => {
    localStorage.removeItem('rowood_session');
    window.location.href = createPageUrl('Home');
  };

  const UserAuthBlock = ({ inSheet = false }) => {
    if (isLoadingAuth) {
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (globalUser) {
      return (
        <div className={`${inSheet ? 'space-y-3 w-full' : 'flex items-center gap-2'}`}>
          <div className={`p-3 rounded-lg ${inSheet ? 'bg-secondary w-full' : ''}`}>
            <span className="text-sm font-semibold text-foreground">
              Bună, {globalUser.full_name || globalUser.email}!
            </span>
          </div>

          {globalUser.role === 'admin' && !inSheet && (
            <Button asChild variant="outline" size="sm">
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
          <Button onClick={handleLogin} size="sm" className="bg-green-600 hover:bg-green-700">
            <LogIn className="w-4 h-4 mr-2" /> Login
          </Button>
        )
      );
    }
  };

  return (
    <>
      <style>{`
        :root {
          --header-height: 80px;
        }
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
      <div className="min-h-screen flex flex-col">
        <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link to={createPageUrl("Home")} className="flex items-center gap-3">
                <Package className="h-8 w-8 text-green-600" />
                <span className="font-bold text-2xl text-foreground">RoWood</span>
              </Link>
              <nav className="hidden md:flex space-x-1">
                {customerNavigation.map((item) => (
                  <Link key={item.title} to={item.url} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === item.url ? 'bg-green-100 text-green-700' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                    {item.isIconOnly ? (
                      <item.icon className="w-5 h-5" />
                    ) : (
                      item.title
                    )}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center gap-4">
                <LanguageSelector />

                <div className="hidden md:flex items-center gap-2">
                  <UserAuthBlock />
                </div>

                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Menu className="w-5 h-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle className="text-2xl font-bold text-green-600">Meniu</SheetTitle>
                      </SheetHeader>
                      <div className="mt-8 flex flex-col gap-2">
                        <nav className="flex flex-col gap-2">
                          {customerNavigation.map((item) => (
                            <SheetClose asChild key={item.title}>
                              <Link to={item.url} className={`flex items-center gap-4 p-4 rounded-lg text-lg font-medium transition-all duration-200 ${location.pathname === item.url ? 'bg-green-100 text-green-700' : 'text-muted-foreground hover:text-foreground hover:hover:bg-secondary'}`}>
                                <item.icon className="w-6 h-6" />
                                {item.title}
                              </Link>
                            </SheetClose>
                          ))}

                          {globalUser?.role === 'admin' && (
                            <SheetClose asChild>
                              <Link to={createPageUrl("AdminDashboard")} className="flex items-center gap-4 p-4 rounded-lg text-lg font-medium transition-all duration-200 bg-blue-100 text-blue-700 border border-blue-200 mt-2">
                                <Settings className="w-6 h-6" />
                                Admin Panel
                              </Link>
                            </SheetClose>
                          )}

                          {globalUser && (
                            <>
                              <div className="p-3 rounded-lg bg-secondary w-full text-left">
                                <span className="text-sm font-semibold text-foreground">
                                  Bună, {globalUser.full_name || globalUser.email}!
                                </span>
                              </div>
                              <Button
                                onClick={handleLogout}
                                variant="destructive"
                                size="lg"
                                className="w-full justify-start mt-4"
                              >
                                <LogOut className="w-6 h-6 mr-4" />
                                Logout
                              </Button>
                            </>
                          )}

                          {!globalUser && !isLoadingAuth && (
                            <Button
                              onClick={handleLogin}
                              size="lg"
                              className="bg-green-600 hover:bg-green-700 w-full justify-start mt-4"
                            >
                              <LogIn className="w-6 h-6 mr-4" />
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

        <footer className="bg-foreground text-background">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">RoWood</h3>
                <p className="text-sm text-background/80">{footerContent?.companyDescription || t('footer.companyDescriptionPlaceholder')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
                <ul className="space-y-2">
                  <li><Link to={createPageUrl("Home")} className="text-sm text-background/80 hover:text-primary transition-colors">{t('home')}</Link></li>
                  <li><Link to={createPageUrl("Products")} className="text-sm text-background/80 hover:text-primary transition-colors">{t('products')}</Link></li>
                  <li><Link to={createPageUrl("Configurator")} className="text-sm text-background/80 hover:text-primary transition-colors">{t('configurator')}</Link></li>
                  <li><Link to={createPageUrl("MyOrders")} className="text-sm text-background/80 hover:text-primary transition-colors">{t('myOrders')}</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
                {footerContent ? (
                  <>
                    <p className="text-sm text-background/80">
                      {footerContent.contactAddress}{footerContent.contactAddress && footerContent.contactCity ? ', ' : ''}
                      {footerContent.contactCity}{footerContent.contactCity && footerContent.contactCountry ? ', ' : ''}
                      {footerContent.contactCountry}
                    </p>
                    {footerContent.contactPhone && <p className="text-sm text-background/80">{t('footer.phone')}: {footerContent.contactPhone}</p>}
                    {footerContent.contactEmail && <p className="text-sm text-background/80">{t('footer.email')}: {footerContent.contactEmail}</p>}
                    {footerContent.workingHours && <p className="text-sm text-background/80 mt-2">{footerContent.workingHours}</p>}
                  </>
                ) : (
                  <p className="text-sm text-background/80">{t('footer.loadingData')}</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('footer.followUs')}</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-background/80 hover:text-primary transition-colors"><Users className="h-5 w-5" /></a>
                  <a href="#" className="text-background/80 hover:text-primary transition-colors"><Users className="h-5 w-5" /></a>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 mt-8 pt-8 text-center text-background/50">
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
