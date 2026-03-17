package com.smartpolice.app.models;

public class AadhaarSignRequest {
    private String documentId;
    private String aadhaarNumber;
    private String otp;
    private String transactionId;

    public AadhaarSignRequest(String documentId, String aadhaarNumber) {
        this.documentId = documentId;
        this.aadhaarNumber = aadhaarNumber;
    }

    public AadhaarSignRequest(String documentId, String otp, String transactionId) {
        this.documentId = documentId;
        this.otp = otp;
        this.transactionId = transactionId;
    }

    public String getDocumentId() { return documentId; }
    public String getAadhaarNumber() { return aadhaarNumber; }
    public String getOtp() { return otp; }
    public String getTransactionId() { return transactionId; }
}
