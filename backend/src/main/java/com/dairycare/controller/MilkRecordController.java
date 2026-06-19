package com.dairycare.controller;

import com.dairycare.model.Cattle;
import com.dairycare.model.MilkRecord;
import com.dairycare.repository.CattleRepository;
import com.dairycare.repository.MilkRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/milk-records")
public class MilkRecordController {
    @Autowired
    private MilkRecordRepository milkRecordRepository;

    @Autowired
    private CattleRepository cattleRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<MilkRecord> getAllRecords() {
        return milkRecordRepository.findAll();
    }

    @PostMapping("/{cattleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public MilkRecord addMilkRecord(@PathVariable Long cattleId, @RequestBody MilkRecord record) {
        Cattle cattle = cattleRepository.findById(cattleId)
                .orElseThrow(() -> new RuntimeException("Cattle not found"));
        record.setCattle(cattle);
        if (record.getCollectionTime() == null) {
            record.setCollectionTime(LocalDateTime.now());
        }
        return milkRecordRepository.save(record);
    }

    @GetMapping("/cattle/{cattleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<MilkRecord> getRecordsByCattle(@PathVariable Long cattleId) {
        return milkRecordRepository.findByCattleId(cattleId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MilkRecord updateMilkRecord(@PathVariable Long id, @RequestBody MilkRecord recordDetails) {
        MilkRecord record = milkRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milk Record not found"));
        
        record.setQuantityLiters(recordDetails.getQuantityLiters());
        record.setFatPercentage(recordDetails.getFatPercentage());
        record.setSnfPercentage(recordDetails.getSnfPercentage());
        
        return milkRecordRepository.save(record);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMilkRecord(@PathVariable Long id) {
        MilkRecord record = milkRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milk Record not found"));
        milkRecordRepository.delete(record);
        return ResponseEntity.ok().build();
    }
}
