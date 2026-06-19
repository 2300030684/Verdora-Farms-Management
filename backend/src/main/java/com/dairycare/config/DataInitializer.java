package com.dairycare.config;

import com.dairycare.model.DairyProduct;
import com.dairycare.repository.DairyProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

// @Configuration // Disabled so it stops auto-adding products on startup
public class DataInitializer {

    @Bean
    public CommandLineRunner initProducts(DairyProductRepository productRepository) {
        return args -> {
            List<DairyProduct> initialProducts = Arrays.asList(
                DairyProduct.builder().name("Pure Cow Milk (1L)").category("Liquid").price(75.0).stockQuantity(150).build(),
                DairyProduct.builder().name("Pure Cow Milk (500ml)").category("Liquid").price(40.0).stockQuantity(200).build(),
                DairyProduct.builder().name("Pure Cow Ghee (1kg)").category("Clarified Butter").price(650.0).stockQuantity(50).build(),
                DairyProduct.builder().name("Pure Cow Ghee (500g)").category("Clarified Butter").price(350.0).stockQuantity(80).build(),
                DairyProduct.builder().name("Fresh Paneer (1kg)").category("Cheese").price(350.0).stockQuantity(40).build(),
                DairyProduct.builder().name("Fresh Paneer (500g)").category("Cheese").price(180.0).stockQuantity(60).build()
            );

            for (DairyProduct p : initialProducts) {
                if (!productRepository.findByName(p.getName()).isPresent()) {
                    productRepository.save(p);
                    System.out.println("Initialized product: " + p.getName());
                }
            }
        };
    }
}
