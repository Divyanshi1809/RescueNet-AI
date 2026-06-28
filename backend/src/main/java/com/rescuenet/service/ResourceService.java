package com.rescuenet.service;

import com.rescuenet.dto.ResourceRequest;
import com.rescuenet.entity.Resource;
import com.rescuenet.entity.Shelter;
import com.rescuenet.entity.User;
import com.rescuenet.exception.ResourceNotFoundException;
import com.rescuenet.repository.ResourceRepository;
import com.rescuenet.repository.ShelterRepository;
import com.rescuenet.repository.UserRepository;
import com.rescuenet.util.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ShelterRepository shelterRepository;

    @Autowired
    private UserRepository userRepository;

    public Resource createResource(ResourceRequest request, String ownerUsername) {
        User owner = userRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Owner user not found: " + ownerUsername));

        Shelter shelter = null;
        if (request.getShelterId() != null) {
            shelter = shelterRepository.findById(request.getShelterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + request.getShelterId()));
        }

        String status = request.getStatus();
        if (status == null || status.trim().isEmpty()) {
            status = Constants.RESOURCE_AVAILABLE;
        }

        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .quantity(request.getQuantity())
                .description(request.getDescription())
                .status(status)
                .location(request.getLocation())
                .shelter(shelter)
                .owner(owner)
                .build();

        return resourceRepository.save(resource);
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public List<Resource> getResourcesByStatus(String status) {
        return resourceRepository.findByStatus(status);
    }

    public List<Resource> getResourcesByType(String type) {
        return resourceRepository.findByType(type);
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public Resource updateQuantity(Long id, int quantity) {
        Resource resource = getResourceById(id);
        resource.setQuantity(quantity);
        return resourceRepository.save(resource);
    }

    public Resource updateStatus(Long id, String status) {
        Resource resource = getResourceById(id);
        resource.setStatus(status);
        return resourceRepository.save(resource);
    }
}
