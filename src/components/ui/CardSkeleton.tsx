import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface CardSkeletonProps {
  title?: string;
  description?: string;
  lines?: number;
  showFooter?: boolean;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  title,
  description,
  lines = 3,
  showFooter = false,
}) => {
  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          )}
          {description && (
            <Skeleton className="h-4 w-72 mt-2" />
          )}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        {showFooter && (
          <div className="flex justify-end mt-4 space-x-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardSkeleton;
