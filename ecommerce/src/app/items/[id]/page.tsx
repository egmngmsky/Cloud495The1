import ItemPageClient from './ItemPageClient';

export default async function ItemPage({ params }: { params: { id: string } }) {
  // Await params to resolve it
  const id = params.id;
  
  return <ItemPageClient id={id} />;
} 