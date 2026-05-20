package com.restoconnect.api.ia.grok;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ia/grok")
@RequiredArgsConstructor
public class GrokAnalysisController {

    private final GrokAnalysisService grokAnalysisService;

    @PostMapping("/analizar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<GrokAnalysisService.GrokAnalysisResponse> analizar(
            @RequestBody(required = false) GrokAnalysisService.GrokAnalysisRequest request
    ) {
        return ResponseEntity.ok(grokAnalysisService.analizar(request));
    }
}
