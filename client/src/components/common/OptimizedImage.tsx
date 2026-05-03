import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  fallback, 
  ...props 
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className={cn("relative overflow-hidden bg-secondary/50", className)}>
      {error ? (
        <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
          <ImageIcon size={40} className="opacity-20" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            loading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
          {...props}
        />
      )}
      {loading && !error && (
        <div className="absolute inset-0 animate-pulse bg-secondary" />
      )}
    </div>
  );
}
