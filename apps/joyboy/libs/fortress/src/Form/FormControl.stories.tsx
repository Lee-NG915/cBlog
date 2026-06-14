/* eslint-disable @nx/enforce-module-boundaries */
import type { Meta, StoryObj } from '@storybook/react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Stack,
  Button,
  Typography,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Radio,
  RadioGroup,
  Switch,
  Checkbox,
  Dropdown,
  DropdownOption,
} from '..';

const meta: Meta<typeof FormControl> = {
  title: 'Components/Form',
  component: FormControl,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Form data interface
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  gender: string;
  notifications: boolean;
  terms: boolean;
  country: string;
}

// Basic form component
const BasicForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: '',
      gender: '',
      notifications: true,
      terms: false,
      country: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    alert('Form submitted successfully! Please check console output.');
  };

  const handleReset = () => {
    reset();
  };

  return (
    <Box sx={{ width: 600, p: 4 }}>
      <Typography level="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Basic Form Example
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          {/* Name row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl required error={!!errors.firstName}>
              <FormLabel>First Name</FormLabel>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'Please enter your first name' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    variant="borderplain"
                    placeholder="Enter your first name"
                    error={!!errors.firstName}
                  />
                )}
              />
              {errors.firstName && <FormHelperText>{errors.firstName.message}</FormHelperText>}
            </FormControl>

            <FormControl required error={!!errors.lastName}>
              <FormLabel>Last Name</FormLabel>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Please enter your last name' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    variant="borderplain"
                    placeholder="Enter your last name"
                    error={!!errors.lastName}
                  />
                )}
              />
              {errors.lastName && <FormHelperText>{errors.lastName.message}</FormHelperText>}
            </FormControl>
          </Box>

          {/* Email */}
          <FormControl required error={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Please enter your email',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field }) => (
                <Input {...field} variant="borderplain" placeholder="Enter your email address" error={!!errors.email} />
              )}
            />
            {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
          </FormControl>

          {/* Phone */}
          <FormControl error={!!errors.phone}>
            <FormLabel>Phone</FormLabel>
            <Controller
              name="phone"
              control={control}
              rules={{
                pattern: {
                  value: /^[0-9-+\s()]*$/,
                  message: 'Please enter a valid phone number',
                },
              }}
              render={({ field }) => (
                <Input {...field} variant="borderplain" placeholder="Enter your phone number" error={!!errors.phone} />
              )}
            />
            {errors.phone && <FormHelperText>{errors.phone.message}</FormHelperText>}
          </FormControl>

          {/* Bio */}
          <FormControl error={!!errors.bio}>
            <FormLabel>Bio</FormLabel>
            <Controller
              name="bio"
              control={control}
              rules={{
                maxLength: {
                  value: 200,
                  message: 'Bio cannot exceed 200 characters',
                },
              }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  variant="outlined"
                  placeholder="Tell us about yourself..."
                  minRows={3}
                  maxRows={6}
                  error={!!errors.bio}
                />
              )}
            />
            {errors.bio && <FormHelperText>{errors.bio.message}</FormHelperText>}
          </FormControl>

          {/* Gender selection */}
          <FormControl required error={!!errors.gender}>
            <FormLabel>Gender</FormLabel>
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Please select your gender' }}
              render={({ field }) => (
                <RadioGroup value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                  <Radio value="male" label="Male" />
                  <Radio value="female" label="Female" />
                  <Radio value="other" label="Other" />
                </RadioGroup>
              )}
            />
            {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
          </FormControl>

          {/* Country selection */}
          <FormControl error={!!errors.country}>
            <FormLabel>Country/Region</FormLabel>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  placeholder="Select your country/region"
                  onChange={(_, value) => field.onChange(value)}
                >
                  <DropdownOption value="cn">China</DropdownOption>
                  <DropdownOption value="us">United States</DropdownOption>
                  <DropdownOption value="jp">Japan</DropdownOption>
                  <DropdownOption value="kr">South Korea</DropdownOption>
                  <DropdownOption value="sg">Singapore</DropdownOption>
                </Dropdown>
              )}
            />

            {errors.country && <FormHelperText>{errors.country.message}</FormHelperText>}
          </FormControl>

          {/* Switch and checkbox */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl>
              <FormLabel>Receive Notifications</FormLabel>
              <Controller
                name="notifications"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                )}
              />
            </FormControl>

            <FormControl required error={!!errors.terms}>
              <FormLabel>Agree to Terms</FormLabel>
              <Controller
                name="terms"
                control={control}
                rules={{ required: 'Please agree to the terms and conditions' }}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    label="I have read and agree to the terms and conditions"
                    variant="outlined"
                  />
                )}
              />
              {errors.terms && <FormHelperText>{errors.terms.message}</FormHelperText>}
            </FormControl>
          </Box>

          {/* Button group */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', pt: 2 }}>
            <Button variant="outlined" color="neutral" onClick={handleReset} type="button">
              Reset
            </Button>
            <Button variant="solid" color="primary" type="submit" disabled={!isValid}>
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

// Basic form Story
export const BasicFormExample: Story = {
  render: () => <BasicForm />,
  parameters: {
    docs: {
      source: {
        code: `
const BasicForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: '',
      gender: '',
      notifications: true,
      terms: false,
      country: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    alert('Form submitted successfully! Please check console output.');
  };

  const handleReset = () => {
    reset();
  };

  return (
    <Box sx={{ width: 600, p: 4 }}>
      <Typography level="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Basic Form Example
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          {/* Name row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl required error={!!errors.firstName}>
              <FormLabel>First Name</FormLabel>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'Please enter your first name' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    variant="borderplain"
                    placeholder="Enter your first name"
                    error={!!errors.firstName}
                  />
                )}
              />
              {errors.firstName && <FormHelperText>{errors.firstName.message}</FormHelperText>}
            </FormControl>

            <FormControl required error={!!errors.lastName}>
              <FormLabel>Last Name</FormLabel>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Please enter your last name' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    variant="borderplain"
                    placeholder="Enter your last name"
                    error={!!errors.lastName}
                  />
                )}
              />
              {errors.lastName && <FormHelperText>{errors.lastName.message}</FormHelperText>}
            </FormControl>
          </Box>

          {/* Email */}
          <FormControl required error={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Please enter your email',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  variant="borderplain"
                  placeholder="Enter your email address"
                  error={!!errors.email}
                />
              )}
            />
            {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
          </FormControl>

          {/* Phone */}
          <FormControl error={!!errors.phone}>
            <FormLabel>Phone</FormLabel>
            <Controller
              name="phone"
              control={control}
              rules={{
                pattern: {
                  value: /^[0-9-+\\s()]*$/,
                  message: 'Please enter a valid phone number',
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  variant="borderplain"
                  placeholder="Enter your phone number"
                  error={!!errors.phone}
                />
              )}
            />
            {errors.phone && <FormHelperText>{errors.phone.message}</FormHelperText>}
          </FormControl>

          {/* Bio */}
          <FormControl error={!!errors.bio}>
            <FormLabel>Bio</FormLabel>
            <Controller
              name="bio"
              control={control}
              rules={{
                maxLength: {
                  value: 200,
                  message: 'Bio cannot exceed 200 characters',
                },
              }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  variant="outlined"
                  placeholder="Tell us about yourself..."
                  minRows={3}
                  maxRows={6}
                  error={!!errors.bio}
                />
              )}
            />
            {errors.bio && <FormHelperText>{errors.bio.message}</FormHelperText>}
          </FormControl>

          {/* Gender selection */}
          <FormControl required error={!!errors.gender}>
            <FormLabel>Gender</FormLabel>
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Please select your gender' }}
              render={({ field }) => (
                <RadioGroup value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                  <Radio value="male" label="Male" />
                  <Radio value="female" label="Female" />
                  <Radio value="other" label="Other" />
                </RadioGroup>
              )}
            />
            {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
          </FormControl>

          {/* Country selection */}
          <FormControl error={!!errors.country}>
            <FormLabel>Country/Region</FormLabel>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  placeholder="Select your country/region"
                  onChange={(_, value) => field.onChange(value)}
                >
                  <DropdownOption value="cn">China</DropdownOption>
                  <DropdownOption value="us">United States</DropdownOption>
                  <DropdownOption value="jp">Japan</DropdownOption>
                  <DropdownOption value="kr">South Korea</DropdownOption>
                  <DropdownOption value="sg">Singapore</DropdownOption>
                </Dropdown>
              )}
            />
            {errors.country && <FormHelperText>{errors.country.message}</FormHelperText>}
          </FormControl>

          {/* Switch and checkbox */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl>
              <FormLabel>Receive Notifications</FormLabel>
              <Controller
                name="notifications"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                )}
              />
            </FormControl>

            <FormControl required error={!!errors.terms}>
              <FormLabel>Agree to Terms</FormLabel>
              <Controller
                name="terms"
                control={control}
                rules={{ required: 'Please agree to the terms and conditions' }}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    label="I have read and agree to the terms and conditions"
                    variant="outlined"
                  />
                )}
              />
              {errors.terms && <FormHelperText>{errors.terms.message}</FormHelperText>}
            </FormControl>
          </Box>

          {/* Button group */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', pt: 2 }}>
            <Button variant="outlined" color="neutral" onClick={handleReset} type="button">
              Reset
            </Button>
            <Button variant="solid" color="primary" type="submit" disabled={!isValid}>
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};`,
        language: 'tsx',
      },
    },
  },
};

// Simple form example
const SimpleForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: 'test@test.com',
      message: '',
    },
  });

  const onSubmit = (data: any) => {
    console.log('Simple form submitted:', data);
    alert('Simple form submitted successfully!');
  };

  return (
    <Box sx={{ width: 400, p: 3 }}>
      <Typography level="h5" sx={{ mb: 3 }}>
        Simple Form
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <FormControl error={!!errors.name}>
            <FormLabel>Name</FormLabel>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Please enter your name' }}
              render={({ field }) => (
                <Input {...field} variant="borderplain" placeholder="Enter your name" error={!!errors.name} />
              )}
            />
            {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
          </FormControl>

          <FormControl error={!!errors.email} disabled>
            <FormLabel>Email</FormLabel>
            <Controller
              name="email"
              control={control}
              rules={{ required: 'Please enter your email' }}
              render={({ field }) => (
                <Input {...field} variant="borderplain" placeholder="Enter your email" error={!!errors.email} />
              )}
            />
            {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
          </FormControl>

          <FormControl error={!!errors.message}>
            <FormLabel>Message</FormLabel>
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  variant="outlined"
                  placeholder="Enter your message"
                  minRows={3}
                  error={!!errors.message}
                />
              )}
            />
            {errors.message && <FormHelperText>{errors.message.message}</FormHelperText>}
          </FormControl>

          <Button variant="solid" color="primary" type="submit">
            Submit
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export const SimpleFormExample: Story = {
  render: () => <SimpleForm />,
  parameters: {
    docs: {
      source: {
        code: `
const SimpleForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = (data: any) => {
    console.log('Simple form submitted:', data);
    alert('Simple form submitted successfully!');
  };

  return (
    <Box sx={{ width: 400, p: 3 }}>
      <Typography level="h5" sx={{ mb: 3 }}>
        Simple Form
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <FormControl error={!!errors.name}>
            <FormLabel>Name</FormLabel>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Please enter your name' }}
              render={({ field }) => (
                <Input
                  {...field}
                  variant="borderplain"
                  placeholder="Enter your name"
                  error={!!errors.name}
                />
              )}
            />
            {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
          </FormControl>

          <FormControl error={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Controller
              name="email"
              control={control}
              rules={{ required: 'Please enter your email' }}
              render={({ field }) => (
                <Input
                  {...field}
                  variant="borderplain"
                  placeholder="Enter your email"
                  error={!!errors.email}
                />
              )}
            />
            {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
          </FormControl>

          <FormControl error={!!errors.message}>
            <FormLabel>Message</FormLabel>
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  variant="outlined"
                  placeholder="Enter your message"
                  minRows={3}
                  error={!!errors.message}
                />
              )}
            />
            {errors.message && <FormHelperText>{errors.message.message}</FormHelperText>}
          </FormControl>

          <Button variant="solid" color="primary" type="submit">
            Submit
          </Button>
        </Stack>
      </form>
    </Box>
  );
};`,
        language: 'tsx',
      },
    },
  },
};
