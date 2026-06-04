import CustomerVisitHistory from "@/app/customers/[id]/CustomerVisitHistory";

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = await params;

  return <CustomerVisitHistory customerId={id} />;
}
