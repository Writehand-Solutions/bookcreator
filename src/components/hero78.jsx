import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Hero78 = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* content container */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 pb-24 pt-24 md:grid-cols-2 md:pt-36 lg:pt-44">
          {/* left column */}
          <div className="md:max-w-xl">
            <h1 className="text-balance text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Create Amazing Books with AI
            </h1>

            <p className="text-muted-foreground mt-5 max-w-xl text-lg">
              Plan, generate, and polish chapters—then export your book in minutes.
            </p>

            {/* Primary CTA only */}
            <div className="mt-8 flex items-center gap-3">
              <Button asChild size="lg" className="pl-4 pr-2.5">
                <Link href="/books">
                  <span className="text-nowrap">Get Started</span>
                  <ChevronRight className="ml-1 opacity-60" />
                </Link>
              </Button>
            </div>

            {/* Powered by branding */}
            <p className="text-muted-foreground mt-10 text-sm">Proudly powered by</p>
            <div className="mt-3">
              <a
                href="https://www.productised.ai/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="productised.ai"
                className="inline-flex items-center"
              >
                <img
                  src="/full%20logo%20no%20back.png"
                  alt="productised."
                  className="h-6 w-auto opacity-90 object-contain"
                />
              </a>
            </div>
          </div>

          {/* right column placeholder so grid reserves space on small screens */}
          <div className="min-h-[18rem] md:min-h-0" />
        </div>
      </div>

      {/* BIG preview (absolute so it can extend beyond grid) */}
      <div className="perspective-near md:absolute md:-right-6 md:bottom-16 md:left-1/2 md:top-28">
        <div className="before:border-foreground/5 before:bg-foreground/5 relative mx-auto h-full max-w-[60rem] scale-[1.08] before:absolute before:-inset-x-4 before:bottom-7 before:top-0 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border">
          <div className="bg-background rounded-(--radius) shadow-foreground/10 ring-foreground/5 relative h-full -translate-y-12 skew-x-6 overflow-hidden border border-transparent shadow-md ring-1">
            {/* keep aspect so it stays large + responsive */}
            <div className="relative aspect-[16/10] w-full">
              <img
                src="https://res.cloudinary.com/dohqjvu9k/image/upload/v1755171585/oxy_jjuhdv.webp"
                alt="App preview"
                className="absolute inset-0 h-full w-full object-cover object-left-top"
              />
            </div>
          </div>
        </div>
      </div>

      {/* subtle noise / texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[url('https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/noise.png')] bg-repeat opacity-10" />
    </section>
  );
};

export { Hero78 };

