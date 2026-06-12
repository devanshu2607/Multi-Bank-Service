package com.studentbanking.bank.controller;

import com.studentbanking.bank.dto.BankAccountResponse;
import com.studentbanking.bank.dto.CreateBankAccountRequest;
import com.studentbanking.bank.service.BankAccountService;
import com.studentbanking.common.dto.AccountDetailsResponse;
import com.studentbanking.common.dto.AmountOperationRequest;
import com.studentbanking.common.dto.AmountOperationResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts")
public class BankController {
    private final BankAccountService bankAccountService;

    public BankController(BankAccountService bankAccountService) {
        this.bankAccountService = bankAccountService;
    }

    @PostMapping
    public BankAccountResponse create(@Valid @RequestBody CreateBankAccountRequest request) {
        return bankAccountService.create(request);
    }

    @GetMapping
    public List<BankAccountResponse> list(@RequestParam("userId") Long userId) {
        return bankAccountService.getUserAccounts(userId);
    }

    @GetMapping("/{accountNumber}")
    public AccountDetailsResponse get(@PathVariable("accountNumber") String accountNumber) {
        return bankAccountService.getAccount(accountNumber);
    }

    @DeleteMapping("/{accountNumber}")
    public BankAccountResponse delete(@PathVariable("accountNumber") String accountNumber, @RequestParam("userId") Long userId) {
        return bankAccountService.delete(accountNumber, userId);
    }

    @PostMapping("/{accountNumber}/debit")
    public AmountOperationResponse debit(@PathVariable("accountNumber") String accountNumber, @RequestBody AmountOperationRequest request) {
        return bankAccountService.debit(accountNumber, request);
    }

    @PostMapping("/{accountNumber}/credit")
    public AmountOperationResponse credit(@PathVariable("accountNumber") String accountNumber, @RequestBody AmountOperationRequest request) {
        return bankAccountService.credit(accountNumber, request);
    }
}
