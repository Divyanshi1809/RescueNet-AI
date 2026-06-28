package com.rescuenet.repository;

import com.rescuenet.entity.NGO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NGORepository extends JpaRepository<NGO, Long> {

    Optional<NGO> findByUserId(Long userId);

    Optional<NGO> findByRegistrationNumber(String registrationNumber);
}
