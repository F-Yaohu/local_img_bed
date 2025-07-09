package com.example.local_img_bed.service;

import com.example.local_img_bed.entity.Thumbnail;
import com.example.local_img_bed.mapper.ThumbnailMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ThumbnailService {

    private final ThumbnailMapper thumbnailMapper;

    @Value("${image.storage.root-path}")
    private String rootPath;

    @Data
    @AllArgsConstructor
    private static class ThumbRule {
        private String ruleName;
        private Integer width;
        private Integer height;
        private String prefix;
        private Float quality;
    }

    /**
     * 所有压缩大小
     */
    private final Map<String, ThumbRule> thumbnailRules = Map.of(
            "small", new ThumbRule("small", 150, 112,"small_", 0.8f),
            "medium", new ThumbRule("medium", 800, 600,"medium_", 0.85f),
            "large", new ThumbRule("large", 1600, 1200,"large_", 0.9f)
    );

    /**
     * 生成略缩图，如果存在直接返回文件
     * @param source    源文件
     * @param size  大小
     * @param originalId    原图id
     * @return  返回略缩图相对路劲
     */
    public String generateThumbnail(File source, String size, Long originalId) throws IOException {
        ThumbRule rule = thumbnailRules.get(size);
        // 如果规则不存在，直接返回原图
        if(null==rule){
            return null;
        }

        //拼接图片路劲，检查文件是否存在
        String originalFileName = rule.getPrefix() + source.getName();
        String thumbnailRelativePath = Paths.get("thumbnails", size, originalFileName).toString();
        Path thumbnailAbsolutePath = Paths.get(rootPath, thumbnailRelativePath);

        // 检查文件是否存在
        if (!Files.exists(thumbnailAbsolutePath)) {
            // 检查图片大小，如果原图小于等于目标宽度，直接返回原图
            BufferedImage image = ImageIO.read(source);
            if (image.getWidth() <= rule.getWidth()) {
                return null;
            }

            // 创建目录
            Files.createDirectories(thumbnailAbsolutePath.getParent());
            File file = thumbnailAbsolutePath.toFile();

            // 使用Thumbnail生成缩略图
            Thumbnails.of(image)
                    .width(rule.getWidth())
                    .keepAspectRatio(true)
                    .outputQuality(rule.getQuality())
                    .toFile(file);

            // 保存略缩图到数据库
            saveThumbnailImage(file,size,originalId);
        }
        // 返回相对路劲
        return thumbnailRelativePath;
    }


    /**
     * 保存略缩图路径到数据库
     * @param file  略缩图文件
     * @param type  略缩图类型
     * @param originalId    原图id
     */
    private void saveThumbnailImage(File file, String type, Long originalId){
        Thumbnail thumbnail = new Thumbnail();
        thumbnail.setType(type);
        thumbnail.setStoragePath(file.getAbsolutePath().replace(rootPath, ""));
        thumbnail.setFileSize(file.length());
        thumbnail.setOriginalId(originalId);

        thumbnailMapper.insert(thumbnail);
    }
}