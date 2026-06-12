package com.studentbanking.upi.service;

import com.studentbanking.common.dto.AccountDetailsResponse;
import com.studentbanking.common.dto.UpiResolutionResponse;
import com.studentbanking.common.exception.ApiException;
import com.studentbanking.upi.dto.CreateUpiProfileRequest;
import com.studentbanking.upi.dto.UpdateDefaultAccountRequest;
import com.studentbanking.upi.dto.UpiProfileResponse;
import com.studentbanking.upi.entity.UpiProfile;
import com.studentbanking.upi.repository.UpiProfileRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class UpiProfileService {

    private final UpiProfileRepository upiProfileRepository;
    private final RestClient restClient;

    public UpiProfileService(
            UpiProfileRepository upiProfileRepository,
            @Value("${services.bank-service.url}") String bankServiceUrl
    ) {
        this.upiProfileRepository = upiProfileRepository;
        this.restClient = RestClient.builder().baseUrl(bankServiceUrl).build();
    }

    public UpiProfileResponse create(CreateUpiProfileRequest request) {
        AccountDetailsResponse account = restClient.get()
                .uri("/api/accounts/{accountNumber}", request.defaultAccountNumber())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(AccountDetailsResponse.class);

        if (account == null) {
            throw new ApiException("Default account not found");
        }
        if (!request.userId().equals(account.userId())) {
            throw new ApiException("Default account does not belong to the user");
        }

        String upiId = sanitize(account.accountHolderName()) + "@" + request.handle().toLowerCase();
        upiProfileRepository.findByUpiId(upiId).ifPresent(existing -> {
            throw new ApiException("UPI ID already exists");
        });
        upiProfileRepository.findByPhoneNumber(request.phoneNumber()).ifPresent(existing -> {
            throw new ApiException("Phone number already linked");
        });

        UpiProfile profile = new UpiProfile();
        profile.setUserId(request.userId());
        profile.setHandle(request.handle().toLowerCase());
        profile.setUpiId(upiId);
        profile.setPhoneNumber(request.phoneNumber());
        profile.setDefaultAccountNumber(account.accountNumber());
        profile.setBankCode(account.bankCode());
        profile.setAccountHolderName(account.accountHolderName());
        return map(upiProfileRepository.save(profile));
    }

    public List<UpiProfileResponse> getUserProfiles(Long userId) {
        return upiProfileRepository.findByUserId(userId).stream().map(this::map).toList();
    }

    public UpiProfileResponse updateDefaultAccount(String upiId, UpdateDefaultAccountRequest request) {
        UpiProfile profile = upiProfileRepository.findByUpiId(upiId)
                .orElseThrow(() -> new ApiException("UPI ID not found"));
        if (!profile.getUserId().equals(request.userId())) {
            throw new ApiException("UPI profile does not belong to this user");
        }
        AccountDetailsResponse account = loadAccount(request.defaultAccountNumber());
        if (!request.userId().equals(account.userId())) {
            throw new ApiException("Default account does not belong to the user");
        }
        profile.setDefaultAccountNumber(account.accountNumber());
        profile.setBankCode(account.bankCode());
        profile.setAccountHolderName(account.accountHolderName());
        return map(upiProfileRepository.save(profile));
    }

    public UpiResolutionResponse resolveUpi(String upiId) {
        UpiProfile profile = upiProfileRepository.findByUpiId(upiId)
                .orElseThrow(() -> new ApiException("UPI ID not found"));
        return mapResolution(profile);
    }

    public UpiResolutionResponse resolvePhone(String phoneNumber) {
        UpiProfile profile = upiProfileRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new ApiException("Phone number not linked"));
        return mapResolution(profile);
    }

    private UpiResolutionResponse mapResolution(UpiProfile profile) {
        return new UpiResolutionResponse(
                profile.getUserId(),
                profile.getUpiId(),
                profile.getPhoneNumber(),
                profile.getDefaultAccountNumber(),
                profile.getBankCode(),
                profile.getAccountHolderName()
        );
    }

    private AccountDetailsResponse loadAccount(String accountNumber) {
        AccountDetailsResponse account = restClient.get()
                .uri("/api/accounts/{accountNumber}", accountNumber)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(AccountDetailsResponse.class);
        if (account == null) {
            throw new ApiException("Account not found");
        }
        return account;
    }

    private UpiProfileResponse map(UpiProfile profile) {
        return new UpiProfileResponse(
                profile.getUserId(),
                profile.getUpiId(),
                profile.getPhoneNumber(),
                profile.getDefaultAccountNumber(),
                profile.getBankCode(),
                profile.getAccountHolderName()
        );
    }

    private String sanitize(String value) {
        return value.toLowerCase().replaceAll("[^a-z0-9]", "");
    }
}
