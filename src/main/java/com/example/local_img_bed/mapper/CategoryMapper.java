package com.example.local_img_bed.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.local_img_bed.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
    @Select("SELECT * FROM category WHERE path LIKE CONCAT(#{path}, '%')")
    List<Category> findSubCategories(String path);

    @Update("UPDATE category SET path = REPLACE(path, #{oldPath}, #{newPath}) WHERE path LIKE CONCAT(#{oldPath}, '/%')")
    int updateSubPath(@Param("oldPath") String oldPath, @Param("newPath") String newPath);
}
