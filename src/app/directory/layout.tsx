import { Footer } from "@/components/layout/footer";

export const metadata = { title: "Directory" };

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
