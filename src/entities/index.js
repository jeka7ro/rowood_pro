import { createClient } from '@base44/sdk';

// Client cu appId hardcodat - nu depinde de .env sau plugin
const client = createClient({
  appId: '68c13cefb4bf14d17f2c2392',
  requiresAuth: false
});

const makeEntity = (name) => client.entities[name];

export const Product = makeEntity('Product');
export const Material = makeEntity('Material');
export const SubMaterial = makeEntity('SubMaterial');
export const Color = makeEntity('Color');
export const GlazingType = makeEntity('GlazingType');
export const AccessoryOption = makeEntity('AccessoryOption');
export const Order = makeEntity('Order');
export const CartItem = makeEntity('CartItem');
export const Configuration = makeEntity('Configuration');
export const CompanySettings = makeEntity('CompanySettings');
export const HomePageContent = makeEntity('HomePageContent');
export const EmailTemplate = makeEntity('EmailTemplate');
export const Lead = makeEntity('Lead');
export const Deal = makeEntity('Deal');
export const Activity = makeEntity('Activity');
export const Contact = makeEntity('Contact');
export const InstallationCompany = makeEntity('InstallationCompany');
export const PresetDimension = makeEntity('PresetDimension');
export const PromotionEvent = makeEntity('PromotionEvent');
export const Profile = makeEntity('Profile');
export const MechanismType = makeEntity('MechanismType');
export const UserLog = makeEntity('UserLog');
export const PaymentProcessor = makeEntity('PaymentProcessor');
export const PaymentTransaction = makeEntity('PaymentTransaction');
export const User = client.auth;
