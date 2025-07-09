package com.example.local_img_bed.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.local_img_bed.dto.ImageStatsDto;
import com.example.local_img_bed.entity.Image;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface ImageMapper extends BaseMapper<Image> {
    @Update("UPDATE image SET category_id = #{newCategoryId} WHERE id = #{imageId}")
    int moveImage(@Param("imageId") Long imageId, @Param("newCategoryId") Long newCategoryId);

    @Select("SELECT \n" +
            "    COUNT(*) AS total_images,\n" +
            "    ROUND(SUM(COALESCE(file_size, 0)) / 1048576, 2) AS total_image_size\n" +
            "FROM image;")
    ImageStatsDto getImgSize();

    @Select("select * from image where create_time order by create_time desc limit #{size}")
    List<Image> getRecentUploads(int size);

    @Select("SELECT storage_path FROM image")
    List<String> selectAllStoragePaths();

    @Select("<script>" +
            "SELECT * FROM image " +
            "<where>" +
            "<if test=\"categoryId != null\">" +
            "category_id = #{categoryId}" +
            "</if>" +
            "</where>" +
            "ORDER BY RAND() LIMIT 1" +
            "</script>")
    Image getRandomImage(@Param("categoryId") Long categoryId);
}
