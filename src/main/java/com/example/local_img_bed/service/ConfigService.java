package com.example.local_img_bed.service;

import com.example.local_img_bed.entity.Config;
import com.example.local_img_bed.mapper.ConfigMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ConfigService {
    private final ConfigMapper configMapper;

    /**
     * 查询一条默认的配置
     * @return  Config
     */
    public Config getConfig() {
        return configMapper.selectOne(null);
    }

    /**
     * 保存用户配置
     * @param config 保存配置数据
     */
    public void save(Config config) {
        Config old = configMapper.selectOne(null);
        if (old == null) {
            configMapper.insert(config);
        }else {
            config.setId(old.getId());
            configMapper.updateById(config);
        }
    }
}
