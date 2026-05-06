package com.restoconnect.api.inventario.movimiento;

import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "inventario_movimientos")
public class MovimientoInventario extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "item_inventario_id", nullable = false)
    private ItemInventario itemInventario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimientoInventario tipoMovimiento;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidad;

    @Column(nullable = false)
    private String motivo;

    @Column(nullable = false)
    private String referencia;

    @Column(nullable = false)
    private OffsetDateTime fechaMovimiento;
}

