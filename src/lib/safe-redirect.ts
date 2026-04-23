export function isSafeRedirectPath(path: string | null | undefined): boolean {
  if (!path) return false;
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (path.includes('\\')) return false;
  return path === '/app' || path.startsWith('/app/') || path === '/admin' || path.startsWith('/admin/');
}
