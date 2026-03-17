package com.smartpolice.app.models;

public class GenericResponse {
    private boolean success;
    private String message;
    private String transactionId;

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public String getTransactionId() { return transactionId; }
}
