package com.merkostore.api.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "store_budgets")
public class StoreBudget {

    @Id
    private String id;

    @Indexed(unique = true)
    private String storeId;

    private BigDecimal initialBudget;
    private BigDecimal currentBalance;
    private BigDecimal totalPurchases;
    private BigDecimal totalRecoveredCosts;
    private BigDecimal totalManualInjections;

    @Builder.Default
    private Boolean isInitialized = false;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
