// setupTests.ts
import { config as loadDotenv } from 'dotenv';
import path from 'path';
import fetchMock from 'jest-fetch-mock';
// import { Ecenv } from '@castlery/config';
loadDotenv({ path: path.resolve(__dirname, './.env') });
loadDotenv({ path: path.resolve(__dirname, './.env.development.sg') });
jest.mock('next/navigation', () => require('../../__mocks__/router'));
fetchMock.enableMocks();
// Ecenv.loadEnv();
