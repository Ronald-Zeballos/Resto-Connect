package com.restoconnect.api.compras.ordencompra;

import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.compras.proveedor.Proveedor;
import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "ordenes_compra")
public class OrdenCompra extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoOrdenCompra estado;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal costoEstimado;

    private LocalDate fechaRecepcion;

    @Column(name = "estado_pago", length = 20)
    private String estadoPago = "PENDIENTE";

    @Column(name = "fecha_pago")
    private LocalDate fechaPago;

    @ManyToOne
    @JoinColumn(name = "usuario_recibe_id")
    private Usuario usuarioRecibe;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @OneToMany(mappedBy = "ordenCompra", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrdenCompraDetalle> detalles = new ArrayList<>();
}

