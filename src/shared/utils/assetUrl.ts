/**
 * Resolves build-time asset URLs with HTTPS host allowlisting.
 * Relative paths (self-hosted) are permitted; unknown external hosts fall back.
 */
export function resolveHttpsAssetUrl(
  candidate: string | undefined,
  fallback: string,
  allowedHosts: readonly string[],
): string {
  const value = candidate?.trim();
  if (!value) {
    return fallback;
  }

  if (value.startsWith('/') && !value.startsWith('//')) {
    return value.replace(/\/$/, '');
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return fallback;
  }

  if (parsed.protocol !== 'https:') {
    return fallback;
  }

  const hostAllowed = allowedHosts.some(
    (allowed) => parsed.hostname === allowed || parsed.hostname.endsWith(`.${allowed}`),
  );

  if (!hostAllowed) {
    return fallback;
  }

  return value.replace(/\/$/, '');
}
