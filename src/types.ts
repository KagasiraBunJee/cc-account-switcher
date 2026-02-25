export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  scopes?: string[];
  subscriptionType?: string;
  rateLimitTier?: string;
}

/** Raw keychain format used by Claude CLI */
export interface ClaudeCredentials {
  claudeAiOauth: OAuthTokens;
}

export interface Profile {
  name: string;
  email?: string;
  org?: string;
  encryptedCredentials: string;
  iv: string;
  authTag: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface CasConfig {
  activeProfile: string | null;
  profiles: Record<string, Profile>;
}
