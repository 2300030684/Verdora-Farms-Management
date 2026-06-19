package com.dairycare.controller;

import com.dairycare.model.FarmExpense;
import com.dairycare.model.MilkPurchase;
import com.dairycare.model.ProductSale;
import com.dairycare.repository.FarmExpenseRepository;
import com.dairycare.repository.MilkPurchaseRepository;
import com.dairycare.repository.ProductSaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FinanceController {

    @Autowired
    private ProductSaleRepository saleRepository;

    @Autowired
    private MilkPurchaseRepository purchaseRepository;

    @Autowired
    private FarmExpenseRepository expenseRepository;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getFinancialSummary() {
        List<ProductSale> sales = saleRepository.findAll();
        List<MilkPurchase> purchases = purchaseRepository.findAll();
        List<FarmExpense> expenses = expenseRepository.findAll();

        double totalIncome = sales.stream().mapToDouble(ProductSale::getTotalPrice).sum();
        
        double procurementExpense = purchases.stream().mapToDouble(MilkPurchase::getTotalPrice).sum();
        
        Map<String, Double> expenseByCategory = new HashMap<>();
        expenseByCategory.put("Milk Procurement", procurementExpense);

        double totalOtherExpenses = 0.0;
        for (FarmExpense expense : expenses) {
            totalOtherExpenses += expense.getAmount();
            expenseByCategory.merge(expense.getCategory(), expense.getAmount(), Double::sum);
        }

        double totalExpense = procurementExpense + totalOtherExpenses;
        double netProfit = totalIncome - totalExpense;

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("netProfit", netProfit);
        summary.put("expenseByCategory", expenseByCategory);

        return summary;
    }
}
