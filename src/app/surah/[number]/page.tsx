import { SURAHS } from '@/lib/constants';
import SurahDetailView from './SurahDetailView';

export function generateStaticParams() {
  return SURAHS.map((s) => ({ number: String(s.number) }));
}

interface PageProps {
  params: Promise<{ number: string }>;
}

export default async function SurahPage({ params }: PageProps) {
  const { number } = await params;
  return <SurahDetailView number={number} />;
}
