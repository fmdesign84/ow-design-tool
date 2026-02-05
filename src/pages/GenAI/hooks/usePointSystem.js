/**
 * usePointSystem 훅
 * 포인트 조회 및 사용 관리
 */
import { useState, useCallback } from 'react';
import { POINT_COSTS } from '../../../constants/pointPolicy';

/**
 * 포인트 시스템 관리 훅
 * @returns {Object} 포인트 상태 및 핸들러
 */
export const usePointSystem = () => {
    const [pointUsage, setPointUsage] = useState({
        used: 0,
        limit: 500,
        remaining: 500
    });

    // Supabase에서 포인트 사용량 로드
    const loadPointUsage = useCallback(async () => {
        try {
            const response = await fetch('/api/points');
            const data = await response.json();
            setPointUsage({
                used: data.pointsUsed || 0,
                limit: data.limit || 500,
                remaining: data.remaining || 500
            });
        } catch (err) {
            console.error('Failed to load point usage:', err);
        }
    }, []);

    // 포인트 사용 (차감) - 'use'로 시작하면 ESLint가 훅으로 인식하므로 consume 사용
    const consumePoints = useCallback(async (action, details = null) => {
        try {
            const points = POINT_COSTS[action] || 3;
            const response = await fetch('/api/points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ points, action, details })
            });
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error(`포인트 한도 초과 (${data.remaining}P 남음)`);
                }
                throw new Error(data.error);
            }

            setPointUsage({
                used: data.pointsUsed,
                limit: data.limit,
                remaining: data.remaining
            });

            return { success: true, remaining: data.remaining };
        } catch (err) {
            console.error('Failed to use points:', err);
            throw err;
        }
    }, []);

    // 포인트 충분 여부 확인
    const hasEnoughPoints = useCallback((action) => {
        const requiredPoints = POINT_COSTS[action] || 3;
        return pointUsage.remaining >= requiredPoints;
    }, [pointUsage.remaining]);

    // 필요 포인트 조회
    const getRequiredPoints = useCallback((action) => {
        return POINT_COSTS[action] || 3;
    }, []);

    return {
        pointUsage,
        loadPointUsage,
        consumePoints,
        hasEnoughPoints,
        getRequiredPoints,
    };
};

export default usePointSystem;
