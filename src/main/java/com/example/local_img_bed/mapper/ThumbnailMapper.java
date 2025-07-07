package com.example.local_img_bed.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.local_img_bed.dto.ImageStatsDto;
import com.example.local_img_bed.entity.Thumbnail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ThumbnailMapper extends BaseMapper<Thumbnail> {
    @Select("SELECT \n" +
            "    COUNT(*) AS total_thumbnails,\n" +
            "    ROUND(SUM(COALESCE(file_size, 0)) / 1048576, 2) AS total_thumbnail_size\n" +
            "FROM thumbnail;")
    ImageStatsDto getImgSize();
}
