import { NextRequest } from 'next/server';
import { createApiItemResponse, createApiErrorResponse } from '../utils';
import { logger } from '@castlery/observability/server';

// Route Segment Config - Next.js caching configuration
export const dynamic = 'force-dynamic'; // Health check should always be fresh

/**
 * GET /api/health-check
 * Health check endpoint in Microsoft API Guidelines format
 *
 * @description Simple health check to verify service availability
 * @returns {ApiSuccessResponse<HealthStatus>} Service health status
 */
export async function GET(request: NextRequest) {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'joyboy-web',
      version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
      uptime: process.uptime(),
    };

    return createApiItemResponse(healthStatus);
  } catch (error) {
    logger.error('Health check failed', { error });

    return createApiErrorResponse('HealthCheckFailed', 'Service health check failed', {
      innerError: error,
      status: 503, // Service Unavailable
    });
  }
}
