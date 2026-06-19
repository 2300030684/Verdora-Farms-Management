package com.dairycare.controller;

import com.dairycare.model.Farmer;
import com.dairycare.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/farmers")
public class FarmerController {
    @Autowired
    private FarmerRepository farmerRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Farmer> getAllFarmers() {
        return farmerRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Farmer createFarmer(@RequestBody Farmer farmer) {
        return farmerRepository.save(farmer);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Farmer> updateFarmer(@PathVariable Long id, @RequestBody Farmer farmerDetails) {
        Farmer farmer = farmerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farmer not found with id :" + id));

        farmer.setName(farmerDetails.getName());
        farmer.setPhone(farmerDetails.getPhone());
        farmer.setAddress(farmerDetails.getAddress());
        
        return ResponseEntity.ok(farmerRepository.save(farmer));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFarmer(@PathVariable Long id) {
        Farmer farmer = farmerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farmer not found with id :" + id));

        farmerRepository.delete(farmer);
        return ResponseEntity.ok().build();
    }
}
