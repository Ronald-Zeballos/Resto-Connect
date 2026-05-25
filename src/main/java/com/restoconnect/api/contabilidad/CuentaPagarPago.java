package com.restoconnect.api.contabilidad;

import com.restoconnect.api.auth.Usuario;
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
@Table(name = "cuentas_pagar_pagos")
public class CuentaPagarPago extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "cuenta_pagar_id", nullable = false)
    private CuentaPagar cuentaPagar;

    @Column(nullable = false)
    private LocalDate fechaPago;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false, length = 20)
    private String metodoPago = "EFECTIVO";

    @Column(length = 100)
    private String comprobante;

    @Column(length = 300)
    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}
