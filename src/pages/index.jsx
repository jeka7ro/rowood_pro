import Layout from "./Layout.jsx";

import Home from "./Home";

import Configurator from "./Configurator";

import AdminDashboard from "./AdminDashboard";

import Products from "./Products";

import ProductManager from "./ProductManager";

import MaterialManager from "./MaterialManager";

import ColorManager from "./ColorManager";

import GlazingManager from "./GlazingManager";

import AccessoryManager from "./AccessoryManager";

import OrderManager from "./OrderManager";

import ContentManager from "./ContentManager";

import PresetDimensionManager from "./PresetDimensionManager";

import MyOrders from "./MyOrders";

import Checkout from "./Checkout";

import OrderSuccess from "./OrderSuccess";

import ShoppingCart from "./ShoppingCart";

import CRMDashboard from "./CRMDashboard";

import LeadManager from "./LeadManager";

import DealManager from "./DealManager";

import ActivityManager from "./ActivityManager";

import ContactManager from "./ContactManager";

import SubMaterialManager from "./SubMaterialManager";

import ConfigurationView from "./ConfigurationView";

import OrderDetails from "./OrderDetails";

import OrderPrint from "./OrderPrint";

import CompanySettingsManager from "./CompanySettingsManager";

import EmailTemplateManager from "./EmailTemplateManager";

import OrderPDF from "./OrderPDF";

import InstallationCompanyManager from "./InstallationCompanyManager";

import PromotionManager from "./PromotionManager";

import UserManager from "./UserManager";

import UserLogs from "./UserLogs";

import PaymentProcessorManager from "./PaymentProcessorManager";

import Payment from "./Payment";

import PaymentSuccess from "./PaymentSuccess";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Configurator: Configurator,
    
    AdminDashboard: AdminDashboard,
    
    Products: Products,
    
    ProductManager: ProductManager,
    
    MaterialManager: MaterialManager,
    
    ColorManager: ColorManager,
    
    GlazingManager: GlazingManager,
    
    AccessoryManager: AccessoryManager,
    
    OrderManager: OrderManager,
    
    ContentManager: ContentManager,
    
    PresetDimensionManager: PresetDimensionManager,
    
    MyOrders: MyOrders,
    
    Checkout: Checkout,
    
    OrderSuccess: OrderSuccess,
    
    ShoppingCart: ShoppingCart,
    
    CRMDashboard: CRMDashboard,
    
    LeadManager: LeadManager,
    
    DealManager: DealManager,
    
    ActivityManager: ActivityManager,
    
    ContactManager: ContactManager,
    
    SubMaterialManager: SubMaterialManager,
    
    ConfigurationView: ConfigurationView,
    
    OrderDetails: OrderDetails,
    
    OrderPrint: OrderPrint,
    
    CompanySettingsManager: CompanySettingsManager,
    
    EmailTemplateManager: EmailTemplateManager,
    
    OrderPDF: OrderPDF,
    
    InstallationCompanyManager: InstallationCompanyManager,
    
    PromotionManager: PromotionManager,
    
    UserManager: UserManager,
    
    UserLogs: UserLogs,
    
    PaymentProcessorManager: PaymentProcessorManager,
    
    Payment: Payment,
    
    PaymentSuccess: PaymentSuccess,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Configurator" element={<Configurator />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/Products" element={<Products />} />
                
                <Route path="/ProductManager" element={<ProductManager />} />
                
                <Route path="/MaterialManager" element={<MaterialManager />} />
                
                <Route path="/ColorManager" element={<ColorManager />} />
                
                <Route path="/GlazingManager" element={<GlazingManager />} />
                
                <Route path="/AccessoryManager" element={<AccessoryManager />} />
                
                <Route path="/OrderManager" element={<OrderManager />} />
                
                <Route path="/ContentManager" element={<ContentManager />} />
                
                <Route path="/PresetDimensionManager" element={<PresetDimensionManager />} />
                
                <Route path="/MyOrders" element={<MyOrders />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/OrderSuccess" element={<OrderSuccess />} />
                
                <Route path="/ShoppingCart" element={<ShoppingCart />} />
                
                <Route path="/CRMDashboard" element={<CRMDashboard />} />
                
                <Route path="/LeadManager" element={<LeadManager />} />
                
                <Route path="/DealManager" element={<DealManager />} />
                
                <Route path="/ActivityManager" element={<ActivityManager />} />
                
                <Route path="/ContactManager" element={<ContactManager />} />
                
                <Route path="/SubMaterialManager" element={<SubMaterialManager />} />
                
                <Route path="/ConfigurationView" element={<ConfigurationView />} />
                
                <Route path="/OrderDetails" element={<OrderDetails />} />
                
                <Route path="/OrderPrint" element={<OrderPrint />} />
                
                <Route path="/CompanySettingsManager" element={<CompanySettingsManager />} />
                
                <Route path="/EmailTemplateManager" element={<EmailTemplateManager />} />
                
                <Route path="/OrderPDF" element={<OrderPDF />} />
                
                <Route path="/InstallationCompanyManager" element={<InstallationCompanyManager />} />
                
                <Route path="/PromotionManager" element={<PromotionManager />} />
                
                <Route path="/UserManager" element={<UserManager />} />
                
                <Route path="/UserLogs" element={<UserLogs />} />
                
                <Route path="/PaymentProcessorManager" element={<PaymentProcessorManager />} />
                
                <Route path="/Payment" element={<Payment />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}