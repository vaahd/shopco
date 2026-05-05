const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';
const MEDIA_BASE = API_BASE.replace('/api/', '/');

export const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const mediaPath = cleanPath.startsWith('media/') ? cleanPath : `media/${cleanPath}`;
  
  return `${MEDIA_BASE.replace(/\/$/, '')}/${mediaPath}`;
};

