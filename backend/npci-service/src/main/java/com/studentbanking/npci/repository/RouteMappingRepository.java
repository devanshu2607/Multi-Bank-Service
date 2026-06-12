package com.studentbanking.npci.repository;

import com.studentbanking.npci.entity.RouteMapping;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RouteMappingRepository extends JpaRepository<RouteMapping, Long> {
    Optional<RouteMapping> findBySourceIdentifierAndTargetIdentifierAndRouteType(String sourceIdentifier, String targetIdentifier, String routeType);
}
