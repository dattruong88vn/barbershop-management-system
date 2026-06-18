import { GeistSpinner } from "./Display";

type FullScreenLoadingProps = {
  message: string;
};

export function FullScreenLoading({ message }: FullScreenLoadingProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-200 px-4 text-gray-1000">
      <div className="flex flex-col items-center gap-3 text-center">
        <GeistSpinner />
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </main>
  );
}
