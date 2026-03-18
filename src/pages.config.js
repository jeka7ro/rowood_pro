import Home from './pages/Home';
import Configurator from './pages/Configurator';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/Products';
import ProductManager from './pages/ProductManager';
import MaterialManager from './pages/MaterialManager';
import ColorManager from './pages/ColorManager';
import GlazingManager from './pages/GlazingManager';
import AccessoryManager from './pages/AccessoryManager';
import OrderManager from './pages/OrderManager';
import ContentManager from './pages/ContentManager';
import PresetDimensionManager from './pages/PresetDimensionManager';
import MyOrders from './pages/MyOrders';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import ShoppingCart from './pages/ShoppingCart';
import CRMDashboard from './pages/CRMDashboard';
import LeadManager from './pages/LeadManager';
import DealManager from './pages/DealManager';
import ActivityManager from './pages/ActivityManager';
import ContactManager from './pages/ContactManager';
import SubMaterialManager from './pages/SubMaterialManager';
import ConfigurationView from './pages/ConfigurationView';
import OrderDetails from './pages/OrderDetails';
import OrderPrint from './pages/OrderPrint';
import CompanySettingsManager from './pages/CompanySettingsManager';
import EmailTemplateManager from './pages/EmailTemplateManager';
import OrderPDF from './pages/OrderPDF';
import InstallationCompanyManager from './pages/InstallationCompanyManager';
import PromotionManager from './pages/PromotionManager';
import UserManager from './pages/UserManager';
import UserLogs from './pages/UserLogs';
import PaymentProcessorManager from './pages/PaymentProcessorManager';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminLogs from './pages/AdminLogs';
import Analytics from './pages/Analytics';
import ProfileManager from './pages/ProfileManager';
import MechanismManager from './pages/MechanismManager';
import PriceManagement from './pages/PriceManagement';
import Login from './pages/Login';
import FactoryManager from './pages/FactoryManager';
import HardwareManager from './pages/HardwareManager';
import InventoryManager from './pages/InventoryManager';
import CostAnalysisPage from './pages/CostAnalysisPage';
import PricingCenter from './pages/PricingCenter';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Configurator": Configurator,
    "AdminDashboard": AdminDashboard,
    "Products": Products,
    "ProductManager": ProductManager,
    "MaterialManager": MaterialManager,
    "ColorManager": ColorManager,
    "GlazingManager": GlazingManager,
    "AccessoryManager": AccessoryManager,
    "OrderManager": OrderManager,
    "ContentManager": ContentManager,
    "PresetDimensionManager": PresetDimensionManager,
    "MyOrders": MyOrders,
    "Checkout": Checkout,
    "OrderSuccess": OrderSuccess,
    "ShoppingCart": ShoppingCart,
    "CRMDashboard": CRMDashboard,
    "LeadManager": LeadManager,
    "DealManager": DealManager,
    "ActivityManager": ActivityManager,
    "ContactManager": ContactManager,
    "SubMaterialManager": SubMaterialManager,
    "ConfigurationView": ConfigurationView,
    "OrderDetails": OrderDetails,
    "OrderPrint": OrderPrint,
    "CompanySettingsManager": CompanySettingsManager,
    "EmailTemplateManager": EmailTemplateManager,
    "OrderPDF": OrderPDF,
    "InstallationCompanyManager": InstallationCompanyManager,
    "PromotionManager": PromotionManager,
    "UserManager": UserManager,
    "UserLogs": UserLogs,
    "PaymentProcessorManager": PaymentProcessorManager,
    "Payment": Payment,
    "PaymentSuccess": PaymentSuccess,
    "AdminLogs": AdminLogs,
    "Analytics": Analytics,
    "ProfileManager": ProfileManager,
    "MechanismManager": MechanismManager,
    "PriceManagement": PriceManagement,
    "Login": Login,
    "FactoryManager": FactoryManager,
    "HardwareManager": HardwareManager,
    "InventoryManager": InventoryManager,
    "CostAnalysisPage": CostAnalysisPage,
    "PricingCenter": PricingCenter,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};