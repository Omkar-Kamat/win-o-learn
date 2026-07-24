import Spinner from "../ui/Spinner";

export default function FullScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}