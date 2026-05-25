package com.restoconnect.api.caja;

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
@Table(name = "caja_gastos")
public class CajaGasto extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "cierre_caja_id", nullable = false)
    private CierreCaja cierreCaja;

    @Column(nullable = false, length = 300)
    private String descripcion;

    @Column(nullable = false, length = 50)
    private String categoriaGasto;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal monto;

    @Column(length = 20)
    private String metodoPago = "EFECTIVO";

    @Column(length = 100)
    private String comprobante;
}
