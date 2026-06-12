package com.studentbanking.bank.dto;

import java.util.List;

public record ListAccountsResponse(List<BankAccountResponse> accounts) {
}
