import { EmptyStateIllustration } from "./empty-state-illustration"

interface SearchEmptyStateProps {
  searchQuery: string
  onClearSearch: () => void
}

export function SearchEmptyState({ searchQuery, onClearSearch }: SearchEmptyStateProps) {
  return (
    <EmptyStateIllustration
      type="no-search-results"
      title={`No results for "${searchQuery}"`}
      description="We couldn't find any events matching your search. Try different keywords or browse our categories to discover amazing events."
      actionText="Clear Search"
      onAction={onClearSearch}
    />
  )
}
