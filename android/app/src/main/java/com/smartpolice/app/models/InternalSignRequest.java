package com.smartpolice.app.models;

public class InternalSignRequest {
    private String documentId;
    private String password;

    public InternalSignRequest(String documentId, String password) {
        this.documentId = documentId;
        this.password = password;
    }

    public String getDocumentId() { return documentId; }
    public String getPassword() { return password; }
}
