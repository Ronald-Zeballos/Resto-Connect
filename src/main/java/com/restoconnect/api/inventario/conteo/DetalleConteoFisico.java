package com.restoconnect.api.inventario.conteo;

import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "inventario_conteos_detalle")
public class DetalleConteoFisico extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "conteo_id", nullable = false)
    private ConteoFisicoInventario conteo;

    @ManyToOne
    @JoinColumn(name = "item_inventario_id", nullable = false)
    private ItemInventario itemInventario;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidadSistema;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidadFisica;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal diferencia;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal costoUnitario = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal ajusteValor = BigDecimal.ZERO;

    @Column(length = 300)
    private String observaciones;

    @Column(columnDefinition = "jsonb")
    private String lotesDetalle;
}
