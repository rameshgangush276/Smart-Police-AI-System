package com.smartpolice.app.models;

public class LoginRequest {
    private String officerId;
    private String password;

    public LoginRequest(String officerId, String password) {
        this.officerId = officerId;
        this.password = password;
    }
}
