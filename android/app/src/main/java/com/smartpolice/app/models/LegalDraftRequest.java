package com.smartpolice.app.models;

public class LegalDraftRequest {
    private String case_id;
    private String type;
    private String officer_inputs;

    public LegalDraftRequest(String case_id, String type, String officer_inputs) {
        this.case_id = case_id;
        this.type = type;
        this.officer_inputs = officer_inputs;
    }
}
