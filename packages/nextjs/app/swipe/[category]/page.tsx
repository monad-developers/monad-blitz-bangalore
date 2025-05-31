import { SwipePage } from "@/components/pages/swipe";

export async function generateStaticParams() {
  // Define all possible dynamic routes at build time
  const categories = [
    "meme-coins",
    "risky-degens",
    "newly-launched",
    "blue-chips",
    "ai-analyzed",
  ];

  return categories.map((category) => ({
    category, // Match the [category] dynamic parameter
  }));
}

export default function Swipe({ params }: { params: { category: string } }) {
  return <SwipePage category={params.category} />;
}
