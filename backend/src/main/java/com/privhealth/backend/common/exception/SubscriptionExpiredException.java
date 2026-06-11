package com.privhealth.backend.common.exception;

public class SubscriptionExpiredException extends RuntimeException {
    public SubscriptionExpiredException(String message) {
        super(message);
    }
}
