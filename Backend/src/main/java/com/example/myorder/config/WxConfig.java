package com.example.myorder.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "wx")
public class WxConfig {
    private String appId;
    private String appSecret;
    private String loginUrl;
} 