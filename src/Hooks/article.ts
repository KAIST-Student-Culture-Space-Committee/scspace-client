"use client"

import { useFormDataMutation, useMutationApi, useQueryApi } from "./api";
import {
    IArticle,
    IArticleFetchResult,
    IArticlePreview,
    IArticlePublicFetchResult,
    IArticlePublicWithUser,
    IArticleQuery,
    IArticleUpdate,
    IArticleWithUser,
} from "@scspace-depot/types/article";

// 통합 Article API Hook
export function useArticleAPI(params?: {
    id?: number;
    query?: IArticleQuery;
    manage?: boolean;
}) {
    const { id, query, manage = false } = params || {};
    const baseEndpoint = manage ? "/article/manage" : "/article";

    // GET Hook들을 최상위에서 호출
    const articles = useQueryApi<IArticlePublicFetchResult | IArticleFetchResult>(
        baseEndpoint,
        query
    );

    const articleById = useQueryApi<IArticlePublicWithUser | IArticleWithUser>(
        (id && id > 0) ? `${baseEndpoint}/${id}` : ""
    );

    const articlePreviews = useQueryApi<IArticlePreview>(
        "/article/preview"
    );

    // POST/PUT/DELETE 메서드들
    const createArticle = useFormDataMutation<IArticle>(
        "/article",
        "POST"
    ).mutateAsync;

    const updateArticle = useMutationApi<IArticle, IArticleUpdate>(
        id ? `/article/${id}` : "",
        "PUT"
    ).mutateAsync;

    const updateArticleFile = useFormDataMutation<IArticle>(
        id ? `/article/${id}/file` : "",
        "PUT"
    ).mutateAsync;

    const updateArticleState = useMutationApi<IArticle, Pick<IArticle, "state">>(
        id ? `/article/${id}/state` : "",
        "PUT"
    ).mutateAsync;

    const deleteArticle = useMutationApi<{}, {}>(
        id ? `/article/${id}` : "",
        "DELETE"
    ).mutateAsync;


    return {
        // GET 데이터와 상태들
        articles,
        articleById,
        articlePreviews,

        // CUD 메서드들
        createArticle,
        updateArticle,
        updateArticleFile,
        deleteArticle,
        updateArticleState,
    };
}
