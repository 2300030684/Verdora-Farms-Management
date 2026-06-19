package com.dairycare.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "dairy_products")
public class DairyProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String category; // e.g., Liquid, Solid, Powder
    
    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer stockQuantity; // For items like Ghee, Cheese
    
    private String unit; // e.g., Liters, Kg, Packets

    private String imageUrl; // Link to the product image
}
