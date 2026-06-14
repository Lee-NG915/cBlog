import { Avatar, Divider } from '@mui/joy';
import { RouterLink } from 'components/RouterLink';
import {
  Box,
  Button,
  Link,
  List,
  ListDivider,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  ListSubheader,
  Sheet,
  Stack,
  SvgIcon,
  Typography,
} from '@castlery/fortress';
import { ArrowForwardIos } from '@castlery/fortress/Icons';
import React from 'react';

const isMobile = true;

export const ItemUI = ({ label = 'Mon - Fri', value = '9:00am - 5:00pm' }) => (
  <ListItem
    sx={{
      display: 'block',
      alignItems: 'center',
      textAlign: 'center',
    }}
  >
    <Typography level="subh2">{label}</Typography>
    <Typography level="body2">{value}</Typography>
  </ListItem>
);
export const ContactItemUI = () => (
  <List
    sx={{
      alignItems: 'center',
    }}
  >
    <ListItem>
      <ListItemContent>
        <Avatar
          src="https://www.figma.com/file/Jbl0kaMNNnzOxBvbtfcGMV/%5BASH%5D-2023-Q2-Quick-Wins?type=design&node-id=927-3242&mode=dev"
          sx={(theme) => ({
            width: '70px',
            height: '70px',
          })}
        />
      </ListItemContent>
    </ListItem>
    <ListItem>
      <RouterLink level="subh2">Visit Us</RouterLink>
    </ListItem>
    <ItemUI />
    <ItemUI />
    <ItemUI />
    <Typography
      level="body2"
      sx={{
        color: (theme) => theme.palette.brand.charcoal[500],
      }}
    >
      <Typography level="subh2">Note: </Typography>
      Some public holidays may have special hours. Check our Google listing for the latest info.
    </Typography>
  </List>
);

export const ContactUI = () => (
  <Box alignItems="center" justifyContent="center">
    <Typography level="h2" textAlign="center">
      We Are Ready To Help
    </Typography>
    <Typography
      level={isMobile ? 'body2' : 'body1'}
      textAlign="center"
      sx={{
        color: (theme) => theme.palette.brand.charcoal[600],
      }}
    >
      Got questions about our products or need help with your order? We’re here for you.
    </Typography>
    <Stack
      my="8"
      direction={{ xs: 'column', sm: 'row' }}
      divider={<Divider orientation="vertical" />}
      spacing={2}
      justifyContent="center"
    >
      <ContactItemUI />
      <ContactItemUI />
      <ContactItemUI />
    </Stack>
  </Box>
);
