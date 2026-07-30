<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\ManagerRanking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class RankingController
{
    public function index(Request $request): JsonResponse
    {
        $scope = $request->string('scope', 'global')->lower()->toString();
        $ranking = ManagerRanking::query()->with('user:id,name')->where('season', config('game.season', '07'))->when($scope !== 'global', fn ($query) => $query->where('scope', $scope))->orderBy('rank')->paginate($request->integer('per_page', 50));
        return response()->json($ranking);
    }
}
