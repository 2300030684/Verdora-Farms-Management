package com.dairycare.controller;

import com.dairycare.model.Cattle;
import com.dairycare.model.Farmer;
import com.dairycare.repository.CattleRepository;
import com.dairycare.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cattle")
public class CattleController {
    @Autowired
    private CattleRepository cattleRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Cattle> getAllCattle() {
        return cattleRepository.findAll();
    }

    @PostMapping("/{farmerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Cattle createCattle(@PathVariable Long farmerId, @RequestBody Cattle cattle) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
        cattle.setFarmer(farmer);
        return cattleRepository.save(cattle);
    }

    @GetMapping("/farmer/{farmerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Cattle> getCattleByFarmer(@PathVariable Long farmerId) {
        return cattleRepository.findByFarmerId(farmerId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Cattle updateCattle(@PathVariable Long id, @RequestBody Cattle cattleDetails) {
        Cattle cattle = cattleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cattle not found"));
        
        cattle.setTagNumber(cattleDetails.getTagNumber());
        cattle.setBreed(cattleDetails.getBreed());
        cattle.setAgeMonths(cattleDetails.getAgeMonths());
        cattle.setWeight(cattleDetails.getWeight());
        cattle.setHealthStatus(cattleDetails.getHealthStatus());
        cattle.setLastVaccinationDate(cattleDetails.getLastVaccinationDate());
        
        return cattleRepository.save(cattle);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCattle(@PathVariable Long id) {
        Cattle cattle = cattleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cattle not found"));
        cattleRepository.delete(cattle);
        return ResponseEntity.ok().build();
    }
}
