package com.rescuenet.service;

import com.rescuenet.entity.ActivityLog;
import com.rescuenet.entity.User;
import com.rescuenet.repository.DisasterRepository;
import com.rescuenet.repository.ResourceRepository;
import com.rescuenet.repository.ShelterRepository;
import com.rescuenet.repository.VolunteerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ShelterRepository shelterRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        long activeDisasters = disasterRepository.findByStatus("ACTIVE").size();
        long pendingDisasters = disasterRepository.findByStatus("PENDING").size();
        long totalVolunteers = volunteerRepository.count();
        long activeVolunteers = volunteerRepository.findByCurrentStatus("ACTIVE").size();
        long totalResources = resourceRepository.count();
        long totalShelters = shelterRepository.count();

        // Get count of emergency requests using EntityManager
        long pendingEmergencyRequests = (long) entityManager.createQuery(
                "SELECT COUNT(e) FROM EmergencyRequest e WHERE e.status = 'PENDING'"
        ).getSingleResult();

        metrics.put("activeDisasters", activeDisasters);
        metrics.put("pendingDisasters", pendingDisasters);
        metrics.put("totalVolunteers", totalVolunteers);
        metrics.put("activeVolunteers", activeVolunteers);
        metrics.put("totalResources", totalResources);
        metrics.put("totalShelters", totalShelters);
        metrics.put("pendingEmergencyRequests", pendingEmergencyRequests);

        return metrics;
    }

    @Transactional
    public ActivityLog logActivity(String action, String details, User user) {
        ActivityLog log = ActivityLog.builder()
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .user(user)
                .build();
        entityManager.persist(log);
        return log;
    }

    public List<ActivityLog> getAllActivityLogs() {
        return entityManager.createQuery(
                "SELECT a FROM ActivityLog a ORDER BY a.timestamp DESC", ActivityLog.class
        ).getResultList();
    }
}
