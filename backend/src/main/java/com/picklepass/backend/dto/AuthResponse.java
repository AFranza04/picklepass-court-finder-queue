package com.picklepass.backend.dto;

public class AuthResponse {
    private String token;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role;

    public AuthResponse(String token, String fullName, String email, String phoneNumber, String role) {
        this.token = token;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = role;
    }

    public String getToken() { return token; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getRole() { return role; }
}