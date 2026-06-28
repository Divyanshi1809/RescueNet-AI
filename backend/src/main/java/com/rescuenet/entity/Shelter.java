package com.rescuenet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shelters")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shelter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    private double latitude;
    private double longitude;

    private int capacity;

    @Column(name = "occupied_capacity")
    private int occupiedCapacity;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(nullable = false)
    private String status; // ACTIVE, FULL, CLOSED
}
