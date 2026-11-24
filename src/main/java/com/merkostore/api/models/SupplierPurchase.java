package com.merkostore.api.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "supplier_purchases")
public class SupplierPurchase {

    @Id
    private String id;

    @Indexed(sparse = true)
    private String purchaseNumber;

    @Indexed
    private String storeId;

    private String supplierName;
    private List<PurchaseItem> items;
    private BigDecimal totalCost;
    private String notes;
    private String createdBy;

    @CreatedDate
    @Indexed
    private LocalDateTime date;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseItem {
        private String productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitCost;
        private BigDecimal subtotal;
        private Integer previousStock;
        private BigDecimal previousCostPrice;
        private BigDecimal newCostPrice;
    }
}
