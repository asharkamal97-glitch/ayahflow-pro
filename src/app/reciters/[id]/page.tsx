import { RECITERS } from '@/lib/constants';
import ReciterDetailView from './ReciterDetailView';

export function generateStaticParams() {
  return RECITERS.map((r) => ({ id: r.id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReciterPage({ params }: PageProps) {
  const { id } = await params;
  return <ReciterDetailView id={id} />;
}
