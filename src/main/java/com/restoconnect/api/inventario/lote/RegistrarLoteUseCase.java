package com.restoconnect.api.inventario.lote;

import com.restoconnect.api.inventario.item.ItemInventarioRepository;
import com.restoconnect.api.shared.exception.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrarLoteUseCase {

    private final LoteInventarioRepository loteRepository;
    private final ItemInventarioRepository itemRepository;

    @Transactional
    public LoteInventarioResponse ejecutar(@Valid RegistrarLoteRequest request) {
        var item = itemRepository.findById(request.itemInventarioId())
                .orElseThrow(() -> new NotFoundException("Item de inventario no encontrado."));

        var lote = new LoteInventario();
        lote.setItemInventario(item);
        lote.setCodigoLote(request.codigoLote());
        lote.setCantidadInicial(request.cantidad());
        lote.setCantidadRestante(request.cantidad());
        lote.setFechaVencimiento(request.fechaVencimiento());
        lote.setFechaIngreso(request.fechaIngreso() != null ? request.fechaIngreso() : LocalDate.now());
        lote.setCostoUnitario(request.costoUnitario());
        return LoteInventarioResponse.from(loteRepository.save(lote));
    }

    public record RegistrarLoteRequest(
            @NotNull UUID itemInventarioId,
            @NotBlank String codigoLote,
            @NotNull @DecimalMin(value = "0.01") BigDecimal cantidad,
            LocalDate fechaVencimiento,
            LocalDate fechaIngreso,
            @NotNull @DecimalMin(value = "0.0") BigDecimal costoUnitario
    ) {}
}
