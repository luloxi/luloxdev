import { SignInPanel } from "@/components/views/sign-in-panel";

type Props = { searchParams: Promise<{ error?: string | string[] }> };

export default async function SignInPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return <SignInPanel error={typeof error === "string" ? error : null} />;
}
