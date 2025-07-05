package com.example.local_img_bed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImageUploadDTO {
    private Long id;
    private String originalName;
}
