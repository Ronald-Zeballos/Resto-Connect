package com.restoconnect.api.pago.qr;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class PaguiRedisCacheService {

    private static final String TOKEN_KEY_PREFIX = "restoconnect:pagui:token:";
    private static final String QR_KEY_PREFIX = "restoconnect:pagui:qr:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final PaguiProperties properties;
    private final PaguiRuntimeSettingsResolver settingsResolver;

    public Optional<String> getToken() {
        String email = settingsResolver.resolve().email();
        if (!StringUtils.hasText(email)) {
            return Optional.empty();
        }
        return readValue(TOKEN_KEY_PREFIX + email.trim().toLowerCase());
    }

    public void storeToken(String token) {
        if (!StringUtils.hasText(token)) {
            return;
        }
        String email = settingsResolver.resolve().email();
        if (!StringUtils.hasText(email)) {
            return;
        }
        writeValue(
                TOKEN_KEY_PREFIX + email.trim().toLowerCase(),
                token,
                Duration.ofMinutes(Math.max(1, properties.getAuthCacheMinutes()))
        );
    }

    public Optional<PaguiSnapshot> getQrSnapshot(String qrId) {
        if (!StringUtils.hasText(qrId)) {
            return Optional.empty();
        }
        return readValue(QR_KEY_PREFIX + qrId)
                .flatMap(value -> {
                    try {
                        return Optional.of(objectMapper.readValue(value, PaguiSnapshot.class));
                    } catch (JsonProcessingException ex) {
                        return Optional.empty();
                    }
                });
    }

    public void storeQrSnapshot(String qrId, PaguiClient.PaguiQrPayload qr, List<PaguiClient.PaguiPaymentPayload> payments) {
        if (!StringUtils.hasText(qrId) || qr == null) {
            return;
        }
        try {
            String payload = objectMapper.writeValueAsString(new PaguiSnapshot(qr, payments != null ? payments : List.of()));
            writeValue(
                    QR_KEY_PREFIX + qrId,
                    payload,
                    Duration.ofSeconds(Math.max(30, properties.getQrCacheSeconds()))
            );
        } catch (JsonProcessingException ignored) {
            // The database remains the source of truth; cache errors should not break payments.
        }
    }

    public void evictQrSnapshot(String qrId) {
        if (!StringUtils.hasText(qrId)) {
            return;
        }
        try {
            redisTemplate.delete(QR_KEY_PREFIX + qrId);
        } catch (DataAccessException ignored) {
            // Ignore cache eviction failures to keep the payment flow alive.
        }
    }

    private Optional<String> readValue(String key) {
        try {
            return Optional.ofNullable(redisTemplate.opsForValue().get(key));
        } catch (DataAccessException ignored) {
            return Optional.empty();
        }
    }

    private void writeValue(String key, String value, Duration ttl) {
        try {
            redisTemplate.opsForValue().set(key, value, ttl);
        } catch (DataAccessException ignored) {
            // Ignore cache write failures to keep the main payment flow alive.
        }
    }

    public record PaguiSnapshot(
            PaguiClient.PaguiQrPayload qr,
            List<PaguiClient.PaguiPaymentPayload> payments
    ) {
    }
}
