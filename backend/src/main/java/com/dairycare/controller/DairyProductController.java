package com.dairycare.controller;

import com.dairycare.model.DairyProduct;
import com.dairycare.repository.DairyProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
public class DairyProductController {

    @Autowired
    private DairyProductRepository productRepository;

    @GetMapping
    public List<DairyProduct> getAllProducts() {
        return productRepository.findAll();
    }

    @PostMapping
    public DairyProduct createProduct(@RequestBody DairyProduct product) {
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DairyProduct> updateProduct(@PathVariable Long id, @RequestBody DairyProduct productDetails) {
        DairyProduct product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));

        product.setName(productDetails.getName());
        product.setCategory(productDetails.getCategory());
        product.setPrice(productDetails.getPrice());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setUnit(productDetails.getUnit());
        product.setImageUrl(productDetails.getImageUrl());

        DairyProduct updatedProduct = productRepository.save(product);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        DairyProduct product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));

        productRepository.delete(product);
        return ResponseEntity.ok().build();
    }
}
