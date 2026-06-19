package com.dairycare.controller;

import com.dairycare.model.Role;
import com.dairycare.model.User;
import com.dairycare.payload.request.LoginRequest;
import com.dairycare.payload.request.SignupRequest;
import com.dairycare.payload.response.JwtResponse;
import com.dairycare.payload.response.MessageResponse;
import com.dairycare.repository.UserRepository;
import com.dairycare.security.jwt.JwtUtils;
import com.dairycare.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getMobileNumber(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getUsername(),
                roles));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByMobileNumber(signUpRequest.getMobileNumber())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Mobile number is already in use!"));
        }

        // Create new user's account
        User user = User.builder()
                .name(signUpRequest.getName())
                .mobileNumber(signUpRequest.getMobileNumber())
                .password(encoder.encode(signUpRequest.getPassword()))
                .build();

        String strRole = signUpRequest.getRole();
        String role;

        if (strRole == null) {
            role = "ROLE_CUSTOMER";
        } else {
            switch (strRole.toLowerCase()) {
                case "admin":
                    role = "ROLE_ADMIN";
                    break;
                case "customer":
                    role = "ROLE_CUSTOMER";
                    break;
                default:
                    role = "ROLE_CUSTOMER";
            }
        }

        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
