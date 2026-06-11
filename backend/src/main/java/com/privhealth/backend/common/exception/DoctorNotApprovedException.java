package com.privhealth.backend.common.exception;

public class DoctorNotApprovedException extends RuntimeException {
    public DoctorNotApprovedException() {
        super("Your doctor account is not yet approved. Please wait for admin approval.");
    }
}
