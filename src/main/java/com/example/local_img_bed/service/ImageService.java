package com.example.local_img_bed.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.local_img_bed.dto.ImageUploadDTO;
import com.example.local_img_bed.entity.Category;
import com.example.local_img_bed.entity.Image;
import com.example.local_img_bed.entity.Thumbnail;
import com.example.local_img_bed.mapper.CategoryMapper;
import com.example.local_img_bed.mapper.ImageMapper;
import com.example.local_img_bed.mapper.ThumbnailMapper;
import com.example.local_img_bed.utils.StringUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.apache.commons.codec.digest.DigestUtils;


import java.awt.print.Pageable;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageMapper imageMapper;
    private final CategoryMapper categoryMapper;
    private final ThumbnailService thumbnailService;
    private final ThumbnailMapper thumbnailMapper;

    @Value("${image.storage.root-path}")
    private String rootPath;

    /**
     * 上传原图
     * @param file  上传文件
     * @param categoryId    分类id
     * @return  返回上传结果
     * @throws IOException  异常
     */
    public ImageUploadDTO uploadImage(MultipartFile file, Long categoryId) throws IOException {
        // 1. 计算文件哈希值
        String fileHash = DigestUtils.sha256Hex(file.getInputStream());

        // 2. 检查重复文件
        LambdaQueryWrapper<Image> query = new LambdaQueryWrapper<>();
        query.eq(Image::getHash, fileHash);
        Image image = imageMapper.selectOne(query);

        if (image == null) {
            // 3. 存储原始图片
            image = saveOriginalFile(file, categoryId, fileHash);
            imageMapper.insert(image);
        }

        return new ImageUploadDTO(image.getId(),image.getOriginalName());
    }

    // 移动图片到新分类
    public void moveImage(Long imageId, Long newCategoryId) {
        Category category = categoryMapper.selectById(newCategoryId);
        if (category == null) {
            throw new RuntimeException("分类不存在");
        }
        imageMapper.moveImage(imageId, newCategoryId);
    }

    /**
     * 删除图片及关联资源
     * @param imageId   原图id
     * @throws IOException  异常
     */
    @Transactional
    public void deleteImage(Long imageId) throws IOException {
        Image image = imageMapper.selectById(imageId);
        if (image == null) return;

        // 删除文件
        Files.deleteIfExists(Paths.get(rootPath, image.getStoragePath()));

        // 删除缩略图
        LambdaQueryWrapper<Thumbnail> query = new LambdaQueryWrapper<>();
        query.eq(Thumbnail::getOriginalId, imageId);
        List<Thumbnail> thumbnails = thumbnailMapper.selectList(query);
        thumbnails.forEach(thumb -> {
            try {
                Files.deleteIfExists(Paths.get(rootPath, thumb.getStoragePath()));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            imageMapper.deleteById(thumb.getId());
        });

        // 删除主记录
        imageMapper.deleteById(imageId);
    }

    /**
     * 封装图片数据
     * @param file  上传文件
     * @param categoryId    分类id
     * @param hash  文件hash
     * @return  返回封装结果
     * @throws IOException  异常
     */
    private Image saveOriginalFile(MultipartFile file, Long categoryId, String hash) throws IOException {
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String fileName = UUID.randomUUID() + "." + file.getOriginalFilename();
        Path storagePath = Paths.get(rootPath, "original", datePath, fileName);

        Files.createDirectories(storagePath.getParent());
        file.transferTo(storagePath);

        Image image = new Image();
        image.setOriginalName(file.getOriginalFilename());
        image.setStoragePath(storagePath.toString().replace(rootPath, ""));
        image.setFileType(file.getContentType());
        image.setFileSize(file.getSize());
        image.setCategoryId(categoryId);
        image.setHash(hash);
        return image;
    }


    /**
     * 加载图片
     * @param imageId   文件id
     * @param type  加载类型
     * @param response  返回流
     * @throws IOException IO异常
     */
    public void loadImageData(Long imageId, String type, HttpServletResponse response) throws IOException {
        // 设置响应类型为图片
        response.setContentType("image/jpeg");

        //查询原图
        Image image = imageMapper.selectById(imageId);
        if (null == image) {
            // 没有该图片
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        // 检查文件是否存在
        File source = new File(rootPath + image.getStoragePath());
        if (!source.exists()) {
            // 文件未找到
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        //检查是否需要生成略缩图
        if(!StringUtil.isEmpty(type)){
            File thumbnail = thumbnailService.generateThumbnail(source, type, imageId);
            if(null != thumbnail && thumbnail.exists()){
                // 存在略缩图
                Files.copy(thumbnail.toPath(), response.getOutputStream());
            }
        }
        // 返回原图
        Files.copy(source.toPath(), response.getOutputStream());
    }

    /**
     * 根据分类id查询图片分页信息
     * @param categoryId    分类id
     * @param page  当前也
     * @param size  每页图片数量
     * @return Page<Image>
     */
    public Page<Image> queryImageByCategoryId(Long categoryId, int page, int size) {
        Page<Image> imagePage = new Page<>(page, size);
        LambdaQueryWrapper<Image> imageQuery = new LambdaQueryWrapper<>();
        imageQuery.eq(Image::getCategoryId, categoryId);
        return  imageMapper.selectPage(imagePage, imageQuery);
    }
}
