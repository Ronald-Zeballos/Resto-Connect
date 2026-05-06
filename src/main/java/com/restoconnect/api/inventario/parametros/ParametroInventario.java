package com.restoconnect.api.inventario.parametros;

import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "inventario_parametros")
public class ParametroInventario extends BaseEntity {

    @Column(nullable = false)
    private Integer diasAnalisisConsumo = 30;

    @Column(nullable = false)
    private Integer diasCoberturaDeseada = 7;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal porcentajeMargenSeguridad = BigDecimal.valueOf(15);

    @Column(nullable = false)
    private boolean activarPrediccionAutomatica = true;

    @Column(nullable = false)
    private boolean activarAlertasEmail = false;

    @Column(nullable = false)
    private boolean activarAlertasWebSocket = true;

    @Column(nullable = false)
    private LocalTime horaEjecucionPrediccionDiaria = LocalTime.of(6, 0);

    @Column(precision = 12, scale = 2)
    private BigDecimal stockMinimoGlobalOpcional;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MetodoPrediccion metodoPrediccion = MetodoPrediccion.PROMEDIO_MOVIL;
}

