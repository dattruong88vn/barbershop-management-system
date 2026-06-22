import { GeistSpinner } from "./Display";

type FullScreenLoadingProps = {
  message: string;
};

export function FullScreenLoading({ message }: FullScreenLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-1000/20 px-4 text-gray-1000">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-400 bg-gray-100 px-6 py-5 text-center">
        <GeistSpinner />
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}
