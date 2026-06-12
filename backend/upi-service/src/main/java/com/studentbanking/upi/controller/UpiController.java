package com.studentbanking.upi.controller;

import com.studentbanking.common.dto.UpiResolutionResponse;
import com.studentbanking.upi.dto.CreateUpiProfileRequest;
import com.studentbanking.upi.dto.UpdateDefaultAccountRequest;
import com.studentbanking.upi.dto.UpiProfileResponse;
import com.studentbanking.upi.service.UpiProfileService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/upi")
public class UpiController {
    private final UpiProfileService upiProfileService;

    public UpiController(UpiProfileService upiProfileService) {
        this.upiProfileService = upiProfileService;
    }

    @PostMapping
    public UpiProfileResponse create(@Valid @RequestBody CreateUpiProfileRequest request) {
        return upiProfileService.create(request);
    }

    @GetMapping
    public List<UpiProfileResponse> list(@RequestParam("userId") Long userId) {
        return upiProfileService.getUserProfiles(userId);
    }

    @PutMapping("/{upiId}/default-account")
    public UpiProfileResponse updateDefaultAccount(@PathVariable("upiId") String upiId, @Valid @RequestBody UpdateDefaultAccountRequest request) {
        return upiProfileService.updateDefaultAccount(upiId, request);
    }

    @GetMapping("/resolve/upi/{upiId}")
    public UpiResolutionResponse resolveUpi(@PathVariable("upiId") String upiId) {
        return upiProfileService.resolveUpi(upiId);
    }

    @GetMapping("/resolve/phone/{phoneNumber}")
    public UpiResolutionResponse resolvePhone(@PathVariable("phoneNumber") String phoneNumber) {
        return upiProfileService.resolvePhone(phoneNumber);
    }
}
