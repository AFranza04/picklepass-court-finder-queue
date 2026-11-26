package com.picklepass.backend.controller;

import java.util.List;
import java.util.Map;

import com.picklepass.backend.dto.CreateCourtRequest;
import com.picklepass.backend.model.Court;
import com.picklepass.backend.model.QueueEntry;
import com.picklepass.backend.model.Role;
import com.picklepass.backend.model.User;
import com.picklepass.backend.repository.CourtRepository;
import com.picklepass.backend.repository.QueueEntryRepository;
import com.picklepass.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courts")
public class CourtQueueController {

    private final CourtRepository courtRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final UserRepository userRepository;

    public CourtQueueController(CourtRepository courtRepository,
                                QueueEntryRepository queueEntryRepository,
                                UserRepository userRepository) {
        this.courtRepository = courtRepository;
        this.queueEntryRepository = queueEntryRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllCourts(@RequestParam(required = false) String query,
                                          @RequestParam(required = false) String status) {
        List<Court> courts = courtRepository.findAllByOrderByCreatedAtDesc();

        var result = courts.stream()
                .filter(c -> query == null || query.isBlank()
                        || c.getName().toLowerCase().contains(query.trim().toLowerCase())
                        || c.getLocation().toLowerCase().contains(query.trim().toLowerCase()))
                .filter(c -> status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)
                        || c.getStatus().equalsIgnoreCase(status.trim()))
                .map(c -> {
                    List<QueueEntry> activeQueue = queueEntryRepository
                            .findByCourtIdAndStatusInOrderByJoinedAtAsc(c.getId(), List.of("WAITING", "ON_COURT"));
                    long waitingCount = activeQueue.stream().filter(q -> "WAITING".equals(q.getStatus())).count();
                    long onCourtCount = activeQueue.stream().filter(q -> "ON_COURT".equals(q.getStatus())).count();

                    return Map.<String, Object>of(
                            "id", c.getId(),
                            "name", c.getName(),
                            "location", c.getLocation(),
                            "status", c.getStatus(),
                            "playersPerMatch", c.getPlayersPerMatch(),
                            "organizerId", c.getOrganizer().getId(),
                            "organizerName", c.getOrganizer().getFullName(),
                            "waitingCount", waitingCount,
                            "onCourtCount", onCourtCount
                    );
                }).toList();

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> createCourt(Authentication auth, @Valid @RequestBody CreateCourtRequest request) {
        User organizer = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (organizer.getRole() != Role.ORGANIZER) {
            return ResponseEntity.status(403).body(Map.of("message", "Only organizers can create courts."));
        }

        Court court = new Court();
        court.setName(request.getName().trim());
        court.setLocation(request.getLocation().trim());
        court.setPlayersPerMatch(request.getPlayersPerMatch() != null ? request.getPlayersPerMatch() : 4);
        court.setStatus("OPEN");
        court.setOrganizer(organizer);
        courtRepository.save(court);

        return ResponseEntity.ok(Map.of("message", "Court created successfully.", "id", court.getId()));
    }

    @PutMapping("/{courtId}/toggle-status")
    public ResponseEntity<?> toggleCourtStatus(Authentication auth, @PathVariable Long courtId) {
        User organizer = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Court court = courtRepository.findById(courtId).orElse(null);

        if (court == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Court not found."));
        }
        if (!court.getOrganizer().getId().equals(organizer.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You can only manage your own courts."));
        }

        court.setStatus("OPEN".equals(court.getStatus()) ? "CLOSED" : "OPEN");
        courtRepository.save(court);
        return ResponseEntity.ok(Map.of("message", "Court status updated to " + court.getStatus(), "status", court.getStatus()));
    }

    @GetMapping("/{courtId}/queue")
    public ResponseEntity<?> getCourtQueue(@PathVariable Long courtId) {
        List<QueueEntry> entries = queueEntryRepository
                .findByCourtIdAndStatusInOrderByJoinedAtAsc(courtId, List.of("ON_COURT", "WAITING"));

        var result = entries.stream().map(e -> Map.<String, Object>of(
                "entryId", e.getId(),
                "playerId", e.getPlayer().getId(),
                "playerName", e.getPlayer().getFullName(),
                "phoneNumber", e.getPlayer().getPhoneNumber(),
                "status", e.getStatus(),
                "joinedAt", e.getJoinedAt().toString()
        )).toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/my-queues")
    public ResponseEntity<?> getMyActiveQueues(Authentication auth) {
        User player = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QueueEntry> myEntries = queueEntryRepository
                .findByPlayerIdAndStatusInOrderByJoinedAtDesc(player.getId(), List.of("ON_COURT", "WAITING"));

        var result = myEntries.stream().map(e -> {
            List<QueueEntry> courtQueue = queueEntryRepository
                    .findByCourtIdAndStatusInOrderByJoinedAtAsc(e.getCourt().getId(), List.of("ON_COURT", "WAITING"));
            int position = 1;
            for (int i = 0; i < courtQueue.size(); i++) {
                if (courtQueue.get(i).getId().equals(e.getId())) {
                    position = i + 1;
                    break;
                }
            }
            return Map.<String, Object>of(
                    "entryId", e.getId(),
                    "courtId", e.getCourt().getId(),
                    "courtName", e.getCourt().getName(),
                    "location", e.getCourt().getLocation(),
                    "status", e.getStatus(),
                    "position", position
            );
        }).toList();

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{courtId}/join")
    public ResponseEntity<?> joinQueue(Authentication auth, @PathVariable Long courtId) {
        User player = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (player.getRole() != Role.PLAYER) {
            return ResponseEntity.status(403).body(Map.of("message", "Only players can join court queues."));
        }

        Court court = courtRepository.findById(courtId).orElse(null);
        if (court == null || !"OPEN".equals(court.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "This court is closed or does not exist."));
        }

        boolean alreadyQueued = queueEntryRepository
                .findByCourtIdAndPlayerIdAndStatusIn(courtId, player.getId(), List.of("WAITING", "ON_COURT"))
                .isPresent();

        if (alreadyQueued) {
            return ResponseEntity.badRequest().body(Map.of("message", "You are already in the active queue for this court."));
        }

        QueueEntry entry = new QueueEntry();
        entry.setCourt(court);
        entry.setPlayer(player);
        entry.setStatus("WAITING");
        queueEntryRepository.save(entry);

        return ResponseEntity.ok(Map.of("message", "Joined queue for " + court.getName() + "!"));
    }

    @DeleteMapping("/{courtId}/leave")
    public ResponseEntity<?> leaveQueue(Authentication auth, @PathVariable Long courtId) {
        User player = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        QueueEntry entry = queueEntryRepository
                .findByCourtIdAndPlayerIdAndStatusIn(courtId, player.getId(), List.of("WAITING"))
                .orElse(null);

        if (entry == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "You do not have a waiting queue entry for this court."));
        }

        entry.setStatus("CANCELLED");
        queueEntryRepository.save(entry);
        return ResponseEntity.ok(Map.of("message", "Left the court queue."));
    }

    @PostMapping("/{courtId}/call-next")
    public ResponseEntity<?> callNextMatch(Authentication auth, @PathVariable Long courtId) {
        User organizer = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Court court = courtRepository.findById(courtId).orElse(null);

        if (court == null || !court.getOrganizer().getId().equals(organizer.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized to manage this court's queue."));
        }

        List<QueueEntry> onCourt = queueEntryRepository
                .findByCourtIdAndStatusInOrderByJoinedAtAsc(courtId, List.of("ON_COURT"));
        if (!onCourt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Finish the current on-court match before calling the next group."));
        }

        List<QueueEntry> waiting = queueEntryRepository
                .findByCourtIdAndStatusInOrderByJoinedAtAsc(courtId, List.of("WAITING"));
        if (waiting.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No players currently waiting in the queue."));
        }

        int batchSize = Math.min(court.getPlayersPerMatch(), waiting.size());
        for (int i = 0; i < batchSize; i++) {
            QueueEntry nextPlayer = waiting.get(i);
            nextPlayer.setStatus("ON_COURT");
            queueEntryRepository.save(nextPlayer);
        }

        return ResponseEntity.ok(Map.of("message", "Called " + batchSize + " player(s) onto the court!"));
    }

    @PostMapping("/{courtId}/complete-match")
    public ResponseEntity<?> completeCurrentMatch(Authentication auth, @PathVariable Long courtId) {
        User organizer = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Court court = courtRepository.findById(courtId).orElse(null);

        if (court == null || !court.getOrganizer().getId().equals(organizer.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized to manage this court's queue."));
        }

        List<QueueEntry> onCourt = queueEntryRepository
                .findByCourtIdAndStatusInOrderByJoinedAtAsc(courtId, List.of("ON_COURT"));
        if (onCourt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No active match is currently on court."));
        }

        for (QueueEntry entry : onCourt) {
            entry.setStatus("COMPLETED");
            queueEntryRepository.save(entry);
        }

        return ResponseEntity.ok(Map.of("message", "Match completed! Court is ready for the next rotation."));
    }
}
