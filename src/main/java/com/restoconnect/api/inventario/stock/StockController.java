package com.restoconnect.api.inventario.stock;

import com.restoconnect.api.inventario.item.ItemInventarioRepository;
import com.restoconnect.api.inventario.item.ItemInventarioResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventario/stock")
@RequiredArgsConstructor
public class StockController {

    private final ItemInventarioRepository itemInventarioRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('COCINA')")
    public ResponseEntity<List<ItemInventarioResponse>> general() {
        return ResponseEntity.ok(itemInventarioRepository.findByActivoTrueOrderByNombreAsc().stream().map(ItemInventarioResponse::from).toList());
    }

    @GetMapping("/bajo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('COCINA')")
    public ResponseEntity<List<ItemInventarioResponse>> bajo() {
        return ResponseEntity.ok(itemInventarioRepository.findStockBajo().stream().map(ItemInventarioResponse::from).toList());
    }

    @GetMapping("/critico")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('COCINA')")
    public ResponseEntity<List<ItemInventarioResponse>> critico() {
        return ResponseEntity.ok(itemInventarioRepository.findCriticos().stream().map(ItemInventarioResponse::from).toList());
    }

    @GetMapping("/agotado")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('COCINA')")
    public ResponseEntity<List<ItemInventarioResponse>> agotado() {
        return ResponseEntity.ok(itemInventarioRepository.findAgotados().stream().map(ItemInventarioResponse::from).toList());
    }
}
