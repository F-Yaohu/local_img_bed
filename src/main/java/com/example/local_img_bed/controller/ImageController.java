package com.example.local_img_bed.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.local_img_bed.dto.ImageStatsDto;
import com.example.local_img_bed.dto.ImageUploadDTO;
import com.example.local_img_bed.entity.Image;
import com.example.local_img_bed.service.ImageService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

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

    @DeleteMapping("/batch")
    public ResponseEntity<Void> deleteImages(@RequestBody List<Long> imageIds) {
        imageService.deleteImages(imageIds);
        return ResponseEntity.noContent().build();
    }

    // 新增图片查看接口
    @GetMapping(value = "/view/{id}", produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE})
    public void loadImageData(
            @PathVariable Long id,
            String path,
            String type,
            String dFileName,
            HttpServletResponse response) throws IOException {

        imageService.loadImageData(id, path, type, dFileName, response);
    }

    @GetMapping("/page/{categoryId}")
    public Page<Image> getCategoryDetails(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return imageService.queryImageByCategoryId(categoryId, page, size);
    }

    @GetMapping("/stats")
    public ImageStatsDto getStats() {
        return imageService.getStats();
    }

    @GetMapping("/recent")
    public List<Image> getRecentUploads(int size){
        return imageService.getRecentUploads(size);
    }

    @PostMapping("/sync-from-original")
    public ResponseEntity<String> syncImagesFromOriginalFolder() {
        try {
            int syncedCount = imageService.syncImagesFromOriginalFolder();
            return ResponseEntity.ok("成功同步 " + syncedCount + " 张图片。");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("同步图片失败: " + e.getMessage());
        }
    }

    @PutMapping("/batch-move")
    public ResponseEntity<Void> batchMoveImages(
            @RequestBody List<Long> imageIds,
            @RequestParam Long newCategoryId) {
        imageService.batchMoveImages(imageIds, newCategoryId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/similar/{imageId}")
    public ResponseEntity<List<Image>> findSimilarImages(
            @PathVariable Long imageId,
            @RequestParam(defaultValue = "10") int threshold) {
        List<Image> similarImages = imageService.findSimilarImages(imageId, threshold);
        return ResponseEntity.ok(similarImages);
    }
}
