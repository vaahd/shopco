import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export function StarRating({ rating, reviewCount, size = 16 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={size} className="fill-rating text-rating" />;
          }
          if (i === fullStars && hasHalf) {
            return <StarHalf key={i} size={size} className="fill-rating text-rating" />;
          }
          return <Star key={i} size={size} className="text-border" />;
        })}
      </div>
      <span className="text-sm text-foreground font-medium">{rating}/5</span>
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
}
