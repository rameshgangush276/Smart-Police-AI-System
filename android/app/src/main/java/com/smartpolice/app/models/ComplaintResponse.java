package com.smartpolice.app.models;

public class ComplaintResponse {
    private String message;
    private Complaint complaint;

    public String getMessage() { return message; }
    public Complaint getComplaint() { return complaint; }

    public static class Complaint {
        private String id;
        private String complaintId;
        private String status;
        private String complainantName;
        private String crimeCategory;
        private String incidentDate;
        private String mobileNumber;
        private String incidentLocation;

        public String getId() { return id; }
        public String getComplaintId() { return complaintId; }
        public String getStatus() { return status; }
        public String getComplainantName() { return complainantName; }
        public String getCrimeCategory() { return crimeCategory; }
        public String getIncidentDate() { return incidentDate; }
        public String getMobileNumber() { return mobileNumber; }
        public String getIncidentLocation() { return incidentLocation; }
    }
}
