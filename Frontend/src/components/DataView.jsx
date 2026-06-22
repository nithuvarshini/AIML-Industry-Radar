/**
 * Wrapper that handles the common loading/error/fallback lifecycle for page sections.
 * Renders skeletons while loading, an error/fallback banner on failure, and the page
 * children once normalized data is available.
 */
import { SkeletonList, SkeletonGrid } from './Skeleton';
import FallbackNotice from './FallbackNotice';

export default function DataView({
  status,
  isFallback,
  error,
  onRetry,
  skeleton = 'list',
  skeletonCount,
  children,
}) {
  if (status === 'loading' || status === 'idle') {
    return skeleton === 'grid'
      ? <SkeletonGrid count={skeletonCount || 6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
      : <SkeletonList count={skeletonCount || 4} />;
  }
  return (
    <div className="animate-fade-in">
      {isFallback && <FallbackNotice message={error} />}
      {children}
    </div>
  );
}
