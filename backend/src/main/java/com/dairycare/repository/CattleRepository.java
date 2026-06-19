package com.dairycare.repository;

import com.dairycare.model.Cattle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CattleRepository extends JpaRepository<Cattle, Long> {
    List<Cattle> findByFarmerId(Long farmerId);
}
