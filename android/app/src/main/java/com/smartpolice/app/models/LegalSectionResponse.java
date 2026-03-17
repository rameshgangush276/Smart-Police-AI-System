package com.smartpolice.app.models;

import java.util.List;

public class LegalSectionResponse {
    private boolean success;
    private List<LegalSection> suggested_sections;
    private String legal_explanation;

    public boolean isSuccess() { return success; }
    public List<LegalSection> getSuggestedSections() { return suggested_sections; }
    public String getLegalExplanation() { return legal_explanation; }
}
