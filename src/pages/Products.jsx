import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  ArrowRight,
  Info,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useTranslation } from "../components/translations/TranslationProvider";

function ProductCard({ product }) {
  const { t } = useTranslation();
  
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 aspect-[4/3]">
        <img
          src={product.image_urls?.[0] || "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {product.is_featured && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-green-600 text-white shadow-lg">
              <span className="text-xs font-bold">{t('recommended')}</span>
            </Badge>
          </div>
        )}
        
        {product.is_on_promotion && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-red-600 text-white shadow-lg animate-pulse">
              <span className="text-xs font-bold">PROMO</span>
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="p-6 bg-white dark:bg-slate-900">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {product.description || 'Produs premium pentru casa ta'}
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-4 bg-white dark:bg-slate-900">
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('width')}:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{product.min_width}-{product.max_width}mm</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('height')}:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{product.min_height}-{product.max_height}mm</span>
          </div>
          
          {product.sashes > 0 && (
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Canaturi:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{product.sashes}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-3 bg-white dark:bg-slate-900">
        <Link to={createPageUrl(`Configurator?product_id=${product.id}`)} className="flex-1">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            Configurează Acum
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Button 
          variant="outline" 
          className="px-4 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
        >
          <Info className="w-4 h-4 text-slate-700 dark:text-slate-300" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function CategorySection({ category, products, t }) {
  const categoryTitles = {
    ferestre: "Ferestre",
    usi: "Uși de Intrare",
    "usi-balcon": "Uși de Balcon"
  };

  const categoryDescriptions = {
    ferestre: "Ferestre moderne cu performanțe energetice superioare",
    usi: "Uși de intrare sigure și estetice pentru casa ta",
    "usi-balcon": "Soluții elegante pentru accesul pe terasă sau balcon"
  };

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          {categoryTitles[category] || category}
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {categoryDescriptions[category] || 'Produse de calitate superioară'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await base44.entities.Product.filter({ is_active: true });
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Nu am putut încărca produsele. Vă rugăm să încercați din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const productsByCategory = filteredProducts.reduce((acc, product) => {
    const category = product.category || 'altele';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Se încarcă produsele...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-slate-950">
        <div className="text-center max-w-md p-8 bg-white dark:bg-slate-900 shadow-lg rounded-2xl border border-red-200 dark:border-red-800">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">A apărut o eroare</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Button onClick={loadProducts} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reîncearcă
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('productsPageTitle')}
          </h1>
          <p className="text-xl text-slate-300 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
            {t('productsPageDesc')}
          </p>

          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-2xl shadow-lg text-base"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl shadow-lg">
                <SelectValue placeholder={t('allCategories')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectItem value="all" className="text-slate-900 dark:text-slate-100">
                  {t('allCategories')}
                </SelectItem>
                <SelectItem value="ferestre" className="text-slate-900 dark:text-slate-100">
                  Ferestre
                </SelectItem>
                <SelectItem value="usi" className="text-slate-900 dark:text-slate-100">
                  Uși de Intrare
                </SelectItem>
                <SelectItem value="usi-balcon" className="text-slate-900 dark:text-slate-100">
                  Uși de Balcon
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700">
            <AlertCircle className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t('noProductsFound')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('noProductsFoundDesc')}
            </p>
          </div>
        ) : selectedCategory === "all" ? (
          Object.entries(productsByCategory).map(([category, categoryProducts]) => (
            <CategorySection 
              key={category} 
              category={category} 
              products={categoryProducts}
              t={t}
            />
          ))
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}