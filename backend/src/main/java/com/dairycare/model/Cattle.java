package com.dairycare.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cattle")
public class Cattle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tagNumber;

    private String breed;
    private Integer ageMonths;
    private Double weight;
    private String healthStatus;
    private LocalDate lastVaccinationDate;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private Farmer farmer;

    @JsonIgnore
    @OneToMany(mappedBy = "cattle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MilkRecord> milkRecords;
}
