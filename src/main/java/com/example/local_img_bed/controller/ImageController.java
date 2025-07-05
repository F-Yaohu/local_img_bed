package com.example.local_img_bed.controller;

import com.example.local_img_bed.dto.ImageUploadDTO;
import com.example.local_img_bed.service.ImageService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @PostMapping("/upload")
    public ResponseEntity<ImageUploadDTO> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "categoryId", defaultValue = "1") Long categoryId) throws IOException {
        return ResponseEntity.ok(imageService.uploadImage(file, categoryId));
    }

    @PutMapping("/{imageId}/move")
    public ResponseEntity<Void> moveImage(
            @PathVariable Long imageId,
            @RequestParam Long newCategoryId) {
        imageService.moveImage(imageId, newCategoryId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) throws IOException {
        imageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }

    // 新增图片查看接口
    @GetMapping(value = "/view/{id}", produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE})
    public void loadImageData(
            @PathVariable Long id,
            @RequestParam(required = false) String type,
            HttpServletResponse response) throws IOException {

        imageService.loadImageData(id, type, response);
    }
}
