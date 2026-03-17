package com.smartpolice.app.models;

public class AiRecommendationRequest {
    private String description;

    public AiRecommendationRequest(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
