package com.merkostore.api.controllers;

import com.merkostore.api.dtos.ApiResponse;
import com.merkostore.api.dtos.AuthResponse;
import com.merkostore.api.dtos.LoginRequest;
import com.merkostore.api.models.User;
import com.merkostore.api.repositories.UserRepository;
import com.merkostore.api.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Ensure initial admin user exists if database is empty
        ensureAdminExists();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        String jwt = tokenProvider.generateToken(user.getUsername(), user.getRole(), user.getStoreId());

        AuthResponse authResponse = AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .username(user.getUsername())
                .role(user.getRole())
                .storeId(user.getStoreId())
                .expiresIn(tokenProvider.getExpirationMs())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Autenticación exitosa", authResponse));
    }

    @PostMapping("/seed-admin")
    public ResponseEntity<ApiResponse<String>> seedAdmin() {
        boolean created = ensureAdminExists();
        String message = created 
                ? "Usuario administrador creado con éxito (admin / 1212)" 
                : "El usuario administrador ya existía";
        String status = created ? "CREATED" : "EXISTS";
        return ResponseEntity.ok(ApiResponse.ok(message, status));
    }

    private synchronized boolean ensureAdminExists() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("1212"))
                    .name("Administrador Merkostore")
                    .email("admin@merkostore.com")
                    .role("ROLE_ADMIN")
                    .storeId("default-store")
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(admin);
            return true;
        }
        return false;
    }
}
