import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Shield,
  Wind,
  Feather,
  Leaf,
  Star,
  Award,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useTranslation } from "../components/translations/TranslationProvider";
import { HomePageContent } from "@/entities/HomePageContent";
import { Product } from "@/entities/Product";

export default function Home() {
  const { t, currentLanguage } = useTranslation();
  const [content, setContent] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let pageContent = await HomePageContent.filter({ language_code: currentLanguage });
      if (!pageContent || pageContent.length === 0) {
        pageContent = await HomePageContent.filter({ language_code: 'ro' });
      }

      if (!pageContent || pageContent.length === 0) {
        throw new Error("Content not found for any language.");
      }

      setContent(pageContent[0]);

      const homepageProducts = await Product.filter({
        show_on_homepage: true,
        is_active: true
      }, '-created_date', 6);
      setFeaturedProducts(homepageProducts);

    } catch (err) {
      console.error("Failed to fetch homepage content or products:", err);
      let errorMessage = "Conținutul nu a putut fi încărcat. Vă rugăm să încercați din nou.";
      if (err.message && err.message.includes("Network Error")) {
        errorMessage = "Eroare de rețea. Verificați conexiunea la internet și reîncărcați.";
      } else if (err.message === "Content not found for any language.") {
        errorMessage = "Conținutul paginii principale nu este disponibil momentan.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-slate-950">
        <div className="text-center max-w-md p-8 bg-white dark:bg-slate-900 shadow-lg rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-400">A apărut o eroare</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-2 mb-6">{error}</p>
          <Button onClick={fetchContent} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reîncearcă
          </Button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Conținutul nu este disponibil momentan.</p>
      </div>
    );
  }

  const features = [
      { icon: Shield, title: content.feature1_title, description: content.feature1_description, color: "text-primary" },
      { icon: Wind, title: content.feature2_title, description: content.feature2_description, color: "text-primary" },
      { icon: Feather, title: content.feature3_title, description: content.feature3_description, color: "text-primary" },
      { icon: Leaf, title: content.feature4_title, description: content.feature4_description, color: "text-primary" }
  ];

  const stats = [
      { icon: Users, number: content.stat1_number, label: content.stat1_label },
      { icon: Award, number: content.stat2_number, label: content.stat2_label },
      { icon: Star, number: content.stat3_number, label: content.stat3_label }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-background overflow-hidden py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[32px] overflow-hidden shadow-2xl">
            <div className="absolute inset-0">
              <img 
                src={content.heroImage || "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=800&fit=crop"}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 bg-gradient-to-t from-black/60 via-black/40 to-transparent"></div>
            </div>
            <div className="relative px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                {content.heroTitle}
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.6)'}}>
                {content.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg text-white shadow-lg">
                  <Link to={createPageUrl("Configurator")}>
                    Configurează Acum
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold shadow-lg">
                  <Link to={createPageUrl("Products")}>
                    Vezi Produsele
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Produse Recomandate
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Descoperă cele mai populare soluții din lemn pentru casa ta
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="border-border shadow-lg hover:shadow-xl transition-all duration-300 group bg-card">
                  <div className="relative overflow-hidden">
                    <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-background">
                      <img
                        src={product.image_urls?.[0] || "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop&auto=format"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {product.is_featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-green-600 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Recomandat
                        </Badge>
                      </div>
                    )}

                    <div className="absolute top-4 right-4">
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        de la {product.base_price}€/m²
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Lățime:</span>
                        <span className="font-medium text-foreground">{product.min_width}-{product.max_width}mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Înălțime:</span>
                        <span className="font-medium text-foreground">{product.min_height}-{product.max_height}mm</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="px-6 pb-6">
                    <div className="flex gap-3">
                      <Link to={createPageUrl(`Configurator?product_id=${product.id}`)} className="flex-1">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          Configurează
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to={createPageUrl("Products")}>
                <Button variant="outline" size="lg" className="px-8 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700">
                  Vezi Toate Produsele
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {content.whyChooseUsTitle}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {content.whyChooseUsSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group bg-background">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 text-primary`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-800 dark:bg-green-900 rounded-[32px] px-8 py-16 text-white shadow-2xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors duration-300">
                    <stat.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold mb-2 text-white">{stat.number}</div>
                  <div className="text-green-200 dark:text-green-300 text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-800 via-green-700 to-green-900 dark:from-green-900 dark:via-green-800 dark:to-green-950 rounded-[32px] px-8 py-16 text-white text-center shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
              {content.ctaTitle}
            </h2>
            <p className="text-xl text-green-100 dark:text-green-200 mb-8 leading-relaxed max-w-3xl mx-auto" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}>
              {content.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Configurator")}>
                <Button size="lg" className="bg-white hover:bg-green-50 text-green-800 hover:text-green-900 px-8 py-4 text-lg font-semibold shadow-lg border-2 border-white">
                  Începe Configurarea
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Products")}>
                <Button size="lg" className="bg-green-600 hover:bg-green-700 border-2 border-green-400 text-white px-8 py-4 text-lg font-semibold shadow-lg">
                  Vezi Produsele
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}