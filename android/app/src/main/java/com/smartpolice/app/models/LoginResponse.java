package com.smartpolice.app.models;

public class LoginResponse {
    private String message;
    private String token;
    private Officer officer;

    public String getToken() { return token; }
    public Officer getOfficer() { return officer; }
    
    public static class Officer {
        private String id;
        private String officerId;
        private String name;
        private String role;
        private String station;

        public String getName() { return name; }
        public String getRole() { return role; }
    }
}
