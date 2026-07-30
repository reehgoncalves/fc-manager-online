<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\PurchaseService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class WalletController
{
    public function __construct(private readonly WalletService $wallets, private readonly PurchaseService $purchases) {}

    public function show(Request $request): JsonResponse { return response()->json($this->wallets->walletFor($request->user())->load('transactions')); }

    public function createOrder(Request $request): JsonResponse
    {
        $data = $request->validate(['package' => ['required', 'in:starter,popular,value'], 'payment_method' => ['required', 'in:pix']]);
        $key = $request->header('Idempotency-Key');
        abort_if(! is_string($key) || strlen($key) < 12, 400, 'Idempotency-Key is required.');
        $packages = ['starter' => [1490, 3000], 'popular' => [4990, 13750], 'value' => [11990, 40000]];
        [$totalCents, $coins] = $packages[$data['package']];
        $order = $this->purchases->createPixOrder($request->user(), 'coins', $totalCents, ['coins' => $coins, 'package' => $data['package']], $key);
        return response()->json(['order' => $order, 'message' => 'PIX order created; awaiting provider confirmation.'], 201);
    }
}
