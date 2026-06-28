package com.rescuenet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requester_name", nullable = false)
    private String requesterName;

    @Column(name = "requester_phone", nullable = false)
    private String requesterPhone;

    @Column(nullable = false)
    private String location;

    private double latitude;
    private double longitude;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    private String status; // PENDING, ASSIGNED, COMPLETED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_volunteer_id")
    private Volunteer assignedVolunteer;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;
}
