package com.studentbanking.upi.repository;

import com.studentbanking.upi.entity.UpiProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UpiProfileRepository extends JpaRepository<UpiProfile, Long> {
    Optional<UpiProfile> findByUpiId(String upiId);
    Optional<UpiProfile> findByPhoneNumber(String phoneNumber);
    List<UpiProfile> findByUserId(Long userId);
}
