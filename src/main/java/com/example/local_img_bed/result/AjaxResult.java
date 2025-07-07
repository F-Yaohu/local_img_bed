package com.example.local_img_bed.result;

import lombok.Data;

/**
 * 接口统一返回参数
 */
@Data
public class AjaxResult {
    Integer code;
    String msg;
    Object data;
}
