import { basePageConfig, enableO2O, EcEnv } from '@castlery/config';
import { WebResetPassword } from '@castlery/modules-user-components';
import { redirect } from 'next/navigation';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

dayjs.extend(utc);
dayjs.extend(tz);

interface ResetPasswordPageProps {
  params: {
    locale: string;
    region: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ResetPasswordPage(props: ResetPasswordPageProps) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.ACCOUNT, domain: BUSINESS_DOMAIN.USER });
  const { searchParams, params } = props;
  const { region } = params;
  const fromEmail = searchParams?.from_email as string;
  const email = searchParams?.email as string;
  const expire = searchParams?.expire as string;
  const redirectPageName = searchParams?.redirect_page_name as string;
  const secret = searchParams?.secret as string;
  const isFromPosEmail = enableO2O && fromEmail === 'true' && expire;

  if (isFromPosEmail) {
    const timezone = EcEnv.NEXT_PUBLIC_TIME_ZONE;
    const nowDate = dayjs().tz(timezone);
    const currentTimestamp = nowDate.unix();
    const isValid = currentTimestamp < Number(expire);
    if (!isValid) {
      const newSearchParams = new URLSearchParams();
      // Object.entries(searchParams).forEach(([key, value]) => {
      //   if (value !== undefined) {
      //     if (Array.isArray(value)) {
      //       value.forEach((v) => newSearchParams.append(key, v));
      //     } else {
      //       newSearchParams.set(key, value);
      //     }
      //   }
      // });

      if (email) {
        newSearchParams.set('email', email);
      }
      if (fromEmail) {
        newSearchParams.set('from_email', fromEmail);
      }

      const queryString = newSearchParams.toString();
      const redirectUrl = `/${region}${basePageConfig['forgot-password']}${queryString ? `?${queryString}` : ''}`;

      redirect(redirectUrl);
    }
  }

  return <WebResetPassword fromEmail={fromEmail} redirectPageName={redirectPageName} secret={secret} />;
}
