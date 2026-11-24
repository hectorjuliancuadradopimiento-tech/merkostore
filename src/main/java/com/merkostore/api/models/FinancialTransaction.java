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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "financial_transactions")
public class FinancialTransaction {

    @Id
    private String id;

    @Indexed
    private String storeId;

    private TransactionType type; // INCOME, EXPENSE
    private String category; // INITIAL_BUDGET, MANUAL_ADD, SUPPLIER_PURCHASE, SALES_COST_RECOVERY, REFUND_REVERSAL, PROFIT_TRANSFER, VENTA_PEDIDO, PROVEEDOR, OTRO
    private String orderId;
    private String referenceId;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private String paymentMethod;
    private String createdBy;

    @CreatedDate
    @Indexed
    private LocalDateTime date;

    public enum TransactionType {
        INCOME, EXPENSE
    }
}
