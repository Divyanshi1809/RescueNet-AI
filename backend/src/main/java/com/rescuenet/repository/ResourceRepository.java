package com.rescuenet.repository;

import com.rescuenet.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByStatus(String status);

    List<Resource> findByType(String type);

    List<Resource> findByOwnerId(Long ownerId);

    List<Resource> findByShelterId(Long shelterId);
}
