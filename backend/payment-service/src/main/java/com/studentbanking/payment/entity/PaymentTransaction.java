package com.studentbanking.payment.entity;

import com.studentbanking.common.model.BankCode;
import com.studentbanking.common.model.TransactionStatus;
import com.studentbanking.common.model.TransactionType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String reference;
    private String sourceIdentifier;
    private String destinationIdentifier;
    private String senderAccountNumber;
    private String receiverAccountNumber;
    private Long senderUserId;
    private Long receiverUserId;
    private BigDecimal amount;
    @Enumerated(EnumType.STRING)
    private TransactionStatus status;
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    @Enumerated(EnumType.STRING)
    private BankCode senderBank;
    @Enumerated(EnumType.STRING)
    private BankCode receiverBank;
    private String narration;
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() { return id; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getSourceIdentifier() { return sourceIdentifier; }
    public void setSourceIdentifier(String sourceIdentifier) { this.sourceIdentifier = sourceIdentifier; }
    public String getDestinationIdentifier() { return destinationIdentifier; }
    public void setDestinationIdentifier(String destinationIdentifier) { this.destinationIdentifier = destinationIdentifier; }
    public String getSenderAccountNumber() { return senderAccountNumber; }
    public void setSenderAccountNumber(String senderAccountNumber) { this.senderAccountNumber = senderAccountNumber; }
    public String getReceiverAccountNumber() { return receiverAccountNumber; }
    public void setReceiverAccountNumber(String receiverAccountNumber) { this.receiverAccountNumber = receiverAccountNumber; }
    public Long getSenderUserId() { return senderUserId; }
    public void setSenderUserId(Long senderUserId) { this.senderUserId = senderUserId; }
    public Long getReceiverUserId() { return receiverUserId; }
    public void setReceiverUserId(Long receiverUserId) { this.receiverUserId = receiverUserId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }
    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
    public BankCode getSenderBank() { return senderBank; }
    public void setSenderBank(BankCode senderBank) { this.senderBank = senderBank; }
    public BankCode getReceiverBank() { return receiverBank; }
    public void setReceiverBank(BankCode receiverBank) { this.receiverBank = receiverBank; }
    public String getNarration() { return narration; }
    public void setNarration(String narration) { this.narration = narration; }
    public Instant getCreatedAt() { return createdAt; }
}
