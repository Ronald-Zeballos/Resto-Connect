package com.restoconnect.api.inventario.conteo;

import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.item.ItemInventarioRepository;
import com.restoconnect.api.inventario.movimiento.MovimientoInventarioRepository;
import com.restoconnect.api.inventario.movimiento.RegistrarSalidaInventarioUseCase;
import com.restoconnect.api.inventario.movimiento.TipoMovimientoInventario;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventario/conteos")
@RequiredArgsConstructor
public class ConteoFisicoController {

    private final ConteoFisicoRepository conteoRepository;
    private final DetalleConteoRepository detalleRepository;
    private final ItemInventarioRepository itemRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final RegistrarSalidaInventarioUseCase salidaInventarioUseCase;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ConteoFisicoResponse>> listar() {
        return ResponseEntity.ok(
                conteoRepository.findAllByOrderByFechaCreacionDesc().stream()
                        .map(ConteoFisicoResponse::from).toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConteoFisicoResponse> iniciar() {
        var abierto = conteoRepository.findTopByEstadoOrderByFechaCreacionDesc(EstadoConteo.ABIERTO);
        if (abierto.isPresent()) {
            return ResponseEntity.ok(ConteoFisicoResponse.from(abierto.get()));
        }
        var ultimoNumero = conteoRepository.countByEstado(EstadoConteo.CERRADO) + 1;
        var conteo = new ConteoFisicoInventario();
        conteo.setFechaConteo(LocalDate.now());
        conteo.setNumeroConteo(ultimoNumero);
        conteo.setEstado(EstadoConteo.ABIERTO);
        return ResponseEntity.ok(ConteoFisicoResponse.from(conteoRepository.save(conteo)));
    }

    @PostMapping("/{conteoId}/detalle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DetalleConteoResponse> registrarDetalle(
            @PathVariable UUID conteoId,
            @Valid @RequestBody ConteoFisicoRequest request
    ) {
        var conteo = conteoRepository.findById(conteoId)
                .orElseThrow(() -> new NotFoundException("Conteo no encontrado."));
        if (conteo.getEstado() == EstadoConteo.CERRADO) {
            throw new BusinessException("El conteo ya esta cerrado.");
        }
        var item = itemRepository.findById(request.itemInventarioId())
                .orElseThrow(() -> new NotFoundException("Item no encontrado."));

        var existente = detalleRepository.findByConteoIdAndItemInventarioId(conteoId, item.getId());
        DetalleConteoFisico detalle;
        if (existente.isPresent()) {
            detalle = existente.get();
        } else {
            detalle = new DetalleConteoFisico();
            detalle.setConteo(conteo);
            detalle.setItemInventario(item);
        }

        BigDecimal cantidadSistema = item.getStockActual();
        BigDecimal cantidadFisica = request.cantidadFisica();
        BigDecimal diferencia = cantidadFisica.subtract(cantidadSistema);
        BigDecimal costo = item.getCostoUnitario() != null ? item.getCostoUnitario() : BigDecimal.ZERO;
        BigDecimal ajuste = diferencia.multiply(costo);

        detalle.setCantidadSistema(cantidadSistema);
        detalle.setCantidadFisica(cantidadFisica);
        detalle.setDiferencia(diferencia);
        detalle.setCostoUnitario(costo);
        detalle.setAjusteValor(ajuste);
        detalle.setObservaciones(request.observaciones());
        detalle.setLotesDetalle(request.lotesDetalle());

        if (conteo.getEstado() == EstadoConteo.ABIERTO) {
            conteo.setEstado(EstadoConteo.EN_PROGRESO);
            conteoRepository.save(conteo);
        }

        return ResponseEntity.ok(DetalleConteoResponse.from(detalleRepository.save(detalle)));
    }

    @PostMapping("/{conteoId}/cerrar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConteoFisicoResponse> cerrar(@PathVariable UUID conteoId) {
        var conteo = conteoRepository.findById(conteoId)
                .orElseThrow(() -> new NotFoundException("Conteo no encontrado."));
        if (conteo.getEstado() == EstadoConteo.CERRADO) {
            throw new BusinessException("El conteo ya esta cerrado.");
        }

        var detalles = detalleRepository.findByConteoId(conteoId);

        int diferencias = 0;
        BigDecimal totalAjuste = BigDecimal.ZERO;

        for (var detalle : detalles) {
            if (detalle.getDiferencia().compareTo(BigDecimal.ZERO) != 0) {
                diferencias++;
                totalAjuste = totalAjuste.add(detalle.getAjusteValor());
                var item = detalle.getItemInventario();
                item.setStockActual(detalle.getCantidadFisica());
                item.setCostoUnitario(detalle.getCostoUnitario());
                itemRepository.save(item);

                var movimiento = new com.restoconnect.api.inventario.movimiento.MovimientoInventario();
                movimiento.setItemInventario(item);
                movimiento.setTipoMovimiento(TipoMovimientoInventario.AJUSTE);
                movimiento.setCantidad(detalle.getDiferencia().abs());
                movimiento.setMotivo("Ajuste por conteo fisico #" + conteo.getNumeroConteo());
                movimiento.setReferencia("CONTEO-" + conteo.getNumeroConteo());
                movimiento.setFechaMovimiento(OffsetDateTime.now(ZoneOffset.UTC));
                movimientoRepository.save(movimiento);
            }
        }

        conteo.setEstado(EstadoConteo.CERRADO);
        conteo.setTotalItemsContados(detalles.size());
        conteo.setTotalDiferencias(diferencias);
        conteo.setTotalAjusteValor(totalAjuste);

        return ResponseEntity.ok(ConteoFisicoResponse.from(conteoRepository.save(conteo)));
    }
}
