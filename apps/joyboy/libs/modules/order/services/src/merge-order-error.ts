const TRANSIENT_NETWORK_ERROR_PATTERN =
  /failed to fetch|network request failed|load failed|networkerror|timeout|aborted/i;

function collectErrorMessages(error: any): string {
  return [
    error?.error,
    error?.message,
    error?.name,
    error?.data?.error,
    error?.data?.message,
    error?.data?.errors?.[0]?.detail,
  ]
    .filter((value) => typeof value === 'string')
    .join(' ');
}

export function isTransientMergeOrderFailure(error: any): boolean {
  if (!error) {
    return false;
  }

  if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR' || error.status === 'PARSING_ERROR') {
    return true;
  }

  return TRANSIENT_NETWORK_ERROR_PATTERN.test(collectErrorMessages(error));
}
