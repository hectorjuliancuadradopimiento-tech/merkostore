package com.merkostore.api.repositories;

import com.merkostore.api.models.StoreBudget;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreBudgetRepository extends MongoRepository<StoreBudget, String> {
    Optional<StoreBudget> findByStoreId(String storeId);
}
