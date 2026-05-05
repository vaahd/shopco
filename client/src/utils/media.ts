const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';
const MEDIA_BASE = API_BASE.replace('/api/', '/');

export const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Remove /media if it's already in the base
  return `${MEDIA_BASE.replace(/\/$/, '')}${normalizedPath}`;
};
