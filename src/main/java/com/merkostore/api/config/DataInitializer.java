package com.merkostore.api.config;

import com.merkostore.api.models.Category;
import com.merkostore.api.models.Order;
import com.merkostore.api.models.Product;
import com.merkostore.api.models.StoreConfig;
import com.merkostore.api.models.User;
import com.merkostore.api.repositories.CategoryRepository;
import com.merkostore.api.repositories.OrderRepository;
import com.merkostore.api.repositories.ProductRepository;
import com.merkostore.api.repositories.StoreConfigRepository;
import com.merkostore.api.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final CategoryRepository categoryRepository;
        private final ProductRepository productRepository;
        private final StoreConfigRepository storeConfigRepository;
        private final OrderRepository orderRepository;
        private final PasswordEncoder passwordEncoder;

        public DataInitializer(
                        UserRepository userRepository,
                        CategoryRepository categoryRepository,
                        ProductRepository productRepository,
                        StoreConfigRepository storeConfigRepository,
                        OrderRepository orderRepository,
                        PasswordEncoder passwordEncoder) {
                this.userRepository = userRepository;
                this.categoryRepository = categoryRepository;
                this.productRepository = productRepository;
                this.storeConfigRepository = storeConfigRepository;
                this.orderRepository = orderRepository;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        public void run(String... args) throws Exception {
                seedAdminUser();
                seedStoreConfig();
                // No sobreescribir ni resetear datos de productos ni pedidos del usuario
        }

        private void seedAdminUser() {
                if (!userRepository.existsByUsername("admin")) {
                        User admin = User.builder()
                                        .username("admin")
                                        .password(passwordEncoder.encode("1212"))
                                        .name("Administrador Merkostore")
                                        .email("admin@merkostore.com")
                                        .role("ROLE_ADMIN")
                                        .storeId("default-store")
                                        .isActive(true)
                                        .createdAt(LocalDateTime.now())
                                        .build();
                        userRepository.save(admin);
                        System.out.println("✅ Usuario admin inicial creado (admin / 1212)");
                }
        }

        private void seedStoreConfig() {
                if (storeConfigRepository.findByStoreId("default-store").isEmpty()) {
                        StoreConfig config = StoreConfig.builder()
                                        .storeId("default-store")
                                        .storeName("Merkostore - Tu Supermercado")
                                        .whatsappPhone("573004567890")
                                        .address("Cartagena de Indias, Bolívar")
                                        .deliveryFee(new BigDecimal("3000"))
                                        .minimumOrder(new BigDecimal("10000"))
                                        .isStoreOpen(true)
                                        .enabledPaymentMethods(List.of("WHATSAPP", "CASH", "NEQUI", "DAVIPLATA",
                                                        "BANCOLOMBIA"))
                                        .build();
                        storeConfigRepository.save(config);
                        System.out.println("✅ Configuración de tienda inicial sembrada.");
                }
        }

        public void seedCategoriesAndProducts(boolean force) {
                if (!force) {
                        return;
                }
                if (categoryRepository.count() == 0 && productRepository.count() == 0) {

                        Category cat1 = Category.builder().id("cat1").storeId("default-store")
                                        .name("📦 Combos Mercados").slug("combos-mercados").icon("📦").displayOrder(1)
                                        .isActive(true).build();
                        Category cat2 = Category.builder().id("cat2").storeId("default-store")
                                        .name("🥛 Lácteos y Huevos").slug("lacteos-huevos").icon("🥛").displayOrder(2)
                                        .isActive(true).build();
                        Category cat3 = Category.builder().id("cat3").storeId("default-store").name("🥖 Panadería")
                                        .slug("panaderia").icon("🥖").displayOrder(3).isActive(true).build();
                        Category cat4 = Category.builder().id("cat4").storeId("default-store")
                                        .name("🌾 Abarrotes y Despensa").slug("abarrotes-despensa").icon("🌾")
                                        .displayOrder(4).isActive(true).build();
                        Category cat5 = Category.builder().id("cat5").storeId("default-store")
                                        .name("🧼 Cuidado del Hogar").slug("cuidado-hogar").icon("🧼").displayOrder(5)
                                        .isActive(true).build();

                        categoryRepository.saveAll(List.of(cat1, cat2, cat3, cat4, cat5));

                        Product prd1 = Product.builder()
                                        .id("PRD-001").storeId("default-store").categoryId("cat2").sku("PRD-001")
                                        .name("Huevos Kikes AA x30")
                                        .description("Cubeta de huevos frescos AA x 30 unidades")
                                        .costPrice(new BigDecimal("14700")).price(new BigDecimal("24500"))
                                        .unit("UND").stock(35).minStockAlert(10)
                                        .imageUrl("https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500")
                                        .isAvailable(true).isFeatured(true).updatedAt(LocalDateTime.now()).build();

                        Product prd2 = Product.builder()
                                        .id("PRD-002").storeId("default-store").categoryId("cat4").sku("PRD-002")
                                        .name("Café Sello Rojo 425g").description("Café molido tradicional de Colombia")
                                        .costPrice(new BigDecimal("15000")).price(new BigDecimal("21990"))
                                        .unit("UND").stock(20).minStockAlert(5)
                                        .imageUrl("https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500")
                                        .isAvailable(true).isFeatured(true).updatedAt(LocalDateTime.now()).build();

                        Product prd3 = Product.builder()
                                        .id("PRD-003").storeId("default-store").categoryId("cat4").sku("PRD-003")
                                        .name("Harina Pan 1Kg").description("Harina de maíz blanco precocida")
                                        .costPrice(new BigDecimal("3200")).price(new BigDecimal("4800"))
                                        .unit("KG").stock(50).minStockAlert(15)
                                        .imageUrl("https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500")
                                        .isAvailable(true).isFeatured(true).updatedAt(LocalDateTime.now()).build();

                        Product prd4 = Product.builder()
                                        .id("PRD-004").storeId("default-store").categoryId("cat4").sku("PRD-004")
                                        .name("Aceite Medalla de Oro 3Lt")
                                        .description("Aceite vegetal de cocina para freír y preparar")
                                        .costPrice(new BigDecimal("13500")).price(new BigDecimal("19490"))
                                        .unit("LT").stock(14).minStockAlert(5)
                                        .imageUrl("https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500")
                                        .isAvailable(true).isFeatured(false).updatedAt(LocalDateTime.now()).build();

                        Product prd5 = Product.builder()
                                        .id("PRD-005").storeId("default-store").categoryId("cat4").sku("PRD-005")
                                        .name("Azúcar Blanca 2.5Kg")
                                        .description("Azúcar blanca refinada de alta pureza")
                                        .costPrice(new BigDecimal("6800")).price(new BigDecimal("9900"))
                                        .unit("PAQ").stock(28).minStockAlert(6)
                                        .imageUrl("https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500")
                                        .isAvailable(true).isFeatured(false).updatedAt(LocalDateTime.now()).build();

                        Product prd6 = Product.builder()
                                        .id("PRD-006").storeId("default-store").categoryId("cat4").sku("PRD-006")
                                        .name("Arroz Diana 1Kg").description("Arroz blanco seleccionado")
                                        .costPrice(new BigDecimal("3100")).price(new BigDecimal("4500"))
                                        .unit("KG").stock(45).minStockAlert(10)
                                        .imageUrl("https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500")
                                        .isAvailable(true).isFeatured(false).updatedAt(LocalDateTime.now()).build();

                        Product prd7 = Product.builder()
                                        .id("PRD-007").storeId("default-store").categoryId("cat2").sku("PRD-007")
                                        .name("Leche Colanta Entera 900ml").description("Leche pasteurizada entera")
                                        .costPrice(new BigDecimal("2900")).price(new BigDecimal("4200"))
                                        .unit("UND").stock(30).minStockAlert(8)
                                        .imageUrl("https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500")
                                        .isAvailable(true).isFeatured(true).updatedAt(LocalDateTime.now()).build();

                        Product prd8 = Product.builder()
                                        .id("PRD-008").storeId("default-store").categoryId("cat3").sku("PRD-008")
                                        .name("Pan Bimbo Artesano 500g").description("Pan tajado artesano tradicional")
                                        .costPrice(new BigDecimal("6000")).price(new BigDecimal("8500"))
                                        .unit("PAQ").stock(18).minStockAlert(5)
                                        .imageUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500")
                                        .isAvailable(true).isFeatured(false).updatedAt(LocalDateTime.now()).build();

                        Product prd9 = Product.builder()
                                        .id("PRD-009").storeId("default-store").categoryId("cat5").sku("PRD-009")
                                        .name("Jabón Rey Barra 300g").description("Jabón tradicional multiusos")
                                        .costPrice(new BigDecimal("2100")).price(new BigDecimal("3200"))
                                        .unit("UND").stock(40).minStockAlert(10)
                                        .imageUrl("https://images.unsplash.com/photo-1607006314177-3e818b264eef?w=500")
                                        .isAvailable(true).isFeatured(false).updatedAt(LocalDateTime.now()).build();

                        Product cmb1 = Product.builder()
                                        .id("CMB-001").storeId("default-store").categoryId("cat1").sku("CMB-001")
                                        .name("Mercado Familiar Esencial")
                                        .description("Combo 5 Productos Detal para el hogar")
                                        .costPrice(new BigDecimal("31800")).price(new BigDecimal("54000"))
                                        .discountPrice(new BigDecimal("44900"))
                                        .unit("COMBO").stock(10).minStockAlert(3)
                                        .imageUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?w=500")
                                        .isAvailable(true).isFeatured(true).updatedAt(LocalDateTime.now()).build();

                        Product cmb2 = Product.builder()
                                        .id("CMB-002").storeId("default-store").categoryId("cat1").sku("CMB-002")
                                        .name("Mercado Desayuno Completo")
                                        .description("Combo Desayuno Nutritivo con café y huevos")
                                        .costPrice(new BigDecimal("25200")).price(new BigDecimal("39900"))
                                        .discountPrice(new BigDecimal("34500"))
                                        .unit("COMBO").stock(8).minStockAlert(3)
                                        .imageUrl("https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500")
                                        .isAvailable(true).isFeatured(true).updatedAt(LocalDateTime.now()).build();

                        Product cmb3 = Product.builder()
                                        .id("CMB-003").storeId("default-store").categoryId("cat1").sku("CMB-003")
                                        .name("Combo Aseo y Hogar")
                                        .description("Kit de limpieza profunda con jabón Rey")
                                        .costPrice(new BigDecimal("18500")).price(new BigDecimal("32000"))
                                        .discountPrice(new BigDecimal("28000"))
                                        .unit("COMBO").stock(6).minStockAlert(2)
                                        .imageUrl("https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500")
                                        .isAvailable(true).isFeatured(true).updatedAt(LocalDateTime.now()).build();

                        productRepository.saveAll(List.of(prd1, prd2, prd3, prd4, prd5, prd6, prd7, prd8, prd9, cmb1,
                                        cmb2, cmb3));
                        System.out.println("✅ Catálogo de 12 productos sincronizado con Power BI / Data Warehouse.");
                }
        }

        public void seedSampleOrders(boolean force) {
                if (!force) {
                        return;
                }
                if (orderRepository.count() == 0) {

                        // 8 Clientes de Cartagena (Dim_Cliente)
                        Order.CustomerInfo c1 = Order.CustomerInfo.builder().name("María Camila Gómez")
                                        .phone("573004567890").deliveryAddress("Mz 14 Lote 8, El Recreo, Cartagena")
                                        .build();
                        Order.CustomerInfo c2 = Order.CustomerInfo.builder().name("Carlos Andrés Pérez")
                                        .phone("573119876543")
                                        .deliveryAddress("Calle 30 # 24-12, La Castellana, Cartagena").build();
                        Order.CustomerInfo c3 = Order.CustomerInfo.builder().name("Rosa Elena Martínez")
                                        .phone("573201122334")
                                        .deliveryAddress("Sector El Bosque # 10-05, Ceballos, Cartagena").build();
                        Order.CustomerInfo c4 = Order.CustomerInfo.builder().name("Jorge Luis Herrera")
                                        .phone("573158877665")
                                        .deliveryAddress("Manzana B Casa 12, Blas de Lezo, Cartagena").build();
                        Order.CustomerInfo c5 = Order.CustomerInfo.builder().name("Diana Patricia Polo")
                                        .phone("573045566778")
                                        .deliveryAddress("Cra 82 # 15-40, San Fernando, Cartagena").build();
                        Order.CustomerInfo c6 = Order.CustomerInfo.builder().name("Andrés Felipe Ruiz")
                                        .phone("573123344556")
                                        .deliveryAddress("Diag 32 # 55-20, Santa Lucía, Cartagena").build();
                        Order.CustomerInfo c7 = Order.CustomerInfo.builder().name("Consuelo Del Carmen")
                                        .phone("573189900112")
                                        .deliveryAddress("Calle de la Cruz # 42-18, Torices, Cartagena").build();
                        Order.CustomerInfo c8 = Order.CustomerInfo.builder().name("Manuel Salvador Díaz")
                                        .phone("573012233445").deliveryAddress("Calle Real # 22-09, Manga, Cartagena")
                                        .build();

                        List<Order> orders = new ArrayList<>();

                        // PED-001
                        orders.add(createOrder("PED-001", c1, Order.FulfillmentType.DELIVERY, "Nequi",
                                        LocalDateTime.of(2026, 11, 3, 10, 15),
                                        List.of(createItem("CMB-001", "Mercado Familiar Esencial", 2, 44900))));

                        // PED-002
                        orders.add(createOrder("PED-002", c2, Order.FulfillmentType.DELIVERY, "Daviplata",
                                        LocalDateTime.of(2026, 11, 4, 11, 30),
                                        List.of(createItem("CMB-002", "Mercado Desayuno Completo", 1, 34500))));

                        // PED-003
                        orders.add(createOrder("PED-003", c3, Order.FulfillmentType.PICKUP, "Efectivo",
                                        LocalDateTime.of(2026, 11, 5, 9, 45),
                                        List.of(createItem("PRD-001", "Huevos Kikes AA x30", 1, 24500),
                                                        createItem("PRD-002", "Café Sello Rojo 425g", 1, 21990))));

                        // PED-004
                        orders.add(createOrder("PED-004", c4, Order.FulfillmentType.DELIVERY, "Nequi",
                                        LocalDateTime.of(2026, 11, 6, 14, 20),
                                        List.of(createItem("PRD-004", "Aceite Medalla de Oro 3Lt", 1, 19490))));

                        // PED-005
                        orders.add(createOrder("PED-005", c5, Order.FulfillmentType.DELIVERY, "Daviplata",
                                        LocalDateTime.of(2026, 11, 7, 16, 10),
                                        List.of(createItem("CMB-001", "Mercado Familiar Esencial", 1, 44900))));

                        // PED-006
                        orders.add(createOrder("PED-006", c6, Order.FulfillmentType.DELIVERY, "Nequi",
                                        LocalDateTime.of(2026, 11, 8, 10, 5),
                                        List.of(createItem("CMB-003", "Combo Aseo y Hogar", 1, 28000))));

                        // PED-007
                        orders.add(createOrder("PED-007", c7, Order.FulfillmentType.PICKUP, "Efectivo",
                                        LocalDateTime.of(2026, 11, 9, 12, 40),
                                        List.of(createItem("PRD-001", "Huevos Kikes AA x30", 2, 24500))));

                        // PED-008
                        orders.add(createOrder("PED-008", c1, Order.FulfillmentType.DELIVERY, "Daviplata",
                                        LocalDateTime.of(2026, 11, 10, 15, 30),
                                        List.of(createItem("CMB-001", "Mercado Familiar Esencial", 2, 44900))));

                        // PED-009
                        orders.add(createOrder("PED-009", c4, Order.FulfillmentType.DELIVERY, "Nequi",
                                        LocalDateTime.of(2026, 11, 11, 11, 15),
                                        List.of(createItem("CMB-002", "Mercado Desayuno Completo", 2, 34500))));

                        // PED-010
                        orders.add(createOrder("PED-010", c2, Order.FulfillmentType.PICKUP, "Efectivo",
                                        LocalDateTime.of(2026, 11, 12, 17, 0),
                                        List.of(createItem("PRD-002", "Café Sello Rojo 425g", 2, 21990))));

                        // PED-011
                        orders.add(createOrder("PED-011", c3, Order.FulfillmentType.PICKUP, "Efectivo",
                                        LocalDateTime.of(2026, 11, 13, 9, 20),
                                        List.of(createItem("PRD-003", "Harina Pan 1Kg", 4, 4800))));

                        // PED-012
                        orders.add(createOrder("PED-012", c8, Order.FulfillmentType.DELIVERY, "Nequi",
                                        LocalDateTime.of(2026, 11, 14, 13, 45),
                                        List.of(createItem("CMB-001", "Mercado Familiar Esencial", 1, 44900),
                                                        createItem("PRD-001", "Huevos Kikes AA x30", 1, 24500))));

                        // PED-013
                        orders.add(createOrder("PED-013", c5, Order.FulfillmentType.PICKUP, "Efectivo",
                                        LocalDateTime.of(2026, 11, 15, 10, 50),
                                        List.of(createItem("PRD-006", "Arroz Diana 1Kg", 3, 4500),
                                                        createItem("PRD-007", "Leche Colanta Entera 900ml", 4, 4200))));

                        // PED-014
                        orders.add(createOrder("PED-014", c2, Order.FulfillmentType.DELIVERY, "Daviplata",
                                        LocalDateTime.of(2026, 11, 16, 16, 20),
                                        List.of(createItem("CMB-001", "Mercado Familiar Esencial", 2, 44900))));

                        // PED-015
                        orders.add(createOrder("PED-015", c3, Order.FulfillmentType.DELIVERY, "Nequi",
                                        LocalDateTime.of(2026, 11, 17, 11, 0),
                                        List.of(createItem("CMB-002", "Mercado Desayuno Completo", 1, 34500),
                                                        createItem("PRD-008", "Pan Bimbo Artesano 500g", 2, 8500))));

                        // PED-016
                        orders.add(createOrder("PED-016", c4, Order.FulfillmentType.DELIVERY, "Daviplata",
                                        LocalDateTime.of(2026, 11, 18, 14, 15),
                                        List.of(createItem("CMB-003", "Combo Aseo y Hogar", 2, 28000))));

                        // PED-017
                        orders.add(createOrder("PED-017", c6, Order.FulfillmentType.DELIVERY, "Nequi",
                                        LocalDateTime.of(2026, 11, 18, 18, 30),
                                        List.of(createItem("PRD-001", "Huevos Kikes AA x30", 2, 24500))));

                        // PED-018
                        orders.add(createOrder("PED-018", c7, Order.FulfillmentType.PICKUP, "Efectivo",
                                        LocalDateTime.of(2026, 11, 19, 12, 10),
                                        List.of(createItem("PRD-004", "Aceite Medalla de Oro 3Lt", 2, 19490),
                                                        createItem("PRD-009", "Jabón Rey Barra 300g", 5, 3200))));

                        // PED-019
                        orders.add(createOrder("PED-019", c1, Order.FulfillmentType.DELIVERY, "Bancolombia QR",
                                        LocalDateTime.of(2026, 11, 20, 15, 40),
                                        List.of(createItem("CMB-001", "Mercado Familiar Esencial", 2, 44900))));

                        // PED-020
                        orders.add(createOrder("PED-020", c2, Order.FulfillmentType.DELIVERY, "Contraentrega Efectivo",
                                        LocalDateTime.of(2026, 11, 20, 17, 55),
                                        List.of(createItem("CMB-002", "Mercado Desayuno Completo", 1, 34500))));

                        orderRepository.saveAll(orders);
                        System.out.println(
                                        "✅ 20 pedidos históricos sincronizados con Fact_Ventas.csv ($ 1.059.440 COP en ventas).");
                }
        }

        private Order.OrderItem createItem(String productId, String name, int qty, long unitPrice) {
                BigDecimal unit = BigDecimal.valueOf(unitPrice);
                BigDecimal sub = unit.multiply(BigDecimal.valueOf(qty));
                return Order.OrderItem.builder()
                                .productId(productId)
                                .productName(name)
                                .quantity(qty)
                                .unitPrice(unit)
                                .subtotal(sub)
                                .build();
        }

        private Order createOrder(String orderNumber, Order.CustomerInfo customer, Order.FulfillmentType fulfillment,
                        String paymentMethod, LocalDateTime createdAt, List<Order.OrderItem> items) {
                BigDecimal subtotal = items.stream().map(Order.OrderItem::getSubtotal).reduce(BigDecimal.ZERO,
                                BigDecimal::add);
                return Order.builder()
                                .orderNumber(orderNumber)
                                .storeId("default-store")
                                .customer(customer)
                                .items(items)
                                .fulfillmentType(fulfillment)
                                .deliveryFee(BigDecimal.ZERO)
                                .subtotal(subtotal)
                                .total(subtotal)
                                .paymentMethod(paymentMethod)
                                .paymentStatus(Order.PaymentStatus.PAID)
                                .orderStatus(Order.OrderStatus.DELIVERED)
                                .createdAt(createdAt)
                                .build();
        }
}
