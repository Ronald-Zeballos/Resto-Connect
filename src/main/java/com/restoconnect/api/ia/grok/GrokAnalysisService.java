package com.restoconnect.api.ia.grok;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.restoconnect.api.configuracion.restaurante.ConfiguracionRestaurante;
import com.restoconnect.api.configuracion.restaurante.ConfigurarRestauranteUseCase;
import com.restoconnect.api.shared.exception.BusinessException;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Service
@RequiredArgsConstructor
public class GrokAnalysisService {

    private static final String XAI_CHAT_COMPLETIONS_URL = "https://api.x.ai/v1/chat/completions";

    private final ConfigurarRestauranteUseCase configurarRestauranteUseCase;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.builder().build();

    @Value("${app.grok.model:grok-4.20-reasoning}")
    private String fallbackModel;

    @Value("${app.grok.api-key:}")
    private String fallbackApiKey;

    @Value("${app.grok.system-prompt:Eres un analista de operaciones para restaurantes. Resume hallazgos, riesgos y acciones concretas.}")
    private String fallbackSystemPrompt;

    public GrokAnalysisResponse analizar(GrokAnalysisRequest request) {
        ConfiguracionRestaurante configuracion = configurarRestauranteUseCase.obtenerActual();
        String apiKey = firstNonBlank(fallbackApiKey, configuracion.getGrokApiKey());
        if (!StringUtils.hasText(apiKey)) {
            throw new BusinessException("Configura primero APP_GROK_API_KEY en el archivo .env para usar Grok.");
        }

        String model = firstNonBlank(configuracion.getGrokModelo(), fallbackModel);
        String systemPrompt = firstNonBlank(configuracion.getGrokSystemPrompt(), fallbackSystemPrompt);
        String objetivo = firstNonBlank(request != null ? request.objetivo() : null, "Analiza el rendimiento del restaurante y propone acciones concretas.");
        String promptAdicional = request != null ? request.promptAdicional() : null;
        Map<String, Object> datos = request != null && request.datos() != null ? request.datos() : Map.of();

        Map<String, Object> payload = Map.of(
                "model", model,
                "stream", false,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", buildUserPrompt(objetivo, promptAdicional, datos))
                )
        );

        GrokChatCompletionResponse response;
        try {
            response = restClient.post()
                    .uri(XAI_CHAT_COMPLETIONS_URL)
                    .header("Authorization", "Bearer " + apiKey.trim())
                    .header("Content-Type", "application/json")
                    .body(payload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<GrokChatCompletionResponse>() {
                    });
        } catch (RestClientResponseException ex) {
            throw new BusinessException(buildRemoteErrorMessage(ex));
        } catch (RestClientException ex) {
            throw new BusinessException("No se pudo consultar Grok: " + ex.getMessage());
        }

        String analysis = extractAnalysis(response);
        return new GrokAnalysisResponse(model, analysis);
    }

    private String buildUserPrompt(String objetivo, String promptAdicional, Map<String, Object> datos) {
        StringBuilder builder = new StringBuilder();
        builder.append("Objetivo del analisis: ").append(objetivo).append("\n\n");
        if (StringUtils.hasText(promptAdicional)) {
            builder.append("Contexto adicional: ").append(promptAdicional.trim()).append("\n\n");
        }
        builder.append("Datos del restaurante en JSON:\n");
        builder.append(serialize(datos));
        builder.append("\n\nEntrega el resultado en espanol claro con:\n");
        builder.append("1. Hallazgos clave.\n");
        builder.append("2. Riesgos.\n");
        builder.append("3. Acciones recomendadas.\n");
        return builder.toString();
    }

    private String serialize(Map<String, Object> datos) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(datos);
        } catch (JsonProcessingException ex) {
            throw new BusinessException("No se pudieron preparar los datos para Grok.");
        }
    }

    private String extractAnalysis(GrokChatCompletionResponse response) {
        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new BusinessException("Grok no devolvio contenido para el analisis.");
        }

        GrokChoice choice = response.choices().getFirst();
        if (choice.message() == null || !StringUtils.hasText(choice.message().content())) {
            throw new BusinessException("Grok devolvio una respuesta vacia.");
        }
        return choice.message().content().trim();
    }

    private String firstNonBlank(String primary, String fallback) {
        return StringUtils.hasText(primary) ? primary.trim() : fallback;
    }

    private String buildRemoteErrorMessage(RestClientResponseException ex) {
        String responseBody = ex.getResponseBodyAsString();
        if (ex.getStatusCode().value() == 403 && responseBody != null && responseBody.contains("credits or licenses")) {
            return "La API key de Grok fue aceptada, pero tu equipo de xAI todavia no tiene creditos o licencias activas. Activalos en console.x.ai y vuelve a intentar.";
        }

        if (StringUtils.hasText(responseBody)) {
            return "No se pudo consultar Grok: " + responseBody;
        }

        return "No se pudo consultar Grok: " + ex.getMessage();
    }

    public record GrokAnalysisRequest(
            String objetivo,
            String promptAdicional,
            Map<String, Object> datos
    ) {
    }

    public record GrokAnalysisResponse(
            String modelo,
            String analisis
    ) {
    }

    public record GrokChatCompletionResponse(
            List<GrokChoice> choices
    ) {
    }

    public record GrokChoice(
            GrokMessage message
    ) {
    }

    public record GrokMessage(
            String content
    ) {
    }
}
