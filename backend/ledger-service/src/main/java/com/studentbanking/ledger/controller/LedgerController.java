package com.studentbanking.ledger.controller;

import com.studentbanking.ledger.dto.CreateLedgerEntryRequest;
import com.studentbanking.ledger.dto.LedgerEntryResponse;
import com.studentbanking.ledger.service.LedgerQueryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ledger")
public class LedgerController {
    private final LedgerQueryService ledgerQueryService;
    public LedgerController(LedgerQueryService ledgerQueryService) { this.ledgerQueryService = ledgerQueryService; }

    @PostMapping
    public LedgerEntryResponse create(@Valid @RequestBody CreateLedgerEntryRequest request) {
        return ledgerQueryService.create(request);
    }

    @GetMapping("/{accountNumber}")
    public List<LedgerEntryResponse> passbook(@PathVariable("accountNumber") String accountNumber) {
        return ledgerQueryService.getPassbook(accountNumber);
    }
}
