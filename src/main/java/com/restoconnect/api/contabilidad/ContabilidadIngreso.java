package com.restoconnect.api.contabilidad;

import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.clientes.Cliente;
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
@Table(name = "contabilidad_ingresos")
public class ContabilidadIngreso extends BaseEntity {

    @Column(nullable = false)
    private LocalDate fechaIngreso;

    @Column(nullable = false, length = 300)
    private String descripcion;

    @Column(name = "categoria_ingreso", nullable = false, length = 50)
    private String categoriaIngreso;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal monto;

    @Column(length = 20)
    private String metodoPago = "EFECTIVO";

    @Column(length = 100)
    private String comprobante;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
