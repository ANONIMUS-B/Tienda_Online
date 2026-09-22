<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ $document->number }}</title>
    <style>
        @page { margin: {{ $format === 'ticket' ? '14px 10px' : '28px 34px' }}; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #234f59; font-family: DejaVu Sans, sans-serif; font-size: {{ $format === 'ticket' ? '8px' : '10px' }}; }
        .header { border-bottom: 3px solid #00cfe8; padding-bottom: 14px; }
        .logo { width: {{ $format === 'ticket' ? '150px' : '250px' }}; height: auto; }
        .document-box { border: 2px solid #00cfe8; padding: 10px; text-align: center; }
        .document-box strong { display: block; font-size: {{ $format === 'ticket' ? '11px' : '15px' }}; color: #2a6572; }
        .document-box .number { margin-top: 5px; font-size: {{ $format === 'ticket' ? '10px' : '13px' }}; font-weight: bold; }
        .company { line-height: 1.5; }
        .muted { color: #60818a; }
        .section { margin-top: 14px; }
        .section-title { margin-bottom: 6px; border-bottom: 1px solid #bceff4; padding-bottom: 4px; color: #167487; font-weight: bold; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #e9fbfd; color: #2a6572; font-size: {{ $format === 'ticket' ? '7px' : '9px' }}; text-transform: uppercase; }
        th, td { border-bottom: 1px solid #d8eff2; padding: {{ $format === 'ticket' ? '5px 2px' : '8px 5px' }}; vertical-align: top; }
        .right { text-align: right; }
        .center { text-align: center; }
        .totals { margin-top: 10px; margin-left: auto; width: {{ $format === 'ticket' ? '100%' : '44%' }}; }
        .totals td { padding: 5px; }
        .grand-total td { border-top: 2px solid #00cfe8; color: #167487; font-size: {{ $format === 'ticket' ? '11px' : '14px' }}; font-weight: bold; }
        .footer { margin-top: 20px; border-top: 1px solid #bceff4; padding-top: 10px; text-align: center; line-height: 1.5; }
        .status { display: inline-block; margin-top: 6px; background: #e9fbfd; padding: 4px 8px; color: #167487; font-weight: bold; }
        @if ($format === 'ticket')
            .a4-only { display: none; }
            .header, .customer-grid { text-align: center; }
            .document-box { margin-top: 10px; }
            .company { margin-top: 8px; }
        @else
            .header-table td { border: 0; padding: 0; vertical-align: top; }
            .brand-cell { width: 58%; padding-right: 20px !important; }
            .document-cell { width: 42%; }
            .customer-table td { width: 50%; border: 0; padding: 5px 10px 5px 0; }
        @endif
    </style>
</head>
<body>
    <header class="header">
        @if ($format === 'a4')
            <table class="header-table"><tr><td class="brand-cell">
        @endif
        @if ($logoData)<img class="logo" src="{{ $logoData }}" alt="{{ $settings->company_name }}">@endif
        <div class="company">
            <strong>{{ $settings->company_name ?: 'JBTECHLINE' }}</strong><br>
            RUC: {{ $settings->billing_ruc ?: 'No configurado' }}<br>
            {{ $settings->address ?: 'Dirección no configurada' }}<br>
            @if ($settings->phone) Teléfono: {{ $settings->phone }} @endif
            @if ($settings->email) · {{ $settings->email }} @endif
        </div>
        @if ($format === 'a4')
            </td><td class="document-cell">
        @endif
        <div class="document-box">
            <strong>{{ strtoupper($document->type === 'boleta' ? 'Boleta de venta electrónica' : ($document->type === 'factura' ? 'Factura electrónica' : 'Nota de venta')) }}</strong>
            <div class="number">{{ $document->number }}</div>
            <span class="status">{{ strtoupper($document->status) }}</span>
        </div>
        @if ($format === 'a4')
            </td></tr></table>
        @endif
    </header>

    <section class="section customer-grid">
        <div class="section-title">Datos del cliente y emisión</div>
        <table class="customer-table">
            <tr><td><strong>Cliente:</strong> {{ $document->customer_name }}</td><td><strong>Fecha:</strong> {{ optional($document->issued_at)->timezone('America/Lima')->format('d/m/Y H:i') }}</td></tr>
            <tr><td><strong>Documento:</strong> {{ $document->customer_document ?: 'Sin documento' }}</td><td><strong>Moneda:</strong> Soles (PEN)</td></tr>
            <tr><td><strong>Correo:</strong> {{ $document->customer_email ?: 'No indicado' }}</td><td><strong>Operación:</strong> Venta interna</td></tr>
        </table>
    </section>

    <section class="section">
        <div class="section-title">Detalle</div>
        <table>
            <thead><tr><th>Descripción</th><th class="center">Cant.</th><th class="right">V. unit.</th><th class="right">Importe</th></tr></thead>
            <tbody>
            @foreach (data_get($document->payload_json, 'items', []) as $item)
                @php
                    $quantity = (float) ($item['cantidad'] ?? 0);
                    $unitValue = (float) ($item['valor_unitario'] ?? 0);
                @endphp
                <tr>
                    <td>{{ $item['descripcion'] ?? '' }}<span class="a4-only muted"><br>{{ $item['codigo_interno'] ?? '' }}</span></td>
                    <td class="center">{{ rtrim(rtrim(number_format($quantity, 2, '.', ''), '0'), '.') }}</td>
                    <td class="right">S/ {{ number_format($unitValue, 2) }}</td>
                    <td class="right">S/ {{ number_format($quantity * $unitValue, 2) }}</td>
                </tr>
            @endforeach
            </tbody>
        </table>
        <table class="totals">
            <tr><td>Op. gravada</td><td class="right">S/ {{ number_format((float) $document->subtotal, 2) }}</td></tr>
            <tr><td>IGV (18%)</td><td class="right">S/ {{ number_format((float) $document->tax, 2) }}</td></tr>
            <tr class="grand-total"><td>Total</td><td class="right">S/ {{ number_format((float) $document->total, 2) }}</td></tr>
        </table>
    </section>

    <footer class="footer">
        Representación impresa del comprobante electrónico.<br>
        Consulte su comprobante y estado desde el enlace enviado por {{ $settings->company_name ?: 'JBTECHLINE' }}.<br>
        <strong>Gracias por su preferencia.</strong>
    </footer>
</body>
</html>
