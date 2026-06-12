package com.studentbanking.auth.service;

import com.studentbanking.auth.dto.AuthResponse;
import com.studentbanking.auth.dto.ChangePasswordRequest;
import com.studentbanking.auth.dto.LoginRequest;
import com.studentbanking.auth.dto.RegisterRequest;
import com.studentbanking.auth.entity.AuthUser;
import com.studentbanking.auth.repository.AuthUserRepository;
import com.studentbanking.common.exception.ApiException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthUserRepository authUserRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(AuthUserRepository authUserRepository) {
        this.authUserRepository = authUserRepository;
    }

    public AuthResponse register(RegisterRequest request) {
        authUserRepository.findByEmail(request.email()).ifPresent(existing -> {
            throw new ApiException("Email already registered");
        });
        if (authUserRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new ApiException("Phone number already registered");
        }

        AuthUser user = new AuthUser();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhoneNumber(request.phoneNumber());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        AuthUser saved = authUserRepository.save(user);
        return buildResponse(saved, "Registration successful");
    }

    public AuthResponse login(LoginRequest request) {
        AuthUser user = authUserRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException("Invalid email or password");
        }
        return buildResponse(user, "Login successful");
    }

    public AuthResponse changePassword(ChangePasswordRequest request) {
        AuthUser user = authUserRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException("Invalid email or password"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ApiException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        return buildResponse(authUserRepository.save(user), "Password changed successfully");
    }

    private AuthResponse buildResponse(AuthUser user, String message) {
        String accessToken = encode(user.getEmail() + ":" + Instant.now());
        String refreshToken = encode(UUID.randomUUID().toString() + ":" + user.getId());
        return new AuthResponse(user.getId(), user.getEmail(), accessToken, refreshToken, message);
    }

    private String encode(String value) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }
}
