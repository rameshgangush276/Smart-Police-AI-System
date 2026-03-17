package com.smartpolice.app.models;

public class EvidenceResponse {
    private String message;
    private Evidence evidence;

    public String getMessage() { return message; }
    public Evidence getEvidence() { return evidence; }

    public static class Evidence {
        private String id;
        private String url;
        public String getId() { return id; }
        public String getUrl() { return url; }
    }
}
