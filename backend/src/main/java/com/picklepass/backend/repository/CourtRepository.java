package com.picklepass.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.picklepass.backend.model.Court;

public interface CourtRepository extends JpaRepository<Court, Long> {
    List<Court> findAllByOrderByCreatedAtDesc();
    List<Court> findByOrganizerIdOrderByCreatedAtDesc(Long organizerId);
}