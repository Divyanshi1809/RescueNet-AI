package com.rescuenet.service;

import com.rescuenet.entity.User;
import com.rescuenet.entity.Volunteer;
import com.rescuenet.exception.ResourceNotFoundException;
import com.rescuenet.repository.UserRepository;
import com.rescuenet.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for Volunteer profile operations.
 * Emergency request management has been moved to EmergencyService.
 */
@Service
public class VolunteerService {

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Register a user as a volunteer or update their skills if already registered.
     */
    @Transactional
    public Volunteer registerVolunteer(String username, String skills) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Volunteer volunteer = volunteerRepository.findByUserId(user.getId())
                .orElse(null);

        if (volunteer == null) {
            volunteer = Volunteer.builder()
                    .user(user)
                    .skills(skills)
                    .availability(true)
                    .currentStatus("IDLE")
                    .build();
        } else {
            volunteer.setSkills(skills);
        }

        return volunteerRepository.save(volunteer);
    }

    /**
     * Retrieve all volunteers.
     */
    public List<Volunteer> getAllVolunteers() {
        return volunteerRepository.findAll();
    }

    /**
     * Retrieve a volunteer by their volunteer profile ID.
     */
    public Volunteer getVolunteerById(Long id) {
        return volunteerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + id));
    }

    /**
     * Retrieve a volunteer profile by the associated user's ID.
     */
    public Volunteer getVolunteerByUserId(Long userId) {
        return volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found for user: " + userId));
    }

    /**
     * Update the availability flag of a volunteer.
     */
    @Transactional
    public Volunteer updateAvailability(Long id, boolean availability) {
        Volunteer volunteer = getVolunteerById(id);
        volunteer.setAvailability(availability);
        return volunteerRepository.save(volunteer);
    }

    /**
     * Retrieve all volunteers filtered by availability.
     */
    public List<Volunteer> getVolunteersByAvailability(boolean availability) {
        return volunteerRepository.findByAvailability(availability);
    }
}
