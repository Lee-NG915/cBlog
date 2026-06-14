'use client';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button, IconButton } from '@castlery/fortress';
import { ArrowLeft } from '@castlery/fortress/Icons';

export const BackBtn = ({
  icon = false,
  afterClick,
}: {
  icon?: boolean;
  afterClick?: (params: {
    router: ReturnType<typeof useRouter>;
    pathname: ReturnType<typeof usePathname>;
    searchparams: ReturnType<typeof useSearchParams>;
    params: ReturnType<typeof useParams>;
  }) => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchparams = useSearchParams();
  const params = useParams();
  const handleClick = () => {
    if (afterClick) {
      afterClick({ router, pathname, searchparams, params });
    } else {
      router.back();
    }
  };
  return icon ? (
    <IconButton onClick={handleClick}>
      <ArrowLeft />
    </IconButton>
  ) : (
    <Button variant="tertiary" startDecorator={<ArrowLeft />} onClick={handleClick}>
      Back
    </Button>
  );
};
