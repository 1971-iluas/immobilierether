package com.immobilierether.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Ressources statiques et pages publiques
                .requestMatchers(
                    "/", 
                    "/css/**", 
                    "/js/**", 
                    "/image/**",
                    "/entreprise",
                    "/services",
                    "/apropos",
                    "/videos",
                    "/contact",
                    "/contact/send"
                ).permitAll()
                // Page de connexion
                .requestMatchers("/login").permitAll()
                // Portail client (protégé)
                .requestMatchers("/portail").authenticated()
                // Tout le reste nécessite une authentification
                .anyRequest().authenticated()
            );

        return http.build();
    }

    
}