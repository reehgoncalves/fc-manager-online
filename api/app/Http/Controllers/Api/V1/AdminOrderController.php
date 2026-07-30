<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Order;
use App\Services\AuditService;
use App\Services\OrderSettlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AdminOrderController
{
    public function __construct(private readonly OrderSettlementService $settlement, private readonly AuditService $audit) {}

    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()->with('user:id,name,email')->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')->toString()))->latest()->paginate(min(100, $request->integer('per_page', 30)));
        return response()->json($orders);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:paid,failed,refunded'], 'reason' => ['required', 'string', 'min:5', 'max:500']]);
        if ($data['status'] === 'paid') {
            $order = $this->settlement->settle($order, $request->user(), 'admin_manual');
        } else {
            abort_if($order->status === 'paid', 409, 'Paid orders cannot be changed without a refund workflow.');
            $order->forceFill(['status' => $data['status'], 'metadata' => array_merge($order->metadata ?? [], ['admin_reason' => $data['reason']])])->save();
        }
        $this->audit->record($request->user()->id, 'order.status_changed', $order, ['status' => $data['status'], 'reason' => $data['reason']], $request);
        return response()->json($order->fresh('user'));
    }
}
