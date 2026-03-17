package com.smartpolice.app.models;

import java.util.List;

public class ComplaintDetailResponse {
    private String id;
    private String complaintId;
    private String status;
    private String complainantName;
    private String fatherName;
    private String mobileNumber;
    private String gender;
    private String fullAddress;
    private String incidentDate;
    private String incidentTime;
    private String incidentLocation;
    private String incidentDescription;
    private String suspectDetails;
    private String witnessDetails;
    private String createdAt;
    private List<Evidence> Evidence;
    private List<WitnessStatement> WitnessStatements;
    private Officer officer;

    public String getId() { return id; }
    public String getComplaintId() { return complaintId; }
    public String getStatus() { return status; }
    public String getComplainantName() { return complainantName; }
    public String getFatherName() { return fatherName; }
    public String getMobileNumber() { return mobileNumber; }
    public String getGender() { return gender; }
    public String getFullAddress() { return fullAddress; }
    public String getIncidentDate() { return incidentDate; }
    public String getIncidentTime() { return incidentTime; }
    public String getIncidentLocation() { return incidentLocation; }
    public String getIncidentDescription() { return incidentDescription; }
    public String getSuspectDetails() { return suspectDetails; }
    public String getWitnessDetails() { return witnessDetails; }
    public String getCreatedAt() { return createdAt; }
    public List<Evidence> getEvidence() { return Evidence; }
    public List<WitnessStatement> getWitnessStatements() { return WitnessStatements; }
    public Officer getOfficer() { return officer; }

    public static class Evidence {
        private String id;
        private String type;
        private String url;
        private String description;
        private String createdAt;

        public String getId() { return id; }
        public String getType() { return type; }
        public String getUrl() { return url; }
        public String getDescription() { return description; }
        public String getCreatedAt() { return createdAt; }
    }

    public static class WitnessStatement {
        private String id;
        private String witnessName;
        private String statement;
        private String audioUrl;
        private String createdAt;

        public String getId() { return id; }
        public String getWitnessName() { return witnessName; }
        public String getStatement() { return statement; }
        public String getAudioUrl() { return audioUrl; }
        public String getCreatedAt() { return createdAt; }
    }

    public static class Officer {
        private String name;
        private String role;
        private String station;

        public String getName() { return name; }
        public String getRole() { return role; }
        public String getStation() { return station; }
    }
}
