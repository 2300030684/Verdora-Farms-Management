
package com.dairycare.controller;

import com.dairycare.model.FarmExpense;
import com.dairycare.repository.FarmExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FarmExpenseController {

    @Autowired
    private FarmExpenseRepository expenseRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<FarmExpense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public FarmExpense createExpense(@RequestBody FarmExpense expense) {
        return expenseRepository.save(expense);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .map(expense -> {
                    expenseRepository.delete(expense);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
