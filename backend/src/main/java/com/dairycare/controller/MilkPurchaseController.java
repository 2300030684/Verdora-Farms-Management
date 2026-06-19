package com.dairycare.controller;

import com.dairycare.model.Farmer;
import com.dairycare.model.MilkPurchase;
import com.dairycare.repository.FarmerRepository;
import com.dairycare.repository.MilkPurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/purchases")
public class MilkPurchaseController {
    @Autowired
    private MilkPurchaseRepository milkPurchaseRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<MilkPurchase> getAllPurchases() {
        return milkPurchaseRepository.findAll();
    }

    @PostMapping("/{farmerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public MilkPurchase addPurchase(@PathVariable Long farmerId, @RequestBody MilkPurchase purchase) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
        purchase.setFarmer(farmer);
        if (purchase.getPurchaseDate() == null) {
            purchase.setPurchaseDate(LocalDateTime.now());
        }
        
        // Update total milk provided by farmer
        if(farmer.getTotalMilkProvided() == null) {
            farmer.setTotalMilkProvided(purchase.getQuantityLiters());
        } else {
            farmer.setTotalMilkProvided(farmer.getTotalMilkProvided() + purchase.getQuantityLiters());
        }
        farmerRepository.save(farmer);

        return milkPurchaseRepository.save(purchase);
    }

    @GetMapping("/farmer/{farmerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<MilkPurchase> getPurchasesByFarmer(@PathVariable Long farmerId) {
        return milkPurchaseRepository.findByFarmerId(farmerId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MilkPurchase updatePurchase(@PathVariable Long id, @RequestBody MilkPurchase purchaseDetails) {
        MilkPurchase purchase = milkPurchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
        
        // Adjust farmer's total milk
        Farmer farmer = purchase.getFarmer();
        double difference = purchaseDetails.getQuantityLiters() - purchase.getQuantityLiters();
        farmer.setTotalMilkProvided(farmer.getTotalMilkProvided() + difference);
        farmerRepository.save(farmer);
        
        purchase.setQuantityLiters(purchaseDetails.getQuantityLiters());
        purchase.setFatPercentage(purchaseDetails.getFatPercentage());
        purchase.setSnfPercentage(purchaseDetails.getSnfPercentage());
        purchase.setPricePerLiter(purchaseDetails.getPricePerLiter());
        purchase.setTotalPrice(purchaseDetails.getTotalPrice());
        
        if (purchaseDetails.getPaymentStatus() != null) {
            purchase.setPaymentStatus(purchaseDetails.getPaymentStatus());
        }
        
        return milkPurchaseRepository.save(purchase);
    }

    @PostMapping("/whatsapp/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendWhatsAppDirectly(@PathVariable Long id) {
        MilkPurchase purchase = milkPurchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
                
        Farmer farmer = purchase.getFarmer();
        if (farmer == null || farmer.getPhone() == null || farmer.getPhone().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Farmer phone number is missing"));
        }
        
        System.out.println("\n=======================================================");
        System.out.println("✅ MOCK WHATSAPP API - MESSAGE SENT DIRECTLY IN BACKGROUND");
        System.out.println("To: " + farmer.getPhone() + " (" + farmer.getName() + ")");
        System.out.println("-------------------------------------------------------");
        System.out.println("VERDORA FARMS - Milk Receipt 🥛");
        System.out.println("Date: " + purchase.getPurchaseDate());
        System.out.println("Volume: " + purchase.getQuantityLiters() + " L");
        System.out.println("Total Payout: Rs." + purchase.getTotalPrice());
        System.out.println("=======================================================\n");
        
        return ResponseEntity.ok(java.util.Map.of("message", "WhatsApp message sent directly to " + farmer.getName() + " (" + farmer.getPhone() + ") in the background!"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePurchase(@PathVariable Long id) {
        MilkPurchase purchase = milkPurchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
                
        // Adjust farmer's total milk
        Farmer farmer = purchase.getFarmer();
        farmer.setTotalMilkProvided(farmer.getTotalMilkProvided() - purchase.getQuantityLiters());
        farmerRepository.save(farmer);
        
        milkPurchaseRepository.delete(purchase);
        return ResponseEntity.ok().build();
    }
}
