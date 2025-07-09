package com.example.local_img_bed.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ImageDTO {
    private Long id;
    private String originalName;
    private String url; // The new field for the direct image URL
    private String fileType;
    private Long fileSize;
    private Long categoryId;
    private String hash;
    private String pHash;
    private LocalDateTime createTime;
}
