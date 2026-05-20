package com.restoconnect.api.pago.qr;

import com.restoconnect.api.pago.Pago;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "pagos_qr")
public class PagoQr extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "pago_id")
    private Pago pago;

    @Column(nullable = false, length = 50)
    private String proveedor;

    @Column(name = "qr_externo_id", nullable = false, unique = true)
    private String qrExternoId;

    @Column(name = "transaccion_externa", nullable = false)
    private String transaccionExterna;

    @Column(nullable = false, length = 50)
    private String estado;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false, length = 20)
    private String moneda;

    @Column(length = 500)
    private String descripcion;

    private OffsetDateTime expiracion;

    @Column(name = "imagen_qr", columnDefinition = "TEXT")
    private String imagenQr;

    @Column(name = "referencia_pago_externa")
    private String referenciaPagoExterna;

    @Column(name = "pagado_en")
    private OffsetDateTime pagadoEn;

    @Column(name = "fecha_ultima_sincronizacion")
    private OffsetDateTime fechaUltimaSincronizacion;
}
