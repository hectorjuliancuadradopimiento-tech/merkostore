package com.merkostore.api.controllers;

import com.merkostore.api.dtos.ApiResponse;
import com.merkostore.api.dtos.SupplierPurchaseRequest;
import com.merkostore.api.models.FinancialTransaction;
import com.merkostore.api.models.StoreBudget;
import com.merkostore.api.models.SupplierPurchase;
import com.merkostore.api.services.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/budget")
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<StoreBudget>> getBudget(@RequestParam(defaultValue = "default-store") String storeId) {
        StoreBudget budget = budgetService.getOrCreateBudget(storeId);
        return ResponseEntity.ok(ApiResponse.ok("Presupuesto del negocio recuperado con éxito", budget));
    }

    @PostMapping("/init")
    public ResponseEntity<ApiResponse<StoreBudget>> initializeBudget(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        String storeId = (String) body.getOrDefault("storeId", "default-store");
        Object rawAmount = body.get("initialAmount");
        if (rawAmount == null) {
            throw new IllegalArgumentException("El valor de 'initialAmount' es obligatorio");
        }
        BigDecimal amount = new BigDecimal(rawAmount.toString());
        String user = authentication != null ? authentication.getName() : "admin";

        StoreBudget budget = budgetService.initializeBudget(storeId, amount, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Presupuesto inicial registrado exitosamente", budget));
    }

    @PostMapping("/add-money")
    public ResponseEntity<ApiResponse<StoreBudget>> addMoney(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        String storeId = (String) body.getOrDefault("storeId", "default-store");
        Object rawAmount = body.get("amount");
        String description = (String) body.get("description");
        String rawDate = (String) body.get("date");

        if (rawAmount == null) {
            throw new IllegalArgumentException("El valor a agregar es obligatorio");
        }
        BigDecimal amount = new BigDecimal(rawAmount.toString());
        LocalDateTime date = (rawDate != null && !rawDate.isEmpty()) ? LocalDateTime.parse(rawDate) : LocalDateTime.now();
        String user = authentication != null ? authentication.getName() : "admin";

        StoreBudget budget = budgetService.addMoneyToBudget(storeId, amount, description, date, user);
        return ResponseEntity.ok(ApiResponse.ok("Dinero agregado al presupuesto exitosamente", budget));
    }

    @PostMapping("/purchases")
    public ResponseEntity<ApiResponse<SupplierPurchase>> registerPurchase(
            @RequestBody SupplierPurchaseRequest request,
            Authentication authentication) {
        String storeId = request.getStoreId() != null ? request.getStoreId() : "default-store";
        String user = authentication != null ? authentication.getName() : "admin";

        SupplierPurchase purchase = budgetService.registerPurchase(storeId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Compra de mercancía registrada exitosamente", purchase));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<FinancialTransaction>>> getTransactions(
            @RequestParam(defaultValue = "default-store") String storeId) {
        List<FinancialTransaction> txs = budgetService.getTransactionsHistory(storeId);
        return ResponseEntity.ok(ApiResponse.ok("Historial de movimientos financieros", txs));
    }

    @GetMapping("/purchases")
    public ResponseEntity<ApiResponse<List<SupplierPurchase>>> getPurchases(
            @RequestParam(defaultValue = "default-store") String storeId) {
        List<SupplierPurchase> purchases = budgetService.getPurchasesHistory(storeId);
        return ResponseEntity.ok(ApiResponse.ok("Historial de compras a proveedores", purchases));
    }
}
