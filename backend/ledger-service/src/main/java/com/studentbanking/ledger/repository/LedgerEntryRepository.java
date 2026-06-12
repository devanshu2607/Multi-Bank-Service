package com.studentbanking.ledger.repository;

import com.studentbanking.ledger.entity.LedgerEntry;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {
    List<LedgerEntry> findByAccountNumberOrderByCreatedAtDesc(String accountNumber);
}
