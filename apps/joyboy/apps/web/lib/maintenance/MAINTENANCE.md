# Maintenance Mode Documentation

## Overview

This maintenance mode system allows you to temporarily redirect all traffic for specific regions to a maintenance page. The system is implemented using AWS CloudFront Functions with a KeyValueStore backend.

## Architecture

The maintenance mode system consists of 2 components:

1. **CloudFront Function** - Runs at the Viewer Request stage to check maintenance status and redirect users
2. **KeyValueStore** - Stores maintenance status flags per region (e.g., `us_maintenance`, `sg_maintenance`). When you want to enable maintenance mode for a specific region, manually update the maintenance status in KeyValueStore. For example: `us_maintenance:true` will enable maintenance mode for the US market.

### Data Flow

```
User Request → CloudFront Function → Check KeyValueStore → Redirect (if maintenance) or Continue
                                            ↑
                                Manual update KeyValueStore maintenance status
```

## How It Works

### CloudFront Function Behavior

1. **Extracts Region**: The function parses the region from the URI (e.g., `/us/...` → `us`)
2. **Reads Maintenance Status**: Queries KeyValueStore for `{region}_maintenance` key
3. **Redirects if Enabled**: If value is `'true'`, redirects to `/{region}/maintenance`
4. **Bypasses Maintenance Page**: Requests to `/{region}/maintenance` are never redirected to prevent loops
5. **Fail-Safe**: If KeyValueStore read fails, the request proceeds normally (fail-open design)

### Region-Specific Configuration

The system supports region-specific maintenance modes for the following regions:

- `us_maintenance` - Controls maintenance for US region
- `sg_maintenance` - Controls maintenance for Singapore region
- `au_maintenance` - Controls maintenance for Australia region
- `ca_maintenance` - Controls maintenance for Canada region
- `uk_maintenance` - Controls maintenance for UK region

Each region can be independently enabled or disabled.

## Configuration

### CloudFront Function Information

#### Test Environment CloudFront Function

**Name:** `Web-Maintenance-Checker-Test`

**ARN:** `arn:aws:cloudfront::8253xxxxx615:function/Web-Maintenance-Checker-Test`

**Description:** Used to query the maintenance status and decide whether to redirect to the maintenance page

**Environment:** Available in test environment

#### Production Environment CloudFront Function

**Name:** `Web-Maintenance-Checker`

**ARN:** `arn:aws:cloudfront::8253xxxxx615:function/Web-Maintenance-Checker`

**Description:** Used to query the maintenance status and decide whether to redirect to the maintenance page

**Environment:** Available in production environment

### KeyValueStore Information

#### Test Environment KeyValueStore

**Name:** `Web-Maintenance-Configuration-Test`

**ID:** `5fc226e5-d15d-47ca-8c01-3b525247110f`

**ARN:** `arn:aws:cloudfront::8253xxxxx615:key-value-store/5fc226e5-d15d-47ca-8c01-3b525247110f`

**Description:** Store the maintenance mode configuration of the web site, which is only used for the frontend.

**Environment:** Available in test environment

#### Production Environment KeyValueStore

**Name:** `Web-Maintenance-Configuration`

**ID:** `e1d2f382-99db-4515-954d-152a50958900`

**ARN:** `arn:aws:cloudfront::8253xxxxx615:key-value-store/e1d2f382-99db-4515-954d-152a50958900`

**Description:** Store the maintenance mode configuration of the web site, which is only used for the frontend.

**Environment:** Available in production environment

### KeyValueStore Keys

Each region has its own maintenance flag in the KeyValueStore:

| Key              | Value                 | Description                         |
| ---------------- | --------------------- | ----------------------------------- |
| `us_maintenance` | `'true'` or `'false'` | US region maintenance status        |
| `sg_maintenance` | `'true'` or `'false'` | Singapore region maintenance status |
| `au_maintenance` | `'true'` or `'false'` | Australia region maintenance status |
| `ca_maintenance` | `'true'` or `'false'` | Canada region maintenance status    |
| `uk_maintenance` | `'true'` or `'false'` | UK region maintenance status        |

**Current Status:** All regions are currently set to `false` (maintenance mode disabled)

## CloudFront Distribution Associations

### `Web-Maintenance-Checker-Test` Function Associated Distribution

**Distribution ID:** E2AUJ5TJDWERYE

**Description:** New web test cloudfront

**Cache Behaviors:**

- `/sg/checkout*`
- `/sg/cart*`
- `/sg*`
- `/us/checkout*`
- `/us/cart*`
- `/us*`
- `/au/checkout*`
- `/au/cart*`
- `/au*`
- `/ca/checkout*`
- `/ca/cart*`
- `/ca*`
- `/uk/checkout*`
- `/uk/cart*`
- `/uk*`

**Event Type:** Viewer Request

### `Web-Maintenance-Checker` Function Associated Distribution

**Distribution ID:** To be provided by Ops team

**Description:** To be provided

**Cache Behaviors:**

- To be provided

**Event Type:** Viewer Request

### Quick Reference Commands

#### Test Environment

```bash
# Check current status
aws cloudfront describe-key-value-store --id 5fc226e5-d15d-47ca-8c01-3b525247110f

# Enable maintenance for US region
aws cloudfront update-key-value-store \
  --id 5fc226e5-d15d-47ca-8c01-3b525247110f \
  --put Key=us_maintenance,Value=true

# Disable maintenance for US region
aws cloudfront update-key-value-store \
  --id 5fc226e5-d15d-47ca-8c01-3b525247110f \
  --put Key=us_maintenance,Value=false
```

#### Production Environment

```bash
# Check current status
aws cloudfront describe-key-value-store --id e1d2f382-99db-4515-954d-152a50958900

# Enable maintenance for US region
aws cloudfront update-key-value-store \
  --id e1d2f382-99db-4515-954d-152a50958900 \
  --put Key=us_maintenance,Value=true

# Disable maintenance for US region
aws cloudfront update-key-value-store \
  --id e1d2f382-99db-4515-954d-152a50958900 \
  --put Key=us_maintenance,Value=false
```

## Usage

### Enable Maintenance Mode for a Region

**Option 1: Using AWS Console**

1. Navigate to CloudFront → Key value stores
2. Select your maintenance KeyValueStore (test or production)
3. Add/Update key: `{region}_maintenance` with value: `true`

**Option 2: Using AWS CLI**

For test environment:

```bash
aws cloudfront update-key-value-store \
  --id 5fc226e5-d15d-47ca-8c01-3b525247110f \
  --put Key=us_maintenance,Value=true
```

For production environment:

```bash
aws cloudfront update-key-value-store \
  --id e1d2f382-99db-4515-954d-152a50958900 \
  --put Key=us_maintenance,Value=true
```

### Disable Maintenance Mode

Update the region's key to `false`:

For test environment:

```bash
aws cloudfront update-key-value-store \
  --id 5fc226e5-d15d-47ca-8c01-3b525247110f \
  --put Key=us_maintenance,Value=false
```

For production environment:

```bash
aws cloudfront update-key-value-store \
  --id e1d2f382-99db-4515-954d-152a50958900 \
  --put Key=us_maintenance,Value=false
```

### Check Current Status

For test environment:

```bash
aws cloudfront describe-key-value-store \
  --id 5fc226e5-d15d-47ca-8c01-3b525247110f

# Or query specific key
aws cloudfront get-key \
  --kvs-arn arn:aws:cloudfront::8253xxxxx615:key-value-store/5fc226e5-d15d-47ca-8c01-3b525247110f \
  --key us_maintenance
```

For production environment:

```bash
aws cloudfront describe-key-value-store \
  --id e1d2f382-99db-4515-954d-152a50958900

# Or query specific key
aws cloudfront get-key \
  --kvs-arn arn:aws:cloudfront::8253xxxxx615:key-value-store/e1d2f382-99db-4515-954d-152a50958900 \
  --key us_maintenance
```

### Batch Operations

**Enable maintenance for all regions (Test Environment):**

```bash
KVS_ID="5fc226e5-d15d-47ca-8c01-3b525247110f"

for region in us sg au ca uk; do
  echo "Enabling maintenance for ${region}..."
  aws cloudfront update-key-value-store \
    --id $KVS_ID \
    --put Key=${region}_maintenance,Value=true
done
```

**Enable maintenance for all regions (Production Environment):**

```bash
KVS_ID="e1d2f382-99db-4515-954d-152a50958900"

for region in us sg au ca uk; do
  echo "Enabling maintenance for ${region}..."
  aws cloudfront update-key-value-store \
    --id $KVS_ID \
    --put Key=${region}_maintenance,Value=true
done
```

**Disable maintenance for all regions (Test Environment):**

```bash
KVS_ID="5fc226e5-d15d-47ca-8c01-3b525247110f"

for region in us sg au ca uk; do
  echo "Disabling maintenance for ${region}..."
  aws cloudfront update-key-value-store \
    --id $KVS_ID \
    --put Key=${region}_maintenance,Value=false
done
```

**Disable maintenance for all regions (Production Environment):**

```bash
KVS_ID="e1d2f382-99db-4515-954d-152a50958900"

for region in us sg au ca uk; do
  echo "Disabling maintenance for ${region}..."
  aws cloudfront update-key-value-store \
    --id $KVS_ID \
    --put Key=${region}_maintenance,Value=false
done
```

## Testing

### Local Testing

You cannot test CloudFront Functions locally, but you can use the CloudFront console's test feature:

1. Go to CloudFront → Functions
2. Select your function (`Web-Maintenance-Checker-Test` for test or `Web-Maintenance-Checker` for production)
3. Click "Test" tab
4. Use test events like:

```json
{
  "version": "1.0",
  "context": {
    "eventType": "viewer-request"
  },
  "viewer": {
    "ip": "198.51.100.11"
  },
  "request": {
    "method": "GET",
    "uri": "/us/products",
    "querystring": {},
    "headers": {},
    "cookies": {}
  }
}
```

### Production Testing

1. **Enable for Test Region**: Start with a low-traffic region
2. **Verify Redirect**: Access `https://yourdomain.com/{region}/` and verify redirect to `/{region}/maintenance`
3. **Verify Bypass**: Access `https://yourdomain.com/{region}/maintenance` directly (should not redirect)
4. **Monitor Logs**: Check CloudFront logs for any errors
5. **Disable**: Set the flag back to `false`

## Important Considerations

### Propagation Delay

- **KeyValueStore Updates**: Changes to KeyValueStore propagate to CloudFront edge locations within seconds

### Performance

- **CloudFront Functions**: Execute in <1ms at CloudFront edge locations
- **No Origin Impact**: Function runs before origin requests, so maintenance mode doesn't affect origin servers
- **High Availability**: CloudFront Functions are distributed globally for low latency

### Limitations

- **KeyValueStore Size**: Each key-value pair can be up to 1KB
- **Read Limits**: CloudFront Functions have quotas on KeyValueStore reads (check AWS documentation for current limits)
- **Fail-Open Design**: If KeyValueStore read fails, traffic proceeds normally (not redirected)

## Maintenance Page Requirements

You must create a maintenance page accessible at `/{region}/maintenance` for each region. This page should:

1. **Be Static**: Avoid dependencies on backend services
2. **Be Cacheable**: Set appropriate cache headers
3. **Inform Users**: Display clear maintenance information
4. **Provide Updates**: Optionally link to status page or social media
5. **Not Include Redirects**: Avoid redirecting from the maintenance page itself

Example Next.js maintenance page:

```typescript
// app/[region]/maintenance/page.tsx
export default function MaintenancePage() {
  return (
    <div>
      <h1>We'll be back soon!</h1>
      <p>We're performing scheduled maintenance. Please check back shortly.</p>
    </div>
  );
}
```

## Troubleshooting

### Users Not Being Redirected

1. **Check KeyValueStore Value**: Verify the key exists and value is exactly `'true'` (string)
2. **Wait for Propagation**: Allow up to 60 seconds after update
3. **Clear CloudFront Cache**: Invalidate CloudFront distribution cache
4. **Check Function Association**: Verify function is associated at viewer-request stage
5. **Review CloudWatch Logs**: Check for function errors

### Redirect Loop

- **Cause**: Maintenance page itself is being redirected
- **Solution**: The function includes a check for `/maintenance` in the URI. Verify this logic hasn't been modified
- **Verify**: Access `/{region}/maintenance` path directly - it should load without redirect

### All Regions Affected

- **Check Keys**: Verify you're setting the correct region-specific keys (e.g., `us_maintenance` not `maintenance`)
- **Verify Logic**: Review the `getRegion()` function to ensure correct region extraction

### Function Errors

- **Check Syntax**: CloudFront Functions use a restricted JavaScript runtime
- **Async Support**: Ensure you're using proper async/await syntax
- **Console Logs**: CloudFront Functions support console.log() for debugging

## Monitoring

### Recommended CloudWatch Alarms

1. **Function Execution Errors**: Alert on CloudFront Function errors
2. **Redirect Rate**: Monitor 302 status codes to detect maintenance mode activation
3. **KeyValueStore Throttling**: Alert on KVS read throttles

### Metrics to Track

- Function execution time
- Number of redirects to maintenance page
- KeyValueStore read latency
- Failed KeyValueStore reads

## Best Practices

1. **Test First**: Always test in test environment before enabling in production
2. **Start Small**: Enable maintenance for one region at a time
3. **Communicate**: Notify users in advance when possible
4. **Monitor**: Watch CloudWatch metrics during maintenance windows
5. **Document**: Keep runbooks for enabling/disabling maintenance mode
6. **Time Windows**: Schedule maintenance during low-traffic periods
7. **Rollback Plan**: Have a quick way to disable maintenance mode
8. **Status Page**: Maintain an external status page independent of your main site

## Security Considerations

- **IAM Permissions**: Limit access to KeyValueStore and CloudFront Function updates
- **Audit Trail**: Enable CloudTrail logging for all maintenance mode changes
- **Read-Only Function**: CloudFront Function only reads from KeyValueStore, never writes
- **Fail-Safe**: Function fails open (allows traffic) rather than closed on errors
- **Environment Separation**: Test and production use separate KeyValueStores for isolation

## Related Resources

- [AWS CloudFront Functions Documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html)
- [CloudFront KeyValueStore Documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/kvs-with-functions.html)
- [CloudFront Functions Limits](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html#limits-functions)

## Support

For issues or questions about the maintenance mode system, contact the DevOps team or create a ticket in your issue tracking system.
