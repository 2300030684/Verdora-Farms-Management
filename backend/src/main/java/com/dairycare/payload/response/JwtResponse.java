package com.dairycare.payload.response;

import lombok.Data;

import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String name;
    private String mobileNumber;
    private List<String> roles;

    public JwtResponse(String accessToken, Long id, String name, String mobileNumber, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.name = name;
        this.mobileNumber = mobileNumber;
        this.roles = roles;
    }
}
