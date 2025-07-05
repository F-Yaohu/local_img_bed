package com.example.local_img_bed.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("thumbnail")
public class Thumbnail {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String type;
    private String storagePath;
    private Long fileSize;
    private Long originalId;
    private LocalDateTime createTime;

}