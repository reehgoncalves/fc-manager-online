<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

final class AuditService
{
    public function record(?int $actorId, string $action, mixed $subject = null, array $metadata = [], ?Request $request = null): AuditLog
    {
        return AuditLog::create([
            'actor_id' => $actorId,
            'action' => $action,
            'auditable_type' => $subject ? $subject::class : null,
            'auditable_id' => $subject?->getKey(),
            'ip_address' => $request?->ip(),
            'metadata' => $metadata,
        ]);
    }
}
