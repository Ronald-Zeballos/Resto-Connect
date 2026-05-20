package com.restoconnect.api.configuracion.restaurante;

import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "configuracion_restaurante")
public class ConfiguracionRestaurante extends BaseEntity {

    @Column(nullable = false)
    private String nombreComercial;

    @Column(nullable = false)
    private String razonSocial;

    @Column(nullable = false)
    private String nit;

    @Column(nullable = false)
    private String telefono;

    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String moneda;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal porcentajeImpuesto;

    @Column(nullable = false)
    private boolean pagosQrHabilitado;

    @Column(nullable = false)
    private String proveedorQr;

    @Column
    private String paguiBaseUrl;

    @Column
    private String paguiEmail;

    @Column
    private String paguiPassword;

    @Column
    private Integer paguiBankId;

    @Column
    private String qrCuentaTitular;

    @Column
    private String qrCuentaBanco;

    @Column
    private String qrCuentaNumero;

    @Column
    private String qrCuentaTipo;

    @Column
    private String qrComercioCodigo;

    @Column(length = 500)
    private String grokApiKey;

    @Column
    private String grokModelo;

    @Column(columnDefinition = "text")
    private String grokSystemPrompt;
}
