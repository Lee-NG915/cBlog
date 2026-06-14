'use client';
import { Box, Card, Stack, useBreakpoints, Typography, Button, Drawer } from '@castlery/fortress';
import { BundleOption, Variant, toPrice } from '@castlery/modules-product-domain';
// import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { BundleVariantSelector } from '../variant-selector/variant-selector';
import { FortressImage } from '@castlery/shared-components';

export interface BundleOptionsProps {
  bundle_option: BundleOption;
  onBundleOptionChange: (bundleOption: { bundle_option_id: string; bundle_option_variant_id: number }) => void;
  defaultVariant: Variant;
}

export const BundleOptions = ({
  bundle_option,
  onBundleOptionChange = () => undefined,
  defaultVariant,
}: BundleOptionsProps) => {
  const [currentVariant, setCurrentVariant] = React.useState(defaultVariant);
  const [modalVariant, setModalVariant] = React.useState(currentVariant);
  const [open, setOpen] = React.useState<boolean>(false);
  const { desktop } = useBreakpoints();
  const [canConfirm, setCanConfirm] = React.useState<boolean>(true);
  const [optionUrl, setOptionUrl] = React.useState<string>('');
  const router = useRouter();
  const closeModel = () => {
    // setModalVariant(currentVariant);
    setOpen(false);
  };
  const openModel = () => {
    setModalVariant(currentVariant);
    setOpen(true);
  };
  const { mobile } = useBreakpoints();
  return (
    <>
      <Card
        key={bundle_option.position}
        onClick={openModel}
        orientation="horizontal"
        sx={{ gap: 2, minWidth: 300, my: 1, cursor: 'pointer' }}
      >
        {/* <AspectRatio
          sx={{
            flexBasis: 200,
            mx: 1,
            mr: 2,
            maxWidth: !desktop ? '120px' : '200px',
          }}
        >
          <Image
            layout="fill"
            src={currentVariant?.images[0]?.links.large}
            alt={currentVariant?.name}
            objectFit="cover"
          />
        </AspectRatio> */}
        <FortressImage
          sx={{
            flexBasis: 200,
            mx: 1,
            mr: 2,
            maxWidth: !desktop ? '120px' : '200px',
          }}
          src={currentVariant?.images[0]?.links.large}
          alt={currentVariant?.name}
          objectFit="cover"
          ratio={1.5}
        />
        <Stack direction={'column'} justifyContent={'center'}>
          <Stack direction={'column'} justifyContent={'space-between'} gap={1}>
            <Typography level="subh2" gap={3}>
              {bundle_option.default_quantity > 1
                ? `${bundle_option.default_quantity} x ${currentVariant.name}`
                : `${currentVariant.name}`}
            </Typography>
            <Stack>
              {currentVariant.variant_option_values.map(({ name, presentation }) => {
                return (
                  <Typography level="caption1" key={presentation}>
                    {presentation}
                  </Typography>
                );
              })}
            </Stack>
            <Typography>{`Select >`}</Typography>
          </Stack>
        </Stack>
      </Card>
      <Drawer
        // anchor={mobile ? 'bottom' : 'right'}
        title={bundle_option.name}
        showCloseButton
        open={open}
        // size={mobile ? 'lg' : 'md'}
        onClose={() => closeModel()}
        // sx={
        //   bundle_option.option_types.length === 1 && mobile
        //     ? { '--Drawer-verticalSize': 'clamp(500px, 80%, 100%)' }
        //     : {}
        // }
      >
        {/* 确保每次 modal 都是用最新的 这是为了处理  BundleVariantSelector 里的 defaultVariant 问题*/}
        {/* <ModalClose /> */}
        {/* <DialogTitle
          sx={{
            color: 'transparent',
          }}
        >
          {bundle_option.name}
        </DialogTitle> */}
        {/* <DialogContent key={Math.random()}> */}
        <Box
          sx={{
            maxHeight: !mobile ? 350 : 300,
            marginBottom: 5,
          }}
        >
          <FortressImage src={modalVariant?.images[0].links.large} ratio={1.5} alt={modalVariant.name} />
        </Box>
        <Typography
          level="subh1"
          sx={{
            color: '#9a5f3e',
          }}
        >
          {modalVariant.name}
        </Typography>
        <Typography>{toPrice(modalVariant.price)}</Typography>
        <BundleVariantSelector
          bundle_option={bundle_option}
          defaultVariant={modalVariant}
          onVariantChange={(variant) => {
            setModalVariant(variant);
          }}
          onRouteChange={(url) => {
            setOptionUrl(url);
          }}
          onCanClickConfirm={setCanConfirm}
        />
        {/* </DialogContent> */}
        <Button
          loading={!canConfirm}
          onClick={() => {
            setCurrentVariant(modalVariant);
            onBundleOptionChange({
              bundle_option_id: bundle_option.id + '',
              bundle_option_variant_id: modalVariant.id,
            });

            closeModel();
            router.replace(optionUrl, { scroll: false });
          }}
        >
          Confirm
        </Button>
      </Drawer>
    </>
  );
};
