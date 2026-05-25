package com.restoconnect.api.contabilidad;

import com.restoconnect.api.clientes.Cliente;
import com.restoconnect.api.pedido.Pedido;
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
@Table(name = "cuentas_cobrar")
public class CuentaCobrar extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

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

    private LocalDate fechaUltimoCobro;
}
