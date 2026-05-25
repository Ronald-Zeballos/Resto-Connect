package com.restoconnect.api.caja;

import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "cierres_caja")
public class CierreCaja extends BaseEntity {

    @Column(nullable = false)
    private OffsetDateTime fechaApertura;

    private OffsetDateTime fechaCierre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoCierreCaja estado = EstadoCierreCaja.ABIERTO;

    @ManyToOne
    @JoinColumn(name = "usuario_apertura_id", nullable = false)
    private Usuario usuarioApertura;

    @ManyToOne
    @JoinColumn(name = "usuario_cierre_id")
    private Usuario usuarioCierre;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal saldoInicial = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal saldoEsperado;

    @Column(precision = 14, scale = 2)
    private BigDecimal saldoRealDeclarado;

    @Column(precision = 14, scale = 2)
    private BigDecimal diferencia;

    @Column(columnDefinition = "text")
    private String observaciones;

    @Column(columnDefinition = "text")
    private String detallePagos;

    private Integer totalPedidos = 0;
    private BigDecimal totalVentas = BigDecimal.ZERO;
    private BigDecimal totalImpuesto = BigDecimal.ZERO;
    private BigDecimal totalPropinas = BigDecimal.ZERO;
    private BigDecimal totalDescuentos = BigDecimal.ZERO;
    private BigDecimal totalGastos = BigDecimal.ZERO;
}
