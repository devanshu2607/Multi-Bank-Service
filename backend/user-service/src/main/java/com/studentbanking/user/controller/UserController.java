package com.studentbanking.user.controller;

import com.studentbanking.user.dto.CreateUserProfileRequest;
import com.studentbanking.user.dto.UpdateUserProfileRequest;
import com.studentbanking.user.dto.UserProfileResponse;
import com.studentbanking.user.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserProfileService userProfileService;
    public UserController(UserProfileService userProfileService) { this.userProfileService = userProfileService; }

    @PostMapping
    public UserProfileResponse create(@Valid @RequestBody CreateUserProfileRequest request) {
        return userProfileService.create(request);
    }

    @GetMapping("/me")
    public UserProfileResponse me(@RequestParam("authUserId") Long authUserId) {
        return userProfileService.getProfile(authUserId);
    }

    @PutMapping("/me")
    public UserProfileResponse update(@RequestParam("authUserId") Long authUserId, @Valid @RequestBody UpdateUserProfileRequest request) {
        return userProfileService.update(authUserId, request);
    }
}
