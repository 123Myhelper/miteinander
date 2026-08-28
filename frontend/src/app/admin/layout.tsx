import { AdminLayout } from '@/components/admin';
import { createPrivateMetadata } from '@/lib/seo';

export const metadata = createPrivateMetadata('Geschützter Administrationsbereich');

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>{children}</AdminLayout>
  );
}
