<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Order;
use App\Models\WebhookEvent;
use App\Services\OrderSettlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class PixWebhookController
{
    public function __construct(private readonly OrderSettlementService $settlement) {}

    public function __invoke(Request $request): JsonResponse
    {
        $secret = (string) config('services.pix.webhook_secret');
        $signature = (string) $request->header('X-Pix-Signature');
        abort_if($secret === '' || $signature === '', 401, 'Invalid webhook signature.');
        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        abort_unless(hash_equals($expected, $signature), 401, 'Invalid webhook signature.');

        $payload = $request->json()->all();
        $externalId = (string) data_get($payload, 'id', data_get($payload, 'txid', ''));
        $status = (string) data_get($payload, 'status', '');
        $providerReference = (string) data_get($payload, 'order_id', data_get($payload, 'metadata.order_id', ''));
        abort_if($externalId === '' || $providerReference === '', 422, 'Webhook without stable references.');

        $event = WebhookEvent::firstOrCreate(['provider' => 'pix', 'external_id' => $externalId], ['event_type' => $status, 'payload' => $payload]);
        if ($event->processed_at) return response()->json(['received' => true, 'duplicate' => true]);
        $order = Order::query()->whereKey($providerReference)->orWhere('provider_reference', $providerReference)->firstOrFail();
        if (in_array(strtolower($status), ['paid', 'approved', 'completed'], true)) $this->settlement->settle($order, null, 'pix_webhook');
        else if (in_array(strtolower($status), ['failed', 'cancelled', 'canceled'], true)) $order->forceFill(['status' => 'failed'])->save();
        DB::transaction(fn () => $event->forceFill(['processed_at' => now()])->save());
        return response()->json(['received' => true]);
    }
}
