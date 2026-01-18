package com.example.myorder.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
        log.error("运行时异常:", e);
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        log.error("系统异常:", e);
        // 在开发环境下返回具体错误信息，生产环境返回通用消息
        if (isDevelopmentEnvironment()) {
            return ResponseEntity.internalServerError().body(e.getMessage() + "\n" + getStackTraceAsString(e));
        }
        return ResponseEntity.internalServerError().body("系统异常，请稍后重试");
    }

    private boolean isDevelopmentEnvironment() {
        // 这里可以根据环境变量或配置来判断
        return true; // 暂时设为开发环境
    }

    private String getStackTraceAsString(Throwable throwable) {
        java.io.StringWriter sw = new java.io.StringWriter();
        throwable.printStackTrace(new java.io.PrintWriter(sw));
        return sw.toString();
    }
} 