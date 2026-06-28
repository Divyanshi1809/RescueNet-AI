package com.rescuenet.service;

import com.rescuenet.entity.Shelter;
import com.rescuenet.exception.ResourceNotFoundException;
import com.rescuenet.repository.ShelterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShelterService {

    @Autowired
    private ShelterRepository shelterRepository;

    public Shelter createShelter(Shelter shelter) {
        if (shelter.getStatus() == null || shelter.getStatus().trim().isEmpty()) {
            shelter.setStatus("ACTIVE");
        }
        return shelterRepository.save(shelter);
    }

    public List<Shelter> getAllShelters() {
        return shelterRepository.findAll();
    }

    public List<Shelter> getSheltersByStatus(String status) {
        return shelterRepository.findByStatus(status);
    }

    public Shelter getShelterById(Long id) {
        return shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));
    }

    public Shelter updateOccupancy(Long id, int occupiedCapacity) {
        Shelter shelter = getShelterById(id);
        if (occupiedCapacity > shelter.getCapacity()) {
            throw new IllegalArgumentException("Occupied capacity cannot exceed total capacity");
        }
        shelter.setOccupiedCapacity(occupiedCapacity);
        if (occupiedCapacity == shelter.getCapacity()) {
            shelter.setStatus("FULL");
        } else if (shelter.getStatus().equals("FULL")) {
            shelter.setStatus("ACTIVE");
        }
        return shelterRepository.save(shelter);
    }

    public Shelter updateStatus(Long id, String status) {
        Shelter shelter = getShelterById(id);
        shelter.setStatus(status);
        return shelterRepository.save(shelter);
    }
}
