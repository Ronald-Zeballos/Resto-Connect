package com.restoconnect.api.contabilidad;

import com.restoconnect.api.compras.ordencompra.OrdenCompra;
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
@Table(name = "cuentas_pagar")
public class CuentaPagar extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;

    @ManyToOne
    @JoinColumn(name = "orden_compra_id")
    private OrdenCompra ordenCompra;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal montoOriginal;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal saldoPendiente;

    @Column(nullable = false)
    private LocalDate fechaEmision;

    @Column(nullable = false)
    private LocalDate fechaVencimiento;

    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE";

    @Column(length = 300)
    private String descripcion;

    @Column(length = 100)
    private String numeroComprobante;

    private LocalDate fechaUltimoPago;
}
