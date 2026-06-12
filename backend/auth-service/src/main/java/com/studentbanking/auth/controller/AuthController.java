package com.studentbanking.auth.controller;

import com.studentbanking.auth.dto.AuthResponse;
import com.studentbanking.auth.dto.ChangePasswordRequest;
import com.studentbanking.auth.dto.LoginRequest;
import com.studentbanking.auth.dto.RegisterRequest;
import com.studentbanking.auth.service.AuthService;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/change-password")
    public AuthResponse changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        return authService.changePassword(request);
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("service", "auth-service", "status", "UP", "timestamp", Instant.now());
    }
}
