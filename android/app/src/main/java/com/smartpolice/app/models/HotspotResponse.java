package com.smartpolice.app.models;

import java.util.List;

public class HotspotResponse {
    private boolean success;
    private List<Hotspot> data;

    public boolean isSuccess() { return success; }
    public List<Hotspot> getData() { return data; }

    public static class Hotspot {
        private String complaintId;
        private String crimeCategory;
        private double latitude;
        private double longitude;
        private String locationDesc;

        public String getComplaintId() { return complaintId; }
        public String getCrimeCategory() { return crimeCategory; }
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
        public String getLocationDesc() { return locationDesc; }
    }
}
