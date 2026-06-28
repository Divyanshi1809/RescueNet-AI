package com.rescuenet.service;

import com.rescuenet.dto.DisasterRequest;
import com.rescuenet.entity.DisasterReport;
import com.rescuenet.entity.User;
import com.rescuenet.exception.ResourceNotFoundException;
import com.rescuenet.repository.DisasterRepository;
import com.rescuenet.repository.UserRepository;
import com.rescuenet.util.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DisasterService {

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private UserRepository userRepository;

    public DisasterReport createReport(DisasterRequest request, String reporterUsername) {
        User reporter = userRepository.findByUsername(reporterUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter user not found: " + reporterUsername));

        String status = request.getStatus();
        if (status == null || status.trim().isEmpty()) {
            status = Constants.STATUS_PENDING;
        }

        DisasterReport report = DisasterReport.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .disasterType(request.getDisasterType())
                .severity(request.getSeverity())
                .status(status)
                .reportedAt(LocalDateTime.now())
                .reportedBy(reporter)
                .build();

        return disasterRepository.save(report);
    }

    public List<DisasterReport> getAllReports() {
        return disasterRepository.findAll();
    }

    public List<DisasterReport> getReportsByStatus(String status) {
        return disasterRepository.findByStatus(status);
    }

    public DisasterReport getReportById(Long id) {
        return disasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disaster report not found with id: " + id));
    }

    public DisasterReport updateReportStatus(Long id, String status) {
        DisasterReport report = getReportById(id);
        report.setStatus(status);
        return disasterRepository.save(report);
    }

    public DisasterReport updateReportSeverity(Long id, String severity) {
        DisasterReport report = getReportById(id);
        report.setSeverity(severity);
        return disasterRepository.save(report);
    }
}
