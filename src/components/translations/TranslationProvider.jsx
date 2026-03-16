import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  ro: {
    // General / Common
    save: 'Salvează',
    cancel: 'Anulează',
    edit: 'Editează',
    delete: 'Șterge',
    add: 'Adaugă',
    close: 'Închide',
    active: 'Activ',
    inactive: 'Inactiv',
    status: 'Status',
    actions: 'Acțiuni',
    price: 'Preț',
    total: 'TOTAL',
    subtotal: 'Subtotal',
    vat: 'TVA (21%)',
    currency: 'EUR',
    pricePerSqm: '€/m²',
    from: 'de la',
    details: 'Detalii',
    required: 'Necesar',
    recommended: 'Recomandat',
    width: 'Lățime',
    height: 'Înălțime',
    description: 'Descriere',
    name: 'Nume',
    category: 'Categorie',
    quantity: 'Cantitate',
    piece: 'bucată',
    pieces: 'bucăți',
    continued: 'continuare',
    glazingDetailsTitle: 'Detalii Sticlă',
    glazingPanesCount: 'Foi Sticlă',
    glazingUValue: 'Valoare U',
    glazingThickness: 'Grosime',
    glazingEnergyEfficiency: 'Eficiență Energetică',
    glazingSoundInsulation: 'Izolare Fonică',
    selectedAccessories: 'Accesorii Selectate',
    loading: 'Se încarcă...',
    loadingDashboard: 'Se încarcă dashboard-ul...',
    loadingAnalytics: 'Se încarcă analytics...',
    loadingUsers: 'Se încarcă utilizatorii...',
    refresh: 'Reîmprospătează',
    search: 'Caută',
    filter: 'Filtrează',
    export: 'Exportă',
    noDataAvailable: 'Nu există date disponibile',
    error: 'Eroare',
    success: 'Succes',

    // Layout & Navigation
    home: 'Acasă',
    products: 'Produse',
    configurator: 'Configurator',
    shoppingCart: 'Coș',
    myOrders: 'Comenzile Mele',
    admin: 'Admin',
    tagline: 'Esența Lemnului în Casa Ta',
    backToSite: 'Înapoi la Site',
    viewSite: 'Vezi Site-ul',
    logout: 'Logout',
    login: 'Login',

    // Analytics translations
    analytics: {
      title: 'Analytics & Tracking',
      subtitle: 'Monitorizare completă activitate utilizatori',
      allVisitors: 'Toți Vizitatorii',
      anonymousOnly: 'Doar Anonimi',
      authenticatedOnly: 'Doar Autentificați',
      today: 'Azi',
      last7Days: 'Ultimele 7 zile',
      last30Days: 'Ultimele 30 zile',
      last90Days: 'Ultimele 90 zile',
      totalSessions: 'Sesiuni Totale',
      pageViews: 'Vizualizări Pagini',
      conversions: 'Conversii',
      avgTime: 'Timp Mediu',
      onPage: 'Pe pagină',
      anonymous: 'anonimi',
      authenticated: 'auth',
      totalPageViews: 'Total page views',
      conversionRate: 'rată conversie',
      showingAnonymous: 'Afișare doar vizitatori anonimi (fără cont)',
      showingAuthenticated: 'Afișare doar utilizatori autentificați (cu cont)',
      resetFilter: 'Resetează Filtru',
      viewsEvolution: 'Evoluție Vizualizări',
      activityTypes: 'Tipuri Activități',
      devices: 'Dispozitive',
      userTypes: 'Tip Utilizatori',
      topPages: 'Top 10 Pagini',
      views: 'vizualizări'
    },

    // User Manager translations
    userManager: {
      title: 'Utilizatori',
      subtitle: 'Gestionează utilizatorii și permisiunile lor',
      searchPlaceholder: 'Nume sau email...',
      role: 'Rol',
      allRoles: 'Toate Rolurile',
      admin: 'Admin',
      user: 'User',
      userList: 'Lista utilizatori',
      lastLogin: 'Ultimul Login',
      createdAt: 'Creat la',
      never: 'Niciodată',
      you: 'Tu',
      administrator: 'Administrator',
      protected: 'Protejat',
      confirmRoleChange: 'Confirmare Schimbare Rol',
      confirmMessage: 'Ești sigur că vrei să schimbi rolul utilizatorului:',
      warning: 'Atenție',
      adminWarning: 'Acest utilizator va avea acces complet la panoul de administrare!',
      confirmChange: 'Confirmă Schimbarea',
      roleChanged: 'Rolul utilizatorului {email} a fost schimbat la "{role}".',
      noUsersFound: 'Niciun utilizator găsit',
      modifyFilters: 'Încearcă să modifici filtrele de căutare'
    },

    // Admin Dashboard translations
    adminDashboard: {
      title: 'Dashboard Administrator',
      subtitle: 'Bun venit în centrul de control RoWood',
      totalOrders: 'Comenzi Totale',
      products: 'Produse',
      materials: 'Materiale',
      colors: 'Culori',
      glazingTypes: 'Tipuri Sticlă',
      accessories: 'Accesorii',
      factoryManager: 'Factory Manager (BOM)',
      totalInDb: 'Total în baza de date',
      recentActivity: 'Activitate Recentă',
      activityPlaceholder: 'Aici va fi un grafic cu vânzările și activitatea recentă...',
      totalLeads: 'Lead-uri Totale',
      openDeals: 'Deal-uri Deschise',
      conversionRate: 'Rata de Conversie',
      salesPipeline: 'Pipeline Vânzări',
      totalRevenue: 'VENITURI TOTALE',
      fromAllOrders: 'Din toate comenzile plasate',
      salesEvolution: 'Evoluția Vânzărilor',
      lastQuarter: 'ULTIM TRIMESTRU',
      sales: 'Vânzări',
      noDataToDisplay: 'Nu există date de afișat',
      ordersWillAppear: 'Comenzile vor apărea aici',
      element: 'element',
      elements: 'elemente',
      noElements: 'Niciun element încă'
    },

    // Home Page
    heroTitle: 'Căldura Lemnului, Claritatea Sticlei',
    heroSubtitle: 'Soluții personalizate de ferestre și uși din lemn masiv, create pentru a aduce armonie, lumină și eficiență energetică în casa ta.',
    configureNow: 'Configurează Acum',
    viewProducts: 'Vezi Produsele',
    featuredProducts: 'Produse Recomandate',
    featuredProductsDesc: 'Descoperă cele mai populare soluții din lemn pentru casa ta',
    viewAllProducts: 'Vezi Toate Produsele',
    whyChooseUsTitle: 'De ce să alegi RoWood?', 
    whyChooseUsSubtitle: 'Folosim lemn masiv, tratat ecologic, pentru a crea ferestre care aduc căldura și frumusețea pădurii în spațiul tău.',
    feature1_title: 'Lemn Rezistent',
    feature1_description: 'Selectăm și tratăm lemnul pentru a garanta o viață lungă și rezistență la intemperii.',
    feature2_title: 'Izolație Naturală',
    feature2_description: 'Proprietățile naturale ale lemnului oferă o izolație termică și fonică superioară.',
    feature3_title: 'Design Organic',
    feature3_description: 'Fiecare piesă are o textură unică. Finisaje variate pentru a complimenta orice stil.',
    feature4_title: 'Măiestrie Artizanală',
    feature4_description: 'Meșterii noștri transformă lemnul în opere de artă funcționale, cu atenție la detalii.',
    stat1_number: '10,000+',
    stat1_label: 'Clienți Mulțumiți',
    stat2_number: '15+',
    stat2_label: 'Ani de Experiență',
    stat3_number: '4.9/5',
    stat3_label: 'Rating Mediu',
    ctaTitle: 'Gata să Îți Transformi Casa?',
    ctaSubtitle: 'Folosește configuratorul nostru inteligent pentru a crea soluția perfectă pentru nevoile tale.',
    startConfiguration: 'Începe Configurarea',

    // Products Page
    productsPageTitle: 'Catalogul Nostru de Produse',
    productsPageDesc: 'Explorați gama completă de ferestre și uși premium. Fiecare produs poate fi personalizat conform nevoilor dumneavoastră.',
    searchPlaceholder: 'Căutați produse...',
    allCategories: 'Toate categoriile',
    noProductsFound: 'Nu s-au găsit produse',
    noProductsFoundDesc: 'Încercați să modificați criteriile de căutare.',

    // Configurator Page
    configuratorPageTitle: 'Configurator Ferestre și Uși Premium',
    configuratorPageDesc: 'Creează-ți produsul perfect pas cu pas. Prețul se actualizează în timp real.',
    loadingData: 'Se încarcă datele...',
    yourConfiguration: 'Configurația Dvs.',
    step: 'Pasul',
    nextStep: 'Pasul Următor',
    prevStep: 'Pasul Anterior',
    addToCart: 'Adaugă în Coș',

    // MESAJE ALERT PENTRU CONFIGURATOR
    configuratorAlertTitle: 'Pasul nu poate fi accesat încă',
    configuratorAlertMaterial: 'Vă rugăm să selectați mai întâi un material pentru a continua.',
    configuratorAlertProduct: 'Vă rugăm să selectați mai întâi un produs pentru a continua.',
    configuratorAlertMechanism: 'Vă rugăm să alegeți mai întâi un model de mecanism/deschidere.',
    configuratorAlertDimensions: 'Vă rugăm să setați mai întâi dimensiunile produsului.',
    configuratorAlertGlazing: 'Vă rugăm să selectați mai întâi tipul de sticlă.',
    configuratorAlertAccessories: 'Accesoriile sunt opționale, puteți continua.',
    configuratorAlertServices: 'Serviciile de transport și montaj sunt opționale.',
    configuratorAlertSummary: 'Vă rugăm să completați toate pașii anteriori pentru a vedea sumarul.',
    configuratorAlertGeneral: 'Vă rugăm să completați pașii anteriori în ordine.',
    configuratorUnderstoodButton: 'Am înțeles',

    // Configurator Steps
    steps: {
      product: 'Produs',
      dimensions: 'Dimensiuni',
      material: 'Material & Culoare',
      glazing: 'Sticlă',
      handle: 'Mâner',
      accessories: 'Accesorii',
      summary: 'Sumar',
    },

    // CRM Pages
    leadManager: {
      title: 'Management Lead-uri',
      description: 'Gestionează potențialii clienți și convertește-i în oportunități.',
      addLead: 'Adaugă Lead',
      editLead: 'Editează Lead',
      newLead: 'Lead Nou',
      table: {
        contact: 'Contact',
        company: 'Companie',
        status: 'Status',
        source: 'Sursă',
        assignedTo: 'Alocat Lui'
      }
    },
    dealManager: {
      title: 'Pipeline Vânzări',
      description: 'Urmărește vizual progresul tuturor tranzacțiilor.',
      addDeal: 'Adaugă Deal',
      totalValue: 'Valoare Totală'
    },
    activityManager: {
      title: 'Management Activități',
      description: 'Gestionează toate sarcinile, întâlnirile și emailurile.',
      addActivity: 'Adaugă Activitate',
      overdue: 'Întârziate',
      dueToday: 'Azi',
      upcoming: 'Următoarele'
    },
    contactManager: {
      title: 'Management Contacte',
      description: 'Gestionează baza de date de clienți și contacte.',
      addContact: 'Adaugă Contact',
      editContact: 'Editează Contact',
      newContact: 'Contact Nou',
      table: {
        contact: 'Contact',
        company: 'Companie',
        type: 'Tip',
        totalValue: 'Valoare Totală'
      }
    },

    productManager: {
      title: 'Management Produse',
      description: 'Gestionează produsele, prețurile și specificațiile acestora.',
      addProduct: 'Adaugă Produs',
      editProduct: 'Editează Produs',
      newProduct: 'Produs Nou',
      table: {
        product: 'Produs',
        category: 'Categorie',
        basePrice: 'Preț Bază',
        status: 'Status',
        actions: 'Acțiuni'
      }
    },
    materialManager: {
      title: 'Management Materiale',
      description: 'Gestionează materialele disponibile pentru ferestre și uși.',
      addMaterial: 'Adaugă Material',
      editMaterial: 'Editează Material',
      newMaterial: 'Material Nou',
      table: {
        material: 'Material',
        priceMultiplier: 'Multiplicator Preț',
        status: 'Status',
        actions: 'Acțiuni'
      }
    },
    colorManager: {
      title: 'Management Culori',
      description: 'Gestionează culorile disponibile pentru produse.',
      addColor: 'Adaugă Culoare',
      editColor: 'Editează Culoare',
      newColor: 'Culoare Nouă'
    },
    glazingManager: {
      title: 'Management Sticlă',
      description: 'Gestionează tipurile de sticlă disponibile.',
      addGlazing: 'Adaugă Tip Sticlă',
      editGlazing: 'Editează Tip Sticlă'
    },
    accessoryManager: {
      title: 'Management Accesorii',
      description: 'Gestionează accesoriile disponibile.',
      addAccessory: 'Adaugă Accesoriu',
      editAccessory: 'Editează Accesoriu'
    },
    presetDimensionManager: {
      title: 'Management Dimensiuni',
      description: 'Gestionează dimensiunile standard pentru configurator.',
      addPreset: 'Adaugă Dimensiune',
      editPreset: 'Editează Dimensiune',
      newPreset: 'Dimensiune Nouă',
      table: {
        name: 'Nume',
        category: 'Categorie',
        width: 'Lățime',
        height: 'Înălțime',
        status: 'Status',
        actions: 'Acțiuni'
      }
    },

    // PDF Generation
    pdf: {
      order: 'COMANDĂ',
      proforma: 'FACTURĂ PROFORMĂ',
      downloadOrder: 'Descarcă Comanda',
      downloadProforma: 'Descarcă Factura Proformă',
      generationError: 'A apărut o eroare la generarea PDF-ului.',
      generating: 'Se generează...',
      orderNumber: 'Nr. Comandă',
      proformaNumber: 'Nr. Proformă',
      invoiceProforma: 'Factură Proformă',
      orderConfirmation: 'Confirmare Comandă',
      date: 'Data',
      hour: 'Ora',
      seller: 'VÂNZĂTOR',
      buyer: 'CUMPĂRĂTOR',
      companyReg: 'Reg.Com',
      fiscalCode: 'CUI',
      phone: 'Tel',
      email: 'Email',
      deliveryAddress: 'ADRESĂ LIVRARE',
      productTableHeader: {
        number: 'Nr.',
        image: 'Imagine',
        product: 'Produs și Specificații',
        qty: 'Cant.',
        unitPrice: 'Preț unit.',
        total: 'Total'
      },
      noImage: 'Fără imagine',
      dimensions: 'Dimensiuni',
      material: 'Material',
      color: 'Culoare',
      glazing: 'Sticlă',
      accessories: 'Accesorii',
      subtotal: 'Subtotal',
      vat: 'TVA (19%)',
      total: 'TOTAL',
      proformaPaymentRequired: 'Plata este necesară pentru procesarea comenzii.',
      thankYouMessage: 'Vă mulțumim pentru comanda dumneavoastră!',
      footerGenerated: 'Generat',
      footerAuto: 'Document generat automat',
      page: 'Pagina',
      pricePerUnit: 'Preț unitar',
      totalProduct: 'Total Produs',
      materialAndColor: 'Material și Culoare',
      accessoriesIncluded: 'Accesorii Incluse',
      glazingFeatures: 'Caracteristici'
    },

    // My Orders Page
    myOrdersTitle: 'Comenzile Mele',
    myOrdersDescription: 'Aici puteți vedea istoricul și stadiul comenzilor dumneavoastră.',
    myOrdersNotLoggedIn: 'Trebuie să fiți autentificat pentru a vedea comenzile.',
    myOrdersErrorFetching: 'A apărut o eroare la preluarea comenzilor. Vă rugăm să încercați din nou mai târziu.',
    myOrdersErrorTitle: 'Eroare',
    myOrdersOrderNumber: 'Nr. Comandă',
    myOrdersDate: 'Data',
    myOrdersTotal: 'Total',
    myOrdersStatus: 'Status',
    myOrdersNoOrdersTitle: 'Nu aveți nicio comandă',
    myOrdersNoOrdersDescription: 'Se pare că nu ați plasat încă nicio comandă. Începeți prin a configura produsul dorit.',
    paymentStatus: 'Status Plată',

    // Cart translations
    cart: {
      title: 'Coșul Tău',
      empty: 'Coșul tău este gol',
      emptyDescription: 'Adaugă produse din configurator pentru a începe comanda.',
      startConfiguration: 'Începe Configurarea',
      product: 'produs în coș',
      products: 'produse în coș',
      transferring: 'Se transferă coșul...',
      perPiece: '/ buc',
      orderSummary: 'Sumar Comandă',
      proceedToCheckout: 'Continuă către Checkout',
      loginToOrder: 'Autentifică-te pentru a comanda',
      continueConfiguration: 'Continuă Configurarea',
      confirmDeleteTitle: 'Ești sigur?',
      confirmDeleteMessage: 'Vrei să ștergi acest produs din coș?'
    },

    // Footer translations
    footer: {
      companyDescriptionPlaceholder: 'Fabricăm ferestre și uși din lemn masiv de cea mai înaltă calitate.',
      quickLinks: 'Link-uri Rapide',
      contact: 'Contact',
      phone: 'Telefon',
      email: 'Email',
      followUs: 'Urmărește-ne',
      allRightsReserved: 'Toate drepturile rezervate',
      loadingData: 'Se încarcă datele...'
    }
  },

  en: {
    // General / Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    close: 'Close',
    active: 'Active',
    inactive: 'Inactive',
    status: 'Status',
    actions: 'Actions',
    price: 'Price',
    total: 'TOTAL',
    subtotal: 'Subtotal',
    vat: 'VAT (21%)',
    currency: 'EUR',
    pricePerSqm: '€/sqm',
    from: 'from',
    details: 'Details',
    required: 'Required',
    recommended: 'Recommended',
    width: 'Width',
    height: 'Height',
    description: 'Description',
    name: 'Name',
    category: 'Category',
    quantity: 'Quantity',
    piece: 'piece',
    pieces: 'pieces',
    continued: 'continued',
    glazingDetailsTitle: 'Glazing Details',
    glazingPanesCount: 'Glass Panes',
    glazingUValue: 'U-Value',
    glazingThickness: 'Thickness',
    glazingEnergyEfficiency: 'Energy Efficiency',
    glazingSoundInsulation: 'Sound Insulation',
    selectedAccessories: 'Selected Accessories',
    loading: 'Loading...',
    loadingDashboard: 'Loading dashboard...',
    loadingAnalytics: 'Loading analytics...',
    loadingUsers: 'Loading users...',
    refresh: 'Refresh',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    noDataAvailable: 'No data available',
    error: 'Error',
    success: 'Success',

    // Layout & Navigation
    home: 'Home',
    products: 'Products',
    configurator: 'Configurator',
    shoppingCart: 'Shopping Cart',
    myOrders: 'My Orders',
    admin: 'Admin',
    tagline: 'Premium Windows & Doors',
    backToSite: 'Back to Site',
    viewSite: 'View Site',
    logout: 'Logout',
    login: 'Login',

    // Analytics translations
    analytics: {
      title: 'Analytics & Tracking',
      subtitle: 'Complete user activity monitoring',
      allVisitors: 'All Visitors',
      anonymousOnly: 'Anonymous Only',
      authenticatedOnly: 'Authenticated Only',
      today: 'Today',
      last7Days: 'Last 7 days',
      last30Days: 'Last 30 days',
      last90Days: 'Last 90 days',
      totalSessions: 'Total Sessions',
      pageViews: 'Page Views',
      conversions: 'Conversions',
      avgTime: 'Avg Time',
      onPage: 'On page',
      anonymous: 'anonymous',
      authenticated: 'auth',
      totalPageViews: 'Total page views',
      conversionRate: 'conversion rate',
      showingAnonymous: 'Showing only anonymous visitors (no account)',
      showingAuthenticated: 'Showing only authenticated users (with account)',
      resetFilter: 'Reset Filter',
      viewsEvolution: 'Views Evolution',
      activityTypes: 'Activity Types',
      devices: 'Devices',
      userTypes: 'User Types',
      topPages: 'Top 10 Pages',
      views: 'views'
    },

    // User Manager translations
    userManager: {
      title: 'Users',
      subtitle: 'Manage users and their permissions',
      searchPlaceholder: 'Name or email...',
      role: 'Role',
      allRoles: 'All Roles',
      admin: 'Admin',
      user: 'User',
      userList: 'User list',
      lastLogin: 'Last Login',
      createdAt: 'Created at',
      never: 'Never',
      you: 'You',
      administrator: 'Administrator',
      protected: 'Protected',
      confirmRoleChange: 'Confirm Role Change',
      confirmMessage: 'Are you sure you want to change the role of:',
      warning: 'Warning',
      adminWarning: 'This user will have full access to the admin panel!',
      confirmChange: 'Confirm Change',
      roleChanged: 'User {email} role has been changed to "{role}".',
      noUsersFound: 'No users found',
      modifyFilters: 'Try modifying search filters'
    },

    // Admin Dashboard translations
    adminDashboard: {
      title: 'Admin Dashboard',
      subtitle: 'Welcome to RoWood control center',
      totalOrders: 'Total Orders',
      products: 'Products',
      materials: 'Materials',
      colors: 'Colors',
      glazingTypes: 'Glazing Types',
      accessories: 'Accessories',
      factoryManager: 'Factory Manager (BOM)',
      totalInDb: 'Total in database',
      recentActivity: 'Recent Activity',
      activityPlaceholder: 'A chart with recent sales and activity will be here...',
      totalLeads: 'Total Leads',
      openDeals: 'Open Deals',
      conversionRate: 'Conversion Rate',
      salesPipeline: 'Sales Pipeline',
      totalRevenue: 'TOTAL REVENUE',
      fromAllOrders: 'From all orders placed',
      salesEvolution: 'Sales Evolution',
      lastQuarter: 'LAST QUARTER',
      sales: 'Sales',
      noDataToDisplay: 'No data to display',
      ordersWillAppear: 'Orders will appear here',
      element: 'element',
      elements: 'elements',
      noElements: 'No elements yet'
    },

    // Home Page
    heroTitle: 'Premium Windows & Doors',
    heroSubtitle: 'Transform your home with modern, high-quality solutions. Configure exactly what you want with advanced insulation technologies.',
    configureNow: 'Configure Now',
    viewProducts: 'View Products',
    featuredProducts: 'Featured Products',
    featuredProductsDesc: 'Discover our most popular window and door solutions',
    viewAllProducts: 'View All Products',
    whyChooseUsTitle: 'Why Choose RoWood?',
    whyChooseUsSubtitle: 'We offer complete solutions with premium materials, advanced technology, and professional services.',
    feature1_title: 'Durability',
    feature1_description: 'Highest quality materials with an extended warranty.',
    feature2_title: 'Thermal Insulation',
    feature2_description: 'Superior energy efficiency with modern profiles.',
    feature3_title: 'Customization',
    feature3_description: 'Diverse colors and finishes for any architectural style.',
    feature4_title: 'Expert Installation',
    feature4_description: 'Specialized teams for professional installation.',
    stat1_number: '10,000+',
    stat1_label: 'Satisfied Clients',
    stat2_number: '15+',
    stat2_label: 'Years of Experience',
    stat3_number: '4.9/5',
    stat3_label: 'Average Rating',
    ctaTitle: 'Ready to Transform Your Home?',
    ctaSubtitle: 'Use our smart configurator to create the perfect solution for your needs.',
    startConfiguration: 'Start Configuration',

    // Products Page
    productsPageTitle: 'Our Product Catalog',
    productsPageDesc: 'Explore the full range of premium windows and doors. Each product can be customized to your needs.',
    searchPlaceholder: 'Search products...',
    allCategories: 'All categories',
    noProductsFound: 'No products found',
    noProductsFoundDesc: 'Try adjusting your search criteria.',

    // Configurator Page
    configuratorPageTitle: 'Premium Window & Door Configurator',
    configuratorPageDesc: 'Create your perfect product step-by-step. The price updates in real-time.',
    loadingData: 'Loading data...',
    yourConfiguration: 'Your Configuration',
    step: 'Step',
    nextStep: 'Next Step',
    prevStep: 'Previous Step',
    addToCart: 'Add to Cart',

    configuratorAlertTitle: 'Step cannot be accessed yet',
    configuratorAlertMaterial: 'Please select a material first to continue.',
    configuratorAlertProduct: 'Please select a product first to continue.',
    configuratorAlertMechanism: 'Please choose a mechanism/opening model first.',
    configuratorAlertDimensions: 'Please set the product dimensions first.',
    configuratorAlertGlazing: 'Please select the glass type first.',
    configuratorAlertAccessories: 'Accessories are optional, you can continue.',
    configuratorAlertServices: 'Shipping and installation services are optional.',
    configuratorAlertSummary: 'Please complete all previous steps to see the summary.',
    configuratorAlertGeneral: 'Please complete the previous steps in order.',
    configuratorUnderstoodButton: 'Understood',

    // Configurator Steps
    steps: {
      product: 'Product',
      dimensions: 'Dimensions',
      material: 'Material & Color',
      glazing: 'Glazing',
      handle: 'Handle',
      accessories: 'Accessories',
      summary: 'Summary',
    },

    // CRM Pages
    leadManager: {
      title: 'Lead Management',
      description: 'Manage potential customers and convert them into opportunities.',
      addLead: 'Add Lead',
      editLead: 'Edit Lead',
      newLead: 'New Lead',
      table: {
        contact: 'Contact',
        company: 'Company',
        status: 'Status',
        source: 'Source',
        assignedTo: 'Assigned To'
      }
    },
    dealManager: {
      title: 'Sales Pipeline',
      description: 'Visually track the progress of all your deals.',
      addDeal: 'Add Deal',
      totalValue: 'Total Value'
    },
    activityManager: {
      title: 'Activity Management',
      description: 'Manage all tasks, meetings, and emails.',
      addActivity: 'Add Activity',
      overdue: 'Overdue',
      dueToday: 'Due Today',
      upcoming: 'Upcoming'
    },
    contactManager: {
      title: 'Contact Management',
      description: 'Manage your customer and contact database.',
      addContact: 'Add Contact',
      editContact: 'Edit Contact',
      newContact: 'New Contact',
      table: {
        contact: 'Contact',
        company: 'Company',
        type: 'Type',
        totalValue: 'Total Value'
      }
    },

    productManager: {
      title: 'Product Management',
      description: 'Manage your products, prices, and specifications.',
      addProduct: 'Add Product',
      editProduct: 'Edit Product',
      newProduct: 'New Product',
      table: {
        product: 'Product',
        category: 'Category',
        basePrice: 'Base Price',
        status: 'Status',
        actions: 'Actions'
      }
    },
    materialManager: {
      title: 'Material Management',
      description: 'Manage the materials available for windows and doors.',
      addMaterial: 'Add Material',
      editMaterial: 'Edit Material',
      newMaterial: 'New Material',
      table: {
        material: 'Material',
        priceMultiplier: 'Price Multiplier',
        status: 'Status',
        actions: 'Actions'
      }
    },
    colorManager: {
      title: 'Color Management',
      description: 'Manage available colors for products.',
      addColor: 'Add Color',
      editColor: 'Edit Color',
      newColor: 'New Color'
    },
    glazingManager: {
      title: 'Glazing Management',
      description: 'Manage available glazing types.',
      addGlazing: 'Add Glazing Type',
      editGlazing: 'Edit Glazing Type'
    },
    accessoryManager: {
      title: 'Accessory Management',
      description: 'Manage available accessories.',
      addAccessory: 'Add Accessory',
      editAccessory: 'Edit Accessory'
    },
    presetDimensionManager: {
      title: 'Preset Dimension Management',
      description: 'Manage standard dimensions for the configurator.',
      addPreset: 'Add Preset',
      editPreset: 'Edit Preset',
      newPreset: 'New Preset',
      table: {
        name: 'Name',
        category: 'Category',
        width: 'Width',
        height: 'Height',
        status: 'Status',
        actions: 'Actions'
      }
    },

    // PDF Generation
    pdf: {
      order: 'ORDER',
      proforma: 'PROFORMA INVOICE',
      downloadOrder: 'Download Order',
      downloadProforma: 'Download Proforma Invoice',
      generationError: 'An error occurred while generating the PDF.',
      generating: 'Generating...',
      orderNumber: 'Order No.',
      proformaNumber: 'Proforma No.',
      invoiceProforma: 'Proforma Invoice',
      orderConfirmation: 'Order Confirmation',
      date: 'Date',
      hour: 'Hour',
      seller: 'SELLER',
      buyer: 'BUYER',
      companyReg: 'Co. Reg.',
      fiscalCode: 'VAT ID',
      phone: 'Phone',
      email: 'Email',
      deliveryAddress: 'DELIVERY ADDRESS',
      productTableHeader: {
        number: 'No.',
        image: 'Image',
        product: 'Product & Specifications',
        qty: 'Qty.',
        unitPrice: 'Unit Price',
        total: 'Total'
      },
      noImage: 'No image',
      dimensions: 'Dimensions',
      material: 'Material',
      color: 'Color',
      glazing: 'Glazing',
      accessories: 'Accessories',
      subtotal: 'Subtotal',
      vat: 'VAT (19%)',
      total: 'TOTAL',
      proformaPaymentRequired: 'Payment is required to process the order.',
      thankYouMessage: 'Thank you for your order!',
      footerGenerated: 'Generated',
      footerAuto: 'Automatically generated document',
      page: 'Page',
      pricePerUnit: 'Unit Price',
      totalProduct: 'Product Total',
      materialAndColor: 'Material & Color',
      accessoriesIncluded: 'Included Accessories',
      glazingFeatures: 'Features'
    },

    // My Orders Page
    myOrdersTitle: 'My Orders',
    myOrdersDescription: 'Here you can view the history and status of your orders.',
    myOrdersNotLoggedIn: 'You must be logged in to view your orders.',
    myOrdersErrorFetching: 'An error occurred while fetching your orders. Please try again later.',
    myOrdersErrorTitle: 'Error',
    myOrdersOrderNumber: 'Order #',
    myOrdersDate: 'Date',
    myOrdersTotal: 'Total',
    myOrdersStatus: 'Status',
    myOrdersNoOrdersTitle: 'You have no orders',
    myOrdersNoOrdersDescription: "It looks like you haven't placed any orders yet. Start by configuring your desired product.",
    paymentStatus: 'Payment Status',

    // Cart translations
    cart: {
      title: 'Your Cart',
      empty: 'Your cart is empty',
      emptyDescription: 'Add products from the configurator to start your order.',
      startConfiguration: 'Start Configuration',
      product: 'product in cart',
      products: 'products in cart',
      transferring: 'Transferring cart...',
      perPiece: '/ pc',
      orderSummary: 'Order Summary',
      proceedToCheckout: 'Proceed to Checkout',
      loginToOrder: 'Log in to Order',
      continueConfiguration: 'Continue Configuration',
      confirmDeleteTitle: 'Are you sure?',
      confirmDeleteMessage: 'Do you want to delete this product from the cart?'
    },

    // Footer translations
    footer: {
      companyDescriptionPlaceholder: 'We manufacture premium wooden windows and doors of the highest quality.',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      phone: 'Phone',
      email: 'Email',
      followUs: 'Follow Us',
      allRightsReserved: 'All rights reserved',
      loadingData: 'Loading data...'
    }
  }
};

const TranslationContext = createContext();

const supportedLanguages = ['ro', 'en', 'de', 'fr'];
const defaultLanguage = 'ro';

export function TranslationProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('rowood-pro-language');
    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    } else {
      // SCHIMBARE: Verificăm timezone-ul pentru a detecta România
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isRomania = timezone === 'Europe/Bucharest' || 
                        timezone === 'Europe/Chisinau' || 
                        (navigator.language && navigator.language.toLowerCase().includes('ro'));
      
      // Dacă e din România sau limbă ro, setăm română
      const langToSet = isRomania ? 'ro' : (() => {
        const browserLang = navigator.language.split('-')[0];
        return supportedLanguages.includes(browserLang) ? browserLang : defaultLanguage;
      })();
      
      setCurrentLanguage(langToSet);
      localStorage.setItem('rowood-pro-language', langToSet);
      document.documentElement.lang = langToSet;
    }

    const handleLanguageChange = (event) => {
      setCurrentLanguage(event.detail.language);
      document.documentElement.lang = event.detail.language;
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const changeLanguage = (newLanguage) => {
    if (supportedLanguages.includes(newLanguage)) {
      setCurrentLanguage(newLanguage);
      localStorage.setItem('rowood-pro-language', newLanguage);
      document.documentElement.lang = newLanguage;
      
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLanguage } }));
      
      window.location.reload();
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage] || translations[defaultLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        let fallbackValue = translations[defaultLanguage];
        for(const fk of keys) {
            if(fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
                fallbackValue = fallbackValue[fk];
            } else {
                return key;
            }
        }
        return fallbackValue;
      }
    }
    return value || key;
  };

  return (
    <TranslationContext.Provider value={{ t, currentLanguage, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}