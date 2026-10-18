import { COLLECTIONS } from '@/lib/constants';
import CollectionDetailView from './CollectionDetailView';

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  return <CollectionDetailView slug={slug} />;
}
