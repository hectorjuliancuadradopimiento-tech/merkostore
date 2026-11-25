package com.merkostore.api.controllers;

import com.merkostore.api.models.Category;
import com.merkostore.api.models.Product;
import com.merkostore.api.repositories.CategoryRepository;
import com.merkostore.api.repositories.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public")
@CrossOrigin(origins = "*")
public class PublicCatalogController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public PublicCatalogController(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getActiveCategories(@RequestParam(defaultValue = "default-store") String storeId) {
        List<Category> all = categoryRepository.findByStoreId(storeId);
        List<Category> active = all.stream()
                .filter(c -> c.getIsActive() == null || Boolean.TRUE.equals(c.getIsActive()))
                .sorted((a, b) -> {
                    int orderA = a.getDisplayOrder() != null ? a.getDisplayOrder() : 999;
                    int orderB = b.getDisplayOrder() != null ? b.getDisplayOrder() : 999;
                    return Integer.compare(orderA, orderB);
                })
                .toList();
        return ResponseEntity.ok(active);
    }

    /**
     * Sincronización de categorías hacia MongoDB (nube)
     */
    @PostMapping("/sync-categories")
    public ResponseEntity<List<Category>> syncCategories(
            @RequestBody List<Category> incomingCategories,
            @RequestParam(defaultValue = "default-store") String storeId) {
        if (incomingCategories == null || incomingCategories.isEmpty()) {
            return ResponseEntity.ok(categoryRepository.findByStoreId(storeId));
        }

        java.util.Set<String> incomingIds = incomingCategories.stream()
                .map(Category::getId)
                .filter(id -> id != null && !id.equalsIgnoreCase("ALL"))
                .collect(java.util.stream.Collectors.toSet());

        for (int i = 0; i < incomingCategories.size(); i++) {
            Category c = incomingCategories.get(i);
            if (c.getId() == null || c.getId().equalsIgnoreCase("ALL")) continue;
            c.setStoreId(storeId);
            if (c.getIsActive() == null) c.setIsActive(true);
            if (c.getDisplayOrder() == null) c.setDisplayOrder(i);
            categoryRepository.save(c);
        }

        // Si se reciben categorías personalizadas (cat-...), eliminar categorías demo antiguas si ya no existen
        boolean hasCustomCats = incomingIds.stream().anyMatch(id -> id.startsWith("cat-"));
        if (hasCustomCats) {
            List<Category> existing = categoryRepository.findByStoreId(storeId);
            for (Category ex : existing) {
                if (!incomingIds.contains(ex.getId()) && ex.getId().matches("cat[1-5]")) {
                    categoryRepository.deleteById(ex.getId());
                }
            }
        }

        return ResponseEntity.ok(categoryRepository.findByStoreId(storeId));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(defaultValue = "default-store") String storeId,
            @RequestParam(required = false) String categoryId) {
        
        List<Product> products;
        if (categoryId != null && !categoryId.isEmpty()) {
            products = productRepository.findByStoreIdAndCategoryIdAndIsAvailableTrue(storeId, categoryId);
        } else {
            products = productRepository.findByStoreIdAndIsAvailableTrue(storeId);
        }
        return ResponseEntity.ok(products);
    }

    /**
     * Sincronización masiva de catálogo hacia MongoDB
     */
    @PostMapping("/sync-catalog")
    public ResponseEntity<List<Product>> syncCatalog(
            @RequestBody List<Product> incomingProducts,
            @RequestParam(defaultValue = "default-store") String storeId) {
        if (incomingProducts == null || incomingProducts.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        for (Product p : incomingProducts) {
            if (p.getStoreId() == null || p.getStoreId().isEmpty()) {
                p.setStoreId(storeId);
            }
            if (p.getIsAvailable() == null) {
                p.setIsAvailable(true);
            }
            p.setUpdatedAt(java.time.LocalDateTime.now());
            productRepository.save(p);
        }
        List<Product> current = productRepository.findByStoreId(storeId);
        return ResponseEntity.ok(current);
    }
}
