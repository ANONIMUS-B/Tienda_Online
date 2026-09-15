<?php

namespace App\Notifications;

use App\Models\ElectronicDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReceiptIssuedNotification extends Notification
{
    use Queueable;

    /** @param array<int, string> $channels */
    public function __construct(public ElectronicDocument $document, public string $customerUrl, public array $channels) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return $this->channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Tu comprobante '.$this->document->number)
            ->greeting('Hola')
            ->line('Tu comprobante '.$this->document->number.' fue emitido por un total de S/ '.$this->document->total.'.')
            ->action('Ver pedido y comprobante', $this->customerUrl)
            ->line('Gracias por comprar en JBTECHLINE.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Comprobante emitido',
            'message' => 'Tu comprobante '.$this->document->number.' ya está disponible.',
            'document_id' => $this->document->id,
            'document_number' => $this->document->number,
            'url' => $this->customerUrl,
        ];
    }
}
