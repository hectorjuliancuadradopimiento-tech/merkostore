package com.merkostore.api.repositories;

import com.merkostore.api.models.SupplierPurchase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierPurchaseRepository extends MongoRepository<SupplierPurchase, String> {
    List<SupplierPurchase> findByStoreIdOrderByDateDesc(String storeId);
}
