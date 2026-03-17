package com.smartpolice.app.models;

public class ProfileUpdateRequest {
    private String designation;
    private String aadhaarNumber;
    private String signatureImage;

    public ProfileUpdateRequest(String designation, String aadhaarNumber, String signatureImage) {
        this.designation = designation;
        this.aadhaarNumber = aadhaarNumber;
        this.signatureImage = signatureImage;
    }

    public String getDesignation() { return designation; }
    public String getAadhaarNumber() { return aadhaarNumber; }
    public String getSignatureImage() { return signatureImage; }
}
