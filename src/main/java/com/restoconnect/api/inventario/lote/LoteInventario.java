package com.restoconnect.api.inventario.lote;

import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "inventario_lotes")
public class LoteInventario extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "item_inventario_id", nullable = false)
    private ItemInventario itemInventario;

    @Column(nullable = false, length = 100)
    private String codigoLote;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidadInicial;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidadRestante;

    private LocalDate fechaVencimiento;

    @Column(nullable = false)
    private LocalDate fechaIngreso;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal costoUnitario;

    @Column(nullable = false)
    private boolean activo = true;
}
