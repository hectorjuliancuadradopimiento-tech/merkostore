package com.merkostore.api.services;

import com.merkostore.api.dtos.SupplierPurchaseRequest;
import com.merkostore.api.exceptions.ResourceNotFoundException;
import com.merkostore.api.models.FinancialTransaction;
import com.merkostore.api.models.Order;
import com.merkostore.api.models.Product;
import com.merkostore.api.models.StoreBudget;
import com.merkostore.api.models.SupplierPurchase;
import com.merkostore.api.repositories.FinancialTransactionRepository;
import com.merkostore.api.repositories.ProductRepository;
import com.merkostore.api.repositories.StoreBudgetRepository;
import com.merkostore.api.repositories.SupplierPurchaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class BudgetService {

    private final StoreBudgetRepository storeBudgetRepository;
    private final SupplierPurchaseRepository supplierPurchaseRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final ProductRepository productRepository;
    private final Random random = new Random();

    public BudgetService(
            StoreBudgetRepository storeBudgetRepository,
            SupplierPurchaseRepository supplierPurchaseRepository,
            FinancialTransactionRepository financialTransactionRepository,
            ProductRepository productRepository) {
        this.storeBudgetRepository = storeBudgetRepository;
        this.supplierPurchaseRepository = supplierPurchaseRepository;
        this.financialTransactionRepository = financialTransactionRepository;
        this.productRepository = productRepository;
    }

    public StoreBudget getOrCreateBudget(String storeId) {
        String sId = (storeId != null && !storeId.trim().isEmpty()) ? storeId.trim() : "default-store";
        return storeBudgetRepository.findByStoreId(sId).orElseGet(() -> {
            StoreBudget newBudget = StoreBudget.builder()
                    .storeId(sId)
                    .initialBudget(BigDecimal.ZERO)
                    .currentBalance(BigDecimal.ZERO)
                    .totalPurchases(BigDecimal.ZERO)
                    .totalRecoveredCosts(BigDecimal.ZERO)
                    .totalManualInjections(BigDecimal.ZERO)
                    .isInitialized(false)
                    .updatedAt(LocalDateTime.now())
                    .build();
            return storeBudgetRepository.save(newBudget);
        });
    }

    public synchronized StoreBudget initializeBudget(String storeId, BigDecimal initialAmount, String createdBy) {
        if (initialAmount == null || initialAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El valor del presupuesto inicial no puede ser negativo");
        }

        StoreBudget budget = getOrCreateBudget(storeId);
        budget.setInitialBudget(initialAmount);
        budget.setCurrentBalance(initialAmount);
        budget.setIsInitialized(true);
        budget.setUpdatedAt(LocalDateTime.now());
        StoreBudget saved = storeBudgetRepository.save(budget);

        FinancialTransaction tx = FinancialTransaction.builder()
                .storeId(budget.getStoreId())
                .type(FinancialTransaction.TransactionType.INCOME)
                .category("INITIAL_BUDGET")
                .amount(initialAmount)
                .balanceAfter(saved.getCurrentBalance())
                .description("Registro de presupuesto inicial para reposición de inventario")
                .paymentMethod("FONDO_PROPIO")
                .createdBy(createdBy != null ? createdBy : "admin")
                .date(LocalDateTime.now())
                .build();
        financialTransactionRepository.save(tx);

        return saved;
    }

    public synchronized StoreBudget setBudgetBalance(String storeId, BigDecimal newBalance, String notes, String createdBy) {
        if (newBalance == null || newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El presupuesto no puede ser negativo");
        }

        StoreBudget budget = getOrCreateBudget(storeId);
        budget.setCurrentBalance(newBalance);
        if (!Boolean.TRUE.equals(budget.getIsInitialized())) {
            budget.setInitialBudget(newBalance);
            budget.setIsInitialized(true);
        }
        budget.setUpdatedAt(LocalDateTime.now());
        StoreBudget saved = storeBudgetRepository.save(budget);

        FinancialTransaction tx = FinancialTransaction.builder()
                .storeId(budget.getStoreId())
                .type(FinancialTransaction.TransactionType.INCOME)
                .category("BUDGET_ADJUSTMENT")
                .amount(newBalance)
                .balanceAfter(saved.getCurrentBalance())
                .description(notes != null && !notes.trim().isEmpty() ? notes.trim() : "Ajuste de presupuesto por el administrador")
                .paymentMethod("AJUSTE_ADMIN")
                .createdBy(createdBy != null ? createdBy : "admin")
                .date(LocalDateTime.now())
                .build();
        financialTransactionRepository.save(tx);

        return saved;
    }

    public synchronized StoreBudget addMoneyToBudget(String storeId, BigDecimal amount, String description, LocalDateTime date, String createdBy) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El valor agregado al presupuesto debe ser mayor a cero");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("El motivo o descripción del aporte es obligatorio");
        }

        StoreBudget budget = getOrCreateBudget(storeId);
        budget.setCurrentBalance(budget.getCurrentBalance().add(amount));
        budget.setTotalManualInjections(budget.getTotalManualInjections().add(amount));
        budget.setUpdatedAt(LocalDateTime.now());
        StoreBudget saved = storeBudgetRepository.save(budget);

        FinancialTransaction tx = FinancialTransaction.builder()
                .storeId(budget.getStoreId())
                .type(FinancialTransaction.TransactionType.INCOME)
                .category("MANUAL_ADD")
                .amount(amount)
                .balanceAfter(saved.getCurrentBalance())
                .description(description.trim())
                .paymentMethod("INYECCION_MANUAL")
                .createdBy(createdBy != null ? createdBy : "admin")
                .date(date != null ? date : LocalDateTime.now())
                .build();
        financialTransactionRepository.save(tx);

        return saved;
    }

    public synchronized SupplierPurchase registerPurchase(String storeId, SupplierPurchaseRequest request, String createdBy) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("La compra debe incluir al menos un producto");
        }

        StoreBudget budget = getOrCreateBudget(storeId);

        // 1. Calculate total purchase cost and pre-validate items
        BigDecimal totalCost = BigDecimal.ZERO;
        List<SupplierPurchase.PurchaseItem> purchaseItems = new ArrayList<>();
        List<ProductUpdateHolder> updates = new ArrayList<>();

        for (SupplierPurchaseRequest.PurchaseItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null || itemReq.getProductId().trim().isEmpty()) {
                throw new IllegalArgumentException("El identificador del producto es requerido");
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("La cantidad comprada debe ser mayor a cero");
            }
            if (itemReq.getUnitCost() == null || itemReq.getUnitCost().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("El precio de adquisición no puede ser negativo");
            }

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + itemReq.getProductId()));

            BigDecimal itemSubtotal = itemReq.getUnitCost().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalCost = totalCost.add(itemSubtotal);

            int oldStock = product.getStock() != null ? product.getStock() : 0;
            BigDecimal oldCost = product.getCostPrice();
            int newStock = oldStock + itemReq.getQuantity();

            // Weighted Average Cost Calculation (Fase 4)
            BigDecimal newWeightedCost;
            if (oldStock <= 0 || oldCost == null || oldCost.compareTo(BigDecimal.ZERO) <= 0) {
                newWeightedCost = itemReq.getUnitCost();
            } else {
                BigDecimal oldTotalVal = oldCost.multiply(BigDecimal.valueOf(oldStock));
                BigDecimal newUnitsVal = itemReq.getUnitCost().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                newWeightedCost = (oldTotalVal.add(newUnitsVal))
                        .divide(BigDecimal.valueOf(newStock), 2, RoundingMode.HALF_UP);
            }

            purchaseItems.add(SupplierPurchase.PurchaseItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemReq.getQuantity())
                    .unitCost(itemReq.getUnitCost())
                    .subtotal(itemSubtotal)
                    .previousStock(oldStock)
                    .previousCostPrice(oldCost)
                    .newCostPrice(newWeightedCost)
                    .build());

            updates.add(new ProductUpdateHolder(product, newStock, newWeightedCost));
        }

        // 2. Budget verification (Fase 6)
        if (budget.getCurrentBalance().compareTo(totalCost) < 0) {
            throw new IllegalArgumentException("Presupuesto insuficiente. Saldo disponible: $" 
                    + budget.getCurrentBalance() + " COP. Costo requerido para la compra: $" + totalCost + " COP.");
        }

        // 3. Deduct from budget
        budget.setCurrentBalance(budget.getCurrentBalance().subtract(totalCost));
        budget.setTotalPurchases(budget.getTotalPurchases().add(totalCost));
        budget.setUpdatedAt(LocalDateTime.now());
        storeBudgetRepository.save(budget);

        // 4. Update products stock and weighted cost
        for (ProductUpdateHolder uh : updates) {
            uh.product.setStock(uh.newStock);
            uh.product.setCostPrice(uh.newCost);
            uh.product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(uh.product);
        }

        // 5. Save Purchase record
        String purchaseNumber = "COM-" + (1000 + random.nextInt(9000)) + "-" + (System.currentTimeMillis() % 1000);
        LocalDateTime purchaseDate = request.getDate() != null ? request.getDate() : LocalDateTime.now();

        SupplierPurchase purchase = SupplierPurchase.builder()
                .purchaseNumber(purchaseNumber)
                .storeId(budget.getStoreId())
                .supplierName(request.getSupplierName() != null ? request.getSupplierName().trim() : "Proveedor General")
                .items(purchaseItems)
                .totalCost(totalCost)
                .notes(request.getNotes())
                .createdBy(createdBy != null ? createdBy : "admin")
                .date(purchaseDate)
                .build();
        SupplierPurchase savedPurchase = supplierPurchaseRepository.save(purchase);

        // 6. Record financial transaction
        FinancialTransaction tx = FinancialTransaction.builder()
                .storeId(budget.getStoreId())
                .type(FinancialTransaction.TransactionType.EXPENSE)
                .category("SUPPLIER_PURCHASE")
                .amount(totalCost)
                .balanceAfter(budget.getCurrentBalance())
                .referenceId(purchaseNumber)
                .description("Compra de reposición #" + purchaseNumber + " - Proveedor: " + purchase.getSupplierName())
                .paymentMethod("PRESUPUESTO_NEGOCIO")
                .createdBy(createdBy != null ? createdBy : "admin")
                .date(purchaseDate)
                .build();
        financialTransactionRepository.save(tx);

        return savedPurchase;
    }

    public synchronized void recordSalesCostRecovery(Order order) {
        if (order == null || Boolean.TRUE.equals(order.getCostRecoveryRecorded())) {
            return; // Idempotency check: prevent duplicate financial recording
        }

        BigDecimal costToRecover = order.getTotalCost();
        if (costToRecover == null || costToRecover.compareTo(BigDecimal.ZERO) <= 0) {
            order.setCostRecoveryRecorded(true);
            return;
        }

        StoreBudget budget = getOrCreateBudget(order.getStoreId());
        budget.setCurrentBalance(budget.getCurrentBalance().add(costToRecover));
        budget.setTotalRecoveredCosts(budget.getTotalRecoveredCosts().add(costToRecover));
        budget.setUpdatedAt(LocalDateTime.now());
        storeBudgetRepository.save(budget);

        order.setCostRecoveryRecorded(true);

        FinancialTransaction tx = FinancialTransaction.builder()
                .storeId(order.getStoreId())
                .type(FinancialTransaction.TransactionType.INCOME)
                .category("SALES_COST_RECOVERY")
                .orderId(order.getId())
                .referenceId(order.getOrderNumber())
                .amount(costToRecover)
                .balanceAfter(budget.getCurrentBalance())
                .description("Costo recuperado por venta de pedido #" + order.getOrderNumber())
                .paymentMethod(order.getPaymentMethod())
                .createdBy("system")
                .date(LocalDateTime.now())
                .build();
        financialTransactionRepository.save(tx);
    }

    public synchronized void revertSalesCostRecovery(Order order) {
        if (order == null || !Boolean.TRUE.equals(order.getCostRecoveryRecorded())) {
            return;
        }

        BigDecimal costToRevert = order.getTotalCost();
        if (costToRevert == null || costToRevert.compareTo(BigDecimal.ZERO) <= 0) {
            order.setCostRecoveryRecorded(false);
            return;
        }

        StoreBudget budget = getOrCreateBudget(order.getStoreId());
        budget.setCurrentBalance(budget.getCurrentBalance().subtract(costToRevert));
        budget.setTotalRecoveredCosts(budget.getTotalRecoveredCosts().subtract(costToRevert));
        budget.setUpdatedAt(LocalDateTime.now());
        storeBudgetRepository.save(budget);

        order.setCostRecoveryRecorded(false);

        FinancialTransaction tx = FinancialTransaction.builder()
                .storeId(order.getStoreId())
                .type(FinancialTransaction.TransactionType.EXPENSE)
                .category("REFUND_REVERSAL")
                .orderId(order.getId())
                .referenceId(order.getOrderNumber())
                .amount(costToRevert)
                .balanceAfter(budget.getCurrentBalance())
                .description("Reversión de costo recuperado por cancelación de pedido #" + order.getOrderNumber())
                .paymentMethod("REVERSAL")
                .createdBy("system")
                .date(LocalDateTime.now())
                .build();
        financialTransactionRepository.save(tx);
    }

    public List<SupplierPurchase> getPurchasesHistory(String storeId) {
        String sId = (storeId != null && !storeId.trim().isEmpty()) ? storeId.trim() : "default-store";
        return supplierPurchaseRepository.findByStoreIdOrderByDateDesc(sId);
    }

    public List<FinancialTransaction> getTransactionsHistory(String storeId) {
        String sId = (storeId != null && !storeId.trim().isEmpty()) ? storeId.trim() : "default-store";
        return financialTransactionRepository.findByStoreIdOrderByDateDesc(sId);
    }

    private record ProductUpdateHolder(Product product, int newStock, BigDecimal newCost) {}
}
