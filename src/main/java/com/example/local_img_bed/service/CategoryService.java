package com.example.local_img_bed.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.local_img_bed.entity.Category;
import com.example.local_img_bed.entity.Image;
import com.example.local_img_bed.mapper.CategoryMapper;
import com.example.local_img_bed.mapper.ImageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryMapper categoryMapper;
    private final ImageMapper imageMapper;

    /**
     * 创建分类
     * @param category  分类信息
     * @return  返回创建结果
     */
    @Transactional
    public Category createCategory(Category category) {
        if (category.getParentId() == null) {
            category.setParentId(0L); // 根分类
            category.setPath("/");
        } else {
            Category parent = categoryMapper.selectById(category.getParentId());
            if (parent == null) throw new RuntimeException("父分类不存在");
            category.setPath(parent.getPath() + parent.getId() + "/");
        }
        category.setCreateTime(LocalDateTime.now());
        categoryMapper.insert(category);
        return category;
    }

    /**
     * 更新分类（含子分类路径同步）
     * @param id    分类id
     * @param category  修改后的分类内容
     */
    @Transactional
    public void updateCategory(Long id, Category category) {
        Category old = categoryMapper.selectById(id);
        if (old == null) throw new RuntimeException("分类不存在");

        // 更新自身
        category.setId(id);
        categoryMapper.updateById(category);

        // 若父分类变更，同步更新子分类路径
        if (!old.getParentId().equals(category.getParentId())) {
            String newPath = category.getPath().substring(0, category.getPath().lastIndexOf('/') + 1);
            categoryMapper.updateSubPath(old.getPath(), newPath);
        }
    }

    /**
     * 删除分类（需无子分类且无图片）
     * @param id    分类id
     */
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) return;

        // 检查是否存在子分类
        LambdaQueryWrapper<Category> query = new LambdaQueryWrapper<>();
        query.eq(Category::getParentId, id);
        if (categoryMapper.selectCount(query) > 0) {
            throw new RuntimeException("存在子分类，不可删除");
        }

        // 检查分类下是否有图片
        LambdaQueryWrapper<Image> imageQuery = new LambdaQueryWrapper<>();
        imageQuery.eq(Image::getCategoryId, id);
        if (imageMapper.selectCount(imageQuery) > 0) { // 假设已注入ImageMapper
            throw new RuntimeException("分类下存在图片，不可删除");
        }

        categoryMapper.deleteById(id);
    }
}
