import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-3xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">
          {customerTexts.detail.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {customerTexts.detail.description}
        </p>

        <dl className="mt-6 rounded-md border border-zinc-200 p-4">
          <dt className="text-sm font-medium text-zinc-800">
            {customerTexts.detail.idLabel}
          </dt>
          <dd className="mt-2 break-all text-sm text-zinc-600">{id}</dd>
        </dl>

        <Link
          href={ROUTES.customers}
          className="mt-6 inline-flex h-10 items-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-950"
        >
          {customerTexts.detail.backToLookup}
        </Link>
      </section>
    </main>
  );
}
