package com.rescuenet.service;

import com.rescuenet.entity.NGO;
import com.rescuenet.entity.User;
import com.rescuenet.exception.ResourceNotFoundException;
import com.rescuenet.repository.NGORepository;
import com.rescuenet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NGOService {

    @Autowired
    private NGORepository ngoRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public NGO registerNGO(String username, NGO ngoDetails) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        NGO ngo = ngoRepository.findByUserId(user.getId())
                .orElse(null);

        if (ngo == null) {
            ngo = NGO.builder()
                    .user(user)
                    .name(ngoDetails.getName())
                    .registrationNumber(ngoDetails.getRegistrationNumber())
                    .contactPerson(ngoDetails.getContactPerson())
                    .description(ngoDetails.getDescription())
                    .focusArea(ngoDetails.getFocusArea())
                    .address(ngoDetails.getAddress())
                    .build();
        } else {
            ngo.setName(ngoDetails.getName());
            ngo.setRegistrationNumber(ngoDetails.getRegistrationNumber());
            ngo.setContactPerson(ngoDetails.getContactPerson());
            ngo.setDescription(ngoDetails.getDescription());
            ngo.setFocusArea(ngoDetails.getFocusArea());
            ngo.setAddress(ngoDetails.getAddress());
        }

        return ngoRepository.save(ngo);
    }

    public List<NGO> getAllNGOs() {
        return ngoRepository.findAll();
    }

    public NGO getNGOById(Long id) {
        return ngoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NGO profile not found with id: " + id));
    }

    public NGO getNGOByUserId(Long userId) {
        return ngoRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO profile not found for user: " + userId));
    }
}
