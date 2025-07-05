package com.example.local_img_bed.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.local_img_bed.entity.Image;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ImageMapper extends BaseMapper<Image> {
    @Update("UPDATE image SET category_id = #{newCategoryId} WHERE id = #{imageId}")
    int moveImage(@Param("imageId") Long imageId, @Param("newCategoryId") Long newCategoryId);
}
