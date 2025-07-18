package com.example.local_img_bed.controller;

import com.example.local_img_bed.dto.CategoryDetailDto;
import com.example.local_img_bed.entity.Category;
import com.example.local_img_bed.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    // 创建分类 [6,7](@ref)
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(category));
    }

    // 更新分类
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category
    ) {
        category.setId(id);
        categoryService.updateCategory(id, category);
        return ResponseEntity.noContent().build();
    }

    // 删除分类
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // 查询分类详情
    @GetMapping("/{id}/sub")
    public List<Category> getCategorySub(@PathVariable Long id) {
        return categoryService.getCategorySub(id);
    }

    // 查询分类树状图
    @GetMapping("/tree")
    public ResponseEntity<List<Category>> getCategoryTree() {
        return ResponseEntity.ok(categoryService.getCategoryTree());
    }
}
