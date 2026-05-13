import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CAMPAIGN_EXCEPTIONS } from './campaign-exceptions';

const REPORTING_BASE_URL = 'https://res-summary-app.azurewebsites.net/api';

// ─── Response shape interfaces ────────────────────────────────────────────────

interface TokenStore {
  token: string;
  expiresAt: number;
}

interface LoginResponse {
  token?: string;
  accessToken?: string;
  Token?: string;
  expiresIn?: number;
  ExpiresIn?: number;
}

export interface DialerSummary {
  totalCalls: number;
  totalDuration: number;
  answeredCalls: number;
  abandonedCalls: number;
  averageHandleTime: number;
  [key: string]: unknown;
}

export interface CallLogEntry {
  date: string;
  campaignName: string;
  totalCalls: number;
  answeredCalls: number;
  duration: number;
  [key: string]: unknown;
}

export interface ResolvedCampaigns {
  token: string;
  matchedCampaigns: string[];
}

export interface DialerSummaryResult {
  matchedCampaigns: string[];
  dialerSummary: DialerSummary | null;
  message?: string;
}

export interface CallLogsResult {
  matchedCampaigns: string[];
  callLogs: CallLogEntry[] | null;
  message?: string;
}

export interface CampaignReportResult {
  campaignName: string;
  matchedCampaigns: string[];
  dialerSummary: DialerSummary | null;
  callLogs: CallLogEntry[] | null;
  message?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ scope: Scope.DEFAULT })
export class ExternalService {
  private readonly logger = new Logger(ExternalService.name);
  private tokenStore: TokenStore | null = null;

  constructor(private readonly configService: ConfigService) {}

  // ─── 1. Auth ──────────────────────────────────────────────────────────────

  private isTokenValid(): boolean {
    if (!this.tokenStore) {
      this.logger.log('Token check: no token stored');
      return false;
    }

    const now = Date.now();
    const timeLeft = this.tokenStore.expiresAt - now;

    this.logger.log(
      `Token check: expiresAt=${new Date(this.tokenStore.expiresAt).toISOString()}, ` +
        `timeLeft=${Math.round(timeLeft / 1000)}s, ` +
        `valid=${timeLeft > 60_000}`,
    );

    return timeLeft > 60_000;
  }

  private async fetchNewToken(): Promise<string> {
    const userName = this.configService.get<string>('REPORTING_APP_USERNAME');
    const password = this.configService.get<string>('REPORTING_APP_PASSWORD');

    if (!userName || !password) {
      throw new InternalServerErrorException(
        'Reporting app credentials are not configured',
      );
    }

    const res = await fetch(`${REPORTING_BASE_URL}/Account/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, password }),
    });

    if (!res.ok) {
      throw new InternalServerErrorException(
        `Reporting app login failed: ${res.status} ${res.statusText}`,
      );
    }

    const data = (await res.json()) as LoginResponse;

    const token: string | undefined =
      data.token ?? data.accessToken ?? data.Token;
    const expiresIn: number = data.expiresIn ?? data.ExpiresIn ?? 3600;

    if (!token) {
      throw new InternalServerErrorException(
        'Reporting app login response did not include a token',
      );
    }

    this.tokenStore = {
      token,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    this.logger.log('Fetched new reporting-app token');
    return token;
  }

  private async getToken(): Promise<string> {
    if (this.isTokenValid()) {
      this.logger.log(
        `Reusing cached token: ${this.tokenStore!.token.slice(0, 20)}...`,
      );
      return this.tokenStore!.token;
    }
    this.logger.log('Fetching new token...');
    return this.fetchNewToken();
  }

  // ─── 2. Get all campaign names ────────────────────────────────────────────

  private async fetchAllCampaignNames(token: string): Promise<string[]> {
    const res = await fetch(`${REPORTING_BASE_URL}/campaign/names`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new InternalServerErrorException(
        `Failed to fetch campaign names: ${res.status} ${res.statusText}`,
      );
    }

    return res.json() as Promise<string[]>;
  }

  // ─── 3. Map / filter campaign names ──────────────────────────────────────

  private matchCampaignNames(
    allNames: string[],
    campaignName: string,
  ): string[] {
    const normalizedSearch = campaignName.replace(/\s+/g, '').toLowerCase();

    const pattern = new RegExp(`^${normalizedSearch}(?:\\.\\d+)?$`, 'i');

    const patternMatches = allNames.filter((name) => {
      const normalized = name.replace(/\s+/g, '').toLowerCase();
      return pattern.test(normalized);
    });

    const exceptions: string[] = CAMPAIGN_EXCEPTIONS[normalizedSearch] ?? [];

    const allNamesLowerMap = new Map<string, string>(
      allNames.map((name) => [name.toLowerCase(), name]),
    );

    const exceptionMatches = exceptions
      .map((exc) => allNamesLowerMap.get(exc.toLowerCase()))
      .filter((name): name is string => name !== undefined);

    const merged = [...patternMatches];
    for (const name of exceptionMatches) {
      if (!merged.includes(name)) {
        merged.push(name);
      }
    }

    return merged;
  }

  // ─── 4. Fetch dialer summary ──────────────────────────────────────────────

  private async fetchDialerSummary(
    token: string,
    campaignNames: string[],
    startDate: string,
    endDate: string,
  ): Promise<DialerSummary> {
    const res = await fetch(`${REPORTING_BASE_URL}/DialerRecord/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        campaignNames,
        startDate,
        endDate,
        groupingMode: 'Union',
      }),
    });

    if (!res.ok) {
      throw new InternalServerErrorException(
        `Failed to fetch dialer summary: ${res.status} ${res.statusText}`,
      );
    }

    return res.json() as Promise<DialerSummary>;
  }

  // ─── 5. Fetch call logs ───────────────────────────────────────────────────

  private async fetchCallLogs(
    token: string,
    campaignNames: string[],
    startDate: string,
    endDate: string,
  ): Promise<CallLogEntry[]> {
    const res = await fetch(`${REPORTING_BASE_URL}/CallLogs/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        campaignNames,
        startDate,
        endDate,
        step: 'Daily',
        groupingMode: 'Union',
      }),
    });

    if (!res.ok) {
      throw new InternalServerErrorException(
        `Failed to fetch call logs: ${res.status} ${res.statusText}`,
      );
    }

    return res.json() as Promise<CallLogEntry[]>;
  }

  // ─── 6. Shared setup helper ───────────────────────────────────────────────

  private async resolveMatchedCampaigns(
    campaignName: string,
  ): Promise<ResolvedCampaigns> {
    const token = await this.getToken();
    const allCampaignNames = await this.fetchAllCampaignNames(token);
    const matchedCampaigns = this.matchCampaignNames(
      allCampaignNames,
      campaignName,
    );
    return { token, matchedCampaigns };
  }

  // ─── 7. Public: dialer summary ────────────────────────────────────────────

  async getDialerSummary(
    campaignName: string,
    startDate: string,
    endDate: string,
  ): Promise<DialerSummaryResult> {
    const { token, matchedCampaigns } =
      await this.resolveMatchedCampaigns(campaignName);

    if (matchedCampaigns.length === 0) {
      return {
        matchedCampaigns: [],
        dialerSummary: null,
        message: `No campaigns found matching "${campaignName}"`,
      };
    }

    const dialerSummary = await this.fetchDialerSummary(
      token,
      matchedCampaigns,
      startDate,
      endDate,
    );

    return { matchedCampaigns, dialerSummary };
  }

  // ─── 8. Public: call logs ─────────────────────────────────────────────────

  async getCallLogs(
    campaignName: string,
    startDate: string,
    endDate: string,
  ): Promise<CallLogsResult> {
    const { token, matchedCampaigns } =
      await this.resolveMatchedCampaigns(campaignName);

    if (matchedCampaigns.length === 0) {
      return {
        matchedCampaigns: [],
        callLogs: null,
        message: `No campaigns found matching "${campaignName}"`,
      };
    }

    const callLogs = await this.fetchCallLogs(
      token,
      matchedCampaigns,
      startDate,
      endDate,
    );

    return { matchedCampaigns, callLogs };
  }

  // ─── 9. Legacy orchestrator (kept for backwards compat) ──────────────────

  async getCampaignReport(
    campaignName: string,
    startDate: string,
    endDate: string,
  ): Promise<CampaignReportResult> {
    const { token, matchedCampaigns } =
      await this.resolveMatchedCampaigns(campaignName);

    if (matchedCampaigns.length === 0) {
      return {
        campaignName,
        matchedCampaigns: [],
        dialerSummary: null,
        callLogs: null,
        message: `No campaigns found matching "${campaignName}"`,
      };
    }

    const [dialerSummary, callLogs] = await Promise.all([
      this.fetchDialerSummary(token, matchedCampaigns, startDate, endDate),
      this.fetchCallLogs(token, matchedCampaigns, startDate, endDate),
    ]);

    return { campaignName, matchedCampaigns, dialerSummary, callLogs };
  }
}
