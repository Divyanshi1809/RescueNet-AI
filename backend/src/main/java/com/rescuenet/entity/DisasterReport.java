package com.rescuenet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "disaster_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisasterReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String location; // format: "latitude, longitude" or text address

    private double latitude;
    private double longitude;

    @Column(name = "disaster_type", nullable = false)
    private String disasterType; // e.g. FLOOD, EARTHQUAKE, FIRE

    @Column(nullable = false)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    private String status; // PENDING, ACTIVE, RESOLVED

    @Column(name = "reported_at")
    private LocalDateTime reportedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reported_by_id")
    private User reportedBy;
}
