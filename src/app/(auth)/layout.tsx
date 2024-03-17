export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <main className="h-[100vh] flex items-center justify-center">
        <div>{children}</div>
      </main>
    </div>
  );
}
