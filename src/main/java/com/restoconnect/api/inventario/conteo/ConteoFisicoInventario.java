package com.restoconnect.api.inventario.conteo;

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
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "inventario_conteos")
public class ConteoFisicoInventario extends BaseEntity {

    @Column(nullable = false)
    private LocalDate fechaConteo;

    @Column(nullable = false)
    private Integer numeroConteo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoConteo estado = EstadoConteo.ABIERTO;

    @Column(columnDefinition = "text")
    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private Integer totalItemsContados = 0;
    private Integer totalDiferencias = 0;
    private BigDecimal totalAjusteValor = BigDecimal.ZERO;
}
