package com.studentbanking.upi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.studentbanking.upi", "com.studentbanking.common"})
public class UpiServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UpiServiceApplication.class, args);
    }
}
