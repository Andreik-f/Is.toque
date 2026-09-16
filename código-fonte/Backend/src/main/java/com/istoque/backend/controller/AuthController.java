package com.istoque.backend.controller;

import com.istoque.backend.dto.LoginRequestDTO;
import com.istoque.backend.dto.LoginResponseDTO;
import com.istoque.backend.dto.MensagemResponse;
import com.istoque.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") // Esta é a URL base dessa classe
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // A rota final será: POST http://localhost:8080/api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        
        LoginResponseDTO response = authService.realizarLogin(loginRequest);

        if (response != null) {
            // Devolve 200 OK com os dados do usuário
            return ResponseEntity.ok(response);
        } else {
            // Devolve 401 Unauthorized com a mensagem de erro padrão
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MensagemResponse("E-mail ou senha incorretos."));
        }
    }
}