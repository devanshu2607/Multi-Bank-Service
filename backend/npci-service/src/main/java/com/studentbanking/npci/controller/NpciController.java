package com.studentbanking.npci.controller;

import com.studentbanking.npci.dto.RouteRequest;
import com.studentbanking.npci.dto.RouteResponse;
import com.studentbanking.npci.service.RoutingService;
import java.math.BigDecimal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/npci")
public class NpciController {
    private final RoutingService routingService;
    public NpciController(RoutingService routingService) { this.routingService = routingService; }

    @PostMapping("/route")
    public RouteResponse route(@RequestBody RouteRequest request) {
        return routingService.resolve(request);
    }

    @PostMapping("/payments")
    public RouteResponse publishPaymentRequest(@RequestBody RouteRequest request, @RequestParam("amount") BigDecimal amount) {
        return routingService.resolveAndPublish(request, amount);
    }
}
