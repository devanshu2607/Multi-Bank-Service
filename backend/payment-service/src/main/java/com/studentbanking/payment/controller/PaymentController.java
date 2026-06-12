package com.studentbanking.payment.controller;

import com.studentbanking.payment.dto.PaymentRequest;
import com.studentbanking.payment.dto.PaymentResponse;
import com.studentbanking.payment.service.PaymentOrchestratorService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentOrchestratorService paymentOrchestratorService;
    public PaymentController(PaymentOrchestratorService paymentOrchestratorService) { this.paymentOrchestratorService = paymentOrchestratorService; }

    @PostMapping
    public PaymentResponse pay(@Valid @RequestBody PaymentRequest request) {
        return paymentOrchestratorService.process(request);
    }
}
