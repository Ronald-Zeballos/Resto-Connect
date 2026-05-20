package com.restoconnect.api.pago.qr;

import com.restoconnect.api.shared.exception.BusinessException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@RequiredArgsConstructor
public class PaguiClient {

    private final PaguiRuntimeSettingsResolver settingsResolver;
    private final PaguiRedisCacheService cacheService;
    private final RestClient restClient = RestClient.builder().build();

    public PaguiQrPayload generarQr(PaguiGenerateQrCommand command) {
        String token = autenticar();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("transactionId", command.transactionId());
        payload.put("amount", command.amount());
        payload.put("description", command.description() != null ? command.description() : "");
        payload.put("bankId", command.bankId() != null ? command.bankId() : 1);
        payload.put("dueDate", command.dueDate());
        payload.put("singleUse", command.singleUse());
        payload.put("modifyAmount", command.modifyAmount());

        PaguiEnvelope<PaguiQrPayload> response = execute(() -> restClient.post()
                .uri(buildUrl("/qr/generate"))
                .header("Authorization", "Bearer " + token)
                .body(payload)
                .retrieve()
                .body(new ParameterizedTypeReference<PaguiEnvelope<PaguiQrPayload>>() {
                }));
        return requireData(response, "No se pudo generar el QR en pagui.");
    }

    public PaguiQrPayload consultarQr(String qrId) {
        String token = autenticar();
        PaguiEnvelope<PaguiQrPayload> response = execute(() -> restClient.get()
                .uri(buildUrl("/qr/" + qrId))
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(new ParameterizedTypeReference<PaguiEnvelope<PaguiQrPayload>>() {
                }));
        return requireData(response, "No se pudo consultar el QR en pagui.");
    }

    public List<PaguiPaymentPayload> consultarPagos(String qrId) {
        String token = autenticar();
        PaguiEnvelope<PaguiPaymentsPayload> response = execute(() -> restClient.get()
                .uri(buildUrl("/qr/" + qrId + "/payments"))
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(new ParameterizedTypeReference<PaguiEnvelope<PaguiPaymentsPayload>>() {
                }));
        PaguiPaymentsPayload data = requireData(response, "No se pudo consultar los pagos del QR en pagui.");
        return data.payments() != null ? data.payments() : List.of();
    }

    public void cancelarQr(String qrId) {
        String token = autenticar();
        PaguiEnvelope<Object> response = execute(() -> restClient.delete()
                .uri(buildUrl("/qr/" + qrId))
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(new ParameterizedTypeReference<PaguiEnvelope<Object>>() {
                }));
        if (response == null || !response.success()) {
            throw new BusinessException(response != null && StringUtils.hasText(response.message())
                    ? response.message()
                    : "No se pudo cancelar el QR en pagui.");
        }
    }

    public OffsetDateTime parseDateTime(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        try {
            return OffsetDateTime.parse(raw);
        } catch (DateTimeParseException ignored) {
            try {
                return OffsetDateTime.parse(raw + "T23:59:59Z");
            } catch (DateTimeParseException secondIgnored) {
                return null;
            }
        }
    }

    private String autenticar() {
        PaguiRuntimeSettingsResolver.PaguiRuntimeSettings settings = settingsResolver.resolve();
        if (!settings.enabled()) {
            throw new BusinessException("La integracion QR con pagui esta deshabilitada.");
        }
        if (!StringUtils.hasText(settings.email()) || !StringUtils.hasText(settings.password())) {
            throw new BusinessException("Faltan credenciales de pagui en la configuracion del backend.");
        }

        Optional<String> cachedToken = cacheService.getToken();
        if (cachedToken.isPresent()) {
            return cachedToken.get();
        }

        PaguiEnvelope<PaguiLoginPayload> response = execute(() -> restClient.post()
                .uri(buildUrl("/auth/login"))
                .body(Map.of(
                        "email", settings.email(),
                        "password", settings.password()
                ))
                .retrieve()
                .body(new ParameterizedTypeReference<PaguiEnvelope<PaguiLoginPayload>>() {
                }));

        PaguiLoginPayload data = requireData(response, "No se pudo iniciar sesion en pagui.");
        if (data.auth() == null || !StringUtils.hasText(data.auth().accessToken())) {
            throw new BusinessException("Pagui no devolvio un token valido.");
        }
        cacheService.storeToken(data.auth().accessToken());
        return data.auth().accessToken();
    }

    private String buildUrl(String path) {
        String configured = settingsResolver.resolve().baseUrl();
        String baseUrl = StringUtils.hasText(configured) ? configured : "http://localhost:3000";
        return baseUrl.replaceAll("/+$", "") + path;
    }

    private <T> T requireData(PaguiEnvelope<T> response, String defaultMessage) {
        if (response == null) {
            throw new BusinessException(defaultMessage);
        }
        if (!response.success()) {
            throw new BusinessException(StringUtils.hasText(response.message()) ? response.message() : defaultMessage);
        }
        if (response.data() == null) {
            throw new BusinessException(defaultMessage);
        }
        return response.data();
    }

    private <T> T execute(RemoteCall<T> call) {
        try {
            return call.execute();
        } catch (RestClientException ex) {
            throw new BusinessException("No se pudo conectar con pagui: " + ex.getMessage());
        }
    }

    @FunctionalInterface
    private interface RemoteCall<T> {
        T execute();
    }

    public record PaguiGenerateQrCommand(
            String transactionId,
            java.math.BigDecimal amount,
            String description,
            Integer bankId,
            String dueDate,
            boolean singleUse,
            boolean modifyAmount
    ) {
    }

    public record PaguiEnvelope<T>(
            boolean success,
            String message,
            T data
    ) {
    }

    public record PaguiLoginPayload(
            PaguiAuthPayload auth
    ) {
    }

    public record PaguiAuthPayload(
            String accessToken
    ) {
    }

    public record PaguiQrPayload(
            String qrId,
            String qrImage,
            String transactionId,
            String createdAt,
            String dueDate,
            String currency,
            java.math.BigDecimal amount,
            String status,
            String description,
            Boolean singleUse,
            Boolean modifyAmount,
            List<PaguiPaymentPayload> payments
    ) {
    }

    public record PaguiPaymentsPayload(
            String qrId,
            List<PaguiPaymentPayload> payments
    ) {
    }

    public record PaguiPaymentPayload(
            String qrId,
            String transactionId,
            String paymentDate,
            String paymentTime,
            String currency,
            java.math.BigDecimal amount,
            String senderBankCode,
            String senderName,
            String senderDocumentId,
            String senderAccount,
            String description
    ) {
    }
}
