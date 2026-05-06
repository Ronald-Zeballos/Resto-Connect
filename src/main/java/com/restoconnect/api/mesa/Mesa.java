package com.restoconnect.api.mesa;

import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "mesas")
public class Mesa extends BaseEntity {

    @Column(nullable = false, unique = true)
    private Integer numero;

    @Column(nullable = false, unique = true)
    private String codigoQr;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoMesa estado = EstadoMesa.LIBRE;
}

