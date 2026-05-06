package com.restoconnect.api.inventario.item;

import com.restoconnect.api.compras.proveedor.Proveedor;
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
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "inventario_items")
public class ItemInventario extends BaseEntity {

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnidadMedida unidadMedida;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal stockActual;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal stockMinimo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal stockMaximo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal puntoReorden;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal costoUnitario;

    @ManyToOne
    @JoinColumn(name = "proveedor_preferido_id")
    private Proveedor proveedorPreferido;

    @Column(nullable = false)
    private Integer tiempoEntregaProveedorDias;

    @Column(nullable = false)
    private boolean activo = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClasificacionAbc clasificacionAbc = ClasificacionAbc.MEDIA;

    private LocalDate fechaUltimaCompra;
}
