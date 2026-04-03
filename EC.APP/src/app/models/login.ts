export interface ILoginRequest {
  username: string,
  password: string
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  userClaimData: {
    userId: string;
    name: string;
    loginName: string;
    role?: string;
    Role?: string;
    tenantId?: number | string;
    TenantId?: number | string;
    tenantID?: number | string;
    TenantID?: number | string;
  };
}


export interface UserClaimData {
  userId: string;
  name: string;
  loginName: string;
  role?: string;
  Role?: string;
  tenantId?: number | string;
  TenantId?: number | string;
  tenantID?: number | string;
  TenantID?: number | string;
}
