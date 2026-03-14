import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, Wrench, MapPin, Info } from "lucide-react";
import { Material } from "@/entities/Material";
import { Product } from "@/entities/Product";

const countries = [
  { code: "RO", name: "România", flag: "🇷🇴" },
  { code: "DE", name: "Germania", flag: "🇩🇪" },
  { code: "FR", name: "Franța", flag: "🇫🇷" },
  { code: "IT", name: "Italia", flag: "🇮🇹" },
  { code: "ES", name: "Spania", flag: "🇪🇸" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "HU", name: "Ungaria", flag: "🇭🇺" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" }
];

function formatEUR(v) {
  return (v || 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

export default function DeliveryInstallationSection() {
  // Stable hooks order; no early return
  const [materials, setMaterials] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [cart, setCart] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [deliveryCountry, setDeliveryCountry] = React.useState("RO");
  const [includeTransport, setIncludeTransport] = React.useState(false);
  const [includeInstallation, setIncludeInstallation] = React.useState(false);

  // Load reference data and cart (guest cart supported)
  React.useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [mats, prods] = await Promise.all([Material.list(), Product.list()]);
        setMaterials(mats || []);
        setProducts(prods || []);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  React.useEffect(() => {
    // Try guest cart
    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    setCart(guestCart || []);
    // Restore previous selection if exists
    const saved = JSON.parse(localStorage.getItem("checkout_delivery_settings") || "null");
    if (saved) {
      setDeliveryCountry(saved.delivery_country || "RO");
      setIncludeTransport(!!saved.include_transport);
      setIncludeInstallation(!!saved.include_installation);
    }
  }, []);

  const totals = React.useMemo(() => {
    // Compute total area and costs using materials.product_specific_pricing
    let totalArea = 0;
    let transportCost = 0;
    let installationCost = 0;

    cart.forEach((item) => {
      const cfg = item.configuration || {};
      const width = Number(cfg.width || 0);
      const height = Number(cfg.height || 0);
      const qty = Number(item.quantity || 1);
      if (!width || !height || !cfg.material_id || !item.product_id) return;

      const areaOne = (width * height) / 1000000; // m²
      const areaAll = areaOne * qty;
      totalArea += areaAll;

      const mat = materials.find((m) => m.id === cfg.material_id);
      const prodPricing = mat?.product_specific_pricing?.find((p) => p.product_id === item.product_id);
      if (!prodPricing) return;

      if (includeTransport) {
        const perSqm =
          deliveryCountry === "RO"
            ? (prodPricing.transport_ro_price_per_sqm || 0)
            : (prodPricing.transport_external_price_per_sqm || 0);
        transportCost += perSqm * areaAll;
      }

      if (includeInstallation && deliveryCountry === "RO") {
        // Using hardware_fixed_price as installation placeholder (consistent with configurator)
        const install = prodPricing.hardware_fixed_price || 0;
        installationCost += install * qty;
      }
    });

    const extra = transportCost + installationCost;
    return { totalArea, transportCost, installationCost, extra };
  }, [cart, materials, includeTransport, includeInstallation, deliveryCountry]);

  // Persist + notify parent (Checkout) on changes
  const persistAndNotify = React.useCallback(() => {
    const payload = {
      delivery_country: deliveryCountry,
      include_transport: includeTransport,
      include_installation: includeInstallation,
      transport_cost: totals.transportCost,
      installation_cost: totals.installationCost,
      extra_total: totals.extra
    };
    localStorage.setItem("checkout_delivery_settings", JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("delivery-installation-updated", { detail: payload }));
  }, [deliveryCountry, includeTransport, includeInstallation, totals]);

  React.useEffect(() => {
    persistAndNotify();
  }, [persistAndNotify]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Livrare & Montaj
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Country */}
          <div>
            <Label className="text-sm font-medium">Țara de livrare</Label>
            <Select
              value={deliveryCountry}
              onValueChange={(v) => {
                setDeliveryCountry(v);
                if (v !== "RO") setIncludeInstallation(false); // install only in RO
              }}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selectează țara" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span> {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transport */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="include-transport-co"
              checked={includeTransport}
              onCheckedChange={(ch) => setIncludeTransport(!!ch)}
            />
            <div className="flex-1">
              <Label htmlFor="include-transport-co" className="cursor-pointer text-sm font-medium">
                Doresc transport
              </Label>
              {includeTransport && (
                <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-800">
                      Transport către {countries.find((c) => c.code === deliveryCountry)?.name}
                    </span>
                    <Badge variant="secondary">{formatEUR(totals.transportCost)}</Badge>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Suprafață totală estimată: {totals.totalArea.toFixed(2)} m²
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Installation */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="include-install-co"
              checked={includeInstallation}
              disabled={deliveryCountry !== "RO"}
              onCheckedChange={(ch) => setIncludeInstallation(!!ch)}
            />
            <div className="flex-1">
              <Label
                htmlFor="include-install-co"
                className={`cursor-pointer text-sm font-medium ${deliveryCountry !== "RO" ? "opacity-50" : ""}`}
              >
                Doresc montaj (disponibil doar în România)
              </Label>
              {includeInstallation && deliveryCountry === "RO" && (
                <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800">Montaj</span>
                    <Badge variant="secondary">{formatEUR(totals.installationCost)}</Badge>
                  </div>
                </div>
              )}
              {deliveryCountry !== "RO" && (
                <div className="mt-2 p-2 rounded bg-slate-50 text-slate-600 text-xs flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  Montajul extern va fi gestionat separat prin partenerii locali.
                </div>
              )}
            </div>
          </div>

          {/* Extra total */}
          <div className="p-3 rounded bg-slate-50 border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-700">Costuri suplimentare (transport + montaj)</div>
              <div className="text-lg font-semibold">{formatEUR(totals.extra)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}