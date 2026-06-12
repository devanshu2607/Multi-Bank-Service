package com.studentbanking.bank.service;

import com.studentbanking.bank.dto.BankAccountResponse;
import com.studentbanking.bank.dto.CreateBankAccountRequest;
import com.studentbanking.bank.entity.BankAccount;
import com.studentbanking.bank.repository.BankAccountRepository;
import com.studentbanking.common.dto.AccountDetailsResponse;
import com.studentbanking.common.dto.AmountOperationRequest;
import com.studentbanking.common.dto.AmountOperationResponse;
import com.studentbanking.common.exception.ApiException;
import com.studentbanking.common.model.AccountStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BankAccountService {

    private static final int MAX_ACCOUNTS_PER_USER = 3;

    private final BankAccountRepository bankAccountRepository;

    public BankAccountService(BankAccountRepository bankAccountRepository) {
        this.bankAccountRepository = bankAccountRepository;
    }

    @Transactional
    public BankAccountResponse create(CreateBankAccountRequest request) {
        if (bankAccountRepository.countByUserId(request.userId()) >= MAX_ACCOUNTS_PER_USER) {
            throw new ApiException("A user can open maximum 3 bank accounts");
        }
        if (bankAccountRepository.existsByUserIdAndBankCode(request.userId(), request.bankCode())) {
            throw new ApiException("User already has an account in " + request.bankCode());
        }

        BankAccount account = new BankAccount();
        account.setUserId(request.userId());
        account.setBankCode(request.bankCode());
        account.setAccountHolderName(request.accountHolderName());
        account.setBalance(request.openingBalance());
        account.setStatus(AccountStatus.ACTIVE);
        account.setAccountNumber(request.bankCode().name() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return map(bankAccountRepository.save(account));
    }

    public List<BankAccountResponse> getUserAccounts(Long userId) {
        return bankAccountRepository.findByUserId(userId).stream()
                .map(this::map)
                .toList();
    }

    public AccountDetailsResponse getAccount(String accountNumber) {
        BankAccount account = loadAccount(accountNumber);
        return new AccountDetailsResponse(
                account.getAccountNumber(),
                account.getUserId(),
                account.getAccountHolderName(),
                account.getBankCode(),
                account.getBalance(),
                account.getStatus().name()
        );
    }

    @Transactional
    public BankAccountResponse delete(String accountNumber, Long userId) {
        BankAccount account = loadAccount(accountNumber);
        if (!account.getUserId().equals(userId)) {
            throw new ApiException("Account does not belong to this user");
        }
        bankAccountRepository.delete(account);
        return map(account);
    }

    @Transactional
    public AmountOperationResponse debit(String accountNumber, AmountOperationRequest request) {
        BankAccount account = loadAccount(accountNumber);
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new ApiException("Account is not active");
        }
        if (account.getBalance().compareTo(request.amount()) < 0) {
            throw new ApiException("Insufficient balance");
        }
        account.setBalance(account.getBalance().subtract(request.amount()));
        BankAccount saved = bankAccountRepository.save(account);
        return new AmountOperationResponse(saved.getAccountNumber(), saved.getBalance(), request.reference(), "DEBIT_SUCCESS");
    }

    @Transactional
    public AmountOperationResponse credit(String accountNumber, AmountOperationRequest request) {
        BankAccount account = loadAccount(accountNumber);
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new ApiException("Account is not active");
        }
        account.setBalance(account.getBalance().add(request.amount()));
        BankAccount saved = bankAccountRepository.save(account);
        return new AmountOperationResponse(saved.getAccountNumber(), saved.getBalance(), request.reference(), "CREDIT_SUCCESS");
    }

    private BankAccount loadAccount(String accountNumber) {
        return bankAccountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ApiException("Account not found: " + accountNumber));
    }

    private BankAccountResponse map(BankAccount account) {
        return new BankAccountResponse(
                account.getAccountNumber(),
                account.getUserId(),
                account.getAccountHolderName(),
                account.getBankCode(),
                account.getBalance(),
                account.getStatus().name()
        );
    }
}
