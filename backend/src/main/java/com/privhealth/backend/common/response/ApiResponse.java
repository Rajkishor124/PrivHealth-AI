package com.privhealth.backend.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private PageMeta meta;
    private ErrorDetails error;
    private String timestamp;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Success")
                .data(data)
                .timestamp(Instant.now().toString())
                .build();
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(Instant.now().toString())
                .build();
    }

    public static <T> ApiResponse<T> ok(String message, T data, PageMeta meta) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .meta(meta)
                .timestamp(Instant.now().toString())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String code) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(ErrorDetails.builder().code(code).build())
                .timestamp(Instant.now().toString())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String code, java.util.List<FieldError> details) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(ErrorDetails.builder().code(code).details(details).build())
                .timestamp(Instant.now().toString())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDetails {
        private String code;
        private java.util.List<FieldError> details;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
    }
}
