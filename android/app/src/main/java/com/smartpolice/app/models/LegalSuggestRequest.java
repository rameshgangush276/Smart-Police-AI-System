package com.smartpolice.app.models;

public class LegalSuggestRequest {
    private String case_description;
    private String crime_type;

    public LegalSuggestRequest(String case_description, String crime_type) {
        this.case_description = case_description;
        this.crime_type = crime_type;
    }
}
