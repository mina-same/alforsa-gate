/**
 * Teams API Types
 */

export interface TeamCreate {
    name: string;
    organization_id: number;
    description?: string;
    avatar_url?: string;
}

export interface TeamUpdate extends Partial<TeamCreate> { }

export interface TeamResponse {
    id: number;
    organization_id: number;
    name: string;
    description?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface TeamMemberResponse {
    user_id: number;
    team_id: number;
    role: string;
    created_at: string;
}

export interface GetTeamsParams {
    skip?: number;
    limit?: number;
}

export interface TeamsListResponse {
    items: TeamResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
}
