import { SignInPanel } from "@/components/views/sign-in-panel";
import { safeNext } from "@/lib/referrals";

type Props = { searchParams: Promise<{ error?: string | string[]; next?: string | string[] }> };

export default async function SignInPage({ searchParams }: Props) {
  const { error, next } = await searchParams;
  // ?next=/referidos: where to land after Google (internal paths only). Default: /blog.
  return <SignInPanel error={typeof error === "string" ? error : null} next={safeNext(next)} />;
}
