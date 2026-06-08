/**
 * Canned Responses API Types
 */

export interface CannedResponseCreate {
    short_code: string;
    content: string;
    account_id: number;
}

export interface CannedResponseUpdate {
    short_code?: string;
    content?: string;
}

export interface CannedResponseResponse {
    short_code: string;
    content: string;
    id: number;
    account_id: number;
    created_at: string;
    updated_at: string;
}

export interface GetCannedResponsesParams {
    skip?: number;
    limit?: number;
}

export interface SearchCannedResponsesParams {
    q: string;
    limit?: number;
}

export interface CannedResponsesListResponse {
    items: CannedResponseResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
}
