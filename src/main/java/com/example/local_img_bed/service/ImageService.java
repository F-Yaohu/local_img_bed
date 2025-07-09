package com.example.local_img_bed.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.local_img_bed.dto.ImageStatsDto;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.apache.commons.codec.digest.DigestUtils;
import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import java.io.InputStream;
import org.opencv.core.MatOfByte;


import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.FileStore;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@Slf4j
@RequiredArgsConstructor
public class ImageService {
    private final ImageMapper imageMapper;
    private final CategoryMapper categoryMapper;
    private final ThumbnailService thumbnailService;
    private final ThumbnailMapper thumbnailMapper;
    private final CategoryService categoryService;

    @Value("${image.storage.root-path}")
    private String rootPath;

    // 创建扩展名到MIME类型的映射（避免硬编码）
    private static final Map<String, String> MIME_TYPES = Map.of(
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "gif", "image/gif",
            "png", "image/png",
            "pdf", "application/pdf"  // 扩展其他常见类型
    );

    /**
     * 计算图片的感知哈希 (pHash)
     * @param inputStream 图片输入流
     * @return pHash 字符串
     * @throws IOException 异常
     */
    private String calculatePHash(InputStream inputStream) throws IOException {
        byte[] bytes = inputStream.readAllBytes();
        Mat img = Imgcodecs.imdecode(new MatOfByte(bytes), Imgcodecs.IMREAD_GRAYSCALE);

        if (img.empty()) {
            throw new IOException("无法加载图片或图片为空");
        }

        Mat resizedImg = new Mat();
        Imgproc.resize(img, resizedImg, new Size(32, 32));

        resizedImg.convertTo(resizedImg, CvType.CV_32F);

        Mat dct = new Mat();
        Core.dct(resizedImg, dct);

        Mat dct8x8 = new Mat(dct, new org.opencv.core.Rect(0, 0, 8, 8));

        double total = 0;
        for (int i = 0; i < 8; i++) {
            for (int j = 0; j < 8; j++) {
                total += dct8x8.get(i, j)[0];
            }
        }
        total -= dct8x8.get(0, 0)[0]; // Exclude the DC component
        double avg = total / (8 * 8 - 1);

        StringBuilder pHash = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            for (int j = 0; j < 8; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }
                pHash.append(dct8x8.get(i, j)[0] > avg ? '1' : '0');
            }
        }

        img.release();
        resizedImg.release();
        dct.release();
        dct8x8.release();

        return pHash.toString();
    }

    /**
     * 计算两个哈希字符串的汉明距离
     * @param hash1 哈希字符串1
     * @param hash2 哈希字符串2
     * @return 汉明距离
     */
    private int hammingDistance(String hash1, String hash2) {
        if (hash1 == null || hash2 == null || hash1.length() != hash2.length()) {
            // 实际应用中可能需要更健壮的错误处理，例如返回-1或抛出特定异常
            return Integer.MAX_VALUE; // 返回一个大值表示不匹配或错误
        }
        int distance = 0;
        for (int i = 0; i < hash1.length(); i++) {
            if (hash1.charAt(i) != hash2.charAt(i)) {
                distance++;
            }
        }
        return distance;
    }

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

        // 2. 计算感知哈希值
        String pHash = null;
        try {
            pHash = calculatePHash(file.getInputStream());
        } catch (Exception e) {
            log.error("计算感知哈希失败: {}", e.getMessage(), e);
        }

        // 3. 检查重复文件
        LambdaQueryWrapper<Image> query = new LambdaQueryWrapper<>();
        query.eq(Image::getHash, fileHash);
        Image image = imageMapper.selectOne(query);

        if (image == null) {
            // 4. 存储原始图片
            image = saveOriginalFile(file, categoryId, fileHash, pHash);
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
     * 批量删除图片及关联资源
     * @param imageIds   图片id列表
     */
    @Transactional
    public void deleteImages(List<Long> imageIds) {
        if (imageIds == null || imageIds.isEmpty()) {
            return;
        }

        for (Long imageId : imageIds) {
            try {
                deleteImage(imageId);
            } catch (IOException e) {
                log.error("删除失败的图片id: {}", imageId, e);
                // Decide how to handle partial failures. For now, we log and continue.
            }
        }
    }

    /**
     * 封装图片数据
     * @param file  上传文件
     * @param categoryId    分类id
     * @param hash  文件hash
     * @return  返回封装结果
     * @throws IOException  异常
     */
    private Image saveOriginalFile(MultipartFile file, Long categoryId, String hash, String pHash) throws IOException {
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
        image.setPHash(pHash);
        return image;
    }


    /**
     * 加载图片
     * @param imageId   文件id
     * @param type  加载类型
     * @param dFileName  下载文件名
     * @param response  返回流
     * @throws IOException IO异常
     */
    public void loadImageData(Long imageId, String path, String type, String dFileName, HttpServletResponse response) throws IOException {
        File source = null;

        // 检查是否存在图片路劲，如果存在，检查路劲是否正确
        if(!StringUtil.isEmpty(path)){
            source = new File(rootPath + path);
            if (!source.exists()) {
                // 文件未找到
                source = null;
            }
        }

        // 检查上面是否找到图片
        if (source == null) {
            //查询原图
            Image image = imageMapper.selectById(imageId);
            if (null == image) {
                // 没有该图片
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            // 检查文件是否存在
            source = new File(rootPath + image.getStoragePath());
            if (!source.exists()) {
                // 文件未找到
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
        }

        // 检查前端是否想下载
        if(!StringUtil.isEmpty(dFileName)){
            response.setContentType("application/octet-stream");
            response.addHeader("Content-Disposition", "attachment; filename=\""+dFileName+"\"");
        }else {
            // 获取文件扩展名
            String fileName = source.getName();
            int dotIndex = fileName.lastIndexOf('.');
            String fileExtension = (dotIndex > 0 && dotIndex < fileName.length() - 1) ?
                    fileName.substring(dotIndex + 1).toLowerCase() :
                    "";

            // 设置ContentType，找不到就返回二进制直接下载
            String contentType = MIME_TYPES.getOrDefault(fileExtension, "application/octet-stream");
            response.setContentType(contentType);
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

    /**
     * 获取图片统计信息
     * @return  ImageStatsDto
     */
    public ImageStatsDto getStats() {
        ImageStatsDto imageStatsDto = new ImageStatsDto();
        // 计算图片总使用空间
        double imageUsableSpace = 0;
        // 获取原图信息
        ImageStatsDto imgSize = imageMapper.getImgSize();
        if(null != imgSize){
            imageStatsDto.setTotalImages(imgSize.getTotalImages());
            imageStatsDto.setTotalImageSize(imgSize.getTotalImageSize());
            imageUsableSpace+=imgSize.getTotalImageSize();
        }
        // 获取略缩图信息
        ImageStatsDto thumbnailMapperImgSize = thumbnailMapper.getImgSize();
        if(null != thumbnailMapperImgSize){
            imageStatsDto.setTotalThumbnails(thumbnailMapperImgSize.getTotalThumbnails());
            imageStatsDto.setTotalThumbnailSize(thumbnailMapperImgSize.getTotalThumbnailSize());
            imageUsableSpace+=thumbnailMapperImgSize.getTotalThumbnailSize();
        }

        // 图片总是用空间
        imageStatsDto.setImageUsableSpace(imageUsableSpace);

        try {
            // 获取当前磁盘的 FileStore 对象
            FileStore store = Files.getFileStore(Paths.get("").toAbsolutePath());
            double v = 1024.0 * 1024.0;
            // 获取空间信息
            long totalSpace = store.getTotalSpace();
            double totalSpaceMb = totalSpace>0?totalSpace / v:0;
            // 已使用空间
            long usableSpace = store.getUsableSpace();
            double usableSpaceMb = usableSpace>0?usableSpace / v:0;
            // 未分配空间
            long unallocatedSpace = store.getUnallocatedSpace();
            double unallocatedSpaceMb = unallocatedSpace>0?unallocatedSpace / v:0;

            imageStatsDto.setTotalSpace(totalSpaceMb);
            imageStatsDto.setOtherUsableSpace(usableSpaceMb-imageUsableSpace);
            imageStatsDto.setUnallocatedSpace(unallocatedSpaceMb);
        } catch (IOException e) {
            log.error("获取本地磁盘信息失败，{}", e.getMessage(),e);
        }
        return imageStatsDto;
    }


    /**
     * 获取最近上传的图片
     * @param size 返回图片数量
     * @return  近上传的图片
     */
    public List<Image> getRecentUploads(int size){
        return imageMapper.getRecentUploads(size);
    }

    @Transactional
    public int syncImagesFromOriginalFolder() throws IOException {
        Path originalFolderPath = Paths.get(rootPath, "original");
        if (!Files.exists(originalFolderPath)) {
            Files.createDirectories(originalFolderPath);
            log.info("创建 original 文件夹: {}", originalFolderPath);
            return 0;
        }

        // 查找或创建“未分类”类别
        Category uncategorizedCategory = categoryService.findOrCreateByName("未分类", 1L); // 假设1L是根分类ID

        // 获取数据库中所有已存在的图片路径
        Set<String> existingImagePaths = imageMapper.selectList(null).stream()
                .map(Image::getStoragePath)
                .collect(Collectors.toSet());

        int syncedCount = 0;
        // 遍历 original 文件夹下的所有图片文件
        try (var stream = Files.walk(originalFolderPath)) {
            List<Path> imageFiles = stream
                    .filter(Files::isRegularFile)
                    .filter(p -> {
                        String fileName = p.getFileName().toString().toLowerCase();
                        return fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") ||
                               fileName.endsWith(".png") || fileName.endsWith(".gif");
                    })
                    .toList();

            for (Path filePath : imageFiles) {
                String relativePath = File.separator + Paths.get(rootPath).relativize(filePath);

                if (!existingImagePaths.contains(relativePath)) {
                    // 新图片，同步到数据库
                    Image image = new Image();
                    image.setOriginalName(filePath.getFileName().toString());
                    image.setStoragePath(relativePath);
                    image.setFileSize(Files.size(filePath));
                    image.setCategoryId(uncategorizedCategory.getId());
                    image.setCreateTime(LocalDateTime.now());

                    // 计算文件哈希值
                    try (FileInputStream fis = new FileInputStream(filePath.toFile())) {
                        image.setHash(DigestUtils.sha256Hex(fis));
                    }

                    // 计算感知哈希值
                    try (FileInputStream fis = new FileInputStream(filePath.toFile())) {
                        image.setPHash(calculatePHash(fis));
                    } catch (Exception e) {
                        log.error("同步图片时计算感知哈希失败: {}", filePath, e);
                    }

                    // 获取文件类型
                    String fileExtension = "";
                    int dotIndex = filePath.getFileName().toString().lastIndexOf('.');
                    if (dotIndex > 0 && dotIndex < filePath.getFileName().toString().length() - 1) {
                        fileExtension = filePath.getFileName().toString().substring(dotIndex + 1).toLowerCase();
                    }
                    image.setFileType(MIME_TYPES.getOrDefault(fileExtension, "application/octet-stream"));

                    imageMapper.insert(image);
                    syncedCount++;
                    log.info("同步新图片: {}", relativePath);
                }
            }
        }
        return syncedCount;
    }

    @Transactional
    public void batchMoveImages(List<Long> imageIds, Long newCategoryId) {
        if (imageIds == null || imageIds.isEmpty()) {
            return;
        }
        Category category = categoryMapper.selectById(newCategoryId);
        if (category == null) {
            throw new RuntimeException("分类不存在");
        }

        // Use Mybatis-Plus batch update
        Image image = new Image();
        image.setCategoryId(newCategoryId);
        LambdaQueryWrapper<Image> updateWrapper = new LambdaQueryWrapper<>();
        updateWrapper.in(Image::getId, imageIds);
        imageMapper.update(image, updateWrapper);
    }

    /**
     * 查找相似图片
     * @param imageId   图片id
     * @param threshold 汉明距离阈值
     * @return  相似图片列表
     */
    public List<Image> findSimilarImages(Long imageId, int threshold) {
        Image targetImage = imageMapper.selectById(imageId);
        if (targetImage == null || StringUtil.isEmpty(targetImage.getPHash())) {
            return List.of(); // 或者抛出异常，取决于业务需求
        }

        String targetPHash = targetImage.getPHash();
        List<Image> allImages = imageMapper.selectList(null); // 获取所有图片

        return allImages.stream()
                .filter(img -> !img.getId().equals(imageId) && !StringUtil.isEmpty(img.getPHash())) // 排除自身和没有pHash的图片
                .filter(img -> {
                    return hammingDistance(targetPHash, img.getPHash()) <= threshold;
                })
                .collect(Collectors.toList());
    }
}
