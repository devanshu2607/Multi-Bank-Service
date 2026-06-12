package com.studentbanking.user.service;

import com.studentbanking.common.exception.ApiException;
import com.studentbanking.user.dto.CreateUserProfileRequest;
import com.studentbanking.user.dto.UpdateUserProfileRequest;
import com.studentbanking.user.dto.UserProfileResponse;
import com.studentbanking.user.entity.UserProfile;
import com.studentbanking.user.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public UserProfileResponse create(CreateUserProfileRequest request) {
        userProfileRepository.findByAuthUserId(request.authUserId()).ifPresent(existing -> {
            throw new ApiException("Profile already exists for auth user");
        });

        UserProfile profile = new UserProfile();
        profile.setAuthUserId(request.authUserId());
        profile.setFullName(request.fullName());
        profile.setEmail(request.email());
        profile.setPhoneNumber(request.phoneNumber());
        return map(userProfileRepository.save(profile));
    }

    public UserProfileResponse getProfile(Long authUserId) {
        return userProfileRepository.findByAuthUserId(authUserId)
                .map(this::map)
                .orElseThrow(() -> new ApiException("User profile not found"));
    }

    public UserProfileResponse update(Long authUserId, UpdateUserProfileRequest request) {
        UserProfile profile = userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new ApiException("User profile not found"));
        profile.setFullName(request.fullName());
        profile.setEmail(request.email());
        profile.setPhoneNumber(request.phoneNumber());
        return map(userProfileRepository.save(profile));
    }

    private UserProfileResponse map(UserProfile profile) {
        return new UserProfileResponse(
                profile.getId(),
                profile.getAuthUserId(),
                profile.getFullName(),
                profile.getEmail(),
                profile.getPhoneNumber()
        );
    }
}
