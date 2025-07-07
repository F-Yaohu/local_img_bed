package com.example.local_img_bed.controller;

import com.example.local_img_bed.entity.Config;
import com.example.local_img_bed.service.ConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/base")
@RequiredArgsConstructor
public class BaseController {
    private final ConfigService configService;

    // 查询分类详情
    @GetMapping("/config")
    public Config getBaseConfig() {
        return configService.getConfig();
    }

    @PutMapping("/config/save")
    public ResponseEntity<Void> updateBaseConfig(@RequestBody Config config) {
        configService.save(config);
        return ResponseEntity.noContent().build();
    }
}
