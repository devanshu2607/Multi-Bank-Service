package com.studentbanking.upi.entity;

import com.studentbanking.common.model.BankCode;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "upi_profiles")
public class UpiProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String handle;
    private String upiId;
    private String phoneNumber;
    private String defaultAccountNumber;
    private String accountHolderName;

    @Enumerated(EnumType.STRING)
    private BankCode bankCode;

    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getHandle() { return handle; }
    public void setHandle(String handle) { this.handle = handle; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getDefaultAccountNumber() { return defaultAccountNumber; }
    public void setDefaultAccountNumber(String defaultAccountNumber) { this.defaultAccountNumber = defaultAccountNumber; }
    public String getAccountHolderName() { return accountHolderName; }
    public void setAccountHolderName(String accountHolderName) { this.accountHolderName = accountHolderName; }
    public BankCode getBankCode() { return bankCode; }
    public void setBankCode(BankCode bankCode) { this.bankCode = bankCode; }
    public Instant getCreatedAt() { return createdAt; }
}
