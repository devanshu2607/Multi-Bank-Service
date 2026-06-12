package com.studentbanking.ledger.service;

import com.studentbanking.ledger.dto.CreateLedgerEntryRequest;
import com.studentbanking.ledger.dto.LedgerEntryResponse;
import com.studentbanking.ledger.entity.LedgerEntry;
import com.studentbanking.ledger.repository.LedgerEntryRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class LedgerQueryService {

    private final LedgerEntryRepository ledgerEntryRepository;

    public LedgerQueryService(LedgerEntryRepository ledgerEntryRepository) {
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    public LedgerEntryResponse create(CreateLedgerEntryRequest request) {
        LedgerEntry entry = new LedgerEntry();
        entry.setAccountNumber(request.accountNumber());
        entry.setReference(request.reference());
        entry.setEntryType(request.entryType());
        entry.setAmount(request.amount());
        entry.setBalanceAfter(request.balanceAfter());
        return map(ledgerEntryRepository.save(entry));
    }

    public List<LedgerEntryResponse> getPassbook(String accountNumber) {
        return ledgerEntryRepository.findByAccountNumberOrderByCreatedAtDesc(accountNumber).stream()
                .map(this::map)
                .toList();
    }

    private LedgerEntryResponse map(LedgerEntry entry) {
        return new LedgerEntryResponse(
                entry.getAccountNumber(),
                entry.getReference(),
                entry.getEntryType(),
                entry.getAmount(),
                entry.getBalanceAfter(),
                entry.getCreatedAt()
        );
    }
}
