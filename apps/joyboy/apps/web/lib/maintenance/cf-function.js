import cf from 'cloudfront';

// Get region from uri
function getRegion(uri) {
  const regionString = uri.split('/')[1];
  return regionString ? regionString.toLowerCase() : '';
}

// CloudFront Function to check maintenance mode and redirect
// This function runs at the Viewer Request stage
// Lambda updates KeyValueStore every 60 seconds, CF Function only reads
async function handler(event) {
  const request = event.request;
  const kvs = cf.kvs();
  const uri = request.uri;
  const region = getRegion(uri);

  // Skip maintenance check for maintenance page itself
  if (uri.includes('/maintenance')) {
    return request;
  }

  // Read maintenance status from KeyValueStore
  // Lambda updates this value every 60 seconds
  try {
    let isInMaintenanceMode = false;
    if (region) {
      const kvValue = await kvs.get(`${region}_maintenance`);
      isInMaintenanceMode = kvValue === 'true';
    }

    // If maintenance mode is enabled, redirect to maintenance page
    if (isInMaintenanceMode) {
      // Preserve the region in the redirect URL
      const maintenanceUrl = region ? `/${region}/maintenance` : 'us/maintenance';

      return {
        statusCode: 302,
        statusDescription: 'Found',
        headers: {
          location: { value: maintenanceUrl },
        },
      };
    }
  } catch (err) {
    // If KeyValueStore read fails, log error but allow request to proceed
    console.log('Error reading from KeyValueStore: ' + err.message);
  }

  // Maintenance mode is off or not set, proceed with normal request
  return request;
}
