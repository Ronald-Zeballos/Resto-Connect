package com.restoconnect.api.pago.qr;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.pagui")
public class PaguiProperties {

    private boolean enabled = false;
    private String baseUrl = "http://localhost:3000";
    private String email;
    private String password;
    private Integer bankId = 1;
    private long authCacheMinutes = 30;
    private long qrCacheSeconds = 120;
}
