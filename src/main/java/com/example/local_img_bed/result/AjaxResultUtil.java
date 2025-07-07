package com.example.local_img_bed.result;

public class AjaxResultUtil {
    public static AjaxResult success(){
        AjaxResult ajaxResult = new AjaxResult();
        ajaxResult.setCode(200);
        ajaxResult.setMsg("success");
        return  ajaxResult;
    }

    public static AjaxResult success(Object data){
        AjaxResult ajaxResult = success();
        ajaxResult.setData(data);
        return ajaxResult;
    }

    public static AjaxResult success(String msg, Object data){
        AjaxResult ajaxResult = success();
        ajaxResult.setMsg(msg);
        ajaxResult.setData(data);
        return ajaxResult;
    }

    public static AjaxResult error(Integer code, String msg){
        AjaxResult ajaxResult = new AjaxResult();
        ajaxResult.setCode(code);
        ajaxResult.setMsg(msg);
        return ajaxResult;
    }

    public static AjaxResult error(Integer code, String msg,Object data){
        AjaxResult ajaxResult = error(code, msg);
        ajaxResult.setData(data);
        return ajaxResult;
    }
}
