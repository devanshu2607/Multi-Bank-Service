package com.studentbanking.npci;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.studentbanking.npci", "com.studentbanking.common"})
public class NpciServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NpciServiceApplication.class, args);
    }
}
