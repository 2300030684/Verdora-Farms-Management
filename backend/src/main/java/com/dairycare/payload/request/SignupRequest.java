package com.dairycare.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    @Size(max = 50)
    private String name;

    @NotBlank
    @Size(max = 15)
    private String mobileNumber;

    @NotBlank
    private String password;

    private String role;
}
