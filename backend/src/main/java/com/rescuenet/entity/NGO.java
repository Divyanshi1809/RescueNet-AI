package com.rescuenet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ngos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NGO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(name = "registration_number", unique = true)
    private String registrationNumber;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "focus_area")
    private String focusArea; // e.g. Rescue, Medical, Food, Housing

    private String address;
}
