package com.restoconnect.api.facturacion;

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
@Table(name = "facturas")
public class Factura extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Column(nullable = false, unique = true)
    private String numeroFactura;

    @Column(nullable = false)
    private String razonSocial;

    @Column(nullable = false)
    private String nitCi;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(nullable = false)
    private LocalDate fechaEmision;
}

