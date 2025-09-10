import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Hero78 = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* content container */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 pb-24 pt-24 md:grid-cols-2 md:pt-32 lg:pt-40">
          {/* left column */}
          <div className="md:max-w-xl">
            <h1 className="text-balance text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Create Long-form Books with AI
            </h1>

            <p className="text-muted-foreground mt-5 max-w-xl text-lg">
              Plan, generate, and polish chapters—then export your book in minutes.
            </p>

            {/* Primary CTA only */}
            <div className="mt-8">
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

      {/* BIG layered preview (absolute; fills available height) */}
      <div className="pointer-events-none md:absolute md:inset-y-20 md:left-[58%] md:right-[-6rem]">
        <div className="relative h-full">
          {/* soft shadow slab behind */}
          <div className="absolute left-[-5%] top-3 h-full w-[110%] -rotate-2 rounded-[24px] bg-foreground/[0.04] ring-1 ring-foreground/10 shadow-md" />
          {/* main card */}
          <div className="relative ml-auto h-full w-[110%] max-w-none skew-x-6 overflow-hidden rounded-[24px] border border-foreground/10 bg-background shadow-lg ring-1 ring-foreground/10">
            <div className="relative h-full">
              <img
                src="/bookhome.png"
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

