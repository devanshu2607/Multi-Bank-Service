package com.studentbanking.payment.dto;

public record NpciRouteRequest(
        String sourceIdentifier,
        String targetIdentifier,
        String routeType
) {
}
