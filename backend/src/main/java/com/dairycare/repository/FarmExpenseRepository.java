package com.dairycare.repository;

import com.dairycare.model.FarmExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmExpenseRepository extends JpaRepository<FarmExpense, Long> {
}
