package com.smartpolice.app.models;

public class ComplaintRequest {
    private String complainantName;
    private String fatherHusbandName;
    private String mobileNumber;
    private String address;
    private String incidentDate;
    private String incidentTime;
    private String incidentLocation;
    private String crimeCategory;
    private String incidentDescription;
    private String suspectDetails;
    private String witnessDetails;
    private String gender;
    private Double latitude;
    private Double longitude;

    public ComplaintRequest(String complainantName, String fatherHusbandName, String mobileNumber, String gender, String address, String incidentDate, String incidentTime, String incidentLocation, Double latitude, Double longitude, String crimeCategory, String incidentDescription, String suspectDetails, String witnessDetails) {
        this.complainantName = complainantName;
        this.fatherHusbandName = fatherHusbandName;
        this.mobileNumber = mobileNumber;
        this.gender = gender;
        this.address = address;
        this.incidentDate = incidentDate;
        this.incidentTime = incidentTime;
        this.incidentLocation = incidentLocation;
        this.latitude = latitude;
        this.longitude = longitude;
        this.crimeCategory = crimeCategory;
        this.incidentDescription = incidentDescription;
        this.suspectDetails = suspectDetails;
        this.witnessDetails = witnessDetails;
    }
}
