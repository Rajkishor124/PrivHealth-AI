package com.privhealth.backend.config.app;

import com.privhealth.backend.user.entity.Role;
import com.privhealth.backend.user.entity.User;
import com.privhealth.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.countByRole(Role.SUPER_ADMIN) == 0) {
            User admin = User.builder()
                    .name("Super Admin")
                    .email("admin@privhealth.com")
                    .password(passwordEncoder.encode("Admin123"))
                    .role(Role.SUPER_ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("=== DEFAULT ADMIN CREATED ===");
            log.info("Email: admin@privhealth.com");
            log.info("Password: Admin123");
            log.info("=============================");
        }
    }
}
