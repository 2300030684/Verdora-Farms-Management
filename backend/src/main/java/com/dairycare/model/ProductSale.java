package com.dairycare.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "product_sales")
public class ProductSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private DairyProduct product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double totalPrice;

    @Column(nullable = false)
    private String saleType; // ONLINE or OFFLINE

    @Column(length = 50)
    private String paymentMethod; // "CASH", "UPI", "CARD", "CASH_ON_DELIVERY"

    private String customerName;
    private String customerPhone;
    
    @Column(length = 500)
    private String customerAddress;

    @CreationTimestamp
    private LocalDateTime saleDate;
}
