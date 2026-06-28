package com.rescuenet.util;

public class Constants {

    // Roles
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_VOLUNTEER = "ROLE_VOLUNTEER";
    public static final String ROLE_NGO = "ROLE_NGO";
    public static final String ROLE_USER = "ROLE_USER";

    // Disaster Severity
    public static final String SEVERITY_LOW = "LOW";
    public static final String SEVERITY_MEDIUM = "MEDIUM";
    public static final String SEVERITY_HIGH = "HIGH";
    public static final String SEVERITY_CRITICAL = "CRITICAL";

    // Disaster Status
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_RESOLVED = "RESOLVED";

    // Resource Status
    public static final String RESOURCE_AVAILABLE = "AVAILABLE";
    public static final String RESOURCE_ALLOCATED = "ALLOCATED";
    public static final String RESOURCE_REQUESTED = "REQUESTED";

    // Emergency Request Status
    public static final String REQUEST_PENDING = "PENDING";
    public static final String REQUEST_ASSIGNED = "ASSIGNED";
    public static final String REQUEST_COMPLETED = "COMPLETED";

    // Response Messages
    public static final String MSG_SUCCESS = "Operation completed successfully.";
    public static final String MSG_NOT_FOUND = "Resource not found.";
    public static final String MSG_UNAUTHORIZED = "Unauthorized access.";
}
