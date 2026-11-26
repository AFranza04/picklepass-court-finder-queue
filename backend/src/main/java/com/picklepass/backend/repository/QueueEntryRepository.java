package com.picklepass.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.picklepass.backend.model.QueueEntry;

public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {
    List<QueueEntry> findByCourtIdAndStatusInOrderByJoinedAtAsc(Long courtId, List<String> statuses);
    Optional<QueueEntry> findByCourtIdAndPlayerIdAndStatusIn(Long courtId, Long playerId, List<String> statuses);
    List<QueueEntry> findByPlayerIdAndStatusInOrderByJoinedAtDesc(Long playerId, List<String> statuses);
}