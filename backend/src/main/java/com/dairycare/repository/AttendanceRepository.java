package com.dairycare.repository;

import com.dairycare.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByWorkerIdAndDateBetween(Long workerId, LocalDate startDate, LocalDate endDate);
    Optional<Attendance> findByWorkerIdAndDate(Long workerId, LocalDate date);
}
