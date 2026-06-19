package com.dairycare.repository;

import com.dairycare.model.MilkPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilkPurchaseRepository extends JpaRepository<MilkPurchase, Long> {
    List<MilkPurchase> findByFarmerId(Long farmerId);
}
