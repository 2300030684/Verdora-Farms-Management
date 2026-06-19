package com.dairycare.repository;

import com.dairycare.model.MilkRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilkRecordRepository extends JpaRepository<MilkRecord, Long> {
    List<MilkRecord> findByCattleId(Long cattleId);
}
