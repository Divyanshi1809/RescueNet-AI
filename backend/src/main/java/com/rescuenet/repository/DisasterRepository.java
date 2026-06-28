package com.rescuenet.repository;

import com.rescuenet.entity.DisasterReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisasterRepository extends JpaRepository<DisasterReport, Long> {

    List<DisasterReport> findByStatus(String status);

    List<DisasterReport> findBySeverity(String severity);

    List<DisasterReport> findByDisasterType(String disasterType);
}
