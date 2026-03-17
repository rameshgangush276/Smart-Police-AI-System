package com.smartpolice.app.models;

import java.util.List;

public class WorkloadResponse {
    private boolean success;
    private List<OfficerWorkload> data;

    public boolean isSuccess() { return success; }
    public List<OfficerWorkload> getData() { return data; }

    public static class OfficerWorkload {
        private String officerId;
        private String officerName;
        private String station;
        private int pendingCases;
        private int closedCases;
        private int totalCases;

        public String getOfficerId() { return officerId; }
        public String getOfficerName() { return officerName; }
        public String getStation() { return station; }
        public int getPendingCases() { return pendingCases; }
        public int getClosedCases() { return closedCases; }
        public int getTotalCases() { return totalCases; }
    }
}
