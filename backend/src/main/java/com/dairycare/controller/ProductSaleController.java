package com.dairycare.controller;

import com.dairycare.model.DairyProduct;
import com.dairycare.model.ProductSale;
import com.dairycare.repository.DairyProductRepository;
import com.dairycare.repository.ProductSaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sales")
public class ProductSaleController {

    @Autowired
    private ProductSaleRepository saleRepository;

    @Autowired
    private DairyProductRepository productRepository;

    @GetMapping
    public List<ProductSale> getAllSales() {
        return saleRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createSale(@RequestBody ProductSale saleRequest) {
        // Fetch the product
        DairyProduct product = productRepository.findById(saleRequest.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check stock
        if (product.getStockQuantity() < saleRequest.getQuantity()) {
            return ResponseEntity.badRequest().body("Insufficient stock. Available: " + product.getStockQuantity());
        }

        // Deduct stock
        product.setStockQuantity(product.getStockQuantity() - saleRequest.getQuantity());
        productRepository.save(product);

        // Save sale
        saleRequest.setProduct(product);
        ProductSale savedSale = saleRepository.save(saleRequest);

        return ResponseEntity.ok(savedSale);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSale(@PathVariable Long id) {
        ProductSale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        // Revert stock
        DairyProduct product = sale.getProduct();
        product.setStockQuantity(product.getStockQuantity() + sale.getQuantity());
        productRepository.save(product);

        saleRepository.delete(sale);
        return ResponseEntity.ok().build();
    }
}
