import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  decodeVerdict,
  getOneLinerFromScore,
  getTierFromScore,
} from "@/lib/utils/verdict-encoding";
import { VerdictPageClient } from "./VerdictPageClient";

interface Props {
  searchParams: Promise<{ d?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const encoded = params.d;
  if (!encoded) return {};

  const verdict = decodeVerdict(encoded);
  if (!verdict) return {};

  const tier = getTierFromScore(verdict.s);
  const oneLiner = getOneLinerFromScore(verdict.s);
  const emoji =
    tier === "green"
      ? "\u{1F7E2}"
      : tier === "yellow"
        ? "\u{1F7E1}"
        : tier === "orange"
          ? "\u{1F7E0}"
          : "\u{1F534}";
  const title = `My idea scored ${verdict.s}/10 on Boardroom AI`;
  const description = `${emoji} ${oneLiner} — 6 AI executives debated this idea live.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?d=${encoded}`],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?d=${encoded}`],
      creator: "@evolved_monkey_",
    },
  };
}

export default async function VerdictPage({ searchParams }: Props) {
  const params = await searchParams;
  const encoded = params.d;

  if (!encoded) notFound();

  const verdict = decodeVerdict(encoded);
  if (!verdict) notFound();

  return <VerdictPageClient encodedData={encoded} />;
}
