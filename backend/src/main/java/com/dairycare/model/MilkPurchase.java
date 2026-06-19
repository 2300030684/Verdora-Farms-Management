package com.dairycare.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "milk_purchases")
public class MilkPurchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    private Double quantityLiters;
    private Double fatPercentage;
    private Double snfPercentage;
    
    private Double pricePerLiter;
    private Double totalPrice;

    @Column(length = 20)
    private String paymentStatus = "PAID"; // "PAID" or "PENDING"
    
    @Column(length = 50)
    private String paymentMethod; // "CASH", "UPI", "BANK_TRANSFER", etc.

    private LocalDateTime purchaseDate;
}
