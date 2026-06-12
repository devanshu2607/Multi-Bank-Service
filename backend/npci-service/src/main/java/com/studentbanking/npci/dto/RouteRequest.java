package com.studentbanking.npci.dto;

public record RouteRequest(String sourceIdentifier, String targetIdentifier, String routeType) {
}
