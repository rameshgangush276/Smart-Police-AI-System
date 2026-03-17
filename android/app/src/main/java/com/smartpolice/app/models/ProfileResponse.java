package com.smartpolice.app.models;

public class ProfileResponse {
    private boolean success;
    private Officer officer;

    public static class Officer {
        private String id;
        private String officerId;
        private String name;
        private String role;
        private String station;
        private String designation;
        private String signatureImage;
        private String aadhaarNumber;

        public String getId() { return id; }
        public String getOfficerId() { return officerId; }
        public String getName() { return name; }
        public String getRole() { return role; }
        public String getStation() { return station; }
        public String getDesignation() { return designation; }
        public String getSignatureImage() { return signatureImage; }
        public String getAadhaarNumber() { return aadhaarNumber; }
    }

    public boolean isSuccess() { return success; }
    public Officer getOfficer() { return officer; }
}
