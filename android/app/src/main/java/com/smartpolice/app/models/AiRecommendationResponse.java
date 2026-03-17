package com.smartpolice.app.models;

import java.util.List;

public class AiRecommendationResponse {
    private boolean success;
    private List<String> suggestions;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }
}
