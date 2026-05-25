package com.restoconnect.api.menu.producto;

import com.restoconnect.api.menu.categoria.CategoriaProducto;
import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "productos")
public class Producto extends BaseEntity {

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaProducto categoria;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(nullable = false)
    private boolean disponible = true;

    @Column(name = "imagen_url", columnDefinition = "text")
    private String imagenUrl;

    @Column(name = "codigo_interno")
    private String codigoInterno;

    @Column(precision = 12, scale = 2)
    private BigDecimal costo = BigDecimal.ZERO;

    @Column(name = "es_venta", nullable = false)
    private boolean esVenta = true;

    @Column(name = "es_insumo", nullable = false)
    private boolean esInsumo = false;

    @Column(name = "impuesto_aplicable", precision = 6, scale = 2)
    private BigDecimal impuestoAplicable = BigDecimal.ZERO;

    @Column(name = "unidad_medida", length = 20)
    private String unidadMedida = "UNIDAD";
}
