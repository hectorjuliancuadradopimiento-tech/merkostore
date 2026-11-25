/* ==========================================================================
   MERKOSTORE 8.0 - PRODUCTOS & MERCADOS ENGINE & HISTORIAL UNIFICADO
   ========================================================================== */

const API_BASE_URL = (window.location.protocol.startsWith('http') && window.location.port !== '5500' && window.location.port !== '3000') ? '' : 'http://localhost:' + (window.location.port || '8085');

const API = {
    getToken() {
        return sessionStorage.getItem('merkostore_jwt_token');
    },
    setToken(token) {
        if (token) {
            sessionStorage.setItem('merkostore_jwt_token', token);
        } else {
            sessionStorage.removeItem('merkostore_jwt_token');
        }
    },
    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...(options.headers || {})
            }
        };

        try {
            const response = await fetch(url, config);
            if (response.status === 401 || response.status === 403) {
                if (endpoint.includes('/admin/')) {
                    const wasAdminSession = state.isAdminLoggedIn && !!this.getToken();
                    this.setToken(null);
                    state.isAdminLoggedIn = false;
                    if (state.currentView === 'admin') {
                        switchView('storefront');
                    }
                    if (wasAdminSession) {
                        showToast('🔒 Sesión expirada o no autorizada.', 'warning', '🔒');
                    }
                }
            }

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                const errorMsg = data?.message || data?.error || `Error en el servidor (${response.status})`;
                throw new Error(errorMsg);
            }
            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            if (error.message && error.message.includes('Failed to fetch')) {
                throw new Error('Servidor backend no detectado en http://localhost:8080. Verifica que Spring Boot esté ejecutándose.');
            }
            throw error;
        }
    },
    get(endpoint) { return this.request(endpoint, { method: 'GET' }); },
    post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
    put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
    patch(endpoint, body) { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }); },
    delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
};

const Storage = {
    get(key, defaultValue = null) {
        try {
            const raw = localStorage.getItem('merkostore_' + key);
            return raw ? JSON.parse(raw) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem('merkostore_' + key, JSON.stringify(value));
        } catch (e) {
            console.warn('Storage.set failed:', e);
        }
    }
};

const state = {
    isAdminLoggedIn: false,
    currentView: 'storefront', // 'storefront' | 'admin'
    currentAdminSubTab: 'dashboard', // 'dashboard' | 'products' | 'productEditor' | 'orders' | 'categories' | 'config'
    currentCartStep: 1, // 1 | 2 | 3
    selectedCategory: 'ALL',
    searchQuery: '',
    adminStockFilter: 'ALL', // 'ALL' | 'IN_STOCK' | 'SOLD_OUT' | 'LOW_STOCK'
    editingProductId: null, // Product ID currently being edited

    // Historial Filters State
    historialTypeFilter: 'ALL', // 'ALL' | 'DETAL' | 'MERCADO'
    historialStatusFilter: 'ALL', // 'ALL' | 'RECEIVED' | 'PREPARING' | 'READY' | 'ON_WAY' | 'DELIVERED' | 'CANCELLED'
    historialPeriodFilter: 'ALL', // 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | '30DAYS'
    historialSearchQuery: '',

    // Active Orders (En Proceso) Filters State
    activeOrdersFilterStatus: 'ALL', // 'ALL' | 'RECEIVED' | 'PREPARING' | 'READY_ON_WAY'
    activeOrdersFilterFulfillment: 'ALL', // 'ALL' | 'DELIVERY' | 'PICKUP'
    activeOrdersSearchQuery: '',

    // Image Framing Editor State (Independent PC & Mobile)
    currentFramingDevice: 'PC', // 'PC' | 'MOBILE'
    currentProductFraming: {
        pc: { fit: 'cover', zoom: 1.0, posX: 50, posY: 50 },
        mobile: { fit: 'cover', zoom: 1.0, posX: 50, posY: 50 }
    },

    // Store Configuration
    storeConfig: {
        storeName: 'MERKOSTORE',
        whatsappPhone: '573004567890',
        address: 'Cartagena de Indias, Bolívar',
        fulfillmentType: 'DELIVERY',
        deliveryFee: 3000,
        minimumOrder: 10000,
        nequiAccount: '3001234567',
        daviplataAccount: '3001234567',
        bancolombiaAccount: '123-456789-01',
        accountHolder: 'MERKOSTORE S.A.S',
        isStoreOpen: true
    },

    // Business Budget & Inventory Replacement State
    budget: {
        initialBudget: 0,
        currentBalance: 0,
        totalPurchases: 0,
        totalRecoveredCosts: 0,
        totalManualInjections: 0,
        isInitialized: false
    },
    budgetTransactions: [],
    supplierPurchases: [],
    
    // Cart: { productId: quantity }
    cart: {},

    // Categories
    categories: [
        { id: 'ALL', name: '✨ Todos los Productos', icon: '🛒', bgColor: '#fee2e2' },
        { id: 'cat1', name: '📦 Combos Mercados', icon: '📦', bgColor: '#fef2f2' },
        { id: 'cat2', name: '🥛 Lácteos y Huevos', icon: '🥛', bgColor: '#e0f2fe' },
        { id: 'cat3', name: '🥖 Panadería', icon: '🥖', bgColor: '#fef3c7' },
        { id: 'cat4', name: '🌾 Abarrotes y Despensa', icon: '🌾', bgColor: '#dcfce7' },
        { id: 'cat5', name: '🧼 Cuidado del Hogar', icon: '🧼', bgColor: '#f3e8ff' }
    ],

    // Products & Mercados (Exactamente los 12 productos del Data Warehouse / Power BI)
    products: [
        {
            id: 'PRD-001',
            type: 'DETAL',
            categoryId: 'cat2',
            sku: 'PRD-001',
            name: 'Huevos Kikes AA x30',
            unitCalc: 'Unidad a $ 816.67',
            costPrice: 14700,
            price: 24500,
            discountPrice: null,
            discountPercent: null,
            stock: 35,
            imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500',
            isAvailable: true
        },
        {
            id: 'PRD-002',
            type: 'DETAL',
            categoryId: 'cat4',
            sku: 'PRD-002',
            name: 'Café Sello Rojo 425g',
            unitCalc: 'Gramo a $ 51.74',
            costPrice: 15000,
            price: 21990,
            discountPrice: null,
            discountPercent: null,
            stock: 20,
            imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
            isAvailable: true
        },
        {
            id: 'PRD-003',
            type: 'DETAL',
            categoryId: 'cat4',
            sku: 'PRD-003',
            name: 'Harina Pan 1Kg',
            unitCalc: 'Gramo a $ 4.80',
            costPrice: 3200,
            price: 4800,
            discountPrice: null,
            discountPercent: null,
            stock: 50,
            imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
            isAvailable: true
        },
        {
            id: 'PRD-004',
            type: 'DETAL',
            categoryId: 'cat4',
            sku: 'PRD-004',
            name: 'Aceite Medalla de Oro 3Lt',
            unitCalc: 'Litro a $ 6.496.67',
            costPrice: 13500,
            price: 19490,
            discountPercent: null,
            discountPrice: null,
            stock: 14,
            imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
            isAvailable: true
        },
        {
            id: 'PRD-005',
            type: 'DETAL',
            categoryId: 'cat4',
            sku: 'PRD-005',
            name: 'Azúcar Blanca 2.5Kg',
            unitCalc: 'Gramo a $ 3.96',
            costPrice: 6800,
            price: 9900,
            discountPrice: null,
            discountPercent: null,
            stock: 28,
            imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500',
            isAvailable: true
        },
        {
            id: 'PRD-006',
            type: 'DETAL',
            categoryId: 'cat4',
            sku: 'PRD-006',
            name: 'Arroz Diana 1Kg',
            unitCalc: 'Gramo a $ 4.50',
            costPrice: 3100,
            price: 4500,
            discountPrice: null,
            discountPercent: null,
            stock: 45,
            imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500',
            isAvailable: true
        },
        {
            id: 'PRD-007',
            type: 'DETAL',
            categoryId: 'cat2',
            sku: 'PRD-007',
            name: 'Leche Colanta Entera 900ml',
            unitCalc: 'Mililitro a $ 4.67',
            costPrice: 2900,
            price: 4200,
            discountPrice: null,
            discountPercent: null,
            stock: 30,
            imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500',
            isAvailable: true
        },
        {
            id: 'PRD-008',
            type: 'DETAL',
            categoryId: 'cat3',
            sku: 'PRD-008',
            name: 'Pan Bimbo Artesano 500g',
            unitCalc: 'Gramo a $ 17.00',
            costPrice: 6000,
            price: 8500,
            discountPrice: null,
            discountPercent: null,
            stock: 18,
            imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
            isAvailable: true
        },
        {
            id: 'PRD-009',
            type: 'DETAL',
            categoryId: 'cat5',
            sku: 'PRD-009',
            name: 'Jabón Rey Barra 300g',
            unitCalc: 'Unidad a $ 3.200',
            costPrice: 2100,
            price: 3200,
            discountPrice: null,
            discountPercent: null,
            stock: 40,
            imageUrl: 'https://images.unsplash.com/photo-1607006314177-3e818b264eef?w=500',
            isAvailable: true
        },
        {
            id: 'CMB-001',
            type: 'MERCADO',
            categoryId: 'cat1',
            sku: 'CMB-001',
            name: 'Mercado Familiar Esencial',
            unitCalc: 'Combo Familiar Completo',
            costPrice: 31800,
            price: 54000,
            discountPrice: 44900,
            discountPercent: '-17%',
            stock: 10,
            imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
            isAvailable: true,
            bundleItems: [
                { productId: 'PRD-001', quantity: 1 },
                { productId: 'PRD-003', quantity: 2 },
                { productId: 'PRD-004', quantity: 1 },
                { productId: 'PRD-005', quantity: 1 },
                { productId: 'PRD-006', quantity: 1 }
            ]
        },
        {
            id: 'CMB-002',
            type: 'MERCADO',
            categoryId: 'cat1',
            sku: 'CMB-002',
            name: 'Mercado Desayuno Completo',
            unitCalc: 'Combo Desayuno Nutritivo',
            costPrice: 25200,
            price: 39900,
            discountPrice: 34500,
            discountPercent: '-14%',
            stock: 8,
            imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500',
            isAvailable: true,
            bundleItems: [
                { productId: 'PRD-001', quantity: 1 },
                { productId: 'PRD-002', quantity: 1 },
                { productId: 'PRD-007', quantity: 2 },
                { productId: 'PRD-008', quantity: 1 }
            ]
        },
        {
            id: 'CMB-003',
            type: 'MERCADO',
            categoryId: 'cat1',
            sku: 'CMB-003',
            name: 'Combo Aseo y Hogar',
            unitCalc: 'Kit Limpieza Profunda',
            costPrice: 18500,
            price: 32000,
            discountPrice: 28000,
            discountPercent: '-13%',
            stock: 6,
            imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500',
            isAvailable: true,
            bundleItems: [
                { productId: 'PRD-009', quantity: 4 }
            ]
        }
    ],

    // Orders (Exactamente los 20 pedidos y 25 transacciones del Data Warehouse / Power BI)
    orders: [
        {
            id: 'ord-ped-001',
            orderNumber: 'PED-001',
            customerName: 'María Camila Gómez',
            customerPhone: '573004567890',
            customerEmail: 'mariacamila.gomez@gmail.com',
            deliveryAddress: 'Mz 14 Lote 8',
            cityNeighborhood: 'Cartagena - El Recreo',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-001', name: 'Mercado Familiar Esencial', type: 'MERCADO', qty: 2, unitPrice: 44900, subtotal: 89800, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500' }
            ],
            subtotal: 89800,
            deliveryFee: 0,
            total: 89800,
            paymentMethod: 'Nequi (WhatsApp Web)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-03 10:15',
            dateOnly: '2026-11-03',
            archivedDate: '2026-11-03'
        },
        {
            id: 'ord-ped-002',
            orderNumber: 'PED-002',
            customerName: 'Carlos Andrés Pérez',
            customerPhone: '573119876543',
            customerEmail: 'carlos.perez@gmail.com',
            deliveryAddress: 'Calle 30 # 24-12',
            cityNeighborhood: 'Cartagena - La Castellana',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-002', name: 'Mercado Desayuno Completo', type: 'MERCADO', qty: 1, unitPrice: 34500, subtotal: 34500, imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500' }
            ],
            subtotal: 34500,
            deliveryFee: 0,
            total: 34500,
            paymentMethod: 'Daviplata (MerkoBot IA)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-04 11:30',
            dateOnly: '2026-11-04',
            archivedDate: '2026-11-04'
        },
        {
            id: 'ord-ped-003',
            orderNumber: 'PED-003',
            customerName: 'Rosa Elena Martínez',
            customerPhone: '573201122334',
            customerEmail: 'rosaelena.martinez@hotmail.com',
            deliveryAddress: 'Sector El Bosque # 10-05',
            cityNeighborhood: 'Cartagena - Ceballos',
            fulfillmentType: 'PICKUP',
            items: [
                { productId: 'PRD-001', name: 'Huevos Kikes AA x30', type: 'DETAL', qty: 1, unitPrice: 24500, subtotal: 24500, imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500' },
                { productId: 'PRD-002', name: 'Café Sello Rojo 425g', type: 'DETAL', qty: 1, unitPrice: 21990, subtotal: 21990, imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500' }
            ],
            subtotal: 46490,
            deliveryFee: 0,
            total: 46490,
            paymentMethod: 'Efectivo (Mostrador Tienda)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-05 09:45',
            dateOnly: '2026-11-05',
            archivedDate: '2026-11-05'
        },
        {
            id: 'ord-ped-004',
            orderNumber: 'PED-004',
            customerName: 'Jorge Luis Herrera',
            customerPhone: '573158877665',
            customerEmail: 'jorge.herrera@gmail.com',
            deliveryAddress: 'Manzana B Casa 12',
            cityNeighborhood: 'Cartagena - Blas de Lezo',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'PRD-004', name: 'Aceite Medalla de Oro 3Lt', type: 'DETAL', qty: 1, unitPrice: 19490, subtotal: 19490, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500' }
            ],
            subtotal: 19490,
            deliveryFee: 0,
            total: 19490,
            paymentMethod: 'Nequi (WhatsApp Web)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-06 14:20',
            dateOnly: '2026-11-06',
            archivedDate: '2026-11-06'
        },
        {
            id: 'ord-ped-005',
            orderNumber: 'PED-005',
            customerName: 'Diana Patricia Polo',
            customerPhone: '573045566778',
            customerEmail: 'diana.polo@gmail.com',
            deliveryAddress: 'Cra 82 # 15-40',
            cityNeighborhood: 'Cartagena - San Fernando',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-001', name: 'Mercado Familiar Esencial', type: 'MERCADO', qty: 1, unitPrice: 44900, subtotal: 44900, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500' }
            ],
            subtotal: 44900,
            deliveryFee: 0,
            total: 44900,
            paymentMethod: 'Daviplata (MerkoBot IA)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-07 16:10',
            dateOnly: '2026-11-07',
            archivedDate: '2026-11-07'
        },
        {
            id: 'ord-ped-006',
            orderNumber: 'PED-006',
            customerName: 'Andrés Felipe Ruiz',
            customerPhone: '573123344556',
            customerEmail: 'andres.ruiz@gmail.com',
            deliveryAddress: 'Diag 32 # 55-20',
            cityNeighborhood: 'Cartagena - Santa Lucía',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-003', name: 'Combo Aseo y Hogar', type: 'MERCADO', qty: 1, unitPrice: 28000, subtotal: 28000, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500' }
            ],
            subtotal: 28000,
            deliveryFee: 0,
            total: 28000,
            paymentMethod: 'Nequi (WhatsApp Web)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-08 10:05',
            dateOnly: '2026-11-08',
            archivedDate: '2026-11-08'
        },
        {
            id: 'ord-ped-007',
            orderNumber: 'PED-007',
            customerName: 'Consuelo Del Carmen',
            customerPhone: '573189900112',
            customerEmail: 'consuelo.carmen@gmail.com',
            deliveryAddress: 'Calle de la Cruz # 42-18',
            cityNeighborhood: 'Cartagena - Torices',
            fulfillmentType: 'PICKUP',
            items: [
                { productId: 'PRD-001', name: 'Huevos Kikes AA x30', type: 'DETAL', qty: 2, unitPrice: 24500, subtotal: 49000, imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500' }
            ],
            subtotal: 49000,
            deliveryFee: 0,
            total: 49000,
            paymentMethod: 'Efectivo (Mostrador Tienda)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-09 12:40',
            dateOnly: '2026-11-09',
            archivedDate: '2026-11-09'
        },
        {
            id: 'ord-ped-008',
            orderNumber: 'PED-008',
            customerName: 'María Camila Gómez',
            customerPhone: '573004567890',
            customerEmail: 'mariacamila.gomez@gmail.com',
            deliveryAddress: 'Mz 14 Lote 8',
            cityNeighborhood: 'Cartagena - El Recreo',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-001', name: 'Mercado Familiar Esencial', type: 'MERCADO', qty: 2, unitPrice: 44900, subtotal: 89800, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500' }
            ],
            subtotal: 89800,
            deliveryFee: 0,
            total: 89800,
            paymentMethod: 'Daviplata (MerkoBot IA)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-10 15:30',
            dateOnly: '2026-11-10',
            archivedDate: '2026-11-10'
        },
        {
            id: 'ord-ped-009',
            orderNumber: 'PED-009',
            customerName: 'Jorge Luis Herrera',
            customerPhone: '573158877665',
            customerEmail: 'jorge.herrera@gmail.com',
            deliveryAddress: 'Manzana B Casa 12',
            cityNeighborhood: 'Cartagena - Blas de Lezo',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-002', name: 'Mercado Desayuno Completo', type: 'MERCADO', qty: 2, unitPrice: 34500, subtotal: 69000, imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500' }
            ],
            subtotal: 69000,
            deliveryFee: 0,
            total: 69000,
            paymentMethod: 'Nequi (WhatsApp Web)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-11 11:15',
            dateOnly: '2026-11-11',
            archivedDate: '2026-11-11'
        },
        {
            id: 'ord-ped-010',
            orderNumber: 'PED-010',
            customerName: 'Carlos Andrés Pérez',
            customerPhone: '573119876543',
            customerEmail: 'carlos.perez@gmail.com',
            deliveryAddress: 'Calle 30 # 24-12',
            cityNeighborhood: 'Cartagena - La Castellana',
            fulfillmentType: 'PICKUP',
            items: [
                { productId: 'PRD-002', name: 'Café Sello Rojo 425g', type: 'DETAL', qty: 2, unitPrice: 21990, subtotal: 43980, imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500' }
            ],
            subtotal: 43980,
            deliveryFee: 0,
            total: 43980,
            paymentMethod: 'Efectivo (Mostrador Tienda)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-12 17:00',
            dateOnly: '2026-11-12',
            archivedDate: '2026-11-12'
        },
        {
            id: 'ord-ped-011',
            orderNumber: 'PED-011',
            customerName: 'Rosa Elena Martínez',
            customerPhone: '573201122334',
            customerEmail: 'rosaelena.martinez@hotmail.com',
            deliveryAddress: 'Sector El Bosque # 10-05',
            cityNeighborhood: 'Cartagena - Ceballos',
            fulfillmentType: 'PICKUP',
            items: [
                { productId: 'PRD-003', name: 'Harina Pan 1Kg', type: 'DETAL', qty: 4, unitPrice: 4800, subtotal: 19200, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500' }
            ],
            subtotal: 19200,
            deliveryFee: 0,
            total: 19200,
            paymentMethod: 'Efectivo (Mostrador Tienda)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-13 09:20',
            dateOnly: '2026-11-13',
            archivedDate: '2026-11-13'
        },
        {
            id: 'ord-ped-012',
            orderNumber: 'PED-012',
            customerName: 'Manuel Salvador Díaz',
            customerPhone: '573012233445',
            customerEmail: 'manuel.diaz@gmail.com',
            deliveryAddress: 'Calle Real # 22-09',
            cityNeighborhood: 'Cartagena - Manga',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-001', name: 'Mercado Familiar Esencial', type: 'MERCADO', qty: 1, unitPrice: 44900, subtotal: 44900, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500' },
                { productId: 'PRD-001', name: 'Huevos Kikes AA x30', type: 'DETAL', qty: 1, unitPrice: 24500, subtotal: 24500, imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500' }
            ],
            subtotal: 69400,
            deliveryFee: 0,
            total: 69400,
            paymentMethod: 'Nequi (WhatsApp Web)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-14 13:45',
            dateOnly: '2026-11-14',
            archivedDate: '2026-11-14'
        },
        {
            id: 'ord-ped-013',
            orderNumber: 'PED-013',
            customerName: 'Diana Patricia Polo',
            customerPhone: '573045566778',
            customerEmail: 'diana.polo@gmail.com',
            deliveryAddress: 'Cra 82 # 15-40',
            cityNeighborhood: 'Cartagena - San Fernando',
            fulfillmentType: 'PICKUP',
            items: [
                { productId: 'PRD-006', name: 'Arroz Diana 1Kg', type: 'DETAL', qty: 3, unitPrice: 4500, subtotal: 13500, imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500' },
                { productId: 'PRD-007', name: 'Leche Colanta Entera 900ml', type: 'DETAL', qty: 4, unitPrice: 4200, subtotal: 16800, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500' }
            ],
            subtotal: 30300,
            deliveryFee: 0,
            total: 30300,
            paymentMethod: 'Efectivo (Mostrador Tienda)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-15 10:50',
            dateOnly: '2026-11-15',
            archivedDate: '2026-11-15'
        },
        {
            id: 'ord-ped-014',
            orderNumber: 'PED-014',
            customerName: 'Carlos Andrés Pérez',
            customerPhone: '573119876543',
            customerEmail: 'carlos.perez@gmail.com',
            deliveryAddress: 'Calle 30 # 24-12',
            cityNeighborhood: 'Cartagena - La Castellana',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-001', name: 'Mercado Familiar Esencial', type: 'MERCADO', qty: 2, unitPrice: 44900, subtotal: 89800, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500' }
            ],
            subtotal: 89800,
            deliveryFee: 0,
            total: 89800,
            paymentMethod: 'Daviplata (MerkoBot IA)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-16 16:20',
            dateOnly: '2026-11-16',
            archivedDate: '2026-11-16'
        },
        {
            id: 'ord-ped-015',
            orderNumber: 'PED-015',
            customerName: 'Rosa Elena Martínez',
            customerPhone: '573201122334',
            customerEmail: 'rosaelena.martinez@hotmail.com',
            deliveryAddress: 'Sector El Bosque # 10-05',
            cityNeighborhood: 'Cartagena - Ceballos',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-002', name: 'Mercado Desayuno Completo', type: 'MERCADO', qty: 1, unitPrice: 34500, subtotal: 34500, imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500' },
                { productId: 'PRD-008', name: 'Pan Bimbo Artesano 500g', type: 'DETAL', qty: 2, unitPrice: 8500, subtotal: 17000, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' }
            ],
            subtotal: 51500,
            deliveryFee: 0,
            total: 51500,
            paymentMethod: 'Nequi (WhatsApp Web)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-17 11:00',
            dateOnly: '2026-11-17',
            archivedDate: '2026-11-17'
        },
        {
            id: 'ord-ped-016',
            orderNumber: 'PED-016',
            customerName: 'Jorge Luis Herrera',
            customerPhone: '573158877665',
            customerEmail: 'jorge.herrera@gmail.com',
            deliveryAddress: 'Manzana B Casa 12',
            cityNeighborhood: 'Cartagena - Blas de Lezo',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-003', name: 'Combo Aseo y Hogar', type: 'MERCADO', qty: 2, unitPrice: 28000, subtotal: 56000, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500' }
            ],
            subtotal: 56000,
            deliveryFee: 0,
            total: 56000,
            paymentMethod: 'Daviplata (MerkoBot IA)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-18 14:15',
            dateOnly: '2026-11-18',
            archivedDate: '2026-11-18'
        },
        {
            id: 'ord-ped-017',
            orderNumber: 'PED-017',
            customerName: 'Andrés Felipe Ruiz',
            customerPhone: '573123344556',
            customerEmail: 'andres.ruiz@gmail.com',
            deliveryAddress: 'Diag 32 # 55-20',
            cityNeighborhood: 'Cartagena - Santa Lucía',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'PRD-001', name: 'Huevos Kikes AA x30', type: 'DETAL', qty: 2, unitPrice: 24500, subtotal: 49000, imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500' }
            ],
            subtotal: 49000,
            deliveryFee: 0,
            total: 49000,
            paymentMethod: 'Nequi (WhatsApp Web)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-18 18:30',
            dateOnly: '2026-11-18',
            archivedDate: '2026-11-18'
        },
        {
            id: 'ord-ped-018',
            orderNumber: 'PED-018',
            customerName: 'Consuelo Del Carmen',
            customerPhone: '573189900112',
            customerEmail: 'consuelo.carmen@gmail.com',
            deliveryAddress: 'Calle de la Cruz # 42-18',
            cityNeighborhood: 'Cartagena - Torices',
            fulfillmentType: 'PICKUP',
            items: [
                { productId: 'PRD-004', name: 'Aceite Medalla de Oro 3Lt', type: 'DETAL', qty: 2, unitPrice: 19490, subtotal: 38980, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500' },
                { productId: 'PRD-009', name: 'Jabón Rey Barra 300g', type: 'DETAL', qty: 5, unitPrice: 3200, subtotal: 16000, imageUrl: 'https://images.unsplash.com/photo-1607006314177-3e818b264eef?w=500' }
            ],
            subtotal: 54980,
            deliveryFee: 0,
            total: 54980,
            paymentMethod: 'Efectivo (Mostrador Tienda)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-19 12:10',
            dateOnly: '2026-11-19',
            archivedDate: '2026-11-19'
        },
        {
            id: 'ord-ped-019',
            orderNumber: 'PED-019',
            customerName: 'María Camila Gómez',
            customerPhone: '573004567890',
            customerEmail: 'mariacamila.gomez@gmail.com',
            deliveryAddress: 'Mz 14 Lote 8',
            cityNeighborhood: 'Cartagena - El Recreo',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-001', name: 'Mercado Familiar Esencial', type: 'MERCADO', qty: 2, unitPrice: 44900, subtotal: 89800, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500' }
            ],
            subtotal: 89800,
            deliveryFee: 0,
            total: 89800,
            paymentMethod: 'Bancolombia QR (WhatsApp Web)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-20 15:40',
            dateOnly: '2026-11-20',
            archivedDate: '2026-11-20'
        },
        {
            id: 'ord-ped-020',
            orderNumber: 'PED-020',
            customerName: 'Carlos Andrés Pérez',
            customerPhone: '573119876543',
            customerEmail: 'carlos.perez@gmail.com',
            deliveryAddress: 'Calle 30 # 24-12',
            cityNeighborhood: 'Cartagena - La Castellana',
            fulfillmentType: 'DELIVERY',
            items: [
                { productId: 'CMB-002', name: 'Mercado Desayuno Completo', type: 'MERCADO', qty: 1, unitPrice: 34500, subtotal: 34500, imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500' }
            ],
            subtotal: 34500,
            deliveryFee: 0,
            total: 34500,
            paymentMethod: 'Contraentrega Efectivo (Tienda Online)',
            paymentStatus: 'PAID',
            paymentStatusLabel: 'APROBADO & COBRADO',
            status: 'DELIVERED',
            createdAt: '2026-11-20 17:55',
            dateOnly: '2026-11-20',
            archivedDate: '2026-11-20'
        }
    ]
};

function getGreetingByTime() {
    const hour = new Date().getHours();
    if (hour < 12) return 'BUENOS DÍAS 👋';
    if (hour < 18) return 'BUENAS TARDES 👋';
    return 'BUENAS NOCHES 👋';
}

function refreshDashboardData() {
    updateDashboardKPIs();
    renderDashboardContent();
    showToast('🔄 Datos del Dashboard actualizados', 'info', '🔄');
}

function updateDashboardKPIs() {
    if (!state) return;

    const today = new Date().toISOString().slice(0, 10);
    const ordersList = Array.isArray(state.orders) ? state.orders : [];
    const productsList = Array.isArray(state.products) ? state.products : [];

    // Mapeo estricto de productos activos
    const activeProductMap = new Map();
    productsList.forEach(p => {
        const isActive = p.isAvailable !== false;
        activeProductMap.set(p.id, isActive);
        if (p.name) activeProductMap.set(p.name.toLowerCase(), isActive);
    });

    const todayOrders = ordersList.filter(o => o.status !== 'CANCELLED' && ((o.createdAt && o.createdAt.startsWith(today)) || o.dateOnly === today));
    
    let todaySalesSum = 0;
    let todayGrossProfitSum = 0;
    let todayActiveOrdersCount = 0;

    todayOrders.forEach(o => {
        let orderActiveTotal = 0;
        let orderActiveProfit = 0;
        let hasActiveItem = false;

        (o.items || []).forEach(it => {
            const isItemActive = (activeProductMap.get(it.productId) !== false) && (!it.name || activeProductMap.get(it.name.toLowerCase()) !== false);
            if (isItemActive) {
                hasActiveItem = true;
                const unitPrice = Number(it.unitPrice || it.price) || 0;
                const qty = Number(it.qty || it.quantity) || 1;
                const itemSubtotal = (Number(it.subtotal) > 0) ? Number(it.subtotal) : (unitPrice * qty);
                orderActiveTotal += itemSubtotal;

                let cost = it.costPrice;
                if (cost == null) {
                    const found = productsList.find(p => p.id === it.productId);
                    if (found && found.costPrice != null && found.costPrice > 0) {
                        cost = found.costPrice;
                    }
                }
                if (cost != null && cost > 0) {
                    orderActiveProfit += (unitPrice - cost) * qty;
                }
            }
        });

        if (hasActiveItem && orderActiveTotal > 0) {
            todaySalesSum += orderActiveTotal;
            todayGrossProfitSum += orderActiveProfit;
            todayActiveOrdersCount++;
        }
    });

    const activeOrders = ordersList.filter(o => ['RECEIVED', 'PREPARING', 'READY', 'ON_WAY'].includes(o.status));
    const pendingOrders = ordersList.filter(o => o.status === 'RECEIVED' || o.paymentStatus === 'PENDING');
    // Únicamente productos ACTIVOS con stock bajo o agotados deben alertar para reponer
    const lowStockProds = productsList.filter(p => p.isAvailable !== false && ((Number(p.stock) || 0) <= (Number(p.minStockAlert) || 5)));

    // Métricas globales históricas de productos activos
    let validActiveTotalSales = 0;
    let validActiveOrdersCount = 0;
    ordersList.filter(o => o.status !== 'CANCELLED').forEach(o => {
        let orderActiveTotal = 0;
        let hasActive = false;
        (o.items || []).forEach(it => {
            const isItemActive = (activeProductMap.get(it.productId) !== false) && (!it.name || activeProductMap.get(it.name.toLowerCase()) !== false);
            if (isItemActive) {
                hasActive = true;
                const unitPrice = Number(it.unitPrice || it.price) || 0;
                const qty = Number(it.qty || it.quantity) || 1;
                orderActiveTotal += (Number(it.subtotal) > 0) ? Number(it.subtotal) : (unitPrice * qty);
            }
        });
        if (hasActive && orderActiveTotal > 0) {
            validActiveTotalSales += orderActiveTotal;
            validActiveOrdersCount++;
        }
    });

    const ticketAvg = validActiveOrdersCount > 0 ? Math.round(validActiveTotalSales / validActiveOrdersCount) : 0;

    const kpiSales = document.getElementById('kpiSales');
    const kpiSalesSubtext = document.getElementById('kpiSalesSubtext');
    const kpiOrders = document.getElementById('kpiOrders');
    const kpiPending = document.getElementById('kpiPending');
    const kpiLowStock = document.getElementById('kpiLowStock');
    const kpiTicketAvg = document.getElementById('kpiTicketAvg');
    const kpiAlertText = document.getElementById('kpiAlertText');

    const displaySales = todaySalesSum;
    const displaySubtext = `↑ ${todayActiveOrdersCount} ventas registradas hoy`;

    const kpiGrossProfit = document.getElementById('kpiGrossProfit');
    const kpiGrossProfitSubtext = document.getElementById('kpiGrossProfitSubtext');
    if (kpiGrossProfit) kpiGrossProfit.textContent = `$ ${Math.round(todayGrossProfitSum).toLocaleString('es-CO')}`;
    if (kpiGrossProfitSubtext) kpiGrossProfitSubtext.textContent = todayActiveOrdersCount > 0 ? `Margen bruto acumulado hoy (Ventas - Costos)` : `Sin ventas registradas en el día de hoy`;

    if (kpiSales) kpiSales.textContent = `$ ${displaySales.toLocaleString('es-CO')}`;
    if (kpiSalesSubtext) kpiSalesSubtext.textContent = displaySubtext;
    if (kpiOrders) kpiOrders.textContent = activeOrders.length;
    if (kpiPending) kpiPending.textContent = pendingOrders.length;
    if (kpiLowStock) kpiLowStock.textContent = lowStockProds.length;
    if (kpiTicketAvg) kpiTicketAvg.textContent = `$ ${ticketAvg.toLocaleString('es-CO')}`;
    if (kpiAlertText) kpiAlertText.textContent = `Productos por agotar: ${lowStockProds.length} ítems con stock bajo o sin existencias.`;

    renderDashboardContent();
}

function renderDashboardContent() {
    // 1. Greeting
    const greetingEl = document.getElementById('dashGreeting');
    if (greetingEl) greetingEl.textContent = getGreetingByTime();

    // 2. Active Orders List (Left Panel 1)
    const activeOrdersContainer = document.getElementById('dashActiveOrdersList');
    if (activeOrdersContainer) {
        const activeOrders = state.orders.filter(o => ['RECEIVED', 'PREPARING', 'READY', 'ON_WAY'].includes(o.status));
        if (activeOrders.length === 0) {
            activeOrdersContainer.innerHTML = `
                <div style="text-align:center; padding:32px 16px; color:var(--admin-text-muted); font-size:0.88rem;">
                    ✨ No hay pedidos activos en este momento.
                </div>`;
        } else {
            activeOrdersContainer.innerHTML = activeOrders.slice(0, 5).map(o => {
                const itemsText = (o.items || []).map(i => `${i.qty || i.quantity || 1}x ${i.name || i.productName || 'Producto'}`).join(', ');
                const nextStatus = o.status === 'RECEIVED' ? 'PREPARING' : (o.status === 'PREPARING' ? 'ON_WAY' : 'DELIVERED');
                const confirmLabel = o.status === 'RECEIVED' ? '✓ Confirmar' : (o.status === 'PREPARING' ? '🛵 Despachar' : '✅ Entregar');

                return `
                <div class="dash-order-card" style="padding:14px; margin-bottom:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(230,81,0,0.25); border-radius:12px;">
                    <div class="dash-order-info" style="margin-bottom:8px;">
                        <div class="dash-order-num" style="display:flex; justify-content:space-between; align-items:center;">
                            <span>📦 <strong>${o.orderNumber}</strong> <span style="font-size:0.75rem; font-weight:600; color:#a1a1aa; margin-left:8px;">${o.createdAt || ''}</span></span>
                            <span class="dash-order-total" style="font-size:1rem; font-weight:900; color:#10b981;">$ ${(o.total || 0).toLocaleString('es-CO')}</span>
                        </div>
                        <div class="dash-order-customer" style="font-size:0.85rem; color:#f4f4f5; margin:4px 0;">
                            👤 <strong>${o.customerName || 'Cliente'}</strong> • 📞 ${o.customerPhone || 'Sin teléfono'}
                        </div>
                        <div style="font-size:0.78rem; color:#fb923c; font-weight:700; margin-bottom:2px;">
                            📍 ${o.fulfillmentType === 'PICKUP' ? '🏬 Recogida en Local' : '🛵 Domicilio: ' + (o.deliveryAddress || 'Sin dirección')}
                        </div>
                        <div style="font-size:0.78rem; color:#d4d4d8; line-height:1.35; margin-top:4px;">
                            🛒 ${itemsText || 'Sin ítems detallados'}
                        </div>
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:6px; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.06); padding-top:8px;">
                        <button class="btn-merko-primary" style="padding:5px 12px; font-size:0.75rem; background:#16a34a; border-color:#16a34a;" onclick="advanceActiveOrder('${o.id}', '${nextStatus}')">
                            ${confirmLabel}
                        </button>
                        <button class="btn-merko-outline" style="padding:5px 10px; font-size:0.75rem; color:#ef4444; border-color:#ef4444;" onclick="advanceActiveOrder('${o.id}', 'CANCELLED')">
                            ✕ Cancelar
                        </button>
                        <button class="btn-merko-outline" style="padding:5px 12px; font-size:0.75rem; border-color:#f59e0b; color:#f59e0b;" onclick="openOrderDetailModal('${o.id}')">
                            📄 Detalle
                        </button>
                    </div>
                </div>`;
            }).join('');
        }
    }

    // 3. Action Requests List (Left Panel 2)
    const actionRequestsContainer = document.getElementById('dashActionRequestsList');
    if (actionRequestsContainer) {
        const pendingOrders = state.orders.filter(o => o.status === 'RECEIVED' || o.paymentStatus === 'PENDING');
        // Excluir productos inactivos de las solicitudes de reposición
        const lowStock = (state.products || []).filter(p => p.isAvailable !== false && ((Number(p.stock) || 0) <= (Number(p.minStockAlert) || 5)));

        let requestsHTML = '';
        pendingOrders.forEach(o => {
            requestsHTML += `
                <div class="dash-order-card" style="border-left: 3px solid #f59e0b;">
                    <div>
                        <div style="font-weight:800; font-size:0.88rem; color:#ffffff;">📲 Confirmación por WhatsApp requerida (${o.orderNumber})</div>
                        <div style="font-size:0.78rem; color:var(--admin-text-muted);">Cliente: ${o.customerName} • Tel: ${o.customerPhone}</div>
                    </div>
                    <button class="btn-merko-primary" style="padding:5px 12px; font-size:0.75rem;" onclick="switchAdminSubTab('orders')">
                        Atender Pedido ➔
                    </button>
                </div>`;
        });

        lowStock.forEach(p => {
            requestsHTML += `
                <div class="dash-order-card" style="border-left: 3px solid #ef4444;">
                    <div>
                        <div style="font-weight:800; font-size:0.88rem; color:#ffffff;">⚠️ Stock Crítico: ${p.name}</div>
                        <div style="font-size:0.78rem; color:#ef4444;">Quedan solo ${p.stock || 0} unidades en inventario.</div>
                    </div>
                    <button class="btn-merko-primary" style="padding:6px 14px; font-size:0.78rem; display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg, #FF8F00, #E65100); border:none;" onclick="quickEditStockFromDashboard('${p.id}')" title="Atender producto y reponer stock">
                        ✏️ Atender
                    </button>
                </div>`;
        });

        if (!requestsHTML) {
            requestsHTML = `
                <div style="text-align:center; padding:28px 16px; color:var(--admin-text-muted); font-size:0.88rem;">
                    ✅ No hay solicitudes pendientes de acción urgente.
                </div>`;
        }
        actionRequestsContainer.innerHTML = requestsHTML;
    }

    // 4. Low Stock Product List (Right Panel 1)
    const lowStockContainer = document.getElementById('dashLowStockList');
    if (lowStockContainer) {
        // Excluir productos inactivos de la lista de stock bajo para reponer
        const lowStockProducts = (state.products || []).filter(p => p.isAvailable !== false && ((Number(p.stock) || 0) <= (Number(p.minStockAlert) || 5))).slice(0, 4);
        if (lowStockProducts.length === 0) {
            lowStockContainer.innerHTML = `
                <div style="text-align:center; padding:24px 16px; color:var(--admin-text-muted); font-size:0.85rem;">
                    🎉 Todo el inventario tiene existencias suficientes.
                </div>`;
        } else {
            lowStockContainer.innerHTML = lowStockProducts.map(p => `
                <div class="dash-stock-item">
                    <img src="${p.imageUrl}" alt="${p.name}" class="dash-stock-img">
                    <div style="flex:1;">
                        <div class="dash-stock-name">${p.name}</div>
                        <div class="dash-stock-price">$ ${(p.price || 0).toLocaleString('es-CO')}</div>
                    </div>
                    <span class="dash-stock-badge ${p.stock <= 0 ? 'agotado' : 'bajo'}">
                        ${p.stock <= 0 ? 'Agotado' : `${p.stock} und.`}
                    </span>
                    <button class="btn-merko-outline" style="padding:4px 8px; font-size:0.72rem;" onclick="quickEditStockFromDashboard('${p.id}')" title="Editar stock">
                        ✏️
                    </button>
                </div>
            `).join('');
        }
    }

    // 5. Sales Summary & 7-Day Chart (Right Panel 2) - SIGUE HORARIO LOCAL REAL (UTC-5 / COLOMBIA)
    const salesTodayEl = document.getElementById('dashSalesToday');
    const salesWeekEl = document.getElementById('dashSalesWeek');
    const salesMonthEl = document.getElementById('dashSalesMonth');
    const chartContainer = document.getElementById('dash7DaysChart');

    const totalOrders = (state.orders || []).filter(o => o.status !== 'CANCELLED');

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    // Inicio de la semana actual (Lunes a las 00:00:00)
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Lunes, 6 = Domingo
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0);
    const startOfWeekStr = `${startOfWeek.getFullYear()}-${pad(startOfWeek.getMonth() + 1)}-${pad(startOfWeek.getDate())}`;

    // Inicio del mes actual (Día 1 del mes a las 00:00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const startOfMonthStr = `${startOfMonth.getFullYear()}-${pad(startOfMonth.getMonth() + 1)}-${pad(startOfMonth.getDate())}`;

    function extractOrderLocalDate(o) {
        if (!o) return '';
        if (o.dateOnly) return o.dateOnly;
        if (o.createdAt) {
            const s = String(o.createdAt).trim();
            if (s.length >= 10) return s.slice(0, 10);
        }
        return '';
    }

    const activeProductMap = new Map();
    (state.products || []).forEach(p => {
        const isActive = p.isAvailable !== false;
        activeProductMap.set(p.id, isActive);
        if (p.name) activeProductMap.set(p.name.toLowerCase(), isActive);
    });

    function getOrderActiveTotal(o) {
        if (!o || o.status === 'CANCELLED') return 0;
        let sum = 0;
        (o.items || []).forEach(it => {
            const isItemActive = (activeProductMap.get(it.productId) !== false) && (!it.name || activeProductMap.get(it.name.toLowerCase()) !== false);
            if (isItemActive) {
                const unitPrice = Number(it.unitPrice || it.price) || 0;
                const qty = Number(it.qty || it.quantity) || 1;
                sum += (Number(it.subtotal) > 0) ? Number(it.subtotal) : (unitPrice * qty);
            }
        });
        return sum;
    }

    let sumToday = 0;
    let sumWeek = 0;
    let sumMonth = 0;

    totalOrders.forEach(o => {
        const val = getOrderActiveTotal(o);
        if (val <= 0) return;
        const dStr = extractOrderLocalDate(o);
        if (!dStr) return;

        if (dStr === todayStr) {
            sumToday += val;
        }
        if (dStr >= startOfWeekStr && dStr <= todayStr) {
            sumWeek += val;
        }
        if (dStr.startsWith(todayStr.slice(0, 7)) || (dStr >= startOfMonthStr && dStr <= todayStr)) {
            sumMonth += val;
        }
    });

    const finalToday = sumToday;
    const finalWeek = sumWeek;
    const finalMonth = sumMonth;

    if (salesTodayEl) salesTodayEl.textContent = `$ ${Math.round(finalToday).toLocaleString('es-CO')}`;
    if (salesWeekEl) salesWeekEl.textContent = `$ ${Math.round(finalWeek).toLocaleString('es-CO')}`;
    if (salesMonthEl) salesMonthEl.textContent = `$ ${Math.round(finalMonth).toLocaleString('es-CO')}`;

    // 7 Days Chart con cálculo exacto por día calendario local
    if (chartContainer) {
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            const val = totalOrders
                .filter(o => extractOrderLocalDate(o) === dateStr)
                .reduce((s, o) => s + getOrderActiveTotal(o), 0);

            last7Days.push({
                dateStr: dateStr,
                dayName: dayNames[d.getDay()],
                val: val,
                isToday: i === 0
            });
        }

        const maxVal = Math.max(...last7Days.map(d => d.val), 50000);

        chartContainer.innerHTML = last7Days.map(d => {
            const heightPercent = d.val > 0 ? Math.max((d.val / maxVal) * 100, 14) : 8;
            return `
                <div class="dash-chart-bar-wrap" title="${d.dayName} (${d.dateStr}): $ ${Math.round(d.val).toLocaleString('es-CO')}">
                    <div class="dash-chart-bar" style="height:${heightPercent}%; ${d.isToday ? 'background:linear-gradient(180deg, #FF8F00 0%, #E65100 100%); box-shadow:0 0 10px rgba(255,143,0,0.5);' : ''}"></div>
                    <span class="dash-chart-label" style="${d.isToday ? 'color:#FF8F00; font-weight:900;' : ''}">${d.dayName}</span>
                </div>
            `;
        }).join('');
    }
}

function advanceOrderStatusFromDashboard(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    const transitions = {
        'RECEIVED': 'PREPARING',
        'PREPARING': 'READY',
        'READY': 'ON_WAY',
        'ON_WAY': 'DELIVERED'
    };

    if (transitions[order.status]) {
        const nextStatus = transitions[order.status];
        advanceActiveOrder(orderId, nextStatus);
    }
}

function quickEditStockFromDashboard(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    switchAdminSubTab('products');
    if (typeof editProduct === 'function') {
        editProduct(productId);
    }

    setTimeout(() => {
        const editorCard = document.getElementById('productEditorCard') || document.getElementById('editorSubtabTitle') || document.getElementById('subtabProducts');
        if (editorCard) {
            editorCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const stockInput = document.getElementById('editorStock');
        if (stockInput) {
            stockInput.focus();
            stockInput.select();
        }
    }, 150);

    showToast(`✏️ Atendiendo "${prod.name}". Actualiza el stock o costo en el formulario.`, 'info', '✏️');
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // 0. One-time clean reset for user requested $0 COP budget and 0 test movements
    const BUDGET_RESET_V1 = 'v6_clean_zero_budget_reset';
    if (!Storage.get(BUDGET_RESET_V1)) {
        state.budget = {
            initialBudget: 0,
            currentBalance: 0,
            totalPurchases: 0,
            totalRecoveredCosts: 0,
            totalManualInjections: 0,
            isInitialized: false
        };
        state.budgetTransactions = [];
        Storage.set('store_budget', state.budget);
        Storage.set('budget_transactions', []);
        Storage.set(BUDGET_RESET_V1, true);
        if (typeof API !== 'undefined' && API.post) {
            API.post('/api/v1/admin/budget/reset', { storeId: 'STORE-001' }).catch(() => {});
        }
    } else {
        const savedBudget = Storage.get('store_budget');
        if (savedBudget) state.budget = savedBudget;
        const savedTransactions = Storage.get('budget_transactions');
        if (savedTransactions) state.budgetTransactions = savedTransactions;
    }
    const savedPurchases = Storage.get('supplier_purchases');
    if (savedPurchases) state.supplierPurchases = savedPurchases;

    // 1. Enforce dataset synchronization with Power BI Star Schema
    const PBI_SYNC_VERSION = 'v3_powerbi_verified_sync';
    const currentVersion = Storage.get('pbi_sync_version');
    const savedProducts = Storage.get('products');
    const savedCategories = Storage.get('categories');
    const savedOrders = Storage.get('orders');

    if (savedProducts !== null && savedProducts !== undefined) {
        state.products = savedProducts;
    } else {
        Storage.set('products', state.products);
    }

    if (savedCategories !== null && savedCategories !== undefined) {
        state.categories = savedCategories;
    } else {
        Storage.set('categories', state.categories);
    }

    if (savedOrders !== null && savedOrders !== undefined) {
        state.orders = (savedOrders || []).map(o => ({
            ...o,
            items: (o.items || []).map(it => {
                const found = state.products.find(p => p.id === it.productId);
                const safeName = (it.name && it.name !== 'undefined') ? it.name : (it.productName || (found ? found.name : 'Producto'));
                return {
                    ...it,
                    name: safeName,
                    qty: it.qty || it.quantity || 1
                };
            })
        }));
    } else {
        Storage.set('orders', state.orders);
    }

    recalculateMercadoStocks();
    renderCategoryBadges();
    renderCategoryOptions();
    renderEmojiPickers();
    renderProducts();
    updateLivePreview();
    renderAdminProductsTable();
    renderAdminCategoriesTable();
    renderActiveOrdersTable();
    renderHistorialUnificadoTable();
    updateDashboardKPIs();
    syncStoreConfigUI();
    renderMercadoItemsChecklist();
});

// FLOATING TOAST NOTIFICATION ENGINE (ULTRA-LIVIANO, ÁGIL Y NO INVASIVO)

// ==========================================================================
// VENTANA FLOTANTE DE CONFIRMACIÓN PERSONALIZADA (MERKOSTORE LUXURY MODAL)
// ==========================================================================
let merkoConfirmResolver = null;

function showMerkoConfirm({ title, message, icon = '⚠️', confirmText = 'Confirmar', cancelText = 'Cancelar', confirmType = 'danger' }) {
    return new Promise((resolve) => {
        merkoConfirmResolver = resolve;

        const modal = document.getElementById('merkoConfirmModal');
        const iconEl = document.getElementById('merkoConfirmIcon');
        const titleEl = document.getElementById('merkoConfirmTitle');
        const msgEl = document.getElementById('merkoConfirmMessage');
        const btnOk = document.getElementById('merkoConfirmBtnOk');
        const btnCancel = document.getElementById('merkoConfirmBtnCancel');

        if (!modal) {
            const fallback = window.confirm(`${title}\n\n${message}`);
            return resolve(fallback);
        }

        if (iconEl) iconEl.textContent = icon;
        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = message;

        if (btnCancel) {
            btnCancel.textContent = cancelText;
            btnCancel.onclick = () => closeMerkoConfirm(false);
        }

        if (btnOk) {
            btnOk.textContent = confirmText;
            if (confirmType === 'danger') {
                btnOk.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                btnOk.style.borderColor = '#ef4444';
                btnOk.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
            } else if (confirmType === 'warning') {
                btnOk.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                btnOk.style.borderColor = '#f59e0b';
                btnOk.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
            } else {
                btnOk.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                btnOk.style.borderColor = '#10b981';
                btnOk.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
            }

            btnOk.onclick = () => closeMerkoConfirm(true);
        }

        modal.onclick = (e) => {
            if (e.target === modal) closeMerkoConfirm(false);
        };

        modal.style.display = 'flex';
        modal.classList.add('active');
    });
}

function closeMerkoConfirm(result) {
    const modal = document.getElementById('merkoConfirmModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    if (typeof merkoConfirmResolver === 'function') {
        const resolve = merkoConfirmResolver;
        merkoConfirmResolver = null;
        resolve(result);
    }
}

function showToast(message, type = 'success', icon = null) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    // Solo permitir 1 notificación activa para no saturar ni trabar la pantalla móvil
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    let defaultIcon = '✅';
    if (type === 'info') defaultIcon = 'ℹ️';
    if (type === 'warning') defaultIcon = '⚠️';
    if (type === 'error') defaultIcon = '❌';

    const toastIcon = icon || defaultIcon;

    const toast = document.createElement('div');
    toast.className = `merko-toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon-badge">${toastIcon}</span>
        <span class="toast-title">${message}</span>
        <button class="toast-close" onclick="closeToast(this.parentElement)" title="Cerrar">✕</button>
    `;

    container.appendChild(toast);

    const timer = setTimeout(() => {
        closeToast(toast);
    }, 2800);

    toast._toastTimer = timer;
}

function closeToast(toast) {
    if (!toast || toast.classList.contains('toast-exit')) return;
    if (toast._toastTimer) clearTimeout(toast._toastTimer);
    toast.classList.add('toast-exit');
    setTimeout(() => {
        if (toast && toast.parentNode) toast.remove();
    }, 220);
}

// FLUID DRAGGABLE FLOATING EMOJIS (MOUSE & TOUCH DRAG ENGINE)
function startDragEmoji(e, element) {
    e.preventDefault();
    element.classList.add('dragging');

    let startX = e.clientX || (e.touches && e.touches[0].clientX);
    let startY = e.clientY || (e.touches && e.touches[0].clientY);

    const rect = element.getBoundingClientRect();
    let initialLeft = rect.left;
    let initialTop = rect.top;

    function onMove(moveEvent) {
        const currentX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
        const currentY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);

        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        element.style.left = `${initialLeft + deltaX}px`;
        element.style.top = `${initialTop + deltaY}px`;
        element.style.right = 'auto';
        element.style.bottom = 'auto';
    }

    function onEnd() {
        element.classList.remove('dragging');
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
}

// INVENTORY SYNC ENGINE (MERCADO & PRODUCTO DETAL)
function recalculateMercadoStocks() {
    state.products.forEach(p => {
        if (p.type === 'MERCADO' && p.bundleItems && p.bundleItems.length > 0) {
            // Si el combo no tiene stock definido manualmente por el administrador, calcularlo automáticamente
            if (p.stock === undefined || p.stock === null) {
                const possibleCombos = p.bundleItems.map(item => {
                    const detal = state.products.find(d => d.id === item.productId && d.type === 'DETAL');
                    if (!detal) return 0;
                    return Math.floor(detal.stock / item.quantity);
                });
                p.stock = Math.min(...possibleCombos);
            }
        }
    });
}

function deductInventoryForOrderItems(items) {
    items.forEach(item => {
        const prod = state.products.find(p => p.id === item.productId);
        if (!prod) return;

        if (prod.type === 'DETAL') {
            prod.stock = Math.max(0, prod.stock - item.qty);
        } else if (prod.type === 'MERCADO' && prod.bundleItems) {
            prod.bundleItems.forEach(bItem => {
                const detal = state.products.find(d => d.id === bItem.productId && d.type === 'DETAL');
                if (detal) {
                    detal.stock = Math.max(0, detal.stock - (bItem.quantity * item.qty));
                }
            });
        }
    });

    recalculateMercadoStocks();
    renderProducts();
    renderAdminProductsTable();
}

// ROUTING & VIEW SWITCHER
function switchView(view) {
    if (view === 'admin' && !state.isAdminLoggedIn) {
        showToast('🔒 Inicia sesión como administrador para acceder', 'warning', '🔒');
        openAdminLoginModal();
        return;
    }

    state.currentView = view;
    const isStorefront = view === 'storefront';
    const isAdmin = view === 'admin';

    document.getElementById('viewStorefront').style.display = isStorefront ? 'block' : 'none';
    document.getElementById('viewAdmin').style.display = isAdmin ? 'block' : 'none';

    // Toggle storefront components visibility
    const topBar = document.querySelector('.top-bar');
    const appHeader = document.getElementById('appHeader');
    const floatingCartFab = document.getElementById('floatingCartFab');
    const floatingWhatsappBtn = document.getElementById('floatingWhatsappBtn');
    const totalCartItems = Object.values(state.cart || {}).reduce((a, b) => a + b, 0);

    if (topBar) topBar.style.display = isStorefront ? '' : 'none';
    if (appHeader) appHeader.style.display = isStorefront ? '' : 'none';
    if (floatingCartFab) floatingCartFab.style.display = (isStorefront && totalCartItems > 0) ? 'flex' : 'none';
    if (floatingWhatsappBtn) floatingWhatsappBtn.style.display = isStorefront ? '' : 'none';

    // El asistente de IA no debe aparecer en el panel admin
    const floatingChatbotBtn = document.getElementById('floatingChatbotBtn');
    const chatbotWidgetContainer = document.getElementById('chatbotWidgetContainer');
    if (floatingChatbotBtn) floatingChatbotBtn.style.display = isStorefront ? '' : 'none';
    if (chatbotWidgetContainer) {
        if (!isStorefront) {
            chatbotWidgetContainer.classList.remove('open');
            chatbotWidgetContainer.style.display = 'none';
            if (typeof chatState !== 'undefined') chatState.isOpen = false;
        } else {
            chatbotWidgetContainer.style.display = '';
        }
    }

    if (isAdmin) {
        document.body.classList.add('admin-fullscreen-active');
    } else {
        document.body.classList.remove('admin-fullscreen-active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// BRAND LOGO SECRET ADMIN ACCESS (5 CLICS CONSECUTIVOS)
let brandLogoClickCount = 0;
let brandLogoClickTimer = null;

function handleBrandLogoClick(e) {
    brandLogoClickCount++;
    if (brandLogoClickTimer) clearTimeout(brandLogoClickTimer);

    if (brandLogoClickCount >= 5) {
        brandLogoClickCount = 0;
        openAdminLoginModal();
        return;
    }

    brandLogoClickTimer = setTimeout(() => {
        brandLogoClickCount = 0;
    }, 2500);

    if (state.currentView !== 'storefront') {
        switchView('storefront');
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ADMIN AUTHENTICATION MODAL
function openAdminLoginModal() {
    if (state.isAdminLoggedIn) {
        switchView('admin');
        return;
    }
    const uInput = document.getElementById('loginUser');
    const pInput = document.getElementById('loginPass');
    if (uInput) uInput.value = '';
    if (pInput) pInput.value = '';
    document.getElementById('adminLoginModal').classList.add('active');
}

function closeAdminLoginModal() {
    document.getElementById('adminLoginModal').classList.remove('active');
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    try {
        const response = await API.post('/api/v1/auth/login', { username: user, password: pass });
        if (response && response.success && response.data && response.data.token) {
            API.setToken(response.data.token);
            state.isAdminLoggedIn = true;
            closeAdminLoginModal();
            // Cambio instantáneo de pantalla sin retraso
            switchView('admin');
            showToast('🔓 ¡Bienvenido al Panel Administrador!', 'success', '🔓');
            // Carga asíncrona de datos en segundo plano
            loadAdminBackendData();
        } else {
            showToast('❌ Credenciales incorrectas.', 'error', '❌');
        }
    } catch (err) {
        showToast(`❌ Error de inicio de sesión: ${err.message}`, 'error', '❌');
    }
}

function logoutAdmin() {
    API.setToken(null);
    state.isAdminLoggedIn = false;
    switchView('storefront');
    showToast('🔒 Sesión de Administrador cerrada correctamente', 'info', '🔒');
}

function scrollToProducts() {
    const title = document.getElementById('productsTitle');
    if (title) title.scrollIntoView({ behavior: 'smooth' });
}

// STOREFRONT CATEGORIES & PRODUCTS
function renderCategoryBadges() {
    const container = document.getElementById('categoryBadgesContainer');
    container.innerHTML = state.categories.map(cat => `
        <div class="cat-badge-card ${state.selectedCategory === cat.id ? 'active' : ''}" onclick="selectCategory('${cat.id}')">
            <div class="cat-badge-icon-box" style="background: ${cat.bgColor || '#f1f5f9'};">
                ${cat.icon}
            </div>
            <span class="cat-badge-label">${cat.name}</span>
        </div>
    `).join('');
}

function selectCategory(catId) {
    state.selectedCategory = catId;
    renderCategoryBadges();
    renderProducts();
}

function filterProducts() {
    state.searchQuery = document.getElementById('searchInput').value.toLowerCase();
    renderProducts();
}

function toggleFavorite(btn, productName) {
    btn.classList.toggle('active');
    const isFav = btn.classList.contains('active');
    btn.innerHTML = isFav ? '❤️' : '♡';
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    // Filter ONLY active products for storefront (inactive products are hidden from customers)
    let filtered = state.products.filter(p => p.isAvailable !== false);

    if (state.selectedCategory !== 'ALL') {
        filtered = filtered.filter(p => p.categoryId === state.selectedCategory);
    }

    if (state.searchQuery) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
    }

    const countLabel = document.getElementById('productCountLabel');
    if (countLabel) {
        countLabel.textContent = `Mostrando ${filtered.length} productos y mercados`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px;">No se encontraron productos ni mercados en esta categoría.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const activePrice = p.discountPrice || p.price;
        const hasDiscount = !!p.discountPrice;
        const savings = hasDiscount ? (p.price - p.discountPrice) : 0;
        const qty = state.cart[p.id] || 0;
        const isMercado = p.type === 'MERCADO';
        const isSoldOut = p.isAvailable === false || p.stock <= 0;

        const fitPc = p.imageFitPc || 'cover';
        const zoomPc = p.imageZoomPc !== undefined ? Number(p.imageZoomPc) : 1;
        const posX_Pc = p.imagePosX_Pc !== undefined ? Number(p.imagePosX_Pc) : 50;
        const posY_Pc = p.imagePosY_Pc !== undefined ? Number(p.imagePosY_Pc) : 50;
        const transX_Pc = posX_Pc - 50;
        const transY_Pc = posY_Pc - 50;

        const fitMob = p.imageFitMobile || fitPc;
        const zoomMob = p.imageZoomMobile !== undefined ? Number(p.imageZoomMobile) : zoomPc;
        const posX_Mob = p.imagePosX_Mobile !== undefined ? Number(p.imagePosX_Mobile) : posX_Pc;
        const posY_Mob = p.imagePosY_Mobile !== undefined ? Number(p.imagePosY_Mobile) : posY_Pc;
        const transX_Mob = posX_Mob - 50;
        const transY_Mob = posY_Mob - 50;

        return `
            <div class="product-card-bright ${isSoldOut ? 'sold-out' : ''}">
                <div class="card-img-wrap" style="--img-fit-pc:${fitPc}; --img-zoom-pc:${zoomPc}; --img-pos-pc:${posX_Pc}% ${posY_Pc}%; --img-trans-x-pc:${transX_Pc}%; --img-trans-y-pc:${transY_Pc}%; --img-fit-mob:${fitMob}; --img-zoom-mob:${zoomMob}; --img-pos-mob:${posX_Mob}% ${posY_Mob}%; --img-trans-x-mob:${transX_Mob}%; --img-trans-y-mob:${transY_Mob}%;">
                    ${isSoldOut ? `<span class="stock-status-badge" style="background:#ef4444; color:#fff; top:10px; left:10px; position:absolute; border-radius:6px; padding:3px 8px; font-size:0.72rem; font-weight:800; z-index:2;">Agotado</span>` : ''}
                    <img src="${p.imageUrl}" alt="${p.name}" class="product-framed-img" loading="lazy">
                </div>
                <div class="card-details">
                    <span class="card-unit-info">${p.unitCalc || (isMercado ? 'Combo Mercado' : 'Unidad detal')}</span>
                    <h3 class="card-product-title">${p.name}</h3>
                    
                    ${p.description ? `<p style="font-size:0.78rem; color:var(--text-muted); line-height:1.3; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.description}</p>` : ''}

                    <div class="card-price-block" style="display:flex; align-items:center; flex-wrap:wrap; gap:8px;">
                        <div class="card-sale-price ${hasDiscount ? 'discounted' : ''}">
                            $ ${activePrice.toLocaleString('es-CO')}
                            ${hasDiscount ? `<span class="card-old-price">$ ${p.price.toLocaleString('es-CO')}</span>` : ''}
                        </div>
                    </div>
                    
                    ${isSoldOut ? `
                        <button class="card-add-btn sold-out-btn" disabled style="margin-top:10px;">
                            <span>Agotado</span>
                        </button>
                    ` : (qty === 0 ? `
                        <button class="card-add-btn" onclick="updateCartQuantity('${p.id}', 1)" style="margin-top:10px;">
                            <span>🛒 Agregar al Carrito</span>
                        </button>
                    ` : `
                        <div class="qty-stepper-card" style="margin-top:10px;">
                            <button class="qty-stepper-btn" onclick="updateCartQuantity('${p.id}', ${qty - 1})">-</button>
                            <div style="text-align:center;">
                                <div style="font-size:0.65rem; font-weight:800; color:#dc2626; line-height:1;">CARRITO</div>
                                <div style="font-weight:900; font-size:1rem; color:#0f172a;">${qty}</div>
                            </div>
                            <button class="qty-stepper-btn" onclick="updateCartQuantity('${p.id}', ${qty + 1})">+</button>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }).join('');
}

// CART ENGINE & CHECKOUT STEP WIZARD
let currentPaymentMethod = 'TRANSFER_WHATSAPP';

function addToCart(productId, quantity = 1) {
    const prod = state.products.find(p => p.id === productId || String(p.id).toLowerCase() === String(productId).toLowerCase());
    if (!prod) return;
    if (prod.isAvailable === false) {
        showToast(`⚠️ "${prod.name}" se encuentra actualmente inactivo en la tienda.`, 'warning', '🚫');
        return;
    }
    const currentQty = state.cart[prod.id] || 0;
    updateCartQuantity(prod.id, currentQty + quantity);
}

function updateCartQuantity(productId, newQty) {
    const prod = state.products.find(p => p.id === productId);
    const oldQty = state.cart[productId] || 0;

    if (prod && newQty > prod.stock) {
        showToast(`⚠️ Inventario máximo disponible: ${prod.stock} unidades.`, 'warning', '⚠️');
        return;
    }

    if (newQty <= 0) {
        delete state.cart[productId];
    } else {
        state.cart[productId] = newQty;
    }
    renderProducts();
    renderCart();
}

function renderCart() {
    const cartList = document.getElementById('cartItemsList');
    const badge = document.getElementById('cartBadge');
    const headerBadge = document.getElementById('cartHeaderBadge');
    const fabBadge = document.getElementById('fabCartBadge');
    const step1Count = document.getElementById('step1ItemCount');
    const itemsCountBadge = document.getElementById('cartItemsCountBadge');

    const cartIds = Object.keys(state.cart);
    const totalItems = Object.values(state.cart).reduce((a, b) => a + b, 0);

    if (badge) badge.textContent = totalItems;
    if (headerBadge) headerBadge.textContent = totalItems;
    if (fabBadge) fabBadge.textContent = totalItems;
    if (step1Count) step1Count.textContent = `${totalItems} ${totalItems === 1 ? 'ítem' : 'ítems'}`;
    if (itemsCountBadge) itemsCountBadge.textContent = `${totalItems} ${totalItems === 1 ? 'Producto' : 'Productos'}`;

    if (cartIds.length === 0) {
        const floatingCartFab = document.getElementById('floatingCartFab');
        if (floatingCartFab) floatingCartFab.style.display = 'none';

        cartList.innerHTML = `
            <div class="cart-empty-state">
                <div class="empty-icon-animated">🛒</div>
                <h4 style="font-size:1.1rem; font-weight:900; color:#0f172a; margin-bottom:6px;">Tu carrito está vacío</h4>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:18px;">Agrega productos y mercados para realizar tu pedido en 3 simples pasos.</p>
                <button class="btn-checkout-next" style="width:auto; padding:10px 24px; font-size:0.88rem;" onclick="toggleCartDrawer(); scrollToProducts();">
                    🛒 Explorar Productos
                </button>
            </div>
        `;
        updateCartTotals(0);
        updateFreeShippingProgress(0);
        renderTicketPreview([]);
        return;
    }

    let subtotal = 0;
    let ticketItems = [];

    cartList.innerHTML = cartIds.map(id => {
        const p = state.products.find(prod => prod.id === id);
        if (!p) return '';

        const qty = state.cart[id];
        const price = p.discountPrice || p.price;
        const sub = price * qty;
        subtotal += sub;

        ticketItems.push({ name: p.name, qty: qty, subtotal: sub });

        return `
            <div class="cart-item-card">
                <img src="${p.imageUrl}" alt="${p.name}" class="cart-item-img">
                
                <div class="cart-item-details">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                        <span class="card-type-badge ${p.type === 'MERCADO' ? 'mercado' : 'detal'}" style="position:static; font-size:0.6rem; padding:1px 6px;">
                            ${p.type === 'MERCADO' ? 'MERCADO' : 'PRODUCTO'}
                        </span>
                    </div>
                    <div class="cart-item-title">${p.name}</div>
                    <div class="cart-item-unit">${p.unitCalc || ''}</div>
                    <div class="cart-item-price-unit">$ ${price.toLocaleString('es-CO')} c/u</div>
                </div>

                <div class="cart-item-actions">
                    <div class="cart-item-subtotal">$ ${sub.toLocaleString('es-CO')}</div>
                    
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div class="cart-qty-control">
                            <button class="qty-btn" onclick="updateCartQuantity('${id}', ${qty - 1})">-</button>
                            <span class="qty-num">${qty}</span>
                            <button class="qty-btn" onclick="updateCartQuantity('${id}', ${qty + 1})">+</button>
                        </div>

                        <button class="cart-remove-btn" onclick="updateCartQuantity('${id}', 0)" title="Eliminar ítem">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    updateCartTotals(subtotal);
    updateFreeShippingProgress(subtotal);
    renderTicketPreview(ticketItems);
}

function updateFreeShippingProgress(subtotal) {
    const freeShippingTarget = 30000;
    const banner = document.getElementById('freeShippingBanner');
    const bar = document.getElementById('freeShippingBar');
    const text = document.getElementById('freeShippingText');

    if (!banner || !bar || !text) return;

    if (subtotal >= freeShippingTarget) {
        bar.style.width = '100%';
        bar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        text.textContent = '🎉 ¡Felicidades! Tienes Domicilio GRATIS';
    } else {
        const pct = Math.min(100, Math.round((subtotal / freeShippingTarget) * 100));
        const remaining = freeShippingTarget - subtotal;
        bar.style.width = `${pct}%`;
        bar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
        text.textContent = `Faltan $ ${remaining.toLocaleString('es-CO')} para envío gratis`;
    }
}

function updateCartTotals(subtotal) {
    const totalItems = Object.values(state.cart || {}).reduce((a, b) => a + b, 0);
    const isFree = subtotal >= 30000;
    const rawFee = state.storeConfig.deliveryFee || 3000;
    const fee = (state.storeConfig.fulfillmentType === 'DELIVERY' && !isFree) ? rawFee : 0;
    const total = subtotal + fee;

    const subStep1 = document.getElementById('cartSubtotalStep1');
    const subStep3 = document.getElementById('cartSubtotal');
    const feeSummary = document.getElementById('cartDeliveryFeeSummary');
    const grandTotal = document.getElementById('cartTotal');
    const fabTotal = document.getElementById('fabCartTotal');
    const fabCartTitle = document.getElementById('fabCartTitle');
    const fabCartFeeNote = document.getElementById('fabCartFeeNote');
    const floatingCartFab = document.getElementById('floatingCartFab');

    if (subStep1) subStep1.textContent = `$ ${subtotal.toLocaleString('es-CO')}`;
    if (subStep3) subStep3.textContent = `$ ${subtotal.toLocaleString('es-CO')}`;
    if (fabTotal) fabTotal.textContent = `$ ${total.toLocaleString('es-CO')}`;
    
    if (fabCartTitle) {
        fabCartTitle.textContent = `Ver Carrito (${totalItems} ${totalItems === 1 ? 'ítem' : 'ítems'})`;
    }

    if (fabCartFeeNote) {
        if (state.storeConfig.fulfillmentType === 'PICKUP') {
            fabCartFeeNote.innerHTML = '🛵 Recogida en local • <strong>Sin costo</strong>';
        } else if (isFree) {
            fabCartFeeNote.innerHTML = '🛵 <strong>¡Domicilio GRATIS incluido!</strong>';
        } else {
            fabCartFeeNote.innerHTML = `🛵 Domicilio: <strong>$ ${fee.toLocaleString('es-CO')}</strong> incluido`;
        }
    }

    if (floatingCartFab) {
        floatingCartFab.style.display = (totalItems > 0 && state.currentView === 'storefront') ? 'flex' : 'none';
    }
    
    if (feeSummary) {
        if (state.storeConfig.fulfillmentType === 'PICKUP') {
            feeSummary.textContent = 'GRATIS (Recogida)';
        } else if (isFree) {
            feeSummary.textContent = '¡GRATIS!';
            feeSummary.style.color = '#059669';
            feeSummary.style.fontWeight = '900';
        } else {
            feeSummary.textContent = `$ ${fee.toLocaleString('es-CO')}`;
            feeSummary.style.color = 'inherit';
        }
    }
    
    if (grandTotal) grandTotal.textContent = `$ ${total.toLocaleString('es-CO')}`;
}

function goToCartStep(step) {
    const cartIds = Object.keys(state.cart);
    if (cartIds.length === 0 && step > 1) {
        showToast('🛒 Tu carrito está vacío. Agrega productos para continuar.', 'warning', '🛒');
        return;
    }

    // Validación de Pedido Mínimo ($ 10.000 COP)
    const subtotal = cartIds.reduce((sum, id) => {
        const prod = state.products.find(p => p.id === id);
        return sum + ((prod ? prod.price : 0) * state.cart[id]);
    }, 0);
    const minOrder = state.storeConfig.minimumOrder || 10000;

    if (step > 1 && subtotal < minOrder) {
        showToast(`⚠️ El pedido mínimo para despacho es de $ ${minOrder.toLocaleString('es-CO')} COP. ¡Agrega más productos a tu canasta!`, 'warning', '⚠️');
        return;
    }

    // Validación de Campos Obligatorios en Paso 2
    if (step === 3) {
        const name = (document.getElementById('custName')?.value || '').trim();
        const phone = (document.getElementById('custPhone')?.value || '').trim();
        const address = (document.getElementById('custAddress')?.value || '').trim();
        const notes = (document.getElementById('custNotes')?.value || '').trim();

        if (!name || !phone || !address || !notes) {
            showToast('⚠️ Todos los campos de entrega son obligatorios (*): Nombre, Teléfono, Dirección e Indicaciones.', 'warning', '⚠️');
            return;
        }
    }

    state.currentCartStep = step;
    
    const subtitles = {
        1: 'Paso 1 de 3: Revisa tus productos seleccionados',
        2: 'Paso 2 de 3: Método de envío y datos de entrega',
        3: 'Paso 3 de 3: Confirma tu pedido por WhatsApp'
    };
    const subEl = document.getElementById('cartHeaderSubtitle');
    if (subEl) subEl.textContent = subtitles[step] || 'Checkout Merkostore';

    const fillEl = document.getElementById('stepperProgressFill');
    if (fillEl) {
        const widths = { 1: '0%', 2: '50%', 3: '100%' };
        fillEl.style.width = widths[step] || '0%';
    }

    [1, 2, 3].forEach(s => {
        const pill = document.getElementById(`tabCartStep${s}`);
        const panel = document.getElementById(`wizardStep${s}`);
        
        if (pill) {
            pill.classList.toggle('active', s === step);
            if (s < step) {
                pill.classList.add('completed');
            } else {
                pill.classList.remove('completed');
            }
        }
        
        if (panel) {
            panel.classList.toggle('active', s === step);
        }
    });

    if (step === 3) {
        const nameInput = document.getElementById('custName');
        const addrInput = document.getElementById('custAddress');
        const ticketName = document.getElementById('ticketCustName');
        const ticketAddr = document.getElementById('ticketCustAddress');

        if (ticketName && nameInput) ticketName.textContent = nameInput.value || 'Cliente';
        if (ticketAddr && addrInput) ticketAddr.textContent = addrInput.value || 'Dirección de entrega';
    }

    const viewport = document.querySelector('.wizard-steps-viewport');
    if (viewport) viewport.scrollTop = 0;
}

function selectFulfillment(type) {
    state.storeConfig.fulfillmentType = type;
    
    const optDel = document.getElementById('optDelivery');
    const optPic = document.getElementById('optPickup');
    const radioDel = document.getElementById('radioDelivery');
    const radioPic = document.getElementById('radioPickup');
    const step2Summary = document.getElementById('step2Summary');

    if (type === 'DELIVERY') {
        if (optDel) optDel.classList.add('active');
        if (optPic) optPic.classList.remove('active');
        if (radioDel) radioDel.checked = true;
        if (step2Summary) step2Summary.textContent = 'Domicilio Express';
    } else {
        if (optPic) optPic.classList.add('active');
        if (optDel) optDel.classList.remove('active');
        if (radioPic) radioPic.checked = true;
        if (step2Summary) step2Summary.textContent = 'Recogida Local';
    }

    renderCart();
}

function selectPaymentMethod(method) {
    currentPaymentMethod = (method === 'CASH') ? 'CASH' : 'TRANSFER_WHATSAPP';

    const cardTransfer = document.getElementById('optPayTransfer');
    const cardCash = document.getElementById('optPayCash');
    const radioTransfer = cardTransfer ? cardTransfer.querySelector('input[type="radio"]') : null;
    const radioCash = cardCash ? cardCash.querySelector('input[type="radio"]') : null;

    const transferBox = document.getElementById('transferAccountsBox');
    const cashBox = document.getElementById('cashChangeGroup');

    if (currentPaymentMethod === 'TRANSFER_WHATSAPP') {
        if (cardTransfer) cardTransfer.classList.add('active');
        if (cardCash) cardCash.classList.remove('active');
        if (radioTransfer) radioTransfer.checked = true;
        if (radioCash) radioCash.checked = false;
        if (transferBox) transferBox.style.display = 'block';
        if (cashBox) cashBox.style.display = 'none';
    } else {
        if (cardCash) cardCash.classList.add('active');
        if (cardTransfer) cardTransfer.classList.remove('active');
        if (radioCash) radioCash.checked = true;
        if (radioTransfer) radioTransfer.checked = false;
        if (transferBox) transferBox.style.display = 'none';
        if (cashBox) cashBox.style.display = 'block';
        calculateCashChange();
    }
}

function copyAccount(elementId, accountName) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`📋 ¡Número ${accountName} (${text}) copiado exitosamente!`, 'success', '📋');
        }).catch(() => {
            fallbackCopy(text, accountName);
        });
    } else {
        fallbackCopy(text, accountName);
    }
}

function fallbackCopy(text, accountName) {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.focus();
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    showToast(`📋 ¡Número ${accountName} copiado al portapapeles!`, 'success', '📋');
}

function calculateCashChange() {
    const input = document.getElementById('custCashAmount');
    const resultDiv = document.getElementById('cashChangeResult');
    if (!input || !resultDiv) return;

    const cashVal = parseFloat(input.value) || 0;
    const cartIds = Object.keys(state.cart);
    const subtotal = cartIds.reduce((sum, id) => {
        const prod = state.products.find(p => p.id === id);
        return sum + ((prod ? prod.price : 0) * state.cart[id]);
    }, 0);
    const isFree = subtotal >= 30000;
    const fee = (state.storeConfig.fulfillmentType === 'DELIVERY' && !isFree) ? (state.storeConfig.deliveryFee || 3000) : 0;
    const total = subtotal + fee;

    if (cashVal <= 0) {
        resultDiv.style.display = 'none';
        return;
    }

    resultDiv.style.display = 'block';
    if (cashVal < total) {
        resultDiv.style.color = '#ef4444';
        resultDiv.textContent = `⚠️ Con $ ${cashVal.toLocaleString('es-CO')} no alcanza para cubrir el total ($ ${total.toLocaleString('es-CO')}).`;
    } else {
        const change = cashVal - total;
        resultDiv.style.color = '#4ade80';
        resultDiv.textContent = `✅ El repartidor llevará tu cambio exacto: $ ${change.toLocaleString('es-CO')} COP`;
    }
}

function renderTicketPreview(items) {
    const container = document.getElementById('ticketItemsPreview');
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = '<div style="font-size:0.75rem; color:var(--text-muted);">No hay ítems en la orden</div>';
        return;
    }

    container.innerHTML = items.map(it => `
        <div class="ticket-item-pill">
            <span>${it.qty || it.quantity || 1}x ${it.name || it.productName || 'Producto'}</span>
            <strong>$ ${(it.subtotal || 0).toLocaleString('es-CO')}</strong>
        </div>
    `).join('');
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    overlay.classList.toggle('active');
    drawer.classList.toggle('active');
}

async function processWhatsAppCheckout() {
    const cartIds = Object.keys(state.cart);
    if (cartIds.length === 0) {
        showToast('⚠️ Tu carrito está vacío. Selecciona productos.', 'warning', '⚠️');
        return;
    }

    const subtotalCalc = cartIds.reduce((sum, id) => {
        const prod = state.products.find(p => p.id === id);
        return sum + ((prod ? prod.price : 0) * state.cart[id]);
    }, 0);
    const minOrder = state.storeConfig.minimumOrder || 10000;
    if (subtotalCalc < minOrder) {
        showToast(`⚠️ El pedido mínimo para despacho a domicilio es de $ ${minOrder.toLocaleString('es-CO')} COP.`, 'warning', '⚠️');
        return;
    }

    const name = (document.getElementById('custName')?.value || '').trim();
    const phone = (document.getElementById('custPhone')?.value || '').trim();
    const address = (document.getElementById('custAddress')?.value || '').trim();
    const notes = (document.getElementById('custNotes')?.value || '').trim();
    const cashAmountInput = document.getElementById('custCashAmount');
    const cashVal = cashAmountInput ? (parseFloat(cashAmountInput.value) || 0) : 0;

    if (!name || !phone || !address || !notes) {
        showToast('⚠️ Por favor completa todos los campos obligatorios (*): Nombre, Teléfono, Dirección e Indicaciones.', 'warning', '⚠️');
        return;
    }

    const itemsRequest = cartIds.map(id => {
        const p = state.products.find(prod => String(prod.id) === String(id));
        return {
            productId: id,
            quantity: state.cart[id],
            name: p ? p.name : 'Producto',
            unitPrice: p ? ((p.discountPrice && p.discountPrice > 0) ? p.discountPrice : p.price) : 0,
            costPrice: p ? (p.costPrice || 0) : 0
        };
    });

    const orderPayload = {
        storeId: 'default-store',
        items: itemsRequest,
        customer: {
            name: name,
            phone: phone,
            deliveryAddress: address,
            notes: notes
        },
        paymentMethod: currentPaymentMethod || 'TRANSFER_WHATSAPP',
        fulfillmentType: state.storeConfig.fulfillmentType
    };

    let newOrder = null;
    try {
        showToast('⏳ Registrando y verificando pedido en el servidor...', 'info', '⏳');
        const response = await API.post('/api/v1/orders', orderPayload);
        if (response && response.success && response.data) {
            newOrder = response.data;
        }
    } catch (apiErr) {
        console.warn('Advertencia en servidor al registrar pedido, activando fallback local:', apiErr);
    }

    // Calcular montos finales de forma resiliente
    const calculatedSubtotal = cartIds.reduce((sum, id) => {
        const p = state.products.find(prod => String(prod.id) === String(id));
        const effectivePrice = p ? ((p.discountPrice && p.discountPrice > 0) ? p.discountPrice : p.price) : 0;
        return sum + (effectivePrice * (state.cart[id] || 1));
    }, 0);
    const calculatedFee = (state.storeConfig.fulfillmentType === 'DELIVERY' && calculatedSubtotal < 30000)
        ? (state.storeConfig.deliveryFee || 3000)
        : 0;

    const newOrderCode = newOrder ? newOrder.orderNumber : ('MS-' + Math.floor(1000 + Math.random() * 9000));
    const total = newOrder ? newOrder.total : (calculatedSubtotal + calculatedFee);
    const subtotal = newOrder ? newOrder.subtotal : calculatedSubtotal;
    const fee = newOrder ? newOrder.deliveryFee : calculatedFee;

    // Map order items robustly ensuring name & qty are ALWAYS present (never undefined)
    const orderItems = (newOrder && newOrder.items && newOrder.items.length > 0)
        ? newOrder.items.map(it => {
            const found = state.products.find(p => String(p.id) === String(it.productId));
            return {
                productId: it.productId,
                name: it.productName || it.name || (found ? found.name : 'Producto'),
                qty: it.quantity || it.qty || 1,
                unitPrice: it.unitPrice || (found ? ((found.discountPrice && found.discountPrice > 0) ? found.discountPrice : found.price) : 0),
                subtotal: it.subtotal || (((found ? ((found.discountPrice && found.discountPrice > 0) ? found.discountPrice : found.price) : 0)) * (it.quantity || 1)),
                type: it.type || (found ? found.type : (it.productId && String(it.productId).startsWith('CMB') ? 'MERCADO' : 'DETAL'))
            };
        })
        : cartIds.map(id => {
            const p = state.products.find(prod => String(prod.id) === String(id));
            const q = state.cart[id];
            const price = p ? ((p.discountPrice && p.discountPrice > 0) ? p.discountPrice : p.price) : 0;
            return {
                productId: id,
                name: p ? p.name : 'Producto',
                qty: q,
                unitPrice: price,
                subtotal: price * q,
                type: p ? p.type : 'DETAL'
            };
        });

    // Save order into local state & storage
    const mappedOrder = {
        id: (newOrder && newOrder.id) ? newOrder.id : ('ord-' + Date.now()),
        orderNumber: newOrderCode,
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        notes: notes,
        customerNotes: notes,
        cashAmount: cashVal,
        fulfillmentType: state.storeConfig.fulfillmentType,
        items: orderItems,
        subtotal: subtotal,
        deliveryFee: fee,
        total: total,
        paymentMethod: currentPaymentMethod || 'TRANSFER_WHATSAPP',
        paymentStatus: 'PENDING',
        paymentStatusLabel: 'PENDIENTE DE CONFIRMACIÓN',
        status: 'RECEIVED',
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    state.orders.unshift(mappedOrder);
    Storage.set('orders', state.orders);

    // Descontar inventario localmente (para combos y detal)
    if (typeof deductInventoryForOrderItems === 'function') {
        deductInventoryForOrderItems(orderItems);
        Storage.set('products', state.products);
    }

    // Retornar costo de adquisición al presupuesto inmediatamente al vender
    if (typeof recordSalesCostRecovery === 'function') {
        recordSalesCostRecovery(mappedOrder);
    }
    renderHistorialUnificadoTable();
    updateDashboardKPIs();

    // Reset Cart
    state.cart = {};
    renderProducts();
    renderCart();
    toggleCartDrawer();

    showToast('🚀 Pedido confirmado exitosamente. Redirigiendo a WhatsApp...', 'success', '📲');

    let itemsText = '';
    orderItems.forEach(it => {
        itemsText += `  • ${it.qty}x ${it.name} ($ ${it.subtotal.toLocaleString('es-CO')})\n`;
    });

    const typeLabel = state.storeConfig.fulfillmentType === 'DELIVERY' ? '🚚 Domicilio a casa' : '🏬 Recogida en local';
    const paymentLabels = {
        'TRANSFER_WHATSAPP': '📲 Transferencia Nequi / Daviplata / Bancolombia (Adjunto comprobante)',
        'CASH': `💵 Efectivo Contra Entrega${cashVal > 0 ? ` (Paga con: $ ${cashVal.toLocaleString('es-CO')} - Cambio: $ ${(cashVal - total).toLocaleString('es-CO')})` : ' (Cantidad exacta)'}`,
        'WHATSAPP': '📲 Transferencia por WhatsApp Directo'
    };
    const paymentText = paymentLabels[currentPaymentMethod] || '📲 Transferencia WhatsApp';

    const message = `🛒 *NUEVO PEDIDO EN MERKOSTORE*\n` +
                    `═════════════════════════\n` +
                    `🔖 *Código Oficial:* ${newOrderCode}\n` +
                    `👤 *Cliente:* ${name}\n` +
                    `📱 *Teléfono:* ${phone}\n` +
                    `📍 *Entrega:* ${typeLabel}\n` +
                    `🏠 *Dirección:* ${address}\n` +
                    `📝 *Indicaciones / Notas:* ${notes}\n` +
                    `💳 *Método de Pago:* ${paymentText}\n` +
                    `═════════════════════════\n` +
                    `📦 *PRODUCTOS SOLICITADOS:*\n${itemsText}` +
                    `═════════════════════════\n` +
                    `💰 *Subtotal Ítems:* $ ${subtotal.toLocaleString('es-CO')}\n` +
                    `🚚 *Costo Domicilio:* ${fee === 0 ? '¡GRATIS!' : '$ ' + fee.toLocaleString('es-CO')}\n` +
                    `💵 *TOTAL A PAGAR:* $ ${total.toLocaleString('es-CO')} COP\n\n` +
                    (currentPaymentMethod === 'TRANSFER_WHATSAPP' ? `📎 *Adjunto mi comprobante de transferencia bancaria para validación inmediata.*\n\n` : '') +
                    `¡Hola! Confirmo mi pedido registrado con código *${newOrderCode}*. Quedo atento al despacho.`;

    window.open(`https://wa.me/${state.storeConfig.whatsappPhone}?text=${encodeURIComponent(message)}`, '_blank');
    if (typeof loadPublicBackendData === 'function') {
        loadPublicBackendData();
    }
}

// ==========================================================================
// MERKO BRAND ADMIN DASHBOARD & PRODUCTO/MERCADO EDITOR ENGINE
// ==========================================================================

function switchAdminSubTab(tab) {
    if (tab === 'productEditor') tab = 'products';
    state.currentAdminSubTab = tab;

    ['dashboard', 'activeOrders', 'products', 'orders', 'categories', 'config', 'users', 'bi', 'io', 'budget'].forEach(t => {
        let suffix = t.charAt(0).toUpperCase() + t.slice(1);
        if (t === 'bi') suffix = 'Bi';
        if (t === 'io') suffix = 'Io';
        if (t === 'activeOrders') suffix = 'ActiveOrders';
        if (t === 'budget') suffix = 'Budget';

        const btnId = 'tabMerko' + suffix;
        const contentId = 'subtab' + suffix;
        const btn = document.getElementById(btnId);
        const content = document.getElementById(contentId);
        if (btn) btn.classList.toggle('active', t === tab);
        if (content) content.style.display = t === tab ? 'block' : 'none';
    });

    if (tab === 'dashboard') { updateDashboardKPIs(); renderDashboardContent(); }
    if (tab === 'activeOrders') renderActiveOrdersTable();
    if (tab === 'products') {
        renderAdminProductsTable();
        renderMercadoItemsChecklist();
        if (!state.editingProductId) {
            resetProductEditorForm(false);
        }
    }
    if (tab === 'categories') renderAdminCategoriesTable();
    if (tab === 'orders') renderHistorialUnificadoTable();
    if (tab === 'users') loadAdminUsersData();
    if (tab === 'bi') initPowerBiEmbed();
    if (tab === 'io') initIoSubtab();
    if (tab === 'budget') renderBudgetSubtab();
}

// ==========================================================================
// VISUALIZACIÓN DE DATOS II - COMPONENTE OFICIAL DE INTEGRACIÓN POWER BI
// ==========================================================================

const DEFAULT_POWERBI_URL = 'https://app.powerbi.com/view?r=eyJrIjoiYjgwMjBiYjctOWU1ZC00ZGY2LTkwOGMtN2VlYmUwY2M1OWFhIiwidCI6IjlkMTJiZjNmLWU0ZjYtNDdhYi05MTJmLTFhMmYwZmM0OGFhNCIsImMiOjR9';

function initPowerBiEmbed() {
    const iframe = document.getElementById('iframePowerBi');
    if (iframe && (!iframe.src || iframe.src.includes('pbi_report.html'))) {
        iframe.src = DEFAULT_POWERBI_URL;
    }
}

function actualizarReportePowerBi() {
    const iframe = document.getElementById('iframePowerBi');
    if (iframe) {
        iframe.src = DEFAULT_POWERBI_URL;
        showToast('✓ Dashboard de Power BI recargado', 'success', '📊');
    }
}

function togglePowerBiFullscreen() {
    const contenedor = document.getElementById('contenedorPowerBi');
    if (!contenedor) return;

    if (!document.fullscreenElement) {
        contenedor.requestFullscreen().catch(() => {
            showToast('No se pudo activar pantalla completa', 'warning', '⚠️');
        });
    } else {
        document.exitFullscreen();
    }
}

// ==========================================================================
// INVESTIGACIÓN DE OPERACIONES - MOTOR DE OPTIMIZACIÓN LINEAL ENTERA (MILP)
// INTEGRADO TOTALMENTE CON COSTOS DE ADQUISICIÓN REALES Y TIEMPO DINÁMICO DEL ADMINISTRADOR
// ==========================================================================

let ultimaSolucionIO = null;

// RENDERIZADO DINÁMICO DE TODOS LOS PRODUCTOS DEL INVENTARIO EN SECCIÓN 1
// ==========================================================================
// MÓDULO DE INVESTIGACIÓN DE OPERACIONES (IO / SIMPLEX / MILP)
// DINÁMICO UNIVERSAL: ADAPTA TODOS LOS PRODUCTOS DEL INVENTARIO Y NUEVAS ALTAS
// ==========================================================================



function renderIoProductInputs(syncStocks = false) {
    const grid = document.getElementById('ioProductInputsGrid');
    const emptyBanner = document.getElementById('ioEmptyProductsBanner');
    // Tomar todos los productos individuales que NO sean combos
    const detalProducts = (state.products || []).filter(p => p.type !== 'MERCADO' && p.isAvailable !== false);

    if (detalProducts.length === 0) {
        if (emptyBanner) emptyBanner.style.display = 'block';
        if (grid) grid.innerHTML = '';
        const tbody = document.getElementById('ioDecisionTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:36px; color:#ef4444; font-weight:700;">
                        ⚠️ No tienes productos registrados en el inventario. Añade tus productos en "Productos & Inventario" antes de optimizar.
                    </td>
                </tr>
            `;
        }
        return;
    }

    if (emptyBanner) emptyBanner.style.display = 'none';

    if (grid) {
        grid.innerHTML = detalProducts.map((p, idx) => {
            const existingInput = document.getElementById('ioStock_' + p.id);
            const currentVal = (!syncStocks && existingInput) ? existingInput.value : (p.stock !== undefined ? p.stock : 0);
            const hasCost = (p.costPrice !== null && p.costPrice !== undefined && p.costPrice > 0);
            return `
                <div class="merko-form-group" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 14px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                        <label style="font-size:0.78rem; font-weight:800; color:#ffffff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70%;" title="${p.name}">
                            📦 ${p.name}
                        </label>
                        <span style="color:#FF8F00; font-size:0.7rem; font-weight:800; background:rgba(255,143,0,0.12); padding:2px 6px; border-radius:4px;">
                            ${p.unitCalc || 'Und'}
                        </span>
                    </div>
                    <div style="font-size:0.7rem; color:var(--admin-text-muted); margin-bottom:8px; display:flex; justify-content:space-between;">
                        <span>Venta: <strong style="color:#fff;">$${(p.price || 0).toLocaleString('es-CO')}</strong></span>
                        <span>Costo: <strong style="${hasCost ? 'color:#10b981;' : 'color:#ef4444;'}">${hasCost ? '$' + p.costPrice.toLocaleString('es-CO') : 'Sin costo'}</strong></span>
                    </div>
                    <label style="font-size:0.7rem; color:#cbd5e1; display:block; margin-bottom:4px;">Disponibilidad en Bodega:</label>
                    <input type="number" id="ioStock_${p.id}" class="io-dynamic-stock-input" data-product-id="${p.id}" value="${currentVal}" min="0" style="padding:8px 12px; font-weight:800; background:rgba(255,255,255,0.05); color:#FF8F00; border:1px solid rgba(255,255,255,0.15); width:100%; border-radius:8px;" placeholder="0" title="Existencias en tienda para ${p.name}">
                </div>
            `;
        }).join('');
    }
}

function initIoSubtab() {
    renderIoProductInputs(false);

    if (!ultimaSolucionIO) {
        limpiarResultadosIO(false);
    }
}

// Sincronizar stock y nuevos productos de la tienda ÚNICAMENTE al presionar el botón
async function syncIoStockFromStore(showToastNotice = true) {
    // 1. Asegurar sincronización inmediata con almacenamiento local y estado
    const saved = Storage.get('products');
    if (saved && Array.isArray(saved) && saved.length > 0) {
        state.products = saved;
    }

    // Renderizado inmediato para respuesta instantánea (0ms)
    let detalProducts = (state.products || []).filter(p => p.type !== 'MERCADO' && p.isAvailable !== false);
    const emptyBanner = document.getElementById('ioEmptyProductsBanner');

    if (detalProducts.length === 0) {
        if (emptyBanner) emptyBanner.style.display = 'block';
        renderIoProductInputs(true);
        if (showToastNotice) {
            showToast('⚠️ No tienes productos añadidos en la tienda. Añade productos en "Productos & Inventario".', 'warning', '📦');
        }
        return;
    }

    renderIoProductInputs(true);
    limpiarResultadosIO(false);

    if (showToastNotice) {
        showToast(`✓ Se sincronizaron exitosamente los ${detalProducts.length} productos de tu inventario real`, 'success', '🔄');
    }

    // 2. Si hay conexión API backend, sincronizar en segundo plano sin congelar la UI
    try {
        if (typeof API !== 'undefined' && API.getToken && API.getToken()) {
            const res = await API.get('/api/v1/public/products').catch(() => null);
            if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
                const backendMap = new Map(res.data.map(p => [p.id, p]));
                state.products = state.products.map(localP => {
                    const remote = backendMap.get(localP.id);
                    if (remote) {
                        return {
                            ...localP,
                            price: remote.price || localP.price,
                            costPrice: remote.costPrice !== undefined ? remote.costPrice : localP.costPrice,
                            stock: remote.stock !== undefined ? remote.stock : localP.stock
                        };
                    }
                    return localP;
                });
                Storage.set('products', state.products);
                renderIoProductInputs(false);
            }
        }
    } catch (e) {
        // En modo local opera fluidamente
    }
}

function limpiarResultadosIO(showToastNotice = true) {
    ultimaSolucionIO = null;

    const lblZ = document.getElementById('ioValorZOptimo');
    if (lblZ) lblZ.textContent = '$ 0 COP';

    const lblSubtext = document.getElementById('ioValorZSubtext');
    if (lblSubtext) lblSubtext.textContent = 'Configura el tiempo disponible del administrador y presiona "🚀 Optimizar" para calcular.';

    const btnSync = document.getElementById('btnSyncIoCatalog');
    if (btnSync) {
        btnSync.disabled = true;
        btnSync.style.opacity = '0.5';
        btnSync.style.cursor = 'not-allowed';
    }

    const tbody = document.getElementById('ioDecisionTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:36px; color:var(--admin-text-muted);">
                    ⚡ Configura el tiempo disponible del administrador y presiona <strong>"🚀 Optimizar"</strong> para calcular la mezcla ideal.
                </td>
            </tr>
        `;
    }

    const grid = document.getElementById('ioResourceDiagnosticsGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:24px; color:var(--admin-text-muted); font-size:0.85rem;">
                📊 El estado de tus productos (disponibles vs. agotados para armar combos) y tu tiempo de trabajo aparecerán aquí una vez optimices.
            </div>
        `;
    }

    if (showToastNotice) {
        showToast('ℹ️ Resultados del modelo restablecidos.', 'info', '🗑️');
    }
}

// SOLVER DINÁMICO UNIVERSAL (MILP): ADAPTA TODOS LOS PRODUCTOS Y COMBOS DEL INVENTARIO
function ejecutarOptimizacionLinealIO() {
    const detalProducts = (state.products || []).filter(p => p.type !== 'MERCADO' && p.isAvailable !== false);
    const emptyBanner = document.getElementById('ioEmptyProductsBanner');

    if (detalProducts.length === 0) {
        if (emptyBanner) emptyBanner.style.display = 'block';
        showToast('⚠️ No tienes productos añadidos en la tienda. Añade productos en "Productos & Inventario" antes de optimizar.', 'warning', '📦');
        return;
    }

    // 1. REGLA ESTRICTA DE COSTOS: Verificar que ningún producto detal carezca de costo registrado
    const missingCosts = detalProducts.filter(p => p.costPrice == null || isNaN(p.costPrice) || p.costPrice <= 0);
    const alertBox = document.getElementById('ioCostAlertBox');
    const btnSync = document.getElementById('btnSyncIoCatalog');

    if (missingCosts.length > 0) {
        if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.innerHTML = `⚠️ Los siguientes productos en tu inventario no tienen Precio de Adquisición registrado: <strong>${missingCosts.map(m => m.name).join(', ')}</strong>. Un producto no puede optimizarse con costo cero. Por favor completa su costo en "Productos & Inventario".`;
        }
        if (btnSync) {
            btnSync.disabled = true;
            btnSync.style.opacity = '0.5';
            btnSync.style.cursor = 'not-allowed';
        }
        const lblZ = document.getElementById('ioValorZOptimo');
        if (lblZ) lblZ.textContent = 'Requiere Registrar Costos';
        showToast('⚠️ Completa los costos de adquisición en el inventario para ejecutar la optimización.', 'warning', '⚠️');
        return;
    }

    if (alertBox) alertBox.style.display = 'none';

    // 2. Extraer stocks ingresados para CADA producto detal
    detalProducts.forEach(p => {
        const inputEl = document.getElementById('ioStock_' + p.id);
        p.b_stock = (inputEl && inputEl.value !== '') ? parseInt(inputEl.value) || 0 : (p.stock || 0);
        const salePrice = p.discountPrice || p.price || 0;
        p.unitMargin = Math.max(0, salePrice - (p.costPrice || 0));
    });

    const bTiempo = parseInt(document.getElementById('ioTiempoArmado')?.value) || 480;

    // 3. Extraer todos los combos configurados en la tienda
    const combos = (state.products || []).filter(p => (p.type === 'MERCADO' || (p.bundleItems && p.bundleItems.length > 0)) && p.isAvailable !== false);

    // Calcular margen y tiempo de ensamblaje para cada combo
    combos.forEach((c, idx) => {
        let componentCostSum = 0;
        let totalItems = 0;
        (c.bundleItems || []).forEach(bi => {
            const prod = detalProducts.find(p => p.id === bi.productId);
            if (prod) {
                componentCostSum += (prod.costPrice || 0) * (bi.quantity || 1);
                totalItems += (bi.quantity || 1);
            }
        });
        c.calculatedCost = componentCostSum;
        const comboPrice = c.discountPrice || c.price || 0;
        c.unitMargin = Math.max(2000, comboPrice - componentCostSum);
        c.assemblyTime = idx === 0 ? 12 : (idx === 1 ? 8 : Math.max(5, totalItems * 2));
    });

    // 4. Algoritmo Solver de Optimización MILP
    let mejorZ = -1;
    let mejorSol = null;

    if (combos.length === 0) {
        // Si no hay combos configurados, vender 100% al detal
        let totalZ = 0;
        const retailSol = {};
        detalProducts.forEach(p => {
            retailSol[p.id] = p.b_stock;
            totalZ += p.unitMargin * p.b_stock;
        });
        mejorZ = totalZ;
        mejorSol = { comboSol: {}, retailSol: retailSol, z: totalZ, tiempoUsado: 0 };
    } else if (combos.length === 1) {
        const c1 = combos[0];
        let maxC1 = Math.floor(bTiempo / c1.assemblyTime);
        (c1.bundleItems || []).forEach(bi => {
            const prod = detalProducts.find(p => p.id === bi.productId);
            if (prod && bi.quantity > 0) {
                maxC1 = Math.min(maxC1, Math.floor(prod.b_stock / bi.quantity));
            }
        });

        const lb1 = Math.min(2, maxC1);
        for (let x1 = lb1; x1 <= maxC1; x1++) {
            const timeUsed = x1 * c1.assemblyTime;
            let currentZ = x1 * c1.unitMargin;
            const retailSol = {};
            detalProducts.forEach(p => {
                const req = (c1.bundleItems || []).find(bi => bi.productId === p.id);
                const used = req ? req.quantity * x1 : 0;
                const rem = Math.max(0, p.b_stock - used);
                retailSol[p.id] = rem;
                currentZ += rem * p.unitMargin;
            });
            if (currentZ > mejorZ) {
                mejorZ = currentZ;
                mejorSol = { comboSol: { [c1.id]: x1 }, retailSol: retailSol, z: currentZ, tiempoUsado: timeUsed };
            }
        }
    } else {
        // 2 o más combos: optimizar mezcla exacta
        const c1 = combos[0];
        const c2 = combos[1];

        let maxC1 = Math.floor(bTiempo / c1.assemblyTime);
        (c1.bundleItems || []).forEach(bi => {
            const prod = detalProducts.find(p => p.id === bi.productId);
            if (prod && bi.quantity > 0) {
                maxC1 = Math.min(maxC1, Math.floor(prod.b_stock / bi.quantity));
            }
        });

        let maxC2 = Math.floor(bTiempo / c2.assemblyTime);
        (c2.bundleItems || []).forEach(bi => {
            const prod = detalProducts.find(p => p.id === bi.productId);
            if (prod && bi.quantity > 0) {
                maxC2 = Math.min(maxC2, Math.floor(prod.b_stock / bi.quantity));
            }
        });

        const lb1 = Math.min(2, maxC1);
        const lb2 = Math.min(2, maxC2);

        for (let x1 = lb1; x1 <= maxC1; x1++) {
            for (let x2 = lb2; x2 <= maxC2; x2++) {
                const timeUsed = x1 * c1.assemblyTime + x2 * c2.assemblyTime;
                if (timeUsed > bTiempo) continue;

                let feasible = true;
                const retailSol = {};
                for (const p of detalProducts) {
                    const req1 = (c1.bundleItems || []).find(bi => bi.productId === p.id);
                    const req2 = (c2.bundleItems || []).find(bi => bi.productId === p.id);
                    const used = (req1 ? req1.quantity * x1 : 0) + (req2 ? req2.quantity * x2 : 0);
                    if (used > p.b_stock) {
                        feasible = false;
                        break;
                    }
                    retailSol[p.id] = p.b_stock - used;
                }

                if (feasible) {
                    let currentZ = x1 * c1.unitMargin + x2 * c2.unitMargin;
                    detalProducts.forEach(p => {
                        currentZ += retailSol[p.id] * p.unitMargin;
                    });
                    if (currentZ > mejorZ) {
                        mejorZ = currentZ;
                        mejorSol = { comboSol: { [c1.id]: x1, [c2.id]: x2 }, retailSol: retailSol, z: currentZ, tiempoUsado: timeUsed };
                    }
                }
            }
        }
    }

    if (!mejorSol) {
        showToast('⚠️ No existe solución factible con los recursos y tiempo actuales. Ajusta los parámetros.', 'warning', '⚠️');
        const lblZ = document.getElementById('ioValorZOptimo');
        if (lblZ) lblZ.textContent = 'Infactible (Ajustar Recursos)';
        if (btnSync) {
            btnSync.disabled = true;
            btnSync.style.opacity = '0.5';
            btnSync.style.cursor = 'not-allowed';
        }
        return;
    }

    ultimaSolucionIO = { ...mejorSol, combos: combos, detalProducts: detalProducts, bTiempo: bTiempo };

    const lblZ = document.getElementById('ioValorZOptimo');
    if (lblZ) lblZ.textContent = `$ ${Math.round(mejorSol.z).toLocaleString('es-CO')} COP`;

    const lblSubtext = document.getElementById('ioValorZSubtext');
    if (lblSubtext) lblSubtext.textContent = `Margen de contribución total diario maximizado. Tiempo de preparación: ${mejorSol.tiempoUsado} min.`;

    if (btnSync) {
        btnSync.disabled = false;
        btnSync.style.opacity = '1';
        btnSync.style.cursor = 'pointer';
    }

    // 5. Renderizar Tabla de Variables de Decisión dinámicamente con TODOS los productos
    renderDynamicIoDecisionTable(mejorSol, combos, detalProducts);

    // 6. Renderizar Diagnósticos de Recursos dinámicamente
    renderDynamicIoDiagnosticsGrid(mejorSol, combos, detalProducts, bTiempo);

    showToast(`✓ Modelo MILP Resuelto: Margen Máximo Z* = $ ${Math.round(mejorSol.z).toLocaleString('es-CO')} COP`, 'success', '⚖️');
}

// RENDERIZADO DINÁMICO DE VARIABLES DE DECISIÓN (COMBOS X_k Y TODOS LOS PRODUCTOS DETAL Y_i)
function renderDynamicIoDecisionTable(sol, combos, detalProducts) {
    const tbody = document.getElementById('ioDecisionTableBody');
    if (!tbody) return;

    let rowsHTML = '';

    // A. Variables de Combos X_1, X_2, ...
    combos.forEach((c, idx) => {
        const qty = (sol.comboSol && sol.comboSol[c.id]) ? sol.comboSol[c.id] : 0;
        const subtotal = qty * c.unitMargin;
        rowsHTML += `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:12px 18px; font-weight:800; color:#3b82f6;">X${idx + 1}</td>
                <td style="padding:12px 18px; color:#fff; font-weight:700;">${c.name}</td>
                <td style="padding:12px 18px; text-align:center;"><span style="color:#3b82f6; background:#3b82f622; padding:2px 8px; border-radius:4px; font-size:0.72rem; font-weight:800;">COMBO</span></td>
                <td style="padding:12px 18px; text-align:right; color:#10b981; font-weight:800;">$ ${Math.round(c.unitMargin).toLocaleString('es-CO')}</td>
                <td style="padding:12px 18px; text-align:right; color:#fff; font-weight:900; font-size:1.1rem;">${qty} unds</td>
                <td style="padding:12px 18px; text-align:right; color:#fff; font-weight:800;">$ ${Math.round(subtotal).toLocaleString('es-CO')}</td>
            </tr>
        `;
    });

    // B. Variables de Detal Y_1, Y_2, ..., Y_n (TODOS los productos del inventario)
    detalProducts.forEach((p, idx) => {
        const qty = (sol.retailSol && sol.retailSol[p.id] !== undefined) ? sol.retailSol[p.id] : p.b_stock;
        const subtotal = qty * p.unitMargin;
        rowsHTML += `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:12px 18px; font-weight:800; color:#f59e0b;">Y${idx + 1}</td>
                <td style="padding:12px 18px; color:#fff; font-weight:700;">${p.name} (Detal)</td>
                <td style="padding:12px 18px; text-align:center;"><span style="color:#f59e0b; background:#f59e0b22; padding:2px 8px; border-radius:4px; font-size:0.72rem; font-weight:800;">DETAL</span></td>
                <td style="padding:12px 18px; text-align:right; color:#10b981; font-weight:800;">$ ${Math.round(p.unitMargin).toLocaleString('es-CO')}</td>
                <td style="padding:12px 18px; text-align:right; color:#fff; font-weight:900; font-size:1.1rem;">${qty} unds</td>
                <td style="padding:12px 18px; text-align:right; color:#fff; font-weight:800;">$ ${Math.round(subtotal).toLocaleString('es-CO')}</td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHTML;
}

// RENDERIZADO DINÁMICO DE DIAGNÓSTICOS PARA TODOS LOS PRODUCTOS Y TIEMPO
function renderDynamicIoDiagnosticsGrid(sol, combos, detalProducts, bTiempo) {
    const grid = document.getElementById('ioResourceDiagnosticsGrid');
    if (!grid) return;

    let cardsHTML = '';

    // Tarjetas para cada producto detal
    detalProducts.forEach(p => {
        let usedInCombos = 0;
        combos.forEach(c => {
            const req = (c.bundleItems || []).find(bi => bi.productId === p.id);
            const cQty = (sol.comboSol && sol.comboSol[c.id]) ? sol.comboSol[c.id] : 0;
            if (req) usedInCombos += req.quantity * cQty;
        });

        const retailQty = (sol.retailSol && sol.retailSol[p.id] !== undefined) ? sol.retailSol[p.id] : 0;
        const totalUsed = usedInCombos + retailQty;
        const slack = p.b_stock - totalUsed;
        const isBottleneck = slack === 0;

        const badgeColor = isBottleneck ? '#ef4444' : '#10b981';
        const badgeBg = isBottleneck ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)';
        const badgeBorder = isBottleneck ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)';
        const badgeText = isBottleneck ? '🔥 Agotado para Combos' : '✅ Stock Disponible';

        cardsHTML += `
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <strong style="color:#ffffff; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70%;" title="${p.name}">
                        📦 ${p.name}
                    </strong>
                    <span style="font-size:0.68rem; font-weight:800; color:${badgeColor}; background:${badgeBg}; border:1px solid ${badgeBorder}; padding:2px 6px; border-radius:4px;">
                        ${badgeText}
                    </span>
                </div>
                <div style="font-size:0.75rem; color:#cbd5e1; display:flex; justify-content:space-between; margin-bottom:4px; flex-wrap:wrap; gap:6px;">
                    <span>Bodega: <strong>${p.b_stock}</strong></span>
                    <span>En Combos: <strong style="color:#3b82f6;">${usedInCombos}</strong></span>
                    <span>Venta Detal: <strong style="color:#f59e0b;">${retailQty}</strong></span>
                    <span>Sobrante: <strong style="color:${isBottleneck ? '#ef4444' : '#10b981'};">${slack}</strong></span>
                </div>
            </div>
        `;
    });

    // Tarjeta para el tiempo del administrador
    const timeUsed = sol.tiempoUsado || 0;
    const timeSlack = bTiempo - timeUsed;
    const isTimeBottleneck = timeSlack < 8;

    cardsHTML += `
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong style="color:#ffffff; font-size:0.85rem;">⏱️ Tiempo del Administrador</strong>
                <span style="font-size:0.68rem; font-weight:800; color:${isTimeBottleneck ? '#ef4444' : '#10b981'}; background:${isTimeBottleneck ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}; border:1px solid ${isTimeBottleneck ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}; padding:2px 6px; border-radius:4px;">
                    ${isTimeBottleneck ? '⏰ Tiempo Límite' : '✅ Tiempo Disponible'}
                </span>
            </div>
            <div style="font-size:0.75rem; color:#cbd5e1; display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
                <span>Disponible: <strong>${bTiempo} min</strong></span>
                <span>Usado: <strong style="color:#10b981;">${timeUsed} min</strong></span>
                <span>Tiempo Libre: <strong style="color:${isTimeBottleneck ? '#ef4444' : '#10b981'};">${timeSlack} min</strong></span>
            </div>
        </div>
    `;

    grid.innerHTML = cardsHTML;
}

// FORMULACIÓN MATEMÁTICA COMPLETAMENTE DINÁMICA SEGÚN LOS PRODUCTOS ACTUALES
function openIoFormulacionModal() {
    const modal = document.getElementById('modalIoFormulacion');
    if (!modal) return;

    const detalProducts = (state.products || []).filter(p => p.type !== 'MERCADO' && p.isAvailable !== false);
    const combos = (state.products || []).filter(p => (p.type === 'MERCADO' || (p.bundleItems && p.bundleItems.length > 0)) && p.isAvailable !== false);
    const bTiempo = parseInt(document.getElementById('ioTiempoArmado')?.value) || 480;

    // Calcular márgenes de detal y stocks actuales ingresados
    detalProducts.forEach(p => {
        const inputEl = document.getElementById('ioStock_' + p.id);
        p.b_stock = (inputEl && inputEl.value !== '') ? parseInt(inputEl.value) || 0 : (p.stock || 0);
        const salePrice = p.discountPrice || p.price || 0;
        p.unitMargin = Math.max(0, salePrice - (p.costPrice || 0));
    });

    // Calcular márgenes y tiempos de combos
    combos.forEach((c, idx) => {
        let componentCostSum = 0;
        let totalItems = 0;
        (c.bundleItems || []).forEach(bi => {
            const prod = detalProducts.find(p => p.id === bi.productId);
            if (prod) {
                componentCostSum += (prod.costPrice || 0) * (bi.quantity || 1);
                totalItems += (bi.quantity || 1);
            }
        });
        c.calculatedCost = componentCostSum;
        const comboPrice = c.discountPrice || c.price || 0;
        c.unitMargin = Math.max(2000, comboPrice - componentCostSum);
        c.assemblyTime = idx === 0 ? 12 : (idx === 1 ? 8 : Math.max(5, totalItems * 2));
    });

    const container = document.getElementById('ioModalFormulacionDynamicContent');
    if (container) {
        // 1. Variables de Decisión
        let varListHtml = '';
        combos.forEach((c, idx) => {
            varListHtml += `<li><strong style="color:#38bdf8;">X${idx + 1}:</strong> Cantidad de <em>${c.name}</em> a armar</li>`;
        });
        detalProducts.forEach((p, idx) => {
            varListHtml += `<li><strong style="color:#fbbf24;">Y${idx + 1}:</strong> Cantidad de <em>${p.name}</em> para venta al detal</li>`;
        });

        // 2. Función Objetivo
        const objTerms = [];
        combos.forEach((c, idx) => {
            objTerms.push(`${Math.round(c.unitMargin).toLocaleString('es-CO')}·X${idx + 1}`);
        });
        detalProducts.forEach((p, idx) => {
            objTerms.push(`${Math.round(p.unitMargin).toLocaleString('es-CO')}·Y${idx + 1}`);
        });
        const objFuncStr = objTerms.length > 0 ? objTerms.join(' + ') : '0';

        // 3. Restricciones de Inventario
        let inventoryConstraintsHtml = '';
        detalProducts.forEach((p, pIdx) => {
            const comboTerms = [];
            combos.forEach((c, cIdx) => {
                const req = (c.bundleItems || []).find(bi => bi.productId === p.id);
                if (req && req.quantity > 0) {
                    comboTerms.push(`<span style="color:#38bdf8;">${req.quantity}·X${cIdx + 1}</span>`);
                }
            });
            const lhs = (comboTerms.length > 0 ? comboTerms.join(' + ') + ' + ' : '') + `<span style="color:#fbbf24;">Y${pIdx + 1}</span>`;
            inventoryConstraintsHtml += `• <strong>${p.name}:</strong> ${lhs} ≤ <strong style="color:#FF8F00;">${p.b_stock}</strong> (Stock actual en tienda)<br>`;
        });

        // 4. Restricción de Tiempo
        const timeTerms = [];
        combos.forEach((c, cIdx) => {
            timeTerms.push(`${c.assemblyTime}·X${cIdx + 1}`);
        });
        const timeLhs = timeTerms.length > 0 ? timeTerms.join(' + ') : '0';

        // 5. Naturaleza de variables
        const allVars = [];
        combos.forEach((_, idx) => allVars.push(`X${idx + 1}`));
        detalProducts.forEach((_, idx) => allVars.push(`Y${idx + 1}`));

        container.innerHTML = `
            <!-- 1. Variables de Decisión -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px;">
                <h4 style="color:#FF8F00; font-size:0.95rem; margin:0 0 10px 0; font-weight:800;">1. Variables de Decisión (${combos.length + detalProducts.length} Variables Activas)</h4>
                <p style="margin:0 0 8px 0; font-size:0.84rem;">El modelo decide la cantidad entera a producir de combos y a destinar para venta individual al detal de cada producto existente en la tienda:</p>
                <ul style="margin:0; padding-left:22px; font-size:0.84rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:6px;">
                    ${varListHtml}
                </ul>
            </div>

            <!-- 2. Función Objetivo -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px;">
                <h4 style="color:#10b981; font-size:0.95rem; margin:0 0 8px 0; font-weight:800;">2. Función Objetivo (Maximizar Utilidad Bruta Diaria)</h4>
                <p style="margin:0 0 10px 0; font-size:0.84rem;">Maximizar el margen de contribución total diario (Precio de Venta - Costo de Adquisición real de cada ítem):</p>
                <div style="background:#09090b; border:1px solid #10b981; border-radius:8px; padding:14px; font-family:monospace; color:#4ade80; font-size:0.92rem; text-align:center; overflow-x:auto;">
                    <strong>MAX Z = ${objFuncStr}</strong>
                </div>
            </div>

            <!-- 3. Restricciones de Inventario de Bodega -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px;">
                <h4 style="color:#FF8F00; font-size:0.95rem; margin:0 0 8px 0; font-weight:800;">3. Restricciones de Disponibilidad de Inventario en Bodega (${detalProducts.length} Restricciones)</h4>
                <p style="margin:0 0 10px 0; font-size:0.84rem;">El consumo en combos más la venta al detal no puede superar el stock físico disponible en tienda para ningún producto:</p>
                <div style="background:#09090b; border-radius:8px; padding:12px 16px; font-family:monospace; font-size:0.85rem; line-height:1.9; color:#f1f5f9; max-height:220px; overflow-y:auto;">
                    ${inventoryConstraintsHtml}
                </div>
            </div>

            <!-- 4. Restricción de Tiempo del Administrador -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px;">
                <h4 style="color:#FF8F00; font-size:0.95rem; margin:0 0 8px 0; font-weight:800;">4. Restricción de Mano de Obra (Tiempo del Administrador)</h4>
                <p style="margin:0 0 10px 0; font-size:0.84rem;">Tiempo dedicado por el dueño para armar los combos según el tiempo disponible ingresado hoy:</p>
                <div style="background:#09090b; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px 16px; font-family:monospace; font-size:0.88rem; color:#f1f5f9; text-align:center;">
                    <strong>${timeLhs} ≤ <span style="color:#10b981;">${bTiempo}</span> minutos (Tiempo disponible del Administrador)</strong>
                </div>
            </div>

            <!-- 5. Demanda Mínima y No Negatividad -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px;">
                <h4 style="color:#FF8F00; font-size:0.95rem; margin:0 0 8px 0; font-weight:800;">5. Naturaleza de las Variables e Integralidad</h4>
                <div style="background:#09090b; padding:12px 16px; border-radius:8px; font-size:0.85rem;">
                    <strong style="color:#4ade80;">Condición Entera y No Negativa:</strong><br>
                    <span style="font-family:monospace; color:#38bdf8;">${allVars.join(', ')} ∈ ℤ⁺ ∪ {0}</span><br>
                    <span style="color:#94a3b8; font-size:0.78rem;">(Todas las cantidades producidas y vendidas deben ser números enteros mayores o iguales a cero)</span>
                </div>
            </div>
        `;
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeIoFormulacionModal() {
    const modal = document.getElementById('modalIoFormulacion');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function aplicarSolucionIOAInventario() {
    if (!ultimaSolucionIO) {
        showToast('⚠️ Primero debes presionar "🚀 Optimizar" para calcular la solución más rentable.', 'warning', '⚠️');
        return;
    }

    const sol = ultimaSolucionIO;
    const detalProducts = sol.detalProducts || (state.products || []).filter(p => p.type !== 'MERCADO');
    const combos = sol.combos || (state.products || []).filter(p => p.type === 'MERCADO' || (p.bundleItems && p.bundleItems.length > 0));

    // 1. Asignar inventario físico a los productos detal (stock bodega original)
    detalProducts.forEach(p => {
        const matchingProd = state.products.find(prod => prod.id === p.id);
        if (matchingProd) {
            matchingProd.stock = p.b_stock;
        }
    });

    // 2. Asignar las cantidades óptimas calculadas a los combos como tipo MERCADO
    combos.forEach(c => {
        const matchingCombo = state.products.find(prod => prod.id === c.id);
        const optQty = (sol.comboSol && sol.comboSol[c.id]) ? sol.comboSol[c.id] : 0;
        if (matchingCombo) {
            matchingCombo.type = 'MERCADO';
            matchingCombo.stock = optQty;
        }
    });

    recalculateMercadoStocks();

    Storage.set('products', state.products);
    renderProducts();
    if (state.currentAdminSubTab === 'products') {
        renderAdminProductsTable();
    }
    if (typeof updateDashboardKPIs === 'function') {
        updateDashboardKPIs();
    }

    showToast('✅ Catálogo sincronizado con la solución óptima del modelo de operaciones.', 'success', '⚖️');
}


// ==========================================================================
// MÓDULO DE PRESUPUESTO DEL NEGOCIO & REPOSICIÓN DE MERCANCÍA
// SIMPLIFICADO: PRESUPUESTO EDITABLE POR EL ADMIN Y COMPRAS AUTOMÁTICAS
// ==========================================================================

async function loadBudgetData() {
    try {
        const [budgetRes, txRes, purchasesRes] = await Promise.allSettled([
            API.get('/api/v1/admin/budget'),
            API.get('/api/v1/admin/budget/transactions'),
            API.get('/api/v1/admin/budget/purchases')
        ]);

        if (budgetRes.status === 'fulfilled' && budgetRes.value?.data) {
            const b = budgetRes.value.data;
            state.budget = {
                initialBudget: Number(b.initialBudget) || 0,
                currentBalance: (b.currentBalance !== undefined && b.currentBalance !== null) ? Number(b.currentBalance) : 0,
                totalPurchases: Number(b.totalPurchases) || 0,
                totalRecoveredCosts: Number(b.totalRecoveredCosts) || 0,
                totalManualInjections: Number(b.totalManualInjections) || 0,
                isInitialized: b.isInitialized !== undefined ? b.isInitialized : (Number(b.initialBudget) > 0)
            };
            Storage.set('store_budget', state.budget);
        } else {
            const saved = Storage.get('store_budget');
            if (saved) {
                state.budget = saved;
            } else {
                state.budget = { initialBudget: 0, currentBalance: 0, totalPurchases: 0, totalRecoveredCosts: 0, totalManualInjections: 0, isInitialized: false };
                Storage.set('store_budget', state.budget);
            }
        }

        if (txRes.status === 'fulfilled' && Array.isArray(txRes.value?.data)) {
            state.budgetTransactions = txRes.value.data;
            Storage.set('budget_transactions', state.budgetTransactions);
        } else {
            const savedTx = Storage.get('budget_transactions');
            if (savedTx) state.budgetTransactions = savedTx;
            else state.budgetTransactions = [];
        }

        if (purchasesRes.status === 'fulfilled' && Array.isArray(purchasesRes.value?.data) && purchasesRes.value.data.length > 0) {
            state.supplierPurchases = purchasesRes.value.data;
            Storage.set('supplier_purchases', state.supplierPurchases);
        } else {
            const savedPurchases = Storage.get('supplier_purchases');
            if (savedPurchases) state.supplierPurchases = savedPurchases;
        }

        renderBudgetSubtab();
    } catch (e) {
        console.warn('Fallback a almacenamiento local para presupuesto:', e);
        const saved = Storage.get('store_budget');
        if (saved) {
            state.budget = saved;
        } else {
            state.budget = { initialBudget: 0, currentBalance: 0, totalPurchases: 0, totalRecoveredCosts: 0, totalManualInjections: 0, isInitialized: false };
        }
        const savedTx = Storage.get('budget_transactions');
        if (savedTx) state.budgetTransactions = savedTx;
        else state.budgetTransactions = [];
        const savedPurchases = Storage.get('supplier_purchases');
        if (savedPurchases) state.supplierPurchases = savedPurchases;
        renderBudgetSubtab();
    }
}

function getCalculatedTotalPurchases() {
    const list = state.supplierPurchases || [];
    if (!Array.isArray(list) || list.length === 0) {
        return Number(state.budget?.totalPurchases) || 0;
    }
    return list.reduce((acc, p) => {
        const assocProd = (state.products || []).find(prod => 
            prod.id === p.productId || 
            prod.sku === p.productSku || 
            (prod.name && p.productName && prod.name.toLowerCase() === p.productName.toLowerCase())
        );
        // Si el producto está inactivo, sus registros en el historial están inactivos y no suman a las métricas activas
        if (assocProd && assocProd.isAvailable === false) {
            return acc;
        }
        const cost = (p.totalCost !== undefined && p.totalCost !== null) 
            ? Number(p.totalCost) 
            : ((Number(p.quantity) || 0) * (Number(p.purchaseUnitCost) || 0));
        return acc + (isNaN(cost) ? 0 : cost);
    }, 0);
}

function renderBudgetSubtab() {
    const purchasesCalculated = getCalculatedTotalPurchases();

    if (!state.budget) {
        state.budget = {
            initialBudget: 0,
            currentBalance: 0,
            totalPurchases: purchasesCalculated,
            totalRecoveredCosts: 0,
            totalManualInjections: 0,
            isInitialized: false
        };
    } else {
        state.budget.totalPurchases = purchasesCalculated;
    }

    // 1. Render KPIs
    const elBalance = document.getElementById('budgetAvailableBalance');
    const elPurchases = document.getElementById('budgetTotalPurchases');
    const elRecovered = document.getElementById('budgetTotalRecovered');
    const elInjected = document.getElementById('budgetTotalInjected');

    if (elBalance) elBalance.textContent = `$ ${Math.round(state.budget.currentBalance || 0).toLocaleString('es-CO')}`;
    if (elPurchases) elPurchases.textContent = `$ ${Math.round(purchasesCalculated).toLocaleString('es-CO')}`;
    if (elRecovered) elRecovered.textContent = `$ ${Math.round(state.budget.totalRecoveredCosts || 0).toLocaleString('es-CO')}`;
    if (elInjected) elInjected.textContent = `$ ${Math.round(state.budget.totalManualInjections || 0).toLocaleString('es-CO')}`;

    // 2. Render Supplier Purchases Table (Matching image columns: CÓDIGO / FECHA, PROVEEDOR, PRODUCTOS ADQUIRIDOS, TOTAL INVERTIDO, IMPACTO EN COSTO PONDERADO)
    const purchasesTbody = document.getElementById('supplierPurchasesTableBody');
    if (purchasesTbody) {
        const purchasesList = state.supplierPurchases || [];
        if (purchasesList.length === 0) {
            purchasesTbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:36px; color:var(--admin-text-muted);">
                        📦 No se han registrado compras de reposición aún. Las compras se generan automáticamente al crear productos o reponer stock en el inventario.
                    </td>
                </tr>
            `;
        } else {
            purchasesTbody.innerHTML = purchasesList.map(p => {
                const dateStr = p.createdAt ? p.createdAt.slice(0, 16).replace('T', ' ') : 'Reciente';
                const prevCostStr = (p.previousUnitCost != null && p.previousUnitCost > 0) ? `$ ${Math.round(p.previousUnitCost).toLocaleString('es-CO')}` : 'Sin costo prev.';
                const newCostStr = (p.newWeightedAverageCost != null && p.newWeightedAverageCost > 0) ? `$ ${Math.round(p.newWeightedAverageCost).toLocaleString('es-CO')}` : `$ ${Math.round(p.purchaseUnitCost || 0).toLocaleString('es-CO')}`;

                const assocProd = (state.products || []).find(prod => prod.id === p.productId || prod.sku === p.productSku || (prod.name && p.productName && prod.name.toLowerCase() === p.productName.toLowerCase()));
                const isPurchaseInactive = assocProd ? assocProd.isAvailable === false : false;

                return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); ${isPurchaseInactive ? 'opacity:0.68; background:rgba(239, 68, 68, 0.05); border-left:3px solid #ef4444;' : ''}">
                        <td style="padding:14px 18px; color:#cbd5e1; font-size:0.85rem;">
                            <div style="font-weight:700; color:#fff;">${dateStr}</div>
                            <span style="font-size:0.72rem; color:${isPurchaseInactive ? '#f87171' : '#94a3b8'}; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px;">${p.productSku || p.productId} ${isPurchaseInactive ? '(Inactivo)' : ''}</span>
                        </td>
                        <td style="padding:14px 18px; color:#ffffff; font-weight:700; font-size:0.88rem;">
                            ${p.supplierName || 'Adquisición de Inventario'}
                        </td>
                        <td style="padding:14px 18px; font-weight:700; color:#ffffff;">
                            <div>${p.productName} ${isPurchaseInactive ? '<span style="font-size:0.65rem; color:#ef4444; background:rgba(239,68,68,0.18); border:1px solid rgba(239,68,68,0.35); padding:1px 6px; border-radius:4px; font-weight:800; margin-left:4px;">🚫 REGISTRO INACTIVO (PRODUCTO INACTIVO)</span>' : ''}</div>
                            <div style="font-size:0.8rem; color:#38bdf8; font-weight:800;">+${p.quantity} unds @ $ ${Math.round(p.purchaseUnitCost).toLocaleString('es-CO')} c/u</div>
                        </td>
                        <td style="padding:14px 18px; color:#ef4444; font-weight:900; font-size:0.95rem;">
                            -$ ${Math.round(p.totalCost).toLocaleString('es-CO')}
                        </td>
                        <td style="padding:14px 18px; font-size:0.82rem;">
                            <div style="color:#94a3b8;">Prev: ${prevCostStr}</div>
                            <div style="color:#10b981; font-weight:800;">Nuevo Promedio: ${newCostStr}</div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // 3. Render Budget Transactions Table
    const txTbody = document.getElementById('budgetTransactionsTableBody');
    const txCountBadge = document.getElementById('budgetTxCountBadge');
    if (txTbody) {
        const txList = state.budgetTransactions || [];
        if (txCountBadge) txCountBadge.textContent = `${txList.length} movimientos`;

        if (txList.length === 0) {
            txTbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:36px; color:var(--admin-text-muted);">
                        📑 No hay transacciones de presupuesto registradas en el historial.
                    </td>
                </tr>
            `;
        } else {
            txTbody.innerHTML = txList.map(tx => {
                const dateStr = tx.createdAt ? tx.createdAt.slice(0, 16).replace('T', ' ') : 'Reciente';
                const isPositive = ['INITIAL_BUDGET', 'MANUAL_ADD', 'SALES_COST_RECOVERY', 'PROFIT_TRANSFER', 'BUDGET_ADJUSTMENT'].includes(tx.type) && tx.amount >= 0;
                const typeLabels = {
                    'INITIAL_BUDGET': { label: '⚙️ Presupuesto Inicial', color: '#38bdf8' },
                    'BUDGET_ADJUSTMENT': { label: '💰 Ajuste de Presupuesto', color: '#38bdf8' },
                    'MANUAL_ADD': { label: '➕ Inyección Capital', color: '#10b981' },
                    'SUPPLIER_PURCHASE': { label: '📦 Compra Mercancía', color: '#ef4444' },
                    'SALES_COST_RECOVERY': { label: '💰 Recuperación Costo', color: '#10b981' },
                    'REFUND_REVERSAL': { label: '↩️ Reversión Cancelación', color: '#f59e0b' },
                    'PROFIT_TRANSFER': { label: '💼 Traslado Ganancias', color: '#a855f7' }
                };
                const tInfo = typeLabels[tx.type] || { label: tx.type, color: '#94a3b8' };

                const isTxInactive = (state.products || []).some(prod => prod.isAvailable === false && tx.description && tx.description.toLowerCase().includes(prod.name.toLowerCase()));

                return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); ${isTxInactive ? 'opacity:0.68; background:rgba(239, 68, 68, 0.05); border-left:3px solid #ef4444;' : ''}">
                        <td style="padding:14px 18px; color:#cbd5e1; font-size:0.85rem;">${dateStr}</td>
                        <td style="padding:14px 18px;">
                            <span style="font-size:0.75rem; font-weight:800; color:${tInfo.color}; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); padding:3px 8px; border-radius:4px;">
                                ${tInfo.label}
                            </span>
                        </td>
                        <td style="padding:14px 18px; font-size:0.84rem; color:#ffffff;">
                            ${tx.description || ''} ${isTxInactive ? '<span style="font-size:0.65rem; color:#ef4444; background:rgba(239,68,68,0.18); border:1px solid rgba(239,68,68,0.35); padding:1px 5px; border-radius:4px; font-weight:800; margin-left:4px;">🚫 Ítem Inactivo</span>' : ''}
                        </td>
                        <td style="padding:14px 18px; font-weight:700; color:#cbd5e1; font-size:0.85rem;">${tx.referenceId || '-'}</td>
                        <td style="padding:14px 18px; font-weight:900; color:${isPositive ? '#10b981' : '#ef4444'}; font-size:0.95rem;">
                            ${isPositive ? '+' : '-'}$ ${Math.round(Math.abs(tx.amount || 0)).toLocaleString('es-CO')}
                        </td>
                        <td style="padding:14px 18px; font-weight:800; color:#ffffff; font-size:0.95rem;">
                            $ ${Math.round(tx.balanceAfter !== undefined ? tx.balanceAfter : state.budget.currentBalance).toLocaleString('es-CO')}
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
}

// --------------------------------------------------------------------------
// MODAL PARA EDITAR PRESUPUESTO DIRECTAMENTE POR EL ADMINISTRADOR
// --------------------------------------------------------------------------

function openEditBudgetModal() {
    const modal = document.getElementById('modalEditBudget');
    if (!modal) return;

    const inputVal = document.getElementById('editBudgetValue');
    if (inputVal) {
        const cur = (state.budget && state.budget.currentBalance !== undefined && state.budget.currentBalance !== null) 
            ? Math.max(0, state.budget.currentBalance) 
            : 0;
        inputVal.value = cur;
    }
    const inputNotes = document.getElementById('editBudgetNotes');
    if (inputNotes) inputNotes.value = '';

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeEditBudgetModal() {
    const modal = document.getElementById('modalEditBudget');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

async function handleEditBudgetSubmit(event) {
    if (event) event.preventDefault();

    const inputVal = document.getElementById('editBudgetValue')?.value;
    const notesVal = document.getElementById('editBudgetNotes')?.value.trim() || 'Ajuste de presupuesto por el administrador';
    const amount = parseFloat(inputVal);

    if (isNaN(amount) || amount < 0) {
        showToast('⚠️ El presupuesto no puede ser negativo ni estar vacío.', 'warning', '⚠️');
        return;
    }

    try {
        if (API.getToken()) {
            await API.put('/api/v1/admin/budget', { amount: amount, notes: notesVal }).catch(() => null);
        }
    } catch (e) {
        console.warn('Fallback local para ajuste de presupuesto');
    }

    const purchasesCalculated = getCalculatedTotalPurchases();

    if (!state.budget) {
        state.budget = { initialBudget: amount, currentBalance: amount, totalPurchases: purchasesCalculated, totalRecoveredCosts: 0, totalManualInjections: 0, isInitialized: true };
    } else {
        state.budget.currentBalance = amount;
        state.budget.totalPurchases = purchasesCalculated;
        state.budget.isInitialized = true;
    }

    if (!state.budgetTransactions) state.budgetTransactions = [];

    const newTx = {
        id: 'tx-adj-' + Date.now(),
        type: 'BUDGET_ADJUSTMENT',
        amount: amount,
        description: notesVal,
        referenceId: 'ADJ-' + Date.now().toString().slice(-4),
        balanceAfter: amount,
        registeredBy: 'Administrador (Propietario)',
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    state.budgetTransactions.unshift(newTx);
    Storage.set('store_budget', state.budget);
    Storage.set('budget_transactions', state.budgetTransactions);

    renderBudgetSubtab();
    closeEditBudgetModal();
    showToast(`✅ Presupuesto actualizado: $ ${amount.toLocaleString('es-CO')} COP`, 'success', '💰');
}

function recordSalesCostRecovery(order) {
    if (!order || order.costRecoveryRecorded) return;

    let totalRecoverableCost = 0;
    (order.items || []).forEach(it => {
        let itemCost = it.costPrice;
        if (itemCost == null) {
            const p = (state.products || []).find(prod => prod.id === it.productId);
            if (p) {
                if (p.type === 'MERCADO' && Array.isArray(p.bundleItems)) {
                    // Suma de costo de adquisición de componentes del mercado/combo
                    itemCost = p.bundleItems.reduce((acc, bi) => {
                        const comp = (state.products || []).find(c => c.id === bi.productId);
                        return acc + ((comp?.costPrice || 0) * (bi.quantity || 1));
                    }, 0);
                } else if (p.costPrice != null && p.costPrice > 0) {
                    itemCost = p.costPrice;
                }
            }
        }
        if (itemCost != null && itemCost > 0) {
            const q = it.qty || it.quantity || 1;
            totalRecoverableCost += itemCost * q;
        }
    });

    if (totalRecoverableCost > 0) {
        if (!state.budget) {
            state.budget = { initialBudget: 0, currentBalance: 0, totalPurchases: getCalculatedTotalPurchases(), totalRecoveredCosts: 0, totalManualInjections: 0, isInitialized: false };
        }
        state.budget.currentBalance += totalRecoverableCost;
        state.budget.totalRecoveredCosts += totalRecoverableCost;
        order.costRecoveryRecorded = true;

        const orderTotal = Number(order.total) || totalRecoverableCost;
        const profit = Math.max(0, orderTotal - totalRecoverableCost);

        const pad = n => String(n).padStart(2, '0');
        const now = new Date();
        const nowFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

        const newTx = {
            id: 'tx-rec-' + Date.now(),
            type: 'SALES_COST_RECOVERY',
            amount: totalRecoverableCost,
            description: `Retorno de costo de adquisición al fondo de reposición por venta ${order.orderNumber || order.id} (Ganancia retenida: $ ${Math.round(profit).toLocaleString('es-CO')})`,
            referenceId: order.orderNumber || order.id,
            balanceAfter: state.budget.currentBalance,
            registeredBy: 'Sistema Merkostore (Venta a Cliente)',
            createdAt: nowFormatted
        };

        if (!state.budgetTransactions) state.budgetTransactions = [];
        state.budgetTransactions.unshift(newTx);
        Storage.set('store_budget', state.budget);
        Storage.set('budget_transactions', state.budgetTransactions);
        Storage.set('orders', state.orders);

        if (state.currentAdminSubTab === 'budget') {
            renderBudgetSubtab();
        }
    }
}

function revertSalesCostRecovery(order) {
    if (!order || !order.costRecoveryRecorded) return;

    let totalRecoverableCost = 0;
    (order.items || []).forEach(it => {
        let itemCost = it.costPrice;
        if (itemCost == null) {
            const p = (state.products || []).find(prod => prod.id === it.productId);
            if (p && p.costPrice != null && p.costPrice > 0) {
                itemCost = p.costPrice;
            }
        }
        if (itemCost != null && itemCost > 0) {
            const q = it.qty || it.quantity || 1;
            totalRecoverableCost += itemCost * q;
        }
    });

    if (totalRecoverableCost > 0) {
        if (state.budget) {
            state.budget.currentBalance = Math.max(0, state.budget.currentBalance - totalRecoverableCost);
            state.budget.totalRecoveredCosts = Math.max(0, state.budget.totalRecoveredCosts - totalRecoverableCost);
        }
        order.costRecoveryRecorded = false;

        const newTx = {
            id: 'tx-rev-' + Date.now(),
            type: 'REFUND_REVERSAL',
            amount: -totalRecoverableCost,
            description: `Reversión de costo recuperado por cancelación de pedido ${order.orderNumber || order.id}`,
            referenceId: order.orderNumber || order.id,
            balanceAfter: state.budget ? state.budget.currentBalance : 0,
            registeredBy: 'Sistema Merkostore (Cancelación)',
            createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };

        if (!state.budgetTransactions) state.budgetTransactions = [];
        state.budgetTransactions.unshift(newTx);
        Storage.set('store_budget', state.budget);
        Storage.set('budget_transactions', state.budgetTransactions);
        Storage.set('orders', state.orders);

        if (state.currentAdminSubTab === 'budget') {
            renderBudgetSubtab();
        }
    }
}

function recalculateMercadosStock() {
    (state.products || []).filter(p => p.type === 'MERCADO').forEach(m => {
        if (m.bundleItems && m.bundleItems.length > 0) {
            const possibleBundles = m.bundleItems.map(b => {
                const component = (state.products || []).find(p => p.id === b.productId);
                const compStock = component ? (component.stock || 0) : 0;
                return Math.floor(compStock / (b.quantity || 1));
            });
            m.stock = Math.min(...possibleBundles);
        }
    });
}

async function loadAdminUsersData() {
    try {
        const res = await API.get('/api/v1/admin/users').catch(() => null);
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
            state.users = res.data;
        } else if (!state.users || state.users.length === 0) {
            state.users = [
                { id: 'u1', username: 'mary' },
                { id: 'u2', username: 'duvan' },
                { id: 'u3', username: 'cris' }
            ];
        }
        renderAdminUsersTable();
    } catch (e) {
        if (!state.users || state.users.length === 0) {
            state.users = [
                { id: 'u1', username: 'mary' },
                { id: 'u2', username: 'duvan' },
                { id: 'u3', username: 'cris' }
            ];
        }
        renderAdminUsersTable();
    }
}

function renderAdminUsersTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    let usersList = state.users || [];
    if (usersList.length === 0) {
        usersList = [
            { id: 'u1', username: 'mary' },
            { id: 'u2', username: 'duvan' },
            { id: 'u3', username: 'cris' }
        ];
        state.users = usersList;
    }

    tbody.innerHTML = usersList.map(u => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding:16px 20px; font-weight:700; color:#ffffff; font-size:0.95rem;">
                <span style="display:inline-flex; align-items:center; gap:8px;">
                    <span style="color:#FF8F00; font-size:1rem;">👤</span> ${u.username}
                    ${u.isActive === false ? '<span style="font-size:0.7rem; color:#f87171; background:rgba(239,68,68,0.15); padding:2px 8px; border-radius:4px;">Inactivo</span>' : '<span style="font-size:0.7rem; color:#4ade80; background:rgba(74,222,128,0.15); padding:2px 8px; border-radius:4px;">Activo</span>'}
                </span>
            </td>
            <td style="padding:16px 20px; text-align:right;">
                <button class="btn-delete-admin-pill" onclick="deleteAdminUser('${u.id}')" style="background:${u.isActive === false ? 'rgba(74,222,128,0.2)' : '#7f1d1d'}; color:${u.isActive === false ? '#4ade80' : '#fca5a5'}; border:1px solid ${u.isActive === false ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.3)'}; padding:6px 18px; border-radius:8px; font-size:0.8rem; font-weight:800; cursor:pointer; transition:all 0.2s ease;">
                    ${u.isActive === false ? '✅ Activar' : '🚫 Inactivar'}
                </button>
            </td>
        </tr>
    `).join('');
}

function openCreateAdminModal() {
    document.getElementById('modalCreateAdmin').classList.add('active');
}

function closeCreateAdminModal() {
    document.getElementById('modalCreateAdmin').classList.remove('active');
}

async function handleCreateAdminUser(e) {
    e.preventDefault();
    const username = document.getElementById('newAdminUsername').value.trim();
    const password = document.getElementById('newAdminPassword').value.trim();
    const name = document.getElementById('newAdminName')?.value.trim() || '';
    const email = document.getElementById('newAdminEmail')?.value.trim() || '';

    if (!username) return;

    const newAdmin = {
        id: 'u-' + Date.now(),
        username: username,
        name: name || username,
        email: email || `${username}@merkostore.com`
    };

    try {
        if (API.getToken()) {
            await API.post('/api/v1/admin/users', {
                username: username,
                password: password,
                name: name,
                email: email
            }).catch(() => {});
        }
    } catch (err) {
        console.warn('API error creating admin, local fallback active', err);
    }

    if (!state.users) state.users = [];
    state.users.push(newAdmin);

    renderAdminUsersTable();
    closeCreateAdminModal();

    document.getElementById('newAdminUsername').value = '';
    document.getElementById('newAdminPassword').value = '';
    if (document.getElementById('newAdminName')) document.getElementById('newAdminName').value = '';
    if (document.getElementById('newAdminEmail')) document.getElementById('newAdminEmail').value = '';

    showToast(`👤 Administrador "${username}" creado exitosamente`, 'success', '👤');
}

async function deleteAdminUser(userId) {
    let usersList = state.users || [];
    if (usersList.length <= 1) {
        showToast('🔒 Por seguridad, el último administrador no se puede inactivar.', 'warning', '🔒');
        return;
    }

    const u = usersList.find(user => user.id === userId);
    const username = u ? u.username : 'seleccionado';
    const isCurrentlyActive = u.isActive !== false;
    const ok = await showMerkoConfirm({
        title: isCurrentlyActive ? 'Inactivar Administrador' : 'Activar Administrador',
        message: isCurrentlyActive 
            ? `¿Deseas inactivar la cuenta de "${username}"?\n\nEl usuario no podrá acceder al panel de administración hasta que sea reactivado.`
            : `¿Deseas reactivar la cuenta de "${username}"?`,
        icon: isCurrentlyActive ? '👤' : '✅',
        confirmText: isCurrentlyActive ? 'Inactivar' : 'Activar',
        cancelText: 'Cancelar',
        confirmType: isCurrentlyActive ? 'warning' : 'success'
    });
    if (!ok) return;

    u.isActive = !isCurrentlyActive;

    try {
        if (API.getToken()) {
            await API.delete(`/api/v1/admin/users/${userId}`).catch(() => {});
        }
    } catch (err) {
        console.warn('API error inactivating admin, local fallback active', err);
    }

    renderAdminUsersTable();
    showToast(
        u.isActive ? `✅ Administrador "${username}" activado correctamente` : `🚫 Administrador "${username}" inactivado (registro preservado)`,
        u.isActive ? 'success' : 'warning',
        u.isActive ? '✅' : '🚫'
    );
}

function filterAdminInventoryStock(filter) {
    state.adminStockFilter = filter;

    const filterBtns = {
        'ALL': 'filterStockAll',
        'IN_STOCK': 'filterStockInStock',
        'SOLD_OUT': 'filterStockSoldOut',
        'LOW_STOCK': 'filterStockLow',
        'WITH_COST': 'filterStockWithCost',
        'NO_COST': 'filterStockNoCost'
    };

    Object.keys(filterBtns).forEach(k => {
        const btn = document.getElementById(filterBtns[k]);
        if (btn) {
            if (k === filter) {
                btn.style.background = 'var(--brand-primary)';
                btn.style.color = '#ffffff';
                btn.style.borderColor = 'var(--brand-primary)';
            } else {
                btn.style.background = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }
        }
    });

    renderAdminProductsTable();
}

async function toggleProductStockAvailability(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const inStock = product.stock > 0;
    if (inStock) {
        product.previousStock = product.stock;
        product.stock = 0;
    } else {
        product.stock = product.previousStock || 10;
    }

    Storage.set('products', state.products);

    try {
        if (API.getToken()) {
            await API.patch(`/api/v1/admin/products/${productId}/toggle-availability`).catch(() => {});
        }
    } catch (err) {
        console.warn('API error toggling stock availability, local fallback active', err);
    }

    renderAdminProductsTable();
    renderProducts();
    if (typeof updateDashboardKPIs === 'function') {
        updateDashboardKPIs();
    }

    const statusText = product.stock > 0 ? '✓ En Stock' : '✕ Agotado';
    const toastType = product.stock > 0 ? 'success' : 'warning';
    const icon = product.stock > 0 ? '🟢' : '🔴';
    showToast(`Stock de "${product.name}" actualizado a: ${statusText}`, toastType, icon);
}

function renderAdminProductsTable() {
    const tbody = document.getElementById('productsAdminTable');
    if (!tbody) return;

    const searchQuery = (document.getElementById('adminInventorySearchInput')?.value || '').toLowerCase().trim();
    const filter = state.adminStockFilter || 'ALL';

    let list = state.products;

    if (searchQuery) {
        list = list.filter(p => 
            p.name.toLowerCase().includes(searchQuery) ||
            getCategoryName(p.categoryId).toLowerCase().includes(searchQuery)
        );
    }

    if (filter === 'IN_STOCK') {
        list = list.filter(p => p.isAvailable !== false && p.stock > 0);
    } else if (filter === 'SOLD_OUT') {
        list = list.filter(p => p.isAvailable === false || p.stock <= 0);
    } else if (filter === 'LOW_STOCK') {
        list = list.filter(p => p.isAvailable !== false && p.stock <= (p.minStockAlert || 5) && p.stock > 0);
    } else if (filter === 'WITH_COST') {
        list = list.filter(p => p.costPrice != null && p.costPrice > 0);
    } else if (filter === 'NO_COST') {
        list = list.filter(p => p.costPrice == null || p.costPrice <= 0);
    }

    const badge = document.getElementById('adminInventoryCountBadge');
    if (badge) {
        badge.textContent = `${list.length} DE ${state.products.length}`;
    }

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:40px; color:var(--admin-text-muted);">
                    No se encontraron productos o mercados con el filtro seleccionado.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map(p => {
        const isMercado = p.type === 'MERCADO';
        const isActive = p.isAvailable !== false;
        const inStock = p.stock > 0;

        return `
            <tr style="${!isActive ? 'opacity:0.65; background:rgba(239, 68, 68, 0.04);' : ''}">
                <td>
                    <img src="${p.imageUrl}" alt="${p.name}" style="width:42px; height:42px; border-radius:8px; object-fit:cover; border:1px solid rgba(255,255,255,0.1);">
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <strong style="font-size:0.92rem; color:#ffffff;">${p.name}</strong>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span class="card-type-badge ${isMercado ? 'mercado' : 'detal'}" style="position:static; font-size:0.65rem; padding:2px 6px;">
                                ${isMercado ? 'Mercado' : 'Producto Detal'}
                            </span>
                            ${!isActive ? `<span style="font-size:0.65rem; color:#ef4444; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); padding:2px 6px; border-radius:4px; font-weight:700;">🚫 INACTIVO</span>` : ''}
                        </div>
                    </div>
                </td>
                <td style="font-size:0.85rem; color:#cbd5e1;">${getCategoryName(p.categoryId)}</td>
                <td>
                    <div style="font-weight:900; color:#fbbf24; font-size:0.92rem;">$ ${(p.discountPrice || p.price).toLocaleString('es-CO')}</div>
                    ${(p.costPrice != null && p.costPrice > 0)
                        ? `<div style="font-size:0.75rem; color:#10b981; font-weight:700; margin-top:2px;">Costo: $ ${Number(p.costPrice).toLocaleString('es-CO')}</div>`
                        : `<div style="font-size:0.7rem; color:#f59e0b; background:rgba(245, 158, 11, 0.15); border:1px solid rgba(245, 158, 11, 0.3); border-radius:4px; padding:1px 5px; display:inline-block; font-weight:700; margin-top:2px;">⚠️ Costo Pendiente</div>`
                    }
                </td>
                <td style="font-weight:800; color:#ffffff; font-size:0.95rem;">
                    ${p.stock} ${p.variantInfo ? `<span style="font-size:0.75rem; color:#94a3b8;">(${p.variantInfo})</span>` : ''}
                </td>
                <td>
                    <button class="stock-toggle-pill-btn ${inStock ? 'en-stock' : 'agotado'}" onclick="toggleProductStockAvailability('${p.id}')">
                        ${inStock ? '✓ En Stock' : '✕ Agotado'}
                    </button>
                </td>
                <td style="text-align:right;">
                    <div style="display:flex; justify-content:flex-end; gap:6px;">
                        <button class="btn-merko-outline" style="padding:5px 12px; font-size:0.75rem; background:#332924;" onclick="editProduct('${p.id}')">✏️ Editar</button>
                        <button class="btn-merko-outline" style="padding:5px 12px; font-size:0.75rem; ${isActive ? 'color:#f87171; border-color:rgba(239, 68, 68, 0.4); background:rgba(239, 68, 68, 0.15);' : 'color:#4ade80; border-color:rgba(74, 222, 128, 0.4); background:rgba(74, 222, 128, 0.15);'}" onclick="toggleProductActivation('${p.id}')" title="${isActive ? 'Inactivar de la vista del cliente y optimización IO' : 'Activar en tienda y optimización IO'}">
                            ${isActive ? '🚫 Inactivar' : '✅ Activar'}
                        </button>
                        <button class="btn-merko-outline" style="padding:5px 12px; font-size:0.75rem; color:#ef4444; border-color:rgba(239, 68, 68, 0.5); background:rgba(239, 68, 68, 0.12);" onclick="deleteProductPermanently('${p.id}')" title="Eliminar permanentemente del inventario y base de datos">
                            🗑️ Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getCategoryName(catId) {
    const cat = state.categories.find(c => c.id === catId);
    return cat ? cat.name : catId;
}

function toggleMercadoCompositionForm() {
    const type = document.getElementById('editorType')?.value || 'DETAL';
    const container = document.getElementById('mercadoItemsContainer');
    const lblStock = document.getElementById('lblEditorStock');
    const subStock = document.getElementById('subEditorStock');
    const costGroup = document.getElementById('editorCostPriceGroup');
    const pricesGrid = document.getElementById('editorPricesGrid');
    const stockInput = document.getElementById('editorStock');
    const warnBox = document.getElementById('editorBudgetWarning');

    if (type === 'MERCADO') {
        if (container) container.style.display = 'block';
        if (lblStock) lblStock.textContent = 'Cantidad de Combos en Inventario *';
        if (subStock) subStock.textContent = 'Existencias físicas disponibles de este combo.';
        if (costGroup) costGroup.style.display = 'none';
        if (pricesGrid) pricesGrid.style.gridTemplateColumns = '1fr';
        if (stockInput) {
            stockInput.readOnly = false;
            stockInput.placeholder = 'Ej: 5';
        }
        if (warnBox) warnBox.style.display = 'none';

        // Si ya hay checks marcados en el DOM por el usuario durante la sesión actual de edición, preservarlos
        const currentChecks = [];
        document.querySelectorAll('.mercado-bundle-check:checked').forEach(chk => {
            const pId = chk.getAttribute('data-id');
            const qtyInput = document.querySelector(`.mercado-bundle-qty[data-id="${pId}"]`);
            currentChecks.push({ productId: pId, quantity: parseInt(qtyInput?.value || 1) });
        });

        if (currentChecks.length > 0) {
            renderMercadoItemsChecklist(currentChecks);
        } else {
            renderMercadoItemsChecklist();
        }
    } else {
        if (container) container.style.display = 'none';
        if (lblStock) lblStock.textContent = 'Inventario Inicial *';
        if (subStock) subStock.textContent = 'Existencias físicas disponibles en bodega.';
        if (costGroup) costGroup.style.display = 'block';
        if (pricesGrid) pricesGrid.style.gridTemplateColumns = '1fr 1fr';
        if (stockInput) {
            stockInput.readOnly = false;
            stockInput.placeholder = 'Ej: 25';
        }
    }
}

function renderMercadoItemsChecklist(bundleItemsToMark = null) {
    const container = document.getElementById('mercadoItemsChecklist');
    if (!container) return;

    // Solo permitir armar combos con productos detal activos
    const detalProducts = (state.products || []).filter(p => p.type !== 'MERCADO' && p.isAvailable !== false);

    // Determinar qué items deben estar seleccionados
    let selectedMap = {};
    let items = bundleItemsToMark;

    // Si no se pasaron items explícitos, verificar si se está editando un producto existente tipo MERCADO
    if (!items && state.editingProductId) {
        const ep = (state.products || []).find(prod => String(prod.id) === String(state.editingProductId));
        if (ep && ep.type === 'MERCADO' && Array.isArray(ep.bundleItems) && ep.bundleItems.length > 0) {
            items = ep.bundleItems;
        }
    }

    if (Array.isArray(items)) {
        items.forEach(b => {
            const id = b.productId || b.id;
            if (id != null) {
                selectedMap[String(id)] = b.quantity || b.qty || 1;
            }
        });
    }

    container.innerHTML = detalProducts.map(p => {
        const pIdStr = String(p.id);
        const isChecked = selectedMap[pIdStr] !== undefined;
        const qty = isChecked ? (selectedMap[pIdStr] || 1) : 1;
        return `
            <div style="display:flex; align-items:center; justify-space-between; background:#18181b; padding:8px 12px; border-radius:8px;">
                <label style="display:flex; align-items:center; gap:8px; font-size:0.82rem; color:#ffffff; cursor:pointer;">
                    <input type="checkbox" class="mercado-bundle-check" data-id="${p.id}" ${isChecked ? 'checked' : ''}>
                    <span>${p.name} (Stock detal: ${p.stock})</span>
                </label>
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:0.72rem; color:#a1a1aa;">Cant:</span>
                    <input type="number" class="mercado-bundle-qty" data-id="${p.id}" value="${qty}" min="1" style="width:55px; padding:4px 6px; font-size:0.8rem; background:#0f172a; color:#fff; border:1px solid #3f3f46; border-radius:4px;">
                </div>
            </div>
        `;
    }).join('');
}

function handleProductImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    const fileNameSpan = document.getElementById('editorImageFileName');
    
    if (file) {
        if (fileNameSpan) fileNameSpan.textContent = `🖼️ ${file.name}`;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            const imgInput = document.getElementById('editorImage');
            if (imgInput) imgInput.value = dataUrl;
            updateLivePreview();
        };
        reader.readAsDataURL(file);
    } else {
        if (fileNameSpan) fileNameSpan.textContent = 'Ningún archivo seleccionado';
    }
}

function resetProductEditorForm(userCancelled = false) {
    state.editingProductId = null;

    const elType = document.getElementById('editorType');
    const elName = document.getElementById('editorName');
    const elCat = document.getElementById('editorCategory');
    const elUnit = document.getElementById('editorUnit');
    const elPrice = document.getElementById('editorPrice');
    const elDisc = document.getElementById('editorDiscount');
    const elStock = document.getElementById('editorStock');
    const elImg = document.getElementById('editorImage');

    if (elType) elType.value = 'DETAL';
    if (elName) elName.value = '';
    if (elCat) elCat.value = 'cat4';
    if (elUnit) elUnit.value = '';
    if (elPrice) elPrice.value = '';
    if (elDisc) elDisc.value = '';
    if (elStock) elStock.value = '';
    if (elImg) elImg.value = '';
    const elCost = document.getElementById('editorCostPrice');
    if (elCost) elCost.value = '';

    const fileInput = document.getElementById('editorImageFile');
    if (fileInput) fileInput.value = '';
    const fileNameSpan = document.getElementById('editorImageFileName');
    if (fileNameSpan) fileNameSpan.textContent = 'Ningún archivo seleccionado';

    const titleEl = document.getElementById('editorSubtabTitle');
    if (titleEl) titleEl.textContent = '➕ CREAR PRODUCTO O MERCADO';

    const btnSave = document.getElementById('btnSaveProductEditor');
    if (btnSave) btnSave.innerHTML = '💾 Guardar en el Catálogo';

    const btnCancel = document.getElementById('btnCancelProductEditor');
    if (btnCancel) btnCancel.style.display = 'none';

    const warnBox = document.getElementById('editorBudgetWarning');
    if (warnBox) warnBox.style.display = 'none';

    document.querySelectorAll('.mercado-bundle-check').forEach(chk => { chk.checked = false; });
    document.querySelectorAll('.mercado-bundle-qty').forEach(qtyInp => { qtyInp.value = '1'; });

    renderMercadoItemsChecklist([]);
    toggleMercadoCompositionForm();
    state.currentProductFraming = {
        pc: { fit: 'cover', zoom: 1.0, posX: 50, posY: 50 },
        mobile: { fit: 'cover', zoom: 1.0, posX: 50, posY: 50 }
    };
    switchFramingDevice('PC');
    updateLivePreview();

    if (userCancelled) {
        showToast('ℹ️ Edición cancelada. Formulario listo para crear un nuevo producto.', 'info', 'ℹ️');
    }
}

function editProduct(productId) {
    const p = state.products.find(prod => String(prod.id) === String(productId));
    if (!p) return;

    state.editingProductId = productId;

    // Cambiar a la pestaña de productos al inicio para que ningún refresco posterior desmarque los items
    switchAdminSubTab('products');

    const titleEl = document.getElementById('editorSubtabTitle');
    if (titleEl) titleEl.textContent = '✏️ EDITAR PRODUCTO O MERCADO';

    const btnSave = document.getElementById('btnSaveProductEditor');
    if (btnSave) btnSave.innerHTML = '💾 Actualizar Producto / Mercado';

    const btnCancel = document.getElementById('btnCancelProductEditor');
    if (btnCancel) btnCancel.style.display = 'inline-flex';

    document.getElementById('editorType').value = p.type || 'DETAL';
    document.getElementById('editorName').value = p.name || '';
    document.getElementById('editorCategory').value = p.categoryId || 'cat4';
    document.getElementById('editorUnit').value = p.unitCalc || '';
    document.getElementById('editorPrice').value = p.price || '';
    document.getElementById('editorDiscount').value = p.discountPrice || '';
    document.getElementById('editorStock').value = p.stock || 0;
    document.getElementById('editorImage').value = p.imageUrl || '';
    const elCostEdit = document.getElementById('editorCostPrice');
    if (elCostEdit) elCostEdit.value = (p.costPrice != null && p.costPrice > 0) ? p.costPrice : '';

    const fileInput = document.getElementById('editorImageFile');
    if (fileInput) fileInput.value = '';
    const fileNameSpan = document.getElementById('editorImageFileName');
    if (fileNameSpan) {
        fileNameSpan.textContent = p.imageUrl ? '🖼️ Imagen actual cargada (haz clic para cambiar)' : 'Ningún archivo seleccionado';
    }

    toggleMercadoCompositionForm();

    if (p.type === 'MERCADO') {
        const bundleList = Array.isArray(p.bundleItems) ? p.bundleItems : [];
        renderMercadoItemsChecklist(bundleList);
    }

    state.currentProductFraming = {
        pc: {
            fit: p.imageFitPc || 'cover',
            zoom: p.imageZoomPc !== undefined ? p.imageZoomPc : 1.0,
            posX: p.imagePosX_Pc !== undefined ? p.imagePosX_Pc : 50,
            posY: p.imagePosY_Pc !== undefined ? p.imagePosY_Pc : 50
        },
        mobile: {
            fit: p.imageFitMobile || p.imageFitPc || 'cover',
            zoom: p.imageZoomMobile !== undefined ? p.imageZoomMobile : (p.imageZoomPc !== undefined ? p.imageZoomPc : 1.0),
            posX: p.imagePosX_Mobile !== undefined ? p.imagePosX_Mobile : (p.imagePosX_Pc !== undefined ? p.imagePosX_Pc : 50),
            posY: p.imagePosY_Mobile !== undefined ? p.imagePosY_Mobile : (p.imagePosY_Pc !== undefined ? p.imagePosY_Pc : 50)
        }
    };
    switchFramingDevice('PC');

    updateLivePreview();
    setTimeout(() => {
        document.getElementById('productEditorCard')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
}

async function toggleProductActivation(productId) {
    const p = state.products.find(prod => prod.id === productId);
    if (!p) return;
    const currentlyActive = p.isAvailable !== false;

    const ok = await showMerkoConfirm({
        title: currentlyActive ? 'Inactivar Producto' : 'Activar Producto',
        message: currentlyActive 
            ? `¿Deseas inactivar "${p.name}"?\n\nAl inactivarlo, el producto se ocultará de la vista de los clientes, del módulo de Investigación de Operaciones (Simplex/MILP), de la creación de combos y sus registros en el historial se marcarán como inactivos.`
            : `¿Deseas reactivar "${p.name}" en la tienda?\n\nVolverá a estar visible para los clientes y disponible en Investigación de Operaciones, inventario y registros de historial.`,
        icon: currentlyActive ? '🚫' : '✅',
        confirmText: currentlyActive ? 'Inactivar Producto' : 'Activar Producto',
        cancelText: 'Cancelar',
        confirmType: currentlyActive ? 'warning' : 'success'
    });

    if (!ok) return;

    p.isAvailable = !currentlyActive;
    Storage.set('products', state.products);

    try {
        if (typeof API !== 'undefined' && API.getToken && API.getToken()) {
            await API.patch(`/api/v1/admin/products/${productId}/toggle-availability`).catch(() => {});
        }
    } catch (e) {}

    recalculateMercadoStocks();
    renderProducts();
    renderAdminProductsTable();
    renderMercadoItemsChecklist();
    renderHistorialUnificadoTable();
    renderActiveOrdersTable();
    if (typeof renderBudgetSubtab === 'function') renderBudgetSubtab();
    if (typeof renderIoProductInputs === 'function') {
        renderIoProductInputs(true);
        limpiarResultadosIO(false);
    }
    if (typeof updateDashboardKPIs === 'function') updateDashboardKPIs();

    showToast(
        p.isAvailable ? `✅ "${p.name}" activado (visible en tienda y en optimización IO)` : `🚫 "${p.name}" inactivado (oculto en tienda y en optimización IO)`,
        p.isAvailable ? 'success' : 'warning',
        p.isAvailable ? '✅' : '🚫'
    );
}

async function deleteProductPermanently(productId) {
    const p = state.products.find(prod => prod.id === productId);
    if (!p) return;

    const ok = await showMerkoConfirm({
        title: 'Eliminar Producto Definitivamente',
        message: `⚠️ ¿Estás completamente seguro de que deseas ELIMINAR PERMANENTEMENTE "${p.name}"?\n\nEsta acción borrará el producto de forma definitiva del inventario, de la base de datos MongoDB y de todos los módulos. Esta operación no se puede deshacer.`,
        icon: '🗑️',
        confirmText: 'Eliminar Permanentemente',
        cancelText: 'Cancelar',
        confirmType: 'danger'
    });

    if (!ok) return;

    // 1. Eliminar del estado local
    const prodName = p.name;
    const prodSku = p.sku;
    state.products = state.products.filter(prod => prod.id !== productId);

    // 2. Si este producto formaba parte de algún combo (bundleItems), removerlo para evitar errores
    state.products.forEach(prod => {
        if (prod.bundleItems && Array.isArray(prod.bundleItems)) {
            prod.bundleItems = prod.bundleItems.filter(bi => bi.productId !== productId);
        }
    });

    // 3. Remover del carrito si estaba agregado
    if (state.cart && state.cart[productId]) {
        delete state.cart[productId];
        if (typeof updateCartBadge === 'function') updateCartBadge();
    }

    // 4. Borrado en cascada del historial de pedidos que contengan este producto
    if (state.orders && Array.isArray(state.orders)) {
        state.orders = state.orders.filter(o => {
            const hasItem = (o.items || []).some(it => 
                it.productId === productId || 
                (prodName && it.name && it.name.toLowerCase() === prodName.toLowerCase()) ||
                (prodName && it.productName && it.productName.toLowerCase() === prodName.toLowerCase())
            );
            return !hasItem;
        });
        Storage.set('orders', state.orders);
    }

    // 5. Borrado en cascada de compras a proveedores asociadas a este producto
    if (state.supplierPurchases && Array.isArray(state.supplierPurchases)) {
        state.supplierPurchases = state.supplierPurchases.filter(sp => 
            sp.productId !== productId && 
            (!prodSku || sp.productSku !== prodSku) &&
            (!prodName || !sp.productName || sp.productName.toLowerCase() !== prodName.toLowerCase())
        );
        Storage.set('supplier_purchases', state.supplierPurchases);
    }

    // 6. Borrado en cascada de movimientos de presupuesto asociados a este producto
    if (state.budgetTransactions && Array.isArray(state.budgetTransactions)) {
        state.budgetTransactions = state.budgetTransactions.filter(tx => 
            !tx.description || (
                !tx.description.includes(productId) &&
                (!prodName || !tx.description.toLowerCase().includes(prodName.toLowerCase()))
            )
        );
        Storage.set('budget_transactions', state.budgetTransactions);
    }

    // 7. Persistir cambios en localStorage
    Storage.set('products', state.products);

    // 5. Llamar al backend para eliminarlo permanentemente de MongoDB
    try {
        if (typeof API !== 'undefined' && API.getToken && API.getToken()) {
            await API.delete(`/api/v1/admin/products/${productId}`).catch(err => {
                console.warn('Advertencia al eliminar en backend:', err);
            });
        }
    } catch (e) {
        console.warn('API backend no disponible o error de red:', e);
    }

    // 6. Recalcular stocks y refrescar todos los apartados
    recalculateMercadoStocks();
    renderAdminProductsTable();
    renderProducts();
    renderMercadoItemsChecklist();
    renderHistorialUnificadoTable();
    renderActiveOrdersTable();
    if (typeof renderBudgetSubtab === 'function') renderBudgetSubtab();
    if (typeof renderIoProductInputs === 'function') {
        renderIoProductInputs(true);
        limpiarResultadosIO(false);
    }
    if (typeof updateDashboardKPIs === 'function') {
        updateDashboardKPIs();
    }

    showToast(`✓ Producto "${p.name}" eliminado definitivamente del inventario y de la base de datos`, 'success', '🗑️');
}

function deleteProduct(productId) {
    deleteProductPermanently(productId);
}

// ==========================================================================
// IMAGE FRAMING CONTROLS (INDEPENDENT PC & MOBILE)
// ==========================================================================

function switchFramingDevice(device) {
    state.currentFramingDevice = device;
    const isPc = device === 'PC';

    // Buttons framing config
    const btnPc = document.getElementById('btnDevicePc');
    const btnMob = document.getElementById('btnDeviceMobile');
    if (btnPc && btnMob) {
        if (isPc) {
            btnPc.classList.add('active');
            btnPc.style.background = 'linear-gradient(135deg, #FF6F00, #E65100)';
            btnPc.style.color = '#fff';
            btnMob.classList.remove('active');
            btnMob.style.background = 'transparent';
            btnMob.style.color = '#a1a1aa';
        } else {
            btnMob.classList.add('active');
            btnMob.style.background = 'linear-gradient(135deg, #FF6F00, #E65100)';
            btnMob.style.color = '#fff';
            btnPc.classList.remove('active');
            btnPc.style.background = 'transparent';
            btnPc.style.color = '#a1a1aa';
        }
    }

    // Buttons preview mode
    const prevPc = document.getElementById('btnPrevPc');
    const prevMob = document.getElementById('btnPrevMobile');
    if (prevPc && prevMob) {
        if (isPc) {
            prevPc.classList.add('active');
            prevPc.style.background = 'linear-gradient(135deg, #FF6F00, #E65100)';
            prevPc.style.color = '#fff';
            prevMob.classList.remove('active');
            prevMob.style.background = 'transparent';
            prevMob.style.color = '#a1a1aa';
        } else {
            prevMob.classList.add('active');
            prevMob.style.background = 'linear-gradient(135deg, #FF6F00, #E65100)';
            prevMob.style.color = '#fff';
            prevPc.classList.remove('active');
            prevPc.style.background = 'transparent';
            prevPc.style.color = '#a1a1aa';
        }
    }

    // Badge
    const badge = document.getElementById('prevMatchBadge');
    if (badge) {
        badge.textContent = isPc ? '100% IDÉNTICA PC' : '100% IDÉNTICA MÓVIL';
    }

    // Card width and image wrap height in live preview matching client view
    const liveCard = document.getElementById('liveCardPreview');
    const prevWrap = document.getElementById('prevImgWrap');
    if (liveCard) {
        liveCard.style.maxWidth = isPc ? '240px' : '185px';
    }
    if (prevWrap) {
        prevWrap.style.height = isPc ? '175px' : '145px';
    }

    // Sync input controls with selected device framing
    const devKey = device.toLowerCase();
    const conf = state.currentProductFraming[devKey] || { fit: 'cover', zoom: 1.0, posX: 50, posY: 50 };
    
    const fitSelect = document.getElementById('imgFitMode');
    if (fitSelect) fitSelect.value = conf.fit || 'cover';

    const zoomRange = document.getElementById('imgZoomRange');
    const lblZoom = document.getElementById('lblImgZoom');
    if (zoomRange) zoomRange.value = conf.zoom || 1.0;
    if (lblZoom) lblZoom.textContent = Number(conf.zoom || 1.0).toFixed(2) + 'x';

    const posXRange = document.getElementById('imgPosXRange');
    const lblPosX = document.getElementById('lblImgPosX');
    if (posXRange) posXRange.value = conf.posX !== undefined ? conf.posX : 50;
    if (lblPosX) lblPosX.textContent = (conf.posX !== undefined ? conf.posX : 50) + '%';

    const posYRange = document.getElementById('imgPosYRange');
    const lblPosY = document.getElementById('lblImgPosY');
    if (posYRange) posYRange.value = conf.posY !== undefined ? conf.posY : 50;
    if (lblPosY) lblPosY.textContent = (conf.posY !== undefined ? conf.posY : 50) + '%';

    updateFramingPreview();
}

function updateFramingSetting(prop, val) {
    const devKey = (state.currentFramingDevice || 'PC').toLowerCase();
    if (!state.currentProductFraming[devKey]) {
        state.currentProductFraming[devKey] = { fit: 'cover', zoom: 1.0, posX: 50, posY: 50 };
    }

    if (prop === 'fit') {
        state.currentProductFraming[devKey].fit = val;
    } else if (prop === 'zoom') {
        const num = parseFloat(val) || 1.0;
        state.currentProductFraming[devKey].zoom = num;
        const lbl = document.getElementById('lblImgZoom');
        if (lbl) lbl.textContent = num.toFixed(2) + 'x';
    } else if (prop === 'posX') {
        const num = parseInt(val);
        state.currentProductFraming[devKey].posX = isNaN(num) ? 50 : num;
        const lbl = document.getElementById('lblImgPosX');
        if (lbl) lbl.textContent = state.currentProductFraming[devKey].posX + '%';
    } else if (prop === 'posY') {
        const num = parseInt(val);
        state.currentProductFraming[devKey].posY = isNaN(num) ? 50 : num;
        const lbl = document.getElementById('lblImgPosY');
        if (lbl) lbl.textContent = state.currentProductFraming[devKey].posY + '%';
    }

    updateFramingPreview();
}

function applyFramingPreset(preset) {
    const devKey = (state.currentFramingDevice || 'PC').toLowerCase();
    if (preset === 'full') {
        state.currentProductFraming[devKey] = { fit: 'contain', zoom: 1.0, posX: 50, posY: 50 };
    } else if (preset === 'cover') {
        state.currentProductFraming[devKey] = { fit: 'cover', zoom: 1.0, posX: 50, posY: 50 };
    } else if (preset === 'reset') {
        state.currentProductFraming[devKey] = { fit: 'cover', zoom: 1.0, posX: 50, posY: 50 };
    }
    switchFramingDevice(state.currentFramingDevice || 'PC');
}

function updateFramingPreview() {
    const devKey = (state.currentFramingDevice || 'PC').toLowerCase();
    const conf = state.currentProductFraming[devKey] || { fit: 'cover', zoom: 1.0, posX: 50, posY: 50 };
    const img = document.getElementById('prevImg');
    if (img) {
        const posX = conf.posX !== undefined ? Number(conf.posX) : 50;
        const posY = conf.posY !== undefined ? Number(conf.posY) : 50;
        const zoom = conf.zoom !== undefined ? Number(conf.zoom) : 1.0;
        const fit = conf.fit || 'cover';

        img.style.objectFit = fit;
        img.style.objectPosition = `${posX}% ${posY}%`;
        const transX = (posX - 50);
        const transY = (posY - 50);
        img.style.transform = `translate(${transX}%, ${transY}%) scale(${zoom})`;
    }
}

function updateLivePreview() {
    const type = document.getElementById('editorType')?.value || 'DETAL';
    const name = document.getElementById('editorName')?.value || 'Nombre del Ítem';
    const unit = document.getElementById('editorUnit')?.value || 'Unidad regular';
    const price = parseFloat(document.getElementById('editorPrice')?.value) || 0;
    const discount = parseFloat(document.getElementById('editorDiscount')?.value) || null;
    const image = document.getElementById('editorImage')?.value || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';

    document.getElementById('prevName').textContent = name;
    document.getElementById('prevUnit').textContent = unit;
    document.getElementById('prevUnitCalc').textContent = unit;
    document.getElementById('prevImg').src = image;

    const badge = document.getElementById('prevTypeBadge');
    if (badge) {
        badge.className = `card-type-badge ${type === 'MERCADO' ? 'mercado' : 'detal'}`;
        badge.textContent = type === 'MERCADO' ? '📦 MERCADO' : '🛍️ DETAL';
    }

    const discountTag = document.getElementById('prevDiscountTag');
    const salePrice = document.getElementById('prevSalePrice');

    if (discount && discount < price) {
        const pct = Math.round(((price - discount) / price) * 100);
        discountTag.textContent = `-${pct}%`;
        discountTag.style.display = 'block';
        salePrice.className = 'card-sale-price discounted';
        salePrice.innerHTML = `$ ${discount.toLocaleString('es-CO')} <span class="card-old-price">$ ${price.toLocaleString('es-CO')}</span>`;
    } else {
        discountTag.style.display = 'none';
        salePrice.className = 'card-sale-price';
        salePrice.textContent = `$ ${price.toLocaleString('es-CO')}`;
    }

    updateFramingPreview();

    // Verificación en vivo de Presupuesto Disponible vs Costo de Compra
    const warnBox = document.getElementById('editorBudgetWarning');
    const msgSpan = document.getElementById('editorBudgetMessage');
    const costInputVal = document.getElementById('editorCostPrice')?.value.trim();
    const liveCost = (costInputVal !== '' && costInputVal !== undefined && costInputVal !== null) ? parseFloat(costInputVal) : 0;
    const liveStock = parseInt(document.getElementById('editorStock')?.value) || 0;

    let deltaUnits = liveStock;
    if (state.editingProductId) {
        const curProd = state.products.find(p => p.id === state.editingProductId);
        const oldUnits = curProd ? (curProd.stock || 0) : 0;
        deltaUnits = Math.max(0, liveStock - oldUnits);
    }

    const availableBudget = (state.budget && state.budget.currentBalance !== undefined && state.budget.currentBalance !== null)
        ? Number(state.budget.currentBalance)
        : 0;

    if (type !== 'MERCADO' && deltaUnits > 0 && liveCost > 0) {
        const requiredCost = deltaUnits * liveCost;
        if (availableBudget < requiredCost) {
            if (warnBox) {
                warnBox.style.display = 'flex';
                if (msgSpan) {
                    msgSpan.innerHTML = `Presupuesto insuficiente. La compra de <strong>${deltaUnits} unds</strong> cuesta <strong>$ ${requiredCost.toLocaleString('es-CO')} COP</strong> y tu presupuesto disponible es de solo <strong>$ ${availableBudget.toLocaleString('es-CO')} COP</strong>. No se permitirá realizar la compra.`;
                }
            }
        } else {
            if (warnBox) warnBox.style.display = 'none';
        }
    } else {
        if (warnBox) warnBox.style.display = 'none';
    }
}

function saveProductFromEditor() {
    const type = document.getElementById('editorType').value;
    const name = document.getElementById('editorName').value.trim();
    const cat = document.getElementById('editorCategory').value;
    const unit = document.getElementById('editorUnit').value.trim();
    const price = parseFloat(document.getElementById('editorPrice').value);
    const discount = parseFloat(document.getElementById('editorDiscount').value) || null;
    const stock = parseInt(document.getElementById('editorStock').value) || 0;
    const image = document.getElementById('editorImage').value.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
    const costInput = document.getElementById('editorCostPrice')?.value.trim();
    let costVal = (costInput !== '' && costInput !== undefined && costInput !== null) ? parseFloat(costInput) : null;

    if (!name || isNaN(price)) {
        showToast('⚠️ Por favor completa los campos obligatorios (Nombre y Precio Venta).', 'warning', '⚠️');
        return;
    }

    // Regla de negocio: Precio de adquisición solo aplica y es obligatorio para productos DETAL
    if (type !== 'MERCADO') {
        if (!state.editingProductId) {
            if (costVal === null || isNaN(costVal) || costVal < 0) {
                showToast('⚠️ El Precio de Adquisición es obligatorio para nuevos productos detal y no puede ser negativo.', 'warning', '⚠️');
                return;
            }
        } else {
            if (costVal !== null && (isNaN(costVal) || costVal < 0)) {
                showToast('⚠️ El Precio de Adquisición debe ser un valor numérico no negativo.', 'warning', '⚠️');
                return;
            }
        }
    }

    let bundleItems = [];
    let calculatedBundleCost = 0;
    if (type === 'MERCADO') {
        const checks = document.querySelectorAll('.mercado-bundle-check:checked');
        checks.forEach(chk => {
            const pId = chk.getAttribute('data-id');
            const qtyInput = document.querySelector(`.mercado-bundle-qty[data-id="${pId}"]`);
            const qty = parseInt(qtyInput?.value || 1);
            bundleItems.push({ productId: pId, quantity: qty });

            const comp = (state.products || []).find(prod => prod.id === pId);
            const compCost = Number(comp?.costPrice) || 0;
            calculatedBundleCost += compCost * qty;
        });

        if (bundleItems.length === 0) {
            showToast('⚠️ Debes seleccionar al menos un producto detal para armar este mercado.', 'warning', '📦');
            return;
        }

        // El costo de adquisición del mercado se deriva automáticamente de los productos detal ya adquiridos
        costVal = calculatedBundleCost;
    }

    let pct = null;
    if (discount && discount < price) {
        pct = `-${Math.round(((price - discount) / price) * 100)}%`;
    }

    const framingPc = state.currentProductFraming.pc || { fit: 'cover', zoom: 1.0, posX: 50, posY: 50 };
    const framingMobile = state.currentProductFraming.mobile || { fit: 'cover', zoom: 1.0, posX: 50, posY: 50 };

    if (state.editingProductId) {
        const existingIndex = state.products.findIndex(p => p.id === state.editingProductId);
        if (existingIndex !== -1) {
            const oldProd = state.products[existingIndex];
            const oldStock = oldProd.stock || 0;
            const deltaStock = stock - oldStock;
            let finalCostPrice = (costVal !== null) ? costVal : oldProd.costPrice;

            // Si se incrementó el stock físico y tiene costo de adquisición, registrar compra automática con costo ponderado (solo para productos DETAL)
            if (type !== 'MERCADO' && deltaStock > 0 && costVal && costVal > 0) {
                const totalCost = deltaStock * costVal;
                const availableBudget = (state.budget && state.budget.currentBalance !== undefined && state.budget.currentBalance !== null)
                    ? Number(state.budget.currentBalance)
                    : 0;

                if (availableBudget < totalCost) {
                    showToast(`⚠️ Presupuesto insuficiente. Saldo disponible: $ ${availableBudget.toLocaleString('es-CO')} COP | Costo compra: $ ${totalCost.toLocaleString('es-CO')} COP`, 'warning', '💰');
                    const warnBox = document.getElementById('editorBudgetWarning');
                    if (warnBox) {
                        warnBox.style.display = 'flex';
                        warnBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }

                const oldTotalValue = oldStock * (oldProd.costPrice || costVal);
                const newTotalValue = oldTotalValue + totalCost;
                finalCostPrice = Math.round((newTotalValue / stock) * 100) / 100;

                // 1. Descontar del presupuesto
                if (!state.budget) {
                    state.budget = { initialBudget: 0, currentBalance: 0, totalPurchases: 0, totalRecoveredCosts: 0, totalManualInjections: 0, isInitialized: false };
                }
                state.budget.currentBalance -= totalCost;
                state.budget.totalPurchases += totalCost;

                // 2. Registrar compra a proveedor
                const purRecord = {
                    id: 'pur-' + Date.now(),
                    productId: oldProd.id,
                    productName: name,
                    productSku: oldProd.sku,
                    previousStock: oldStock,
                    previousUnitCost: oldProd.costPrice || 0,
                    quantity: deltaStock,
                    purchaseUnitCost: costVal,
                    totalCost: totalCost,
                    newWeightedAverageCost: finalCostPrice,
                    newStock: stock,
                    supplierName: 'Reposición de Mercancía',
                    notes: `Reposición de stock (+${deltaStock} unds) al editar producto`,
                    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
                };
                if (!state.supplierPurchases) state.supplierPurchases = [];
                state.supplierPurchases.unshift(purRecord);

                // 3. Registrar transacción de presupuesto
                const newTx = {
                    id: 'tx-pur-' + Date.now(),
                    type: 'SUPPLIER_PURCHASE',
                    amount: -totalCost,
                    description: `Reposición de ${deltaStock} unds de "${name}"`,
                    referenceId: 'PUR-' + Date.now().toString().slice(-4),
                    balanceAfter: state.budget.currentBalance,
                    registeredBy: 'Sistema Merkostore (Reposición)',
                    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
                };
                if (!state.budgetTransactions) state.budgetTransactions = [];
                state.budgetTransactions.unshift(newTx);

                Storage.set('store_budget', state.budget);
                Storage.set('supplier_purchases', state.supplierPurchases);
                Storage.set('budget_transactions', state.budgetTransactions);
            }

            state.products[existingIndex] = {
                ...oldProd,
                type: type,
                categoryId: cat,
                name: name,
                unitCalc: unit,
                price: price,
                costPrice: finalCostPrice,
                discountPrice: discount,
                discountPercent: pct,
                stock: stock,
                imageUrl: image,
                bundleItems: bundleItems,
                imageFitPc: framingPc.fit,
                imageZoomPc: framingPc.zoom,
                imagePosX_Pc: framingPc.posX,
                imagePosY_Pc: framingPc.posY,
                imageFitMobile: framingMobile.fit,
                imageZoomMobile: framingMobile.zoom,
                imagePosX_Mobile: framingMobile.posX,
                imagePosY_Mobile: framingMobile.posY
            };

            // Sincronizar actualización con backend en segundo plano
            try {
                if (typeof API !== 'undefined' && API.getToken && API.getToken()) {
                    API.put(`/api/v1/admin/products/${state.editingProductId}`, {
                        storeId: 'default-store',
                        categoryId: cat,
                        sku: oldProd.sku,
                        name: name,
                        price: price,
                        costPrice: finalCostPrice,
                        discountPrice: discount,
                        unit: unit,
                        stock: stock,
                        imageUrl: image,
                        isAvailable: oldProd.isAvailable !== false
                    }).catch(e => console.warn('Sync PUT backend warning:', e));
                }
            } catch (e) {}

            showToast(`✅ ¡"${name}" actualizado exitosamente!`, 'success', '💾');
        }
    } else {
        const newProd = {
            id: (type === 'MERCADO' ? 'm-' : 'p-') + Date.now(),
            type: type,
            categoryId: cat,
            sku: (type === 'MERCADO' ? 'MER-' : 'SKU-') + Math.floor(100 + Math.random() * 900),
            name: name,
            unitCalc: unit,
            costPrice: costVal,
            price: price,
            discountPrice: discount,
            discountPercent: pct,
            stock: stock,
            imageUrl: image,
            isAvailable: true,
            bundleItems: bundleItems,
            imageFitPc: framingPc.fit,
            imageZoomPc: framingPc.zoom,
            imagePosX_Pc: framingPc.posX,
            imagePosY_Pc: framingPc.posY,
            imageFitMobile: framingMobile.fit,
            imageZoomMobile: framingMobile.zoom,
            imagePosX_Mobile: framingMobile.posX,
            imagePosY_Mobile: framingMobile.posY
        };

        // Si se crea con inventario inicial > 0 y costo de adquisición > 0, registrar compra automática y descontar de presupuesto (solo para productos DETAL)
        if (type !== 'MERCADO' && stock > 0 && costVal && costVal > 0) {
            const totalCost = stock * costVal;
            const availableBudget = (state.budget && state.budget.currentBalance !== undefined && state.budget.currentBalance !== null)
                ? Number(state.budget.currentBalance)
                : 0;

            if (availableBudget < totalCost) {
                showToast(`⚠️ Presupuesto insuficiente. Saldo disponible: $ ${availableBudget.toLocaleString('es-CO')} COP | Costo compra: $ ${totalCost.toLocaleString('es-CO')} COP`, 'warning', '💰');
                const warnBox = document.getElementById('editorBudgetWarning');
                if (warnBox) {
                    warnBox.style.display = 'flex';
                    warnBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            if (!state.budget) {
                state.budget = { initialBudget: 0, currentBalance: 0, totalPurchases: 0, totalRecoveredCosts: 0, totalManualInjections: 0, isInitialized: false };
            }
            state.budget.currentBalance -= totalCost;
            state.budget.totalPurchases += totalCost;

            const purRecord = {
                id: 'pur-' + Date.now(),
                productId: newProd.id,
                productName: name,
                productSku: newProd.sku,
                previousStock: 0,
                previousUnitCost: 0,
                quantity: stock,
                purchaseUnitCost: costVal,
                totalCost: totalCost,
                newWeightedAverageCost: costVal,
                newStock: stock,
                supplierName: 'Inventario Inicial',
                notes: `Compra inicial automática al registrar producto (${stock} unds)`,
                createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
            };
            if (!state.supplierPurchases) state.supplierPurchases = [];
            state.supplierPurchases.unshift(purRecord);

            const newTx = {
                id: 'tx-pur-' + Date.now(),
                type: 'SUPPLIER_PURCHASE',
                amount: -totalCost,
                description: `Compra inicial de inventario (${stock} unds) de "${name}"`,
                referenceId: 'PUR-' + Date.now().toString().slice(-4),
                balanceAfter: state.budget.currentBalance,
                registeredBy: 'Sistema Merkostore (Alta de Producto)',
                createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
            };
            if (!state.budgetTransactions) state.budgetTransactions = [];
            state.budgetTransactions.unshift(newTx);

            Storage.set('store_budget', state.budget);
            Storage.set('supplier_purchases', state.supplierPurchases);
            Storage.set('budget_transactions', state.budgetTransactions);
        }

        state.products.unshift(newProd);

        // Sincronizar nuevo producto / combo con backend en segundo plano
        try {
            if (typeof API !== 'undefined' && API.getToken && API.getToken()) {
                API.post('/api/v1/admin/products', {
                    id: newProd.id,
                    storeId: 'default-store',
                    categoryId: cat,
                    sku: newProd.sku,
                    name: name,
                    price: price,
                    costPrice: costVal,
                    discountPrice: discount,
                    unit: unit,
                    stock: stock,
                    imageUrl: image,
                    isAvailable: true
                }).catch(e => console.warn('Sync POST backend warning:', e));
            }
        } catch (e) {}

        showToast(`✅ ¡${type === 'MERCADO' ? 'Mercado Combo' : 'Producto Detal'} guardado exitosamente!`, 'success', '💾');
    }

    Storage.set('products', state.products);
    recalculateMercadoStocks();
    renderProducts();
    renderAdminProductsTable();
    if (typeof renderIoProductInputs === 'function') {
        renderIoProductInputs(true);
    }

    resetProductEditorForm();

    switchAdminSubTab('products');
}

// CATEGORIES MANAGEMENT
function renderAdminCategoriesTable() {
    const tbody = document.getElementById('categoriesAdminTable');
    if (!tbody) return;

    tbody.innerHTML = state.categories.map(c => `
        <tr>
            <td style="font-size:1.4rem;">${c.icon}</td>
            <td><strong style="color:#ffffff;">${c.name}</strong></td>
            <td>
                <div style="display:flex; gap:6px;">
                    <button class="btn-merko-outline" style="padding:4px 10px; font-size:0.75rem;" onclick="editCategory('${c.id}')">✏️ Editar</button>
                    ${c.id !== 'ALL' ? `
                        <button class="btn-merko-outline" style="padding:4px 10px; font-size:0.75rem; color:#ef4444; border-color:#ef4444;" onclick="deleteCategory('${c.id}')" title="Eliminar categoría permanentemente">
                            🗑️ Eliminar
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

const MARKET_EMOJIS = [
    '🌾', '🥛', '🥩', '🍎', '🥦', '🍞', '🧃', '🍺', '🍫', '🧼', 
    '🔴', '📦', '🧀', '🐔', '🐟', '☕', '🧹', '🐶', '🍦', '🧴',
    '🥑', '🍇', '🥕', '🥔', '🍋', '🍿', '🍬', '🧻', '🕯️', '⚡'
];

function renderEmojiPickers() {
    const createPicker = document.getElementById('createEmojiPicker');
    const editPicker = document.getElementById('editEmojiPicker');
    
    const buildGrid = (targetInputId) => MARKET_EMOJIS.map(e => `
        <button type="button" class="emoji-pick-btn" onclick="selectEmojiForInput('${e}', '${targetInputId}')">${e}</button>
    `).join('');

    if (createPicker) createPicker.innerHTML = buildGrid('newCatIcon');
    if (editPicker) editPicker.innerHTML = buildGrid('editCatIcon');
}

function selectEmojiForInput(emoji, inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = emoji;
    }
}

function renderCategoryOptions() {
    const select = document.getElementById('editorCategory');
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = state.categories.map(c => `
        <option value="${c.id}">${c.icon} ${c.name}</option>
    `).join('');
    if (currentVal && state.categories.some(c => c.id === currentVal)) {
        select.value = currentVal;
    }
}

function saveNewCategory() {
    const nameInput = document.getElementById('newCatName');
    const name = nameInput ? nameInput.value.trim() : '';
    const icon = (document.getElementById('newCatIcon').value || '🏷️').trim();
    const color = document.getElementById('newCatColor').value || '#fef3c7';

    if (!name) {
        showToast('⚠️ Escribe el nombre de la categoría', 'warning', '⚠️');
        return;
    }

    const newCat = {
        id: 'cat-' + Date.now(),
        name: name,
        icon: icon,
        bgColor: color
    };

    state.categories.push(newCat);
    Storage.set('categories', state.categories);
    renderCategoryBadges();
    renderAdminCategoriesTable();
    renderCategoryOptions();
    if (nameInput) nameInput.value = '';
    showToast(`✨ Categoría "${name}" creada exitosamente`, 'success', '✨');
}

function editCategory(catId) {
    const cat = state.categories.find(c => c.id === catId);
    if (!cat) return;

    document.getElementById('editCatId').value = cat.id;
    document.getElementById('editCatName').value = cat.name;
    document.getElementById('editCatIcon').value = cat.icon || '🏷️';
    document.getElementById('editCatColor').value = cat.bgColor || '#fef3c7';

    renderEmojiPickers();
    document.getElementById('editCategoryModal').classList.add('active');
}

function closeEditCategoryModal() {
    document.getElementById('editCategoryModal').classList.remove('active');
}

function handleSaveCategoryEdit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('editCatId').value;
    const name = document.getElementById('editCatName').value.trim();
    const icon = (document.getElementById('editCatIcon').value || '🏷️').trim();
    const color = document.getElementById('editCatColor').value || '#fef3c7';

    if (!name) {
        showToast('⚠️ Escribe el nombre de la categoría', 'warning', '⚠️');
        return;
    }

    const cat = state.categories.find(c => c.id === id);
    if (cat) {
        cat.name = name;
        cat.icon = icon;
        cat.bgColor = color;
    }

    Storage.set('categories', state.categories);
    renderCategoryBadges();
    renderAdminCategoriesTable();
    renderCategoryOptions();
    closeEditCategoryModal();
    showToast(`✨ Categoría "${name}" actualizada con éxito`, 'success', '✨');
}

async function toggleCategoryActivation(catId) {
    const cat = state.categories.find(c => c.id === catId);
    if (!cat) return;

    const currentlyActive = cat.isActive !== false;
    const ok = await showMerkoConfirm({
        title: currentlyActive ? 'Inactivar Categoría' : 'Activar Categoría',
        message: currentlyActive 
            ? `¿Deseas inactivar la categoría "${cat.name}"?\n\nLos productos existentes y el registro se preservarán en el sistema.`
            : `¿Deseas activar la categoría "${cat.name}"?`,
        icon: currentlyActive ? '🏷️' : '✅',
        confirmText: currentlyActive ? 'Inactivar' : 'Activar',
        cancelText: 'Cancelar',
        confirmType: currentlyActive ? 'warning' : 'success'
    });
    if (!ok) return;

    cat.isActive = !currentlyActive;
    Storage.set('categories', state.categories);

    try {
        if (API.getToken()) {
            await API.delete(`/api/v1/admin/categories/${catId}`).catch(() => {});
        }
    } catch (e) {}

    renderCategoryBadges();
    renderAdminCategoriesTable();
    renderCategoryOptions();
    showToast(
        cat.isActive ? `✅ Categoría "${cat.name}" activada` : `🚫 Categoría "${cat.name}" inactivada (registro preservado)`,
        cat.isActive ? 'success' : 'warning',
        cat.isActive ? '✅' : '🚫'
    );
}

async function deleteCategory(catId) {
    if (catId === 'ALL') {
        showToast('⚠️ No se puede eliminar la categoría principal del sistema.', 'warning', '⚠️');
        return;
    }
    const cat = state.categories.find(c => c.id === catId);
    if (!cat) return;
    const ok = await showMerkoConfirm({
        title: 'Eliminar Categoría',
        message: `¿Estás seguro de eliminar permanentemente la categoría "${cat.name}"?\n\nEsta acción no se puede deshacer.`,
        icon: '🗑️',
        confirmText: 'Eliminar Categoría',
        cancelText: 'Cancelar',
        confirmType: 'danger'
    });
    if (!ok) return;

    state.categories = state.categories.filter(c => c.id !== catId);
    Storage.set('categories', state.categories);

    try {
        if (API.getToken()) {
            await API.delete(`/api/v1/admin/categories/${catId}`).catch(() => {});
        }
    } catch (e) {}

    renderCategoryBadges();
    renderAdminCategoriesTable();
    renderCategoryOptions();
    showToast(`🗑️ Categoría "${cat.name}" eliminada permanentemente`, 'success', '🗑️');
}

// ==========================================================================
// CONTROL DE PEDIDOS EN PROCESO & DESPACHOS ENGINE
// ==========================================================================

function filterActiveOrdersStatus(status) {
    state.activeOrdersFilterStatus = status;
    const mapping = {
        'ALL': 'btnActiveFilterAll',
        'RECEIVED': 'btnActiveFilterReceived',
        'PREPARING': 'btnActiveFilterPreparing',
        'READY_ON_WAY': 'btnActiveFilterOnWay'
    };
    Object.keys(mapping).forEach(k => {
        const btn = document.getElementById(mapping[k]);
        if (btn) btn.classList.toggle('active', k === status);
    });
    renderActiveOrdersTable();
}

function filterActiveOrdersFulfillment(type) {
    state.activeOrdersFilterFulfillment = type;
    const mapping = {
        'ALL': 'btnActiveDeliveryAll',
        'DELIVERY': 'btnActiveDeliveryOnly',
        'PICKUP': 'btnActivePickupOnly'
    };
    Object.keys(mapping).forEach(k => {
        const btn = document.getElementById(mapping[k]);
        if (btn) btn.classList.toggle('active', k === type);
    });
    renderActiveOrdersTable();
}

function filterActiveOrdersSearch(query) {
    state.activeOrdersSearchQuery = (query || '').toLowerCase().trim();
    renderActiveOrdersTable();
}

function updateActiveOrdersCountBadge() {
    const activeCount = state.orders.filter(o => ['RECEIVED', 'PREPARING', 'READY', 'ON_WAY'].includes(o.status)).length;
    const badge = document.getElementById('activeOrdersTabBadge');
    if (badge) {
        badge.textContent = activeCount;
        badge.style.display = activeCount > 0 ? 'inline-block' : 'none';
    }
}

function renderActiveOrdersTable() {
    updateActiveOrdersCountBadge();
    updateDashboardKPIs();
    const container = document.getElementById('activeOrdersCardsContainer');
    if (!container) return;

    const allActive = state.orders.filter(o => ['RECEIVED', 'PREPARING', 'READY', 'ON_WAY'].includes(o.status));

    // Update KPI badges in active orders subtab
    const kpiTotal = document.getElementById('activeKpiTotal');
    const kpiRec = document.getElementById('activeKpiReceived');
    const kpiPrep = document.getElementById('activeKpiPreparing');
    const kpiOnWay = document.getElementById('activeKpiOnWay');

    if (kpiTotal) kpiTotal.textContent = allActive.length;
    if (kpiRec) kpiRec.textContent = allActive.filter(o => o.status === 'RECEIVED').length;
    if (kpiPrep) kpiPrep.textContent = allActive.filter(o => o.status === 'PREPARING').length;
    if (kpiOnWay) kpiOnWay.textContent = allActive.filter(o => o.status === 'READY' || o.status === 'ON_WAY').length;

    let filtered = [...allActive];

    // Status filter
    if (state.activeOrdersFilterStatus === 'RECEIVED') {
        filtered = filtered.filter(o => o.status === 'RECEIVED');
    } else if (state.activeOrdersFilterStatus === 'PREPARING') {
        filtered = filtered.filter(o => o.status === 'PREPARING');
    } else if (state.activeOrdersFilterStatus === 'READY_ON_WAY') {
        filtered = filtered.filter(o => o.status === 'READY' || o.status === 'ON_WAY');
    }

    // Fulfillment filter
    if (state.activeOrdersFilterFulfillment !== 'ALL') {
        filtered = filtered.filter(o => (o.fulfillmentType || 'DELIVERY') === state.activeOrdersFilterFulfillment);
    }

    // Search query
    if (state.activeOrdersSearchQuery) {
        const q = state.activeOrdersSearchQuery;
        filtered = filtered.filter(o =>
            (o.orderNumber || '').toLowerCase().includes(q) ||
            (o.customerName || '').toLowerCase().includes(q) ||
            (o.customerPhone || '').toLowerCase().includes(q) ||
            (o.deliveryAddress || '').toLowerCase().includes(q) ||
            (o.items || []).some(it => (it.name || '').toLowerCase().includes(q))
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:45px 20px; background:rgba(255,255,255,0.02); border:1.5px dashed var(--admin-border); border-radius:18px;">
                <div style="font-size:2.5rem; margin-bottom:10px;">🎉</div>
                <h4 style="font-size:1.1rem; font-weight:900; color:#ffffff; margin-bottom:6px;">¡Todo al día! No hay pedidos pendientes con estos filtros</h4>
                <p style="font-size:0.85rem; color:var(--admin-text-muted);">Los nuevos pedidos que ingresen por WhatsApp o la tienda se listarán aquí en tiempo real.</p>
            </div>
        `;
        return;
    }

    const statusBadges = {
        'RECEIVED': '<span class="status-badge-merko status-received" style="animation:waBtnGlow 2s infinite;">🔔 Por Confirmar</span>',
        'PREPARING': '<span class="status-badge-merko status-preparing">👨‍🍳 En Preparación</span>',
        'READY': '<span class="status-badge-merko status-ready">📦 Listo Despacho</span>',
        'ON_WAY': '<span class="status-badge-merko status-onway">🛵 En Camino</span>'
    };

    container.innerHTML = filtered.map(o => {
        const cleanPhone = (o.customerPhone || '').replace(/[^0-9]/g, '');
        const itemsSummary = (o.items || []).map(it => `${it.qty || it.quantity || 1}x ${it.name || it.productName || 'Producto'}`).join(' • ');
        const isDelivery = (o.fulfillmentType || 'DELIVERY') === 'DELIVERY';

        let primaryActionButton = '';
        if (o.status === 'RECEIVED') {
            primaryActionButton = `
                <button class="btn-merko-primary" style="padding:8px 14px; font-size:0.8rem; background:linear-gradient(135deg, #FF6F00, #E65100);" onclick="advanceActiveOrder('${o.id}', 'PREPARING')">
                    👨‍🍳 Confirmar y Preparar
                </button>
            `;
        } else if (o.status === 'PREPARING') {
            primaryActionButton = `
                <button class="btn-merko-primary" style="padding:8px 14px; font-size:0.8rem; background:linear-gradient(135deg, #2563eb, #1d4ed8);" onclick="advanceActiveOrder('${o.id}', 'ON_WAY')">
                    🛵 Despachar (En Camino)
                </button>
            `;
        } else if (o.status === 'READY' || o.status === 'ON_WAY') {
            primaryActionButton = `
                <button class="btn-merko-primary" style="padding:8px 14px; font-size:0.8rem; background:linear-gradient(135deg, #10b981, #059669);" onclick="advanceActiveOrder('${o.id}', 'DELIVERED')">
                    ✅ Marcar como Entregado
                </button>
            `;
        }

        return `
            <div class="active-order-card">
                <div class="active-order-top">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="code-badge-gold" style="font-size:0.9rem; padding:4px 10px;">${o.orderNumber}</span>
                        ${statusBadges[o.status] || ''}
                        <span style="font-size:0.75rem; color:var(--admin-text-muted);">🕒 ${o.createdAt || 'Hoy'}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:0.8rem; font-weight:800; color:${isDelivery ? '#f59e0b' : '#38bdf8'};">
                            ${isDelivery ? '🛵 Domicilio' : '🏬 Recogida en Local'}
                        </span>
                        <span style="font-size:1.05rem; font-weight:900; color:#10b981; margin-left:8px;">
                            $ ${(o.total || 0).toLocaleString('es-CO')} COP
                        </span>
                    </div>
                </div>

                <div class="active-order-body">
                    <div>
                        <div style="font-weight:900; color:#ffffff; font-size:0.95rem; margin-bottom:2px;">
                            👤 ${o.customerName || 'Cliente'}
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                            <span style="font-size:0.8rem; color:var(--admin-text-muted);">📞 ${o.customerPhone || 'Sin teléfono'}</span>
                            ${cleanPhone ? `
                                <a href="https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(o.customerName || '')},%20te%20escribimos%20de%20Merkostore%20sobre%20tu%20pedido%20${o.orderNumber}" target="_blank" style="text-decoration:none; background:rgba(37,211,102,0.18); color:#25d366; font-size:0.72rem; font-weight:800; padding:2px 8px; border-radius:12px; border:1px solid rgba(37,211,102,0.35);">
                                    💬 WhatsApp
                                </a>
                            ` : ''}
                        </div>
                        ${isDelivery && o.deliveryAddress ? `
                            <div style="font-size:0.8rem; color:#fde68a;">
                                📍 ${o.deliveryAddress}
                            </div>
                        ` : ''}
                    </div>

                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:10px 12px;">
                        <div style="font-size:0.72rem; font-weight:800; color:var(--brand-primary); text-transform:uppercase; margin-bottom:3px;">
                            🛒 Ítems (${(o.items || []).length}):
                        </div>
                        <div style="font-size:0.82rem; color:#e2e8f0; line-height:1.35; max-height:48px; overflow-y:auto;">
                            ${itemsSummary || 'Sin productos'}
                        </div>
                    </div>

                    <div class="active-order-actions">
                        ${primaryActionButton}
                        <button class="btn-merko-outline" style="padding:8px 12px; font-size:0.78rem;" onclick="openOrderDetailModal('${o.id}')">
                            📄 Detalle
                        </button>
                        <button class="btn-merko-outline" style="padding:8px 10px; font-size:0.78rem; color:#ef4444; border-color:rgba(239,68,68,0.4);" onclick="advanceActiveOrder('${o.id}', 'CANCELLED')" title="Cancelar Pedido">
                            ✕ Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function advanceActiveOrder(orderId, newStatus) {
    const o = state.orders.find(ord => ord.id === orderId);
    if (!o) return;

    try {
        if (API.getToken()) {
            await API.patch(`/api/v1/admin/orders/${orderId}/status`, { status: newStatus }).catch(() => null);
        }
        o.status = newStatus;
        if (newStatus === 'DELIVERED') {
            o.paymentStatus = 'PAID';
            if (typeof recordSalesCostRecovery === 'function') {
                recordSalesCostRecovery(o);
            }
            showToast(`✅ Pedido ${o.orderNumber} completado y archivado al Historial`, 'success', '✅');
        } else if (newStatus === 'CANCELLED') {
            if (typeof revertSalesCostRecovery === 'function') {
                revertSalesCostRecovery(o);
            }
            showToast(`❌ Pedido ${o.orderNumber} cancelado y archivado al Historial`, 'info', '❌');
        } else {
            const labels = { PREPARING: 'En Preparación', ON_WAY: 'En Camino', READY: 'Listo Despacho' };
            showToast(`📦 Pedido ${o.orderNumber} pasó a: ${labels[newStatus] || newStatus}`, 'success', '📦');
        }

        Storage.set('orders', state.orders);
        renderActiveOrdersTable();
        renderHistorialUnificadoTable();
        updateDashboardKPIs();
        renderDashboardContent();
    } catch (e) {
        showToast(`❌ Error al actualizar estado: ${e.message}`, 'error', '❌');
    }
}

// ==========================================================================
// CONTROL DE PEDIDOS & HISTORIAL UNIFICADO ENGINE (MATCHING IMAGE 1 & 2)
// ==========================================================================

function filterHistorialTipo(tipo) {
    state.historialTypeFilter = tipo;
    ['All', 'Productos', 'Mercados'].forEach(t => {
        const btn = document.getElementById('btnFilterTipo' + t);
        if (btn) {
            const matches = (t === 'All' && tipo === 'ALL') || (t === 'Productos' && tipo === 'DETAL') || (t === 'Mercados' && tipo === 'MERCADO');
            btn.classList.toggle('active', matches);
        }
    });
    renderHistorialUnificadoTable();
}

function filterPeriod(period) {
    state.historialPeriodFilter = period;
    const periods = ['All', 'Today', 'Yesterday', 'Week', 'Month', '30Days'];
    periods.forEach(p => {
        const btn = document.getElementById('btnPeriod' + p);
        if (btn) btn.classList.toggle('active', p.toUpperCase() === period);
    });
    renderHistorialUnificadoTable();
}

function filterHistorialTable() {
    state.historialSearchQuery = document.getElementById('historialSearchInput')?.value.toLowerCase() || '';
    state.historialStatusFilter = document.getElementById('historialStatusSelect')?.value || 'ALL';
    renderHistorialUnificadoTable();
}

function renderHistorialUnificadoTable() {
    updateActiveOrdersCountBadge();
    updateDashboardKPIs();
    const tbody = document.getElementById('historialUnificadoTableBody');
    if (!tbody) return;

    // Por defecto el Historial muestra pedidos cerrados (DELIVERED y CANCELLED)
    let filtered = state.orders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');

    // Filter by Tipo (if order contains product or mercado)
    if (state.historialTypeFilter !== 'ALL') {
        filtered = filtered.filter(o => o.items.some(it => it.type === state.historialTypeFilter));
    }

    // Filter by Status (si el usuario elige un filtro específico en el selector)
    if (state.historialStatusFilter !== 'ALL') {
        if (state.historialStatusFilter === 'ALL_INCLUDING_ACTIVE') {
            filtered = [...state.orders];
        } else {
            filtered = state.orders.filter(o => o.status === state.historialStatusFilter);
        }
    }

    // Filter by Search Query
    if (state.historialSearchQuery) {
        const q = state.historialSearchQuery;
        filtered = filtered.filter(o => 
            (o.orderNumber || '').toLowerCase().includes(q) ||
            (o.customerName || '').toLowerCase().includes(q) ||
            (o.customerPhone || '').toLowerCase().includes(q) ||
            (o.items || []).some(it => (it.name || it.productName || '').toLowerCase().includes(q))
        );
    }

    // KPI Metrics calculation (Únicamente productos y registros activos)
    const activeProductMap = new Map();
    (state.products || []).forEach(p => {
        const isActive = p.isAvailable !== false;
        activeProductMap.set(p.id, isActive);
        if (p.name) activeProductMap.set(p.name.toLowerCase(), isActive);
    });

    let activeHistorySales = 0;
    let activeConfirmedCount = 0;
    let activeTotalCount = 0;

    state.orders.forEach(o => {
        let orderActiveSum = 0;
        let hasActiveItem = false;
        (o.items || []).forEach(it => {
            const isProdActive = (activeProductMap.get(it.productId) !== false) && (!it.name || activeProductMap.get(it.name.toLowerCase()) !== false);
            if (isProdActive) {
                hasActiveItem = true;
                const unitPrice = Number(it.unitPrice || it.price) || 0;
                const qty = Number(it.qty || it.quantity) || 1;
                orderActiveSum += (Number(it.subtotal) > 0) ? Number(it.subtotal) : (unitPrice * qty);
            }
        });
        if (hasActiveItem && o.status !== 'CANCELLED') {
            activeHistorySales += orderActiveSum;
            activeTotalCount++;
            if (o.status === 'DELIVERED' || o.paymentStatus === 'PAID') {
                activeConfirmedCount++;
            }
        }
    });

    const totalCount = state.orders.length;
    document.getElementById('histKpiRegistros').textContent = activeTotalCount;
    document.getElementById('histKpiConfirmadas').textContent = activeConfirmedCount;
    document.getElementById('histKpiTotal').textContent = `$ ${Math.round(activeHistorySales).toLocaleString('es-CO')}`;
    document.getElementById('histKpiShowing').textContent = `${filtered.length} de ${totalCount}`;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:32px; color:#a1a1aa;">
                    No hay registros de pedidos o compras para los filtros seleccionados.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(o => {
        // Verificar si algún producto de esta orden está inactivo actualmente
        const inactiveItemsInOrder = (o.items || []).filter(it => {
            const prod = (state.products || []).find(p => p.id === it.productId || (it.productId && p.id && String(p.id).toLowerCase() === String(it.productId).toLowerCase()) || (p.name && it.name && p.name.toLowerCase() === it.name.toLowerCase()));
            return prod ? prod.isAvailable === false : false;
        });
        const hasInactiveProduct = inactiveItemsInOrder.length > 0;

        const itemsListText = (o.items || []).map(it => {
            const prod = (state.products || []).find(p => p.id === it.productId || (it.productId && p.id && String(p.id).toLowerCase() === String(it.productId).toLowerCase()) || (p.name && it.name && p.name.toLowerCase() === it.name.toLowerCase()));
            const isItInactive = prod ? prod.isAvailable === false : false;
            return isItInactive 
                ? `<span style="color:#f87171; text-decoration:line-through;" title="Producto inactivo">${it.qty || it.quantity || 1}x ${it.name || it.productName || 'Producto'}</span> <span style="font-size:0.6rem; color:#ef4444; background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.4); padding:1px 4px; border-radius:3px; font-weight:800;">🚫 INACTIVO</span>`
                : `${it.qty || it.quantity || 1}x ${it.name || it.productName || 'Producto'}`;
        }).join(', ');

        const isPaid = o.paymentStatus === 'PAID';
        
        return `
            <tr style="${hasInactiveProduct ? 'opacity:0.68; background:rgba(239, 68, 68, 0.05); border-left:3px solid #ef4444;' : ''}">
                <td>
                    <div class="code-badge-gold">${o.orderNumber}</div>
                    <div class="client-name-bold">${o.customerName || 'Cliente'}</div>
                    <div class="client-phone-sub">${o.customerPhone || 'Sin teléfono'}</div>
                    ${hasInactiveProduct ? `<div style="margin-top:4px;"><span style="font-size:0.62rem; color:#ef4444; background:rgba(239,68,68,0.18); border:1px solid rgba(239,68,68,0.35); padding:2px 6px; border-radius:4px; font-weight:800; display:inline-block;">🚫 REGISTRO CON PRODUCTO INACTIVO</span></div>` : ''}
                </td>
                <td style="max-width:280px;">
                    <div class="items-solicitud-text">${itemsListText || 'Sin ítems'}</div>
                    <div style="margin-top:4px;">
                        ${(o.items || []).map(it => `
                            <span class="card-type-badge ${it.type === 'MERCADO' ? 'mercado' : 'detal'}" style="position:static; font-size:0.6rem; padding:1px 6px;">
                                ${it.type === 'MERCADO' ? 'MERCADO' : 'PRODUCTO'}
                            </span>
                        `).join(' ')}
                    </div>
                </td>
                <td>
                    <div style="font-size:0.8rem; font-weight:700;">Registro: ${o.createdAt || o.dateOnly || 'Hoy'}</div>
                    <div style="font-size:0.75rem; color:#f59e0b; margin-top:2px;">
                        ${o.fulfillmentType === 'DELIVERY' ? '🚚 Envío a domicilio' : '🏬 Recogida local'}
                    </div>
                </td>
                <td style="font-weight:900; color:#10b981; font-size:0.95rem;">
                    $ ${(o.total || 0).toLocaleString('es-CO')}
                </td>
                <td>
                    <div class="method-tag-pill">
                        💳 ${o.paymentMethod || 'Transferencia'}
                    </div>
                    <div>
                        <span class="status-tag-pill ${isPaid ? 'delivered' : 'preparing'}">
                            ${isPaid ? '✓ PAGADO' : (o.status === 'DELIVERED' ? '✓ ENTREGADO' : (o.status === 'CANCELLED' ? '✕ CANCELADO' : 'PENDIENTE'))}
                        </span>
                    </div>
                </td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn-merko-outline" style="padding:6px 12px; font-size:0.75rem; border-color:#f59e0b; color:#f59e0b;" onclick="openOrderDetailModal('${o.id}')">
                            👁️ Detalle
                        </button>
                        <button class="btn-merko-outline" style="padding:6px 12px; font-size:0.75rem; color:#ef4444; border-color:#ef4444;" onclick="deleteOrder('${o.id}')" title="Eliminar permanentemente del historial">
                            🗑️ Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ORDER DETAIL MODAL
function openOrderDetailModal(orderId) {
    const o = state.orders.find(ord => ord.id === orderId);
    if (!o) return;

    const overlay = document.getElementById('orderDetailModalOverlay');
    const content = document.getElementById('orderDetailModalContent');

    const isDelivered = o.status === 'DELIVERED';
    const isPaid = o.paymentStatus === 'PAID';

    // Steps 1 to 5 mapping
    const steps = [
        { key: 'RECEIVED', num: '1', label: '1. Recibido', icon: '🔔' },
        { key: 'PREPARING', num: '2', label: '2. En prep.', icon: '👨‍🍳' },
        { key: 'READY', num: '3', label: '3. Listo despacho', icon: '📦' },
        { key: 'ON_WAY', num: '4', label: '4. En camino', icon: '🛵' },
        { key: 'DELIVERED', num: '5', label: '5. Entregado', icon: '✅' }
    ];

    const currentStepIndex = steps.findIndex(s => s.key === o.status);

    content.innerHTML = `
        <!-- Modal Header -->
        <div class="order-detail-header">
            <div>
                <div class="order-code-title">
                    <span>${o.orderNumber}</span>
                    <span class="status-tag-pill ${isDelivered ? 'delivered' : 'preparing'}" style="font-size:0.75rem;">
                        ${o.status === 'DELIVERED' ? 'Entregado' : (o.status === 'CANCELLED' ? 'Cancelado' : 'En proceso')}
                    </span>
                </div>
                <div class="order-client-sub">
                    👤 ${o.customerName || 'Cliente'} • 📞 ${o.customerPhone || 'Sin teléfono'}
                </div>
            </div>
            <button class="order-close-btn" onclick="closeOrderDetailModal()" title="Cerrar modal">✕</button>
        </div>

        <!-- Progreso del Pedido Stepper -->
        <div class="order-progreso-box">
            <div class="progreso-box-title">CAMBIAR O PROGRESAR ESTADO DEL PEDIDO</div>
            <div class="progreso-steps-grid">
                ${steps.map((s, idx) => {
                    const isDone = idx <= currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    return `
                        <div class="progreso-step-pill ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}" onclick="setOrderStatus('${o.id}', '${s.key}')">
                            <span class="step-icon">${s.icon}</span>
                            <span>${s.label}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- Fecha y Datos de Entrega Box -->
        <div class="order-info-card">
            <div class="info-grid-2col">
                <div>
                    <div class="info-label">Fecha y Hora de Registro</div>
                    <div class="info-val">${o.createdAt || 'Hoy'}</div>
                </div>
                <div>
                    <div class="info-label">Teléfono WhatsApp de Contacto</div>
                    <div class="info-val">${o.customerPhone || 'Sin teléfono'}</div>
                </div>
            </div>

            <div>
                <div class="info-label">Modalidad de Entrega</div>
                <div class="info-val" style="color:#f59e0b; font-size:0.86rem; margin-top:2px;">
                    ${o.fulfillmentType === 'PICKUP' ? '🏬 Recogida en Local' : '🛵 Envío a Domicilio'}
                </div>
            </div>

            <div>
                <div class="info-label">Dirección Exacta de Entrega</div>
                <div class="info-val" style="color:#ffffff; font-size:0.88rem; margin-top:2px;">
                    📍 ${o.deliveryAddress || 'No especificada'}
                </div>
            </div>

            <div>
                <div class="info-label">Indicaciones o Notas de Entrega</div>
                <div class="info-val" style="color:#38bdf8; font-size:0.86rem; margin-top:2px; font-weight:700;">
                    📝 ${o.notes || o.customerNotes || 'Sin notas adicionales'}
                </div>
            </div>
        </div>

        <!-- Productos Solicitados Section -->
        <div style="display:flex; flex-direction:column; gap:10px;">
            <div style="font-size:0.75rem; font-weight:900; color:#d4d4d8; text-transform:uppercase;">PRODUCTOS SOLICITADOS (${(o.items || []).length} ÍTEMS)</div>
            <div class="items-solicitados-list">
                ${(o.items || []).map(it => `
                    <div class="order-item-detail-card">
                        <div class="item-thumb-name">
                            <img src="${it.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}" class="item-thumb-img">
                            <div>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <strong style="color:#fff; font-size:0.9rem;">${it.name || it.productName || 'Producto'}</strong>
                                    <span class="card-type-badge ${it.type === 'MERCADO' ? 'mercado' : 'detal'}" style="position:static; font-size:0.6rem; padding:1px 6px;">
                                        ${it.type === 'MERCADO' ? 'MERCADO' : 'PRODUCTO'}
                                    </span>
                                </div>
                                <div style="font-size:0.75rem; color:#a1a1aa; margin-top:2px;">
                                    Cantidad: ${it.qty || it.quantity || 1} • $ ${(it.unitPrice || 0).toLocaleString('es-CO')} c/u
                                </div>
                            </div>
                        </div>
                        <div style="font-weight:900; color:#10b981; font-size:0.95rem;">
                            $ ${(it.subtotal || 0).toLocaleString('es-CO')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Payment Details Summary Box -->
        <div class="payment-summary-box">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
                <span style="color:#a1a1aa;">Método de Pago Seleccionado:</span>
                <strong style="color:#fff;">${o.paymentMethod || 'Transferencia WhatsApp'}</strong>
            </div>
            ${o.cashAmount ? `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; border-top:1px solid #27272a; padding-top:8px;">
                    <span style="color:#a1a1aa;">Paga en Efectivo con:</span>
                    <strong style="color:#4ade80;">$ ${o.cashAmount.toLocaleString('es-CO')} (Cambio: $ ${(o.cashAmount - (o.total || 0)).toLocaleString('es-CO')})</strong>
                </div>
            ` : ''}
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; border-top:1px solid #27272a; padding-top:8px;">
                <span style="color:#a1a1aa;">Estado del Pedido:</span>
                <span class="status-tag-pill ${isPaid ? 'delivered' : 'preparing'}">
                    ${o.status}
                </span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:1.05rem; font-weight:900; border-top:1px dashed #27272a; padding-top:10px; margin-top:4px;">
                <span>Total a Cobrar:</span>
                <span style="color:#f59e0b; font-size:1.25rem;">$ ${(o.total || 0).toLocaleString('es-CO')} COP</span>
            </div>
        </div>

        <!-- Bottom Action Buttons: WhatsApp Verification & Close -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; flex-wrap:wrap; gap:10px;">
            <button class="btn-merko-outline" style="padding:10px 18px; font-size:0.85rem;" onclick="closeOrderDetailModal()">
                ✕ Cerrar Ventana
            </button>
            <button class="btn-merko-primary" style="background:#25D366; border-color:#25D366; color:#ffffff; padding:10px 20px; font-weight:800; display:inline-flex; align-items:center; gap:8px;" onclick="contactCustomerWhatsApp('${o.customerPhone}', '${o.orderNumber}')">
                <span>💬 Verificar Comprobante por WhatsApp</span>
            </button>
        </div>
    `;

    overlay.classList.add('active');
}

function closeOrderDetailModal() {
    document.getElementById('orderDetailModalOverlay').classList.remove('active');
}

async function setOrderStatus(orderId, newStatus) {
    const o = state.orders.find(ord => ord.id === orderId);
    if (!o) return;

    try {
        const response = await API.patch(`/api/v1/admin/orders/${orderId}/status`, { status: newStatus });
        if (response && response.data) {
            o.status = response.data.orderStatus || newStatus;
            o.paymentStatus = response.data.paymentStatus || o.paymentStatus;
        } else {
            o.status = newStatus;
        }

        const statusLabels = { RECEIVED: '1. Recibido', PREPARING: '2. En Preparación', READY: '3. Listo Envío', ON_WAY: '4. En Camino', DELIVERED: '5. Entregado', CANCELLED: 'Cancelado' };

        renderHistorialUnificadoTable();
        renderActiveOrdersTable();
        openOrderDetailModal(orderId);
        showToast(`📦 Estado de pedido ${o.orderNumber} cambiado a: ${statusLabels[newStatus] || newStatus}`, 'success', '📦');
    } catch (e) {
        showToast(`❌ Error al actualizar estado del pedido: ${e.message}`, 'error', '❌');
    }
}

function contactCustomerWhatsApp(phone, orderCode) {
    const num = phone ? phone.replace(/[^0-9]/g, '') : '573001234567';
    const msg = `¡Hola! Te contactamos de MERKOSTORE sobre tu pedido *${orderCode}*. ¿Nos podrías confirmar tu pedido o enviar tu comprobante de pago?`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
}

async function deleteOrder(orderId) {
    const o = state.orders.find(ord => ord.id === orderId);
    if (!o) return;
    const ok = await showMerkoConfirm({
        title: 'Eliminar Pedido',
        message: `¿Estás seguro de eliminar permanentemente el pedido ${o.orderNumber || ''} del historial?\n\nEsta acción no se puede deshacer.`,
        icon: '📜',
        confirmText: 'Eliminar Pedido',
        cancelText: 'Cancelar',
        confirmType: 'danger'
    });
    if (!ok) return;

    state.orders = state.orders.filter(ord => ord.id !== orderId);
    Storage.set('orders', state.orders);

    try {
        if (API.getToken()) {
            await API.delete(`/api/v1/admin/orders/${orderId}`).catch(() => {});
        }
    } catch (e) {}

    renderHistorialUnificadoTable();
    updateDashboardKPIs();
    showToast(`🗑️ Pedido ${o.orderNumber || ''} eliminado permanentemente del historial`, 'success', '🗑️');
}

async function saveStoreConfig() {
    state.storeConfig.storeName = 'MERKOSTORE';
    const waInput = document.getElementById('cfgWhatsappPhone');
    if (waInput) state.storeConfig.whatsappPhone = waInput.value;
    const feeInput = document.getElementById('cfgDeliveryFee');
    if (feeInput) state.storeConfig.deliveryFee = parseFloat(feeInput.value);
    const minInput = document.getElementById('cfgMinOrder');
    if (minInput) state.storeConfig.minimumOrder = parseFloat(minInput.value);
    const addrInput = document.getElementById('cfgAddress');
    if (addrInput) state.storeConfig.address = addrInput.value;
    const nequiInput = document.getElementById('cfgNequiAccount');
    if (nequiInput) state.storeConfig.nequiAccount = nequiInput.value;
    const daviplataInput = document.getElementById('cfgDaviplataAccount');
    if (daviplataInput) state.storeConfig.daviplataAccount = daviplataInput.value;
    const bancoInput = document.getElementById('cfgBancolombiaAccount');
    if (bancoInput) state.storeConfig.bancolombiaAccount = bancoInput.value;
    const holderInput = document.getElementById('cfgAccountHolder');
    if (holderInput) state.storeConfig.accountHolder = holderInput.value;

    Storage.set('storeConfig', state.storeConfig);

    try {
        await API.put('/api/v1/admin/store-config', {
            storeId: 'default-store',
            storeName: 'MERKOSTORE',
            whatsappPhone: state.storeConfig.whatsappPhone,
            deliveryFee: state.storeConfig.deliveryFee,
            minimumOrder: state.storeConfig.minimumOrder,
            address: state.storeConfig.address,
            nequiAccount: state.storeConfig.nequiAccount,
            daviplataAccount: state.storeConfig.daviplataAccount,
            bancolombiaAccount: state.storeConfig.bancolombiaAccount,
            accountHolder: state.storeConfig.accountHolder,
            isStoreOpen: true
        });
        syncStoreConfigUI();
        showToast('⚙️ ¡Configuración del negocio guardada exitosamente!', 'success', '⚙️');
    } catch (e) {
        syncStoreConfigUI();
        showToast('⚙️ Configuración guardada localmente.', 'success', '⚙️');
    }
}

function openStoreWhatsApp() {
    const num = state.storeConfig.whatsappPhone || '573001234567';
    const msg = '¡Hola! Deseo realizar una consulta o hacer un pedido en Merkostore.';
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
}

function syncStoreConfigUI() {
    state.storeConfig.storeName = 'MERKOSTORE';
    const storeNameEl = document.getElementById('navStoreName');
    if (storeNameEl) storeNameEl.textContent = 'MERKOSTORE';

    const dispNequi = document.getElementById('dispNequiNumber');
    if (dispNequi) dispNequi.textContent = state.storeConfig.nequiAccount || '3001234567';

    const dispDaviplata = document.getElementById('dispDaviplataNumber');
    if (dispDaviplata) dispDaviplata.textContent = state.storeConfig.daviplataAccount || '3001234567';

    const dispBanco = document.getElementById('dispBancolombiaNumber');
    if (dispBanco) dispBanco.textContent = state.storeConfig.bancolombiaAccount || '123-456789-01';

    const dispHolder = document.getElementById('dispHolderName');
    if (dispHolder) dispHolder.textContent = `Titular: ${state.storeConfig.accountHolder || 'MERKOSTORE S.A.S'}`;

    const cfgNequi = document.getElementById('cfgNequiAccount');
    if (cfgNequi && state.storeConfig.nequiAccount) cfgNequi.value = state.storeConfig.nequiAccount;

    const cfgDaviplata = document.getElementById('cfgDaviplataAccount');
    if (cfgDaviplata && state.storeConfig.daviplataAccount) cfgDaviplata.value = state.storeConfig.daviplataAccount;

    const cfgBanco = document.getElementById('cfgBancolombiaAccount');
    if (cfgBanco && state.storeConfig.bancolombiaAccount) cfgBanco.value = state.storeConfig.bancolombiaAccount;

    const cfgHolder = document.getElementById('cfgAccountHolder');
    if (cfgHolder && state.storeConfig.accountHolder) cfgHolder.value = state.storeConfig.accountHolder;

    const cfgMin = document.getElementById('cfgMinOrder');
    if (cfgMin && state.storeConfig.minimumOrder) cfgMin.value = state.storeConfig.minimumOrder;

    const cfgFee = document.getElementById('cfgDeliveryFee');
    if (cfgFee && state.storeConfig.deliveryFee) cfgFee.value = state.storeConfig.deliveryFee;

    const cfgAddr = document.getElementById('cfgAddress');
    if (cfgAddr && state.storeConfig.address) cfgAddr.value = state.storeConfig.address;

    const cfgWa = document.getElementById('cfgWhatsappPhone');
    if (cfgWa && state.storeConfig.whatsappPhone) cfgWa.value = state.storeConfig.whatsappPhone;

    const topBarPhoneEl = document.getElementById('topBarPhone');
    if (topBarPhoneEl) topBarPhoneEl.textContent = `📲 WhatsApp Tienda: ${state.storeConfig.whatsappPhone}`;

    const footerWaEl = document.getElementById('footerWhatsappLink');
    if (footerWaEl) {
        footerWaEl.href = `https://wa.me/${state.storeConfig.whatsappPhone}`;
        footerWaEl.textContent = `💬 +${state.storeConfig.whatsappPhone}`;
    }

    const feeEl = document.getElementById('lblDeliveryFee');
    if (feeEl) feeEl.textContent = `$ ${(state.storeConfig.deliveryFee || 3000).toLocaleString('es-CO')} COP`;
}

// ==========================================
// ASYNC BACKEND DATA LOADING
// ==========================================
async function loadPublicBackendData() {
    try {
        const catRes = await API.get('/api/v1/public/categories');
        if (catRes && catRes.data && Array.isArray(catRes.data) && catRes.data.length > 0) {
            const fetchedCats = catRes.data.map(c => ({
                id: c.id,
                name: c.name,
                icon: c.icon || '📦',
                bgColor: '#f1f5f9'
            }));
            state.categories = [
                { id: 'ALL', name: '✨ Todos los Productos', icon: '🛒', bgColor: '#fee2e2' },
                ...fetchedCats
            ];
            Storage.set('categories', state.categories);
            renderCategoryBadges();
            renderAdminCategoriesTable();
        }

        const prodRes = await API.get('/api/v1/public/products');
        if (prodRes && prodRes.data && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
            const backendMap = new Map(prodRes.data.map(p => [p.id, p]));
            state.products = state.products.map(localP => {
                const remote = backendMap.get(localP.id);
                if (remote) {
                    return {
                        ...localP,
                        price: remote.price || localP.price,
                        discountPrice: remote.discountPrice !== undefined ? remote.discountPrice : localP.discountPrice,
                        stock: remote.stock !== undefined ? remote.stock : localP.stock
                    };
                }
                return localP;
            });
            Storage.set('products', state.products);
            renderProducts();
            renderAdminProductsTable();
        }

        if (API.getToken()) {
            const cfgRes = await API.get('/api/v1/admin/store-config').catch(() => null);
            if (cfgRes && cfgRes.data) {
                state.storeConfig = {
                    ...state.storeConfig,
                    storeName: 'MERKOSTORE',
                    whatsappPhone: cfgRes.data.whatsappPhone || state.storeConfig.whatsappPhone || '573001234567',
                    address: cfgRes.data.address || state.storeConfig.address || 'Calle 45 # 23 - 10 Barrio El Prado',
                    fulfillmentType: 'DELIVERY',
                    deliveryFee: cfgRes.data.deliveryFee !== undefined ? cfgRes.data.deliveryFee : (state.storeConfig.deliveryFee || 3000),
                    minimumOrder: cfgRes.data.minimumOrder !== undefined ? cfgRes.data.minimumOrder : (state.storeConfig.minimumOrder || 10000),
                    nequiAccount: cfgRes.data.nequiAccount || state.storeConfig.nequiAccount || '3001234567',
                    daviplataAccount: cfgRes.data.daviplataAccount || state.storeConfig.daviplataAccount || '3001234567',
                    bancolombiaAccount: cfgRes.data.bancolombiaAccount || state.storeConfig.bancolombiaAccount || '123-456789-01',
                    accountHolder: cfgRes.data.accountHolder || state.storeConfig.accountHolder || 'MERKOSTORE S.A.S',
                    isStoreOpen: cfgRes.data.isStoreOpen !== false
                };
                Storage.set('storeConfig', state.storeConfig);
                syncStoreConfigUI();
            }
        }
    } catch (e) {
        console.log('Utilizando estado local por defecto:', e);
    }
}

async function loadAdminBackendData() {
    try {
        const [catsRes, prodsRes, ordersRes] = await Promise.allSettled([
            API.get('/api/v1/admin/categories'),
            API.get('/api/v1/admin/products'),
            API.get('/api/v1/admin/orders')
        ]);

        if (catsRes.status === 'fulfilled' && catsRes.value?.data && Array.isArray(catsRes.value.data) && catsRes.value.data.length > 0) {
            const fetched = catsRes.value.data.map(c => ({
                id: c.id,
                name: c.name,
                icon: c.icon || '🏷️',
                bgColor: '#f1f5f9'
            }));
            state.categories = [
                { id: 'ALL', name: '✨ Todos los Productos', icon: '🛒', bgColor: '#fee2e2' },
                ...fetched
            ];
            Storage.set('categories', state.categories);
            renderCategoryBadges();
            renderAdminCategoriesTable();
        }

        if (prodsRes.status === 'fulfilled' && prodsRes.value?.data && Array.isArray(prodsRes.value.data) && prodsRes.value.data.length > 0) {
            const localMap = new Map((state.products || []).map(lp => [String(lp.id), lp]));
            const mergedProducts = prodsRes.value.data.map(p => {
                const local = localMap.get(String(p.id));
                const bundleItems = (local && Array.isArray(local.bundleItems) && local.bundleItems.length > 0)
                    ? local.bundleItems
                    : (p.bundleItems || []);
                const resolvedType = (local && local.type) 
                    ? local.type 
                    : (bundleItems.length > 0 ? 'MERCADO' : 'DETAL');
                return {
                    id: p.id,
                    type: resolvedType,
                    categoryId: (local && local.categoryId) || p.categoryId || 'cat1',
                    sku: p.sku || (local && local.sku) || 'SKU-001',
                    name: (local && local.name) || p.name,
                    unitCalc: (local && local.unitCalc) || (p.unit ? `Unidad por ${p.unit}` : 'Unidad'),
                    costPrice: (local && local.costPrice != null) ? local.costPrice : ((p.costPrice !== undefined && p.costPrice !== null && p.costPrice > 0) ? p.costPrice : null),
                    price: (local && local.price != null) ? local.price : (p.price || 0),
                    discountPrice: (local && local.discountPrice !== undefined) ? local.discountPrice : (p.discountPrice || null),
                    discountPercent: (local && local.discountPercent !== undefined) ? local.discountPercent : (p.discountPrice && p.price ? `-${Math.round((1 - p.discountPrice / p.price) * 100)}%` : null),
                    stock: (local && local.stock !== undefined) ? local.stock : (p.stock !== undefined ? p.stock : 10),
                    imageUrl: (local && local.imageUrl) || p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
                    isAvailable: (local && local.isAvailable !== undefined) ? local.isAvailable : (p.isAvailable !== false),
                    bundleItems: bundleItems,
                    imageFitPc: local?.imageFitPc,
                    imageZoomPc: local?.imageZoomPc,
                    imagePosX_Pc: local?.imagePosX_Pc,
                    imagePosY_Pc: local?.imagePosY_Pc,
                    imageFitMobile: local?.imageFitMobile,
                    imageZoomMobile: local?.imageZoomMobile,
                    imagePosX_Mobile: local?.imagePosX_Mobile,
                    imagePosY_Mobile: local?.imagePosY_Mobile
                };
            });

            // Preservar productos creados localmente que aún no están en backend
            const remoteIds = new Set(prodsRes.value.data.map(p => String(p.id)));
            const localOnly = (state.products || []).filter(lp => !remoteIds.has(String(lp.id)));
            state.products = [...mergedProducts, ...localOnly];

            Storage.set('products', state.products);
            renderProducts();
            renderAdminProductsTable();
        }

        await loadBudgetData();
        let ordersData = ordersRes.status === 'fulfilled' ? ordersRes.value?.data : null;
        if (ordersData && Array.isArray(ordersData) && ordersData.length > 0) {
            state.orders = ordersData.map(o => ({
                id: o.id,
                orderNumber: o.orderNumber || 'PED-000',
                customerName: o.customer ? o.customer.name : 'Cliente',
                customerPhone: o.customer ? o.customer.phone : '',
                deliveryAddress: o.customer ? o.customer.deliveryAddress : '',
                notes: o.customer ? (o.customer.notes || '') : '',
                customerNotes: o.customer ? (o.customer.notes || '') : '',
                fulfillmentType: o.fulfillmentType || 'DELIVERY',
                items: (o.items || []).map(it => ({
                    productId: it.productId,
                    name: it.productName || it.name || (state.products.find(p => p.id === it.productId)?.name || 'Producto'),
                    qty: it.quantity || it.qty || 1,
                    unitPrice: it.unitPrice || 0,
                    subtotal: it.subtotal || 0,
                    type: it.type || (it.productId && it.productId.startsWith('CMB') ? 'MERCADO' : 'DETAL')
                })),
                subtotal: o.subtotal || 0,
                deliveryFee: o.deliveryFee || 0,
                total: o.total || 0,
                paymentMethod: o.paymentMethod || 'WHATSAPP',
                paymentStatus: o.paymentStatus || 'COMPLETED',
                status: o.orderStatus || 'DELIVERED',
                createdAt: o.createdAt ? o.createdAt.toString().slice(0, 16).replace('T', ' ') : ''
            }));
            Storage.set('orders', state.orders);
            renderActiveOrdersTable();
            renderHistorialUnificadoTable();
            updateDashboardKPIs();
        } else {
            renderActiveOrdersTable();
            updateDashboardKPIs();
        }
    } catch (e) {
        console.log('Error al cargar datos administrativos del backend:', e);
        updateDashboardKPIs();
    }
}

async function forceSyncWithDatabase() {
    showToast('⏳ Sincronizando datos con la base de datos MongoDB...', 'info', '🔄');
    await loadAdminBackendData();
    renderProducts();
    renderAdminProductsTable();
    renderHistorialUnificadoTable();
    updateDashboardKPIs();
    showToast('✨ Dashboard y base de datos completamente sincronizados', 'success', '📊');
}
window.forceSyncWithDatabase = forceSyncWithDatabase;

document.addEventListener('DOMContentLoaded', () => {
    loadPublicBackendData();
    const existingToken = API.getToken();
    if (existingToken) {
        state.isAdminLoggedIn = true;
        loadAdminBackendData();
    }
    initChipsSliderEvents();
    renderChatChips(getDynamicSuggestionsFromProducts());
});

/* ==========================================================================
   MERKOBOT IA - LÓGICA DE CONTROLADOR Y CLIENTE FRONT-END
   ========================================================================== */

const chatState = {
    isOpen: false,
    conversationId: null,
    isProcessing: false
};

function toggleChatbotDrawer() {
    if (state.currentView === 'admin') return;
    const container = document.getElementById('chatbotWidgetContainer');
    if (!container) return;

    chatState.isOpen = !chatState.isOpen;
    if (chatState.isOpen) {
        container.classList.add('open');
        setTimeout(() => {
            const input = document.getElementById('chatbotInput');
            if (input) input.focus();
        }, 150);
    } else {
        container.classList.remove('open');
    }
}

function handleChatKeyDown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendUserChatMessage();
    }
}

function sendChatChip(chipText) {
    if (chipText.includes('Ver Carrito') || chipText.includes('Abrir Carrito')) {
        toggleCartDrawer();
        return;
    }
    const input = document.getElementById('chatbotInput');
    if (input) {
        input.value = chipText;
        sendUserChatMessage();
    }
}

async function sendUserChatMessage() {
    const input = document.getElementById('chatbotInput');
    if (!input || chatState.isProcessing) return;

    const rawMessage = input.value.trim();
    if (!rawMessage) return;

    // Limpiar input
    input.value = '';

    // Renderizar mensaje del usuario
    appendChatMessage('user', rawMessage);
    showChatTypingIndicator();
    chatState.isProcessing = true;

    // Detectar si el usuario pide explícitamente agregar un producto al carrito por mensaje
    const lowerRaw = rawMessage.toLowerCase();
    const isAddIntent = /(?:agrega|agregar|añade|añadir|mete|pon|llevar|quiero\s+llevar|dame|comprar|pedir|si\s*,\s*agrega)/i.test(lowerRaw);

    if (isAddIntent) {
        const matchedProd = (state.products || []).find(p => {
            if (p.isAvailable === false) return false;
            const pName = (p.name || '').toLowerCase();
            const words = pName.split(/[\s,.-]+/).filter(w => w.length >= 3 && !['para', 'del', 'con', 'las', 'los', 'unds', '330ml', 'rojo', 'blanca', 'blanco', 'mezcla'].includes(w));
            return words.some(w => lowerRaw.includes(w)) || lowerRaw.includes(pName);
        });

        if (matchedProd) {
            let qty = 1;
            const qtyMatch = lowerRaw.match(/(?:agrega|agregar|añade|añadir|mete|pon|llevar|dame|pedir)\s+(\d+)/i);
            if (qtyMatch && qtyMatch[1]) {
                const parsed = parseInt(qtyMatch[1], 10);
                if (!isNaN(parsed) && parsed > 0) qty = parsed;
            }

            const currentQty = state.cart[matchedProd.id] || 0;
            if (matchedProd.stock !== undefined && (currentQty + qty) > matchedProd.stock) {
                hideChatTypingIndicator();
                appendChatMessage('bot', `⚠️ No podemos agregar esa cantidad. El inventario máximo disponible de **${matchedProd.name}** es de **${matchedProd.stock} unidades**.`, [matchedProd]);
                chatState.isProcessing = false;
                return;
            }

            updateCartQuantity(matchedProd.id, currentQty + qty);
            showToast(`🛒 ${qty > 1 ? qty + 'x ' : ''}"${matchedProd.name}" agregado al carrito desde MerkoBot`, 'success', '🤖');

            hideChatTypingIndicator();
            const totalItemsInCart = Object.values(state.cart).reduce((a, b) => a + b, 0);
            appendChatMessage('bot', `🛒 ¡Listo! He agregado **${qty > 1 ? qty + 'x ' : ''}${matchedProd.name}** a tu carrito de compras.\n\nEn este momento tienes **${totalItemsInCart} producto(s)** en tu pedido.\n\n¿Deseas agregar algo más o quieres ver tu carrito para finalizar la orden?`, [matchedProd]);
            renderChatChips(['🛒 Ver Carrito', '🛵 Domicilios y envíos', '💳 Métodos de pago', '🔥 Ofertas destacadas']);
            chatState.isProcessing = false;
            return;
        }
    }

    try {
        let replyData = null;

        // Construir catálogo y configuración activa en tiempo real
        const payload = {
            message: rawMessage,
            conversationId: chatState.conversationId,
            storeId: 'default-store',
            storeConfig: {
                storeName: 'MERKOSTORE',
                whatsappPhone: state.storeConfig?.whatsappPhone || '573001234567',
                address: state.storeConfig?.address || 'Calle 45 # 23 - 10 Barrio El Prado',
                deliveryFee: state.storeConfig?.deliveryFee || 3000,
                minimumOrder: state.storeConfig?.minimumOrder || 10000,
                isStoreOpen: state.storeConfig?.isStoreOpen !== false
            },
            currentCatalog: (state.products || [])
                .filter(p => p.isAvailable !== false)
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.unitCalc || p.name,
                    price: p.price,
                    discountPrice: p.discountPrice || null,
                    stock: p.stock !== undefined ? p.stock : 10,
                    category: p.categoryId,
                    imageUrl: p.imageUrl,
                    isAvailable: p.isAvailable !== false,
                    unit: p.unitCalc || 'Unidad'
                }))
        };

        // Intentar llamada al backend Spring Boot
        try {
            const res = await API.request('/api/v1/public/chat', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res && res.data) {
                replyData = res.data;
            }
        } catch (apiErr) {
            console.warn('Backend chat no disponible, ejecutando motor local sincronizado:', apiErr);
            replyData = generateClientSideFallbackChat(rawMessage);
        }

        hideChatTypingIndicator();

        if (replyData) {
            if (replyData.conversationId) {
                chatState.conversationId = replyData.conversationId;
            }
            appendChatMessage('bot', replyData.reply, replyData.matchedProducts);

            if (replyData.suggestions && Array.isArray(replyData.suggestions)) {
                renderChatChips(replyData.suggestions);
            }
        }
    } catch (err) {
        hideChatTypingIndicator();
        appendChatMessage('bot', '⚠️ Disculpa, hubo un inconveniente al procesar tu solicitud. Por favor intenta de nuevo.');
    } finally {
        chatState.isProcessing = false;
    }
}

function appendChatMessage(role, text, matchedProducts = []) {
    const body = document.getElementById('chatbotMessagesBody');
    if (!body) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${role === 'user' ? 'user-message' : 'bot-message'}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Formatear texto simple con negritas y saltos de línea
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');

    let productsHtml = '';
    if (matchedProducts && matchedProducts.length > 0) {
        productsHtml = matchedProducts.map(p => `
            <div class="chat-product-card">
                <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}" class="chat-product-img" alt="${p.name}">
                <div class="chat-product-info">
                    <div class="chat-product-name">${p.name}</div>
                    <div class="chat-product-price">$ ${(p.discountPrice || p.price || 0).toLocaleString('es-CO')} COP</div>
                </div>
                <button class="chat-product-btn" onclick="addChatProductToCart('${p.id}', this)">🛒 Agregar</button>
            </div>
        `).join('');
    }

    msgDiv.innerHTML = `
        <div class="chat-bubble">
            ${formattedText}
            ${productsHtml}
        </div>
        <span class="chat-time">${timeStr}</span>
    `;

    body.appendChild(msgDiv);
    body.scrollTop = body.scrollHeight;
}

function showChatTypingIndicator() {
    const body = document.getElementById('chatbotMessagesBody');
    if (!body || document.getElementById('chatTypingIndicator')) return;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'chatTypingIndicator';
    typingDiv.className = 'chat-message bot-message';
    typingDiv.innerHTML = `
        <div class="chat-typing-bubble">
            <span class="chat-dot"></span>
            <span class="chat-dot"></span>
            <span class="chat-dot"></span>
        </div>
    `;
    body.appendChild(typingDiv);
    body.scrollTop = body.scrollHeight;
}

function hideChatTypingIndicator() {
    const typing = document.getElementById('chatTypingIndicator');
    if (typing) typing.remove();
}

function renderChatChips(suggestions) {
    const container = document.getElementById('chatbotChipsContainer');
    if (!container || !suggestions) return;

    container.innerHTML = suggestions.map(s => `
        <button class="chat-chip" onclick="sendChatChip('${s.replace(/'/g, "\\'")}')">${s}</button>
    `).join('');

    container.scrollLeft = 0;
}

function slideChatChips(direction) {
    const container = document.getElementById('chatbotChipsContainer');
    if (!container) return;
    const scrollAmount = Math.max(140, container.clientWidth * 0.7) * direction;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function initChipsSliderEvents() {
    const container = document.getElementById('chatbotChipsContainer');
    if (!container) return;

    // Rueda del ratón para desplazamiento horizontal natural
    container.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
        }
    }, { passive: false });

    // Soporte para arrastrar con mouse (drag to scroll)
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    const stopDrag = () => { isDown = false; };
    container.addEventListener('mouseleave', stopDrag);
    container.addEventListener('mouseup', stopDrag);

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
    });
}

function clearChatHistory() {
    const body = document.getElementById('chatbotMessagesBody');
    if (!body) return;
    chatState.conversationId = null;
    const store = state.storeConfig || { storeName: 'MERKOSTORE' };
    body.innerHTML = `
        <div class="chat-message bot-message">
            <div class="chat-bubble">
                👋 Conversación reiniciada. ¡Hola de nuevo! Soy <strong>MerkoBot</strong>, tu asistente de <em>${store.storeName}</em>. ¿En qué te puedo asesorar hoy?
            </div>
            <span class="chat-time">Justo ahora</span>
        </div>
    `;
    renderChatChips(getDynamicSuggestionsFromProducts());
}

function addChatProductToCart(productId, btnElement) {
    const product = state.products.find(p => p.id === productId || String(p.id).toLowerCase() === String(productId).toLowerCase());
    if (!product) {
        showToast('⚠️ No se encontró el producto en el catálogo activo.', 'warning', '⚠️');
        return;
    }

    const currentQty = state.cart[product.id] || 0;
    if (product.stock !== undefined && currentQty >= product.stock) {
        showToast(`⚠️ Has alcanzado el inventario máximo (${product.stock} unds) de ${product.name}`, 'warning', '⚠️');
        return;
    }

    // Agregar al carrito
    updateCartQuantity(product.id, currentQty + 1);
    showToast(`🛒 "${product.name}" agregado al carrito desde MerkoBot`, 'success', '🤖');

    // Feedback táctil/visual inmediato en el botón
    if (btnElement) {
        const originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = '✅ ¡Agregado!';
        btnElement.style.backgroundColor = '#16a34a';
        btnElement.style.color = '#ffffff';
        btnElement.disabled = true;
        setTimeout(() => {
            btnElement.innerHTML = originalHtml;
            btnElement.style.backgroundColor = '';
            btnElement.style.color = '';
            btnElement.disabled = false;
        }, 1200);
    }
}

function getDynamicSuggestionsFromProducts() {
    const prods = (state.products || []).filter(p => p.isAvailable !== false);
    const chips = [];

    // Sugerencia de oferta real si existe
    const promo = prods.find(p => p.discountPrice && p.discountPrice > 0);
    if (promo) {
        chips.push(`🔥 Oferta: ${promo.name}`);
    }

    // Sugerencias de productos reales disponibles
    prods.slice(0, 3).forEach(p => {
        chips.push(`💲 Precio de ${p.name}`);
    });

    chips.push('🛵 Domicilios y envíos');
    chips.push('💳 Métodos de pago');
    chips.push('⏰ Horario de atención');

    return chips;
}

/**
 * Fallback cliente inteligente sincronizado con el inventario real del negocio
 */
function generateClientSideFallbackChat(query) {
    const q = query.toLowerCase();
    const products = (state.products || []).filter(p => p.isAvailable !== false);
    const store = state.storeConfig || { storeName: 'MERKOSTORE', deliveryFee: 3000 };

    if (q.includes('domicilio') || q.includes('envio') || q.includes('envío') || q.includes('tiempo')) {
        return {
            reply: `🛵 **Domicilios en ${store.storeName}:**\n\n• **Tarifa:** $${(store.deliveryFee || 3000).toLocaleString('es-CO')} COP en el sector.\n• **Tiempo:** 15 a 25 minutos.\n• **Envío GRATIS** en compras superiores a $30.000 COP.`,
            suggestions: getDynamicSuggestionsFromProducts()
        };
    }

    if (q.includes('pago') || q.includes('nequi') || q.includes('daviplata') || q.includes('efectivo')) {
        return {
            reply: "💳 **Métodos de Pago Disponibles:**\n\n1. **Nequi o Daviplata** directo.\n2. **Efectivo contra-entrega** al recibir tu pedido.\n3. **WhatsApp** acordado con la tienda.",
            suggestions: getDynamicSuggestionsFromProducts()
        };
    }

    if (q.includes('horario') || q.includes('abierto') || q.includes('hora')) {
        return {
            reply: `⏰ **Horario de Atención:**\n\n• Lunes a Domingo de 7:00 a.m. a 9:30 p.m. (Jornada continua).\n• Dirección: ${store.address || 'Calle 45 # 23 - 10 Barrio El Prado'}\n• Estado: 🟢 ¡Abiertos y despachando pedidos!`,
            suggestions: getDynamicSuggestionsFromProducts()
        };
    }

    if (q.includes('oferta') || q.includes('promocion') || q.includes('promoción') || q.includes('descuento')) {
        const promoList = products.filter(p => p.discountPrice && p.discountPrice > 0).slice(0, 4);
        if (promoList.length > 0) {
            return {
                reply: `🔥 **¡Ofertas destacadas hoy en ${store.storeName}!** Encuentra estos artículos con descuento en nuestro catálogo:`,
                matchedProducts: promoList,
                suggestions: getDynamicSuggestionsFromProducts()
            };
        }
    }

    // Búsqueda inteligente por palabras clave en los productos REALES
    const found = products.filter(p => {
        const name = (p.name || '').toLowerCase();
        const desc = (p.unitCalc || '').toLowerCase();
        return q.split(' ').some(w => w.length >= 3 && (name.includes(w) || desc.includes(w)));
    }).slice(0, 4);

    if (found.length > 0) {
        return {
            reply: `✨ **Encontré estos productos para ti en el inventario de ${store.storeName}:**`,
            matchedProducts: found,
            suggestions: getDynamicSuggestionsFromProducts()
        };
    }

    // Si el usuario preguntó por un producto que NO está en el catálogo del negocio:
    const sampleList = products.slice(0, 5).map(p => `• **${p.name}**: $${(p.discountPrice || p.price).toLocaleString('es-CO')}`).join('\n');
    return {
        reply: `En este momento no contamos con ese producto en el inventario disponible de **${store.storeName}**.\n\n📦 **Los productos que sí tenemos disponibles hoy son:**\n${sampleList}\n\n¿Te gustaría consultar el precio o agregar alguno de estos artículos?`,
        suggestions: getDynamicSuggestionsFromProducts()
    };
}


