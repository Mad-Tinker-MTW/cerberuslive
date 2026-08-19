import { Button, Container } from "@/components/ui";
import { Monogram } from "@/components/Logo";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-gradient-to-b from-midnight-deep to-onyx py-24">
      <Container className="text-center">
        <div className="flex justify-center">
          <Monogram size={120} />
        </div>
        <p className="eyebrow mt-10">Off the map</p>
        <h1 className="display mt-5 text-5xl sm:text-6xl">This route doesn&apos;t exist</h1>
        <div className="gold-rule mx-auto my-7 w-24" />
        <p className="lede mx-auto max-w-lg">
          The page you were looking for has moved or was never here. Let&apos;s get you back on the road.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/">Return home</Button>
          <Button href="/plan-my-trip" variant="outline">
            Plan a trip
          </Button>
        </div>
      </Container>
    </section>
  );
}
