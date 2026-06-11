package com.privhealth.backend.common.exception;

public class EmailExistsException extends RuntimeException {
    public EmailExistsException(String email) {
        super("An account with email '" + email + "' already exists");
    }
}
