package com.restoconnect.api.inventario.prediccion;

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
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "inventario_predicciones")
public class PrediccionReposicion extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "item_inventario_id", nullable = false)
    private ItemInventario itemInventario;

    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal consumoPromedioDiario;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal diasHastaAgotamiento;

    @Column(nullable = false)
    private LocalDate fechaEstimadaAgotamiento;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidadSugeridaCompra;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NivelRiesgoPrediccion nivelRiesgo;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal confianza;

    @Column(nullable = false, length = 1000)
    private String motivo;

    @Column(nullable = false)
    private OffsetDateTime fechaGeneracion;
}

