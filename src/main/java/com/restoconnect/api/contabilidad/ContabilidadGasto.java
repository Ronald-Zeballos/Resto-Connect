package com.restoconnect.api.contabilidad;

import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.compras.proveedor.Proveedor;
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
@Table(name = "contabilidad_gastos")
public class ContabilidadGasto extends BaseEntity {

    @Column(nullable = false)
    private LocalDate fechaGasto;

    @Column(nullable = false, length = 300)
    private String descripcion;

    @Column(name = "categoria_gasto", nullable = false, length = 50)
    private String categoriaGasto;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal monto;

    @Column(length = 20)
    private String metodoPago = "EFECTIVO";

    @Column(length = 100)
    private String comprobante;

    @ManyToOne
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
