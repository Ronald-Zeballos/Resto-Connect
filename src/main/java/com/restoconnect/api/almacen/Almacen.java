package com.restoconnect.api.almacen;

import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "almacenes")
public class Almacen extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 200)
    private String ubicacion;

    @Column(nullable = false)
    private boolean activo = true;
}
