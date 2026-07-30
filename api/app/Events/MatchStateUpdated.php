<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class MatchStateUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly string $matchId,
        public readonly array $state,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('matches.'.$this->matchId)];
    }

    public function broadcastAs(): string
    {
        return 'match.state';
    }

    public function broadcastWith(): array
    {
        return ['matchId' => $this->matchId, ...$this->state];
    }
}
