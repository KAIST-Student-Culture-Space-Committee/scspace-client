"use client"

import { useFormDataMutation, useMutationApi, useQueryApi } from "./api";
import {
    IRentalAll,
    IGoods,
    IGoodsCreate,
    IGoodsUpdate,
    IGoodsAvailabilityCheck,
} from "@scspace-depot/types/rental";
import { IDataResponse, ISuccessResponse } from "@scspace-depot/types/common/common.type";

// 통합 Rental API Hook (대여 관리)
export function useRentalAPI(params?: {
    view?: "all" | "my";
    limit?: number;
    offset?: number;
    isActive?: boolean;
}) {
    const { view = "my", limit = 50, offset = 0, isActive } = params || {
        view: "my" as const,
        limit: 50,
        offset: 0,
        isActive: undefined
    };

    const activeParam = isActive !== undefined ? `&isActive=${isActive}` : '';

    // GET Hook들을 최상위에서 호출
    const allRentals = useQueryApi<IDataResponse<IRentalAll[]>>(
        view === "all" ? `/rental?limit=${limit}&offset=${offset}` : ""
    );

    const myRentals = useQueryApi<IDataResponse<IRentalAll[]>>(
        view === "my" ? `/rental/my/list?limit=${limit}&offset=${offset}${activeParam}` : ""
    );

    return {
        allRentals,
        myRentals,
    };
}

// 통합 Goods API Hook (물품 관리)
export function useGoodsAPI(params?: {
    id?: number;
}) {
    const { id } = params || { id: -1 };

    // GET Hook들을 최상위에서 호출
    const allGoods = useQueryApi<IGoods[]>(
        `/rental/goods/list`
    );

    const goodsById = useQueryApi<IGoods>(
        (id && id > 0) ? `/rental/goods/${id}` : ""
    );

    const createGoods = useFormDataMutation<{ success: boolean; data: { id: number } }>(
        "/rental/goods",
        "POST"
    ).mutateAsync;

    const updateGoods = useFormDataMutation<ISuccessResponse>(
        `/rental/goods/${id || ''}`,
        "PUT"
    ).mutateAsync;

    const deleteGoods = useMutationApi<ISuccessResponse, {}>(
        `/rental/goods/${id || ''}`,
        "DELETE"
    ).mutateAsync;

    const checkAvailability = useMutationApi<{ available: boolean }, IGoodsAvailabilityCheck>(
        "/rental/goods/check-availability",
        "POST"
    ).mutate;

    return {
        // GET 데이터와 상태들
        allGoods,
        goodsById,

        // CUD 메서드들
        createGoods,
        updateGoods,
        deleteGoods,
        checkAvailability,
    };
}
