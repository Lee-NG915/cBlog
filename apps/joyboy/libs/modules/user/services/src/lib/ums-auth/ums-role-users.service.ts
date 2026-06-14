import { PosUmsAuthService } from './ums-auth.service';

export type PosUmsRoleUser = {
  id: number;
  name: string;
  email: string;
};

type PosUmsApplicationRoleUser = {
  id?: number | string;
  name?: string;
  username?: string;
  email?: string;
};

type PosUmsRoleUsersResponse = {
  code?: number;
  msg?: string;
  data?: PosUmsApplicationRoleUser[];
};

export const POS_UMS_ROLE_USERS_APPLICATION_CODE = 'pos';

export const POS_UMS_ROLE_CODES_CONFIG = {
  ca: ['knight_sales_crew_ca', 'knight_sales_manager_ca', 'knight_sales_crew_ca'],
  us: ['knight_sales_crew_us', 'knight_sales_manager_us', 'knight_sales_crew_us'],
  sg: ['knight_sales_crew_sg', 'knight_sales_manager_sg', 'knight_sales_crew_sg'],
  au: ['knight_sales_crew_au', 'knight_sales_manager_au', 'knight_sales_crew_au'],
  uk: ['knight_sales_crew_uk', 'knight_sales_manager_uk', 'knight_sales_crew_uk'],
} satisfies Record<string, string[]>;

function normalizePosUmsRoleUsers(data: unknown): PosUmsRoleUser[] {
  const response = data as PosUmsRoleUsersResponse | null | undefined;

  if (!Array.isArray(response?.data)) {
    return [];
  }

  return response.data
    .map((item) => {
      const id = typeof item?.id === 'number' ? item.id : Number(item?.id);
      const name = typeof item?.name === 'string' ? item.name.trim() : '';
      const username = typeof item?.username === 'string' ? item.username.trim() : '';
      const email = typeof item?.email === 'string' ? item.email.trim() : '';
      const displayName = username || name || email;

      if (!Number.isFinite(id) || !displayName) {
        return null;
      }

      return {
        id,
        name: displayName,
        email,
      };
    })
    .filter((item): item is PosUmsRoleUser => Boolean(item));
}

export async function getPosUmsRoleUsers({ locale }: { locale: string }): Promise<PosUmsRoleUser[]> {
  const authService = PosUmsAuthService.getInstance(locale);
  const user = await authService.getValidUser();
  const normalizedLocale = locale.toLowerCase();
  const roleCodes = POS_UMS_ROLE_CODES_CONFIG[normalizedLocale as keyof typeof POS_UMS_ROLE_CODES_CONFIG];

  if (!user?.access_token) {
    throw new Error('POS UMS user is not available.');
  }

  if (!roleCodes?.length) {
    throw new Error(`POS UMS role codes are not configured for market: ${locale}`);
  }

  const searchParams = new URLSearchParams({
    application_code: POS_UMS_ROLE_USERS_APPLICATION_CODE,
  });

  roleCodes.forEach((roleCode) => {
    searchParams.append('role_codes[]', roleCode);
  });

  const response = await fetch(
    `${authService.getConfigSnapshot().apiBaseUrl}/api/v1/application/role/users?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    }
  );

  const result = (await response.json().catch(() => null)) as PosUmsRoleUsersResponse | null;

  if (!response.ok) {
    throw new Error(`Failed to get POS UMS role users: ${response.status}`);
  }

  if (result?.code !== 0) {
    throw new Error(result?.msg || 'Failed to get POS UMS role users.');
  }

  return normalizePosUmsRoleUsers(result);
}
