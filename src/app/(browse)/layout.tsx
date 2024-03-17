import { Navbar } from "@/components/Navbar";

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-3">{children}</main>
    </div>
  );
}
