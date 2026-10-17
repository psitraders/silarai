import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStorefront } from '../../../core/storefront-context';
import type { ProductQuery } from '../../../core/types';

/** "View all" goes to the matching category when the collection is category-based. */
export function ViewAllLink({ query, categoryName }: { query?: ProductQuery; categoryName?: string | null }) {
  const { links } = useStorefront();
  const to = query?.source === 'category' && categoryName ? links.category(categoryName) : links.allProducts();
  return (
    <Link to={to} className="sf-btn sf-btn-secondary sf-btn-sm">
      View all <ChevronRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}
