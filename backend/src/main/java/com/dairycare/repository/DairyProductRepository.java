package com.dairycare.repository;

import com.dairycare.model.DairyProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DairyProductRepository extends JpaRepository<DairyProduct, Long> {
    java.util.Optional<DairyProduct> findByName(String name);
}
