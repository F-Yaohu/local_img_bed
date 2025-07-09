package com.example.local_img_bed;

import nu.pattern.OpenCV;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LocalImgBedApplication {

    static {
        OpenCV.loadLocally(); // 自动下载并加载本地库
    }

    public static void main(String[] args) {
        SpringApplication.run(LocalImgBedApplication.class, args);
    }

}
