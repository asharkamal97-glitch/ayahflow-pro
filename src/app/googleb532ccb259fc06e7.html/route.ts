export const dynamic = "force-static";

export function GET() {
  return new Response("google-site-verification: googleb532ccb259fc06e7.html", {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
