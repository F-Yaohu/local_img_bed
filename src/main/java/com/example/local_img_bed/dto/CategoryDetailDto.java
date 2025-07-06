package com.example.local_img_bed.dto;

import com.example.local_img_bed.entity.Category;
import lombok.Data;

import java.util.List;

@Data
public class CategoryDetailDto {
    /**
     * 当前分类信息
     */
    private Category currentCategory;

    /**
     * 子分类数据
     */
    private List<Category> subCategories;
}
