package com.example.local_img_bed.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("config")
public class Config {
    @TableId(type = IdType.AUTO)
    Long id;
    // 图片查看路径
    String imgBaseUrl;
    // 登录页面背景
    String loginBgUrl;
    // 主页面背景
    String mainBgUrl;
    // logo图标
    String logoUrl;
    // 页面标题
    String pageTitle;
}
