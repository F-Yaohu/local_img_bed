package com.example.local_img_bed.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("image")
public class Image {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String originalName;
    private String storagePath;
    private String fileType;
    private Long fileSize;
    private Long categoryId;
    private String hash;
    private LocalDateTime createTime;
}