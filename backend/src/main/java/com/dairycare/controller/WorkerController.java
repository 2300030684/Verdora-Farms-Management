package com.dairycare.controller;

import com.dairycare.model.Attendance;
import com.dairycare.model.Worker;
import com.dairycare.repository.AttendanceRepository;
import com.dairycare.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class WorkerController {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Worker createWorker(@RequestBody Worker worker) {
        if (worker.getDailyWage() == null) {
            worker.setDailyWage(500.0);
        }
        if (worker.getJoinDate() == null) {
            worker.setJoinDate(LocalDate.now());
        }
        return workerRepository.save(worker);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Worker> updateWorker(@PathVariable Long id, @RequestBody Worker workerDetails) {
        Worker worker = workerRepository.findById(id).orElseThrow();
        worker.setName(workerDetails.getName());
        worker.setPhone(workerDetails.getPhone());
        worker.setRole(workerDetails.getRole());
        worker.setDailyWage(workerDetails.getDailyWage());
        return ResponseEntity.ok(workerRepository.save(worker));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteWorker(@PathVariable Long id) {
        workerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Attendance> getAttendanceForDate(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return attendanceRepository.findByDate(localDate);
    }

    // Input format: List of maps [{ "workerId": 1, "date": "2026-06-19", "status": "PRESENT" }, ...]
    @PostMapping("/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> markAttendance(@RequestBody List<Map<String, Object>> attendanceData) {
        for (Map<String, Object> data : attendanceData) {
            Long workerId = Long.valueOf(data.get("workerId").toString());
            LocalDate date = LocalDate.parse(data.get("date").toString());
            String status = data.get("status").toString();

            Worker worker = workerRepository.findById(workerId).orElseThrow();

            Optional<Attendance> existing = attendanceRepository.findByWorkerIdAndDate(workerId, date);
            if (existing.isPresent()) {
                Attendance att = existing.get();
                att.setStatus(status);
                attendanceRepository.save(att);
            } else {
                Attendance att = Attendance.builder()
                        .worker(worker)
                        .date(date)
                        .status(status)
                        .build();
                attendanceRepository.save(att);
            }
        }
        return ResponseEntity.ok("Attendance marked successfully");
    }

    @GetMapping("/salary")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> calculateSalary(@RequestParam int year, @RequestParam int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Worker> workers = workerRepository.findAll();
        List<Map<String, Object>> salaryReport = new ArrayList<>();

        for (Worker worker : workers) {
            List<Attendance> attendances = attendanceRepository.findByWorkerIdAndDateBetween(worker.getId(), startDate, endDate);
            
            int daysPresent = 0;
            int daysHalf = 0;
            
            for (Attendance att : attendances) {
                if ("PRESENT".equalsIgnoreCase(att.getStatus())) {
                    daysPresent++;
                } else if ("HALF_DAY".equalsIgnoreCase(att.getStatus())) {
                    daysHalf++;
                }
            }

            double effectiveDays = daysPresent + (daysHalf * 0.5);
            double totalSalary = effectiveDays * worker.getDailyWage();

            Map<String, Object> report = new HashMap<>();
            report.put("worker", worker);
            report.put("daysPresent", daysPresent);
            report.put("daysHalf", daysHalf);
            report.put("daysAbsent", attendances.size() - daysPresent - daysHalf); // Actually, we should check against days in month, but this is days marked
            report.put("effectiveDays", effectiveDays);
            report.put("totalSalary", totalSalary);

            salaryReport.add(report);
        }

        return salaryReport;
    }
}
