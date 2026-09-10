<x-mail::message>
# ¡Recibimos tu pedido!

Hola {{ $order->customer_name }}, tu pedido **{{ $order->number }}** fue registrado correctamente.

@foreach ($order->items as $item)
- {{ $item->name }} × {{ $item->quantity }} — S/ {{ number_format((float) $item->total, 2) }}
@endforeach

**Total: S/ {{ number_format((float) $order->total, 2) }}**

Te contactaremos para confirmar el pago y la entrega.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
