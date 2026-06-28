import { PlaceholderPage } from "@/components/PlaceholderPage";

const names: Record<string, string> = {
  "the-law-library": "The Law Library",
  "golding-compound": "Golding Compound",
  youpassgo: "YouPassGo",
  "relax-with-me": "Relax With Me",
};

export default function BusinessPage({ params }: { params: { slug: string } }) {
  return <PlaceholderPage title={names[params.slug] ?? "Business Lane"} description="Protected business lane with server-side authentication and Supabase-backed ownership policies." />;
}
