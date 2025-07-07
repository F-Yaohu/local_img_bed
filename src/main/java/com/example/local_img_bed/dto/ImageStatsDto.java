package com.example.local_img_bed.dto;

import lombok.Data;

@Data
public class ImageStatsDto {
    // 原图数量
    Integer totalImages;
    // 原图大小 MB
    Double totalImageSize;
    // 略缩图数量
    Integer totalThumbnails;
    // 略缩图大小 MB
    Double totalThumbnailSize;

    // 本地磁盘大小 MB
    Double totalSpace;
    // 上传图片使用空间 MB
    Double imageUsableSpace;
    // 其他文件使用空间 MB
    Double otherUsableSpace;
    // 未分配空间 MB
    Double unallocatedSpace;
}