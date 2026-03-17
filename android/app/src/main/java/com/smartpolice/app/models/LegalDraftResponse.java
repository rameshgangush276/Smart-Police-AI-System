package com.smartpolice.app.models;

public class LegalDraftResponse {
    private boolean success;
    private String draft_id;
    private String fileUrl;
    private String message;

    public boolean isSuccess() { return success; }
    public String getDraftId() { return draft_id; }
    public String getFileUrl() { return fileUrl; }
    public String getMessage() { return message; }
}
