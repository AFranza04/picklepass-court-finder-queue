package com.picklepass.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @GetMapping("/player/dashboard")
    public ResponseEntity<?> playerDashboard(Authentication auth) {
        return ResponseEntity.ok(Map.of(
                "role", "PLAYER",
                "user", auth.getName(),
                "message", "Welcome to the Pickleball Player Portal. Ready to find courts and join match queues."
        ));
    }

    @GetMapping("/organizer/dashboard")
    public ResponseEntity<?> organizerDashboard(Authentication auth) {
        return ResponseEntity.ok(Map.of(
                "role", "ORGANIZER",
                "user", auth.getName(),
                "message", "Welcome to the Court Organizer Console. Ready to manage venues and call next matches."
        ));
    }
}