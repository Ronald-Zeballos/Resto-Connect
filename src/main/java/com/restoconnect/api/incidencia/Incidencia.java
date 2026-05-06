package com.restoconnect.api.incidencia;

import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.mesa.Mesa;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "incidencias")
public class Incidencia extends BaseEntity {

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 1500)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaIncidencia categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrioridadIncidencia prioridad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoIncidencia estado;

    @ManyToOne
    @JoinColumn(name = "mesa_id")
    private Mesa mesa;

    @ManyToOne
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "reportado_por_id", nullable = false)
    private Usuario reportadoPor;

    @Column(length = 1000)
    private String comentarioResolucion;

    private OffsetDateTime fechaResolucion;
}

