import { logout } from "@/app/spravce/actions";
import { AdminLibrary, type AdminVideo } from "@/components/admin-library";
import { LoginForm } from "@/components/login-form";
import { Tied } from "@/components/tied";
import { isAdmin } from "@/lib/auth";
import { listCompleteSubmissions } from "@/lib/records";

export async function AdminGate({
  searchParams,
}: {
  searchParams: Promise<{ chyba?: string }>;
}) {
  const signedIn = await isAdmin();
  if (!signedIn) {
    const params = await searchParams;
    return <LoginForm error={loginError(params.chyba)} />;
  }

  let videos: AdminVideo[] = [];
  let loadError: string | null = null;
  try {
    const records = await listCompleteSubmissions();
    videos = records.map((record) => ({
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      description: record.description,
      fileName: record.fileName,
      byteSize: record.byteSize ?? record.declaredSize,
      completedAt: record.completedAt ?? record.createdAt,
    }));
  } catch (error) {
    console.error(error);
    loadError = "Videa se nepodařilo načíst. Zkontrolujte, že je k projektu připojený soukromý Vercel Blob.";
  }

  return (
    <Tied>
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-unhost-navy">Nahraná videa</h1>
          <p className="mt-2 text-ink">{countVideos(videos.length)}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-unhost-navy/20 px-4 py-2 text-sm font-semibold text-unhost-navy"
          >
            Odhlásit
          </button>
        </form>
      </div>
      {loadError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">
          {loadError}
        </p>
      ) : (
        <AdminLibrary videos={videos} />
      )}
    </section>
    </Tied>
  );
}

function countVideos(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} dokončené video`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} dokončená videa`;
  }
  return `${count} dokončených videí`;
}

function loginError(code: string | undefined): string | null {
  switch (code) {
    case undefined:
      return null;
    case "heslo":
      return "Heslo nesedí.";
    case "nastaveni":
      return "Správa ještě nemá nastavené heslo. Doplňte ADMIN_PASSWORD v prostředí serveru.";
    default:
      return null;
  }
}
