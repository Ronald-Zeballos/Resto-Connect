package com.restoconnect.api.pago.qr;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PaguiBankCatalogService {

    public List<BankOptionResponse> listarBancosDisponibles() {
        return List.of(new BankOptionResponse(1, "Banco Economico"));
    }

    public record BankOptionResponse(
            Integer id,
            String nombre
    ) {
    }
}
