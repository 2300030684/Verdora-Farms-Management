package com.dairycare.controller;

import com.dairycare.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping("/predict-milk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> predictMilkYield(@RequestBody Map<String, Object> data) {
        String prompt = "Act as an expert dairy farm AI. Based on the following data about a cow, predict its milk yield for the next 7 days. Provide a short, structured response. Data: " + data.toString();
        String aiResponse = aiService.generateResponse(prompt);
        return ResponseEntity.ok(Map.of("prediction", aiResponse));
    }

    @PostMapping("/predict-disease")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> predictDisease(@RequestBody Map<String, Object> data) {
        String symptoms = (String) data.getOrDefault("symptoms", "No symptoms provided");
        String prompt = "Act as an expert veterinary AI. A dairy cow is exhibiting the following symptoms: " + symptoms + ". What are the top 3 most likely diseases, and what immediate actions should the farmer take? Keep it concise and formatted.";
        String aiResponse = aiService.generateResponse(prompt);
        return ResponseEntity.ok(Map.of("diagnosis", aiResponse));
    }

    @PostMapping("/assistant")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> askAssistant(@RequestBody Map<String, String> data) {
        String prompt = data.getOrDefault("prompt", "Hello");
        String fullPrompt = "You are Verdora Farms, an intelligent assistant for dairy farmers. Answer the following concisely: " + prompt;
        String aiResponse = aiService.generateResponse(fullPrompt);
        return ResponseEntity.ok(Map.of("reply", aiResponse));
    }
}
