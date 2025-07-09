package com.example.local_img_bed.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.local_img_bed.dto.ImageDTO;
import com.example.local_img_bed.dto.ImageStatsDto;
import com.example.local_img_bed.dto.ImageUploadDTO;
import com.example.local_img_bed.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.List;

@Slf4j
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

    @GetMapping("/thumbnail/{id}/{size}")
    public ResponseEntity<Object> getThumbnail(
            @PathVariable Long id,
            @PathVariable String size,
            @RequestParam String path) {
        try {
            String thumbnailPath = imageService.getOrCreateThumbnailAndGetStaticPath(id,size, path);
            String staticUrl = "/images-static/" + thumbnailPath;

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(new URI(staticUrl));
            return new ResponseEntity<>(headers, HttpStatus.FOUND); // HTTP 302
        } catch (Exception e) {
            // Log the error with more details
            log.error("Error processing thumbnail for path '{}' with size '{}': {}", path, size, e.getMessage(), e);
            // Return a 404 Not Found for client errors or 500 for server errors
            if (e instanceof IllegalArgumentException || e instanceof IOException) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/page/{categoryId}")
    public IPage<ImageDTO> getCategoryDetails(
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
    public List<ImageDTO> getRecentUploads(@RequestParam(defaultValue = "50") int size){
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
    public ResponseEntity<List<ImageDTO>> findSimilarImages(
            @PathVariable Long imageId,
            @RequestParam(defaultValue = "10") int threshold) {
        List<ImageDTO> similarImages = imageService.findSimilarImages(imageId, threshold);
        return ResponseEntity.ok(similarImages);
    }

    @GetMapping("/random")
    public ResponseEntity<Object> getRandomImage(@RequestParam(required = false) Long categoryId) {
        try {
            ImageDTO randomImage = imageService.getRandomImage(categoryId);
            if (randomImage != null) {
                String staticUrl = randomImage.getUrl();
                HttpHeaders headers = new HttpHeaders();
                headers.setLocation(new URI(staticUrl));
                return new ResponseEntity<>(headers, HttpStatus.FOUND); // HTTP 302
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error getting random image: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
