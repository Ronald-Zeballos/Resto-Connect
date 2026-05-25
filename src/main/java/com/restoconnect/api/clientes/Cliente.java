package com.restoconnect.api.clientes;

import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "clientes")
public class Cliente extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(name = "nit_ci", length = 50)
    private String nitCi;

    @Column(length = 50)
    private String telefono;

    @Column(length = 200)
    private String email;

    @Column(length = 300)
    private String direccion;

    @Column(name = "tipo_documento", length = 20)
    private String tipoDocumento = "CI";

    @Column(nullable = false)
    private boolean activo = true;
}
