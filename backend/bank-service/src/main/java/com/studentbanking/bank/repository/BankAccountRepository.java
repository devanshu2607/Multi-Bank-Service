package com.studentbanking.bank.repository;

import com.studentbanking.bank.entity.BankAccount;
import com.studentbanking.common.model.BankCode;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    long countByUserId(Long userId);
    boolean existsByUserIdAndBankCode(Long userId, BankCode bankCode);
    Optional<BankAccount> findByAccountNumber(String accountNumber);
    List<BankAccount> findByUserId(Long userId);
}
