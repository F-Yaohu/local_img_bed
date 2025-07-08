package com.example.local_img_bed.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.local_img_bed.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
    @Select("SELECT * FROM category WHERE path LIKE CONCAT(#{path}, '%')")
    List<Category> findSubCategories(String path);

    @Select("SELECT * FROM category WHERE name = #{name} AND parent_id = #{parentId} LIMIT 1")
    Category findByName(String name, Long parentId);
}
