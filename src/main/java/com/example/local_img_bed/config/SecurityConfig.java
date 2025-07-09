package com.example.local_img_bed.config;

import com.example.local_img_bed.filter.JwtAuthFilter;
import com.example.local_img_bed.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtUtil jwtUtil;


    private final String username;
    private final String password;

    public SecurityConfig(JwtUtil jwtUtil, @Value("${admin.username}") String username,@Value("${admin.password}") String password) {
        this.jwtUtil = jwtUtil;
        this.username = username;
        this.password = password;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2. 配置内存用户（替代旧版 configure(AuthenticationManagerBuilder)）
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        UserDetails admin = User.builder()
                .username(username)
                .password(encoder.encode(password)) // 加密密码
                .roles("ADMIN")
                .build();

        UserDetails user = User.builder()
                .username("user")
                .password(encoder.encode("user123"))
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(admin, user);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // 禁用 CSRF
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 允许访问前端静态资源和根路径
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/favicon.ico",
                                "/logo192.png",
                                "/logo512.png",
                                "/manifest.json",
                                "/robots.txt",
                                "/static/**" // 允许访问 /static/ 目录下的所有内容 (JS, CSS)
                        ).permitAll()
                        // 保持你现有的API权限规则
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/images/thumbnail/**").permitAll() // 略缩图
                        .requestMatchers("/api/images/random").permitAll()  // 随机图
                        .requestMatchers("/api/base/config").permitAll()    // 获取配置
                        .requestMatchers("/api/**").hasRole("ADMIN")
                        // 确保所有其他未明确匹配的请求都需要认证
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        new JwtAuthFilter(jwtUtil),
                        UsernamePasswordAuthenticationFilter.class
                );
        return http.build();
    }

    // 关键修复：显式定义 AuthenticationManager Bean
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig // 自动注入配置对象
    ) throws Exception {
        return authConfig.getAuthenticationManager(); // 从配置中获取实例
    }
}
