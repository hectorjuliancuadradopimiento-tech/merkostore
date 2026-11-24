package com.merkostore.api.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierPurchaseRequest {
    private String storeId;
    private String supplierName;
    private LocalDateTime date;
    private String notes;
    private List<PurchaseItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseItemRequest {
        private String productId;
        private Integer quantity;
        private BigDecimal unitCost;
    }
}
