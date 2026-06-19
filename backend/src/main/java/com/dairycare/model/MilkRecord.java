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
@Table(name = "milk_records")
public class MilkRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cattle_id")
    private Cattle cattle;

    private Double quantityLiters;
    private Double fatPercentage;
    private Double snfPercentage;
    
    private LocalDateTime collectionTime;
}
