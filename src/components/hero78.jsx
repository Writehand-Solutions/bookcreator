import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Hero78 = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* content */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 pb-24 pt-24 md:grid-cols-2 md:pt-36 lg:pt-44 lg:px-12">
        {/* left column */}
        <div className="md:max-w-xl">
          <h1 className="text-balance text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
            Create Amazing Books with AI
          </h1>

          <p className="text-muted-foreground mt-5 max-w-xl text-lg">
            Plan, generate, and polish chapters—then export your book in minutes.
          </p>

          {/* Primary CTA only (watch demo removed) */}
          <div className="mt-8 flex items-center gap-3">
            <Button asChild size="lg" className="pl-4 pr-2.5">
              <Link href="/books">
                <span className="text-nowrap">Get Started</span>
                <ChevronRight className="ml-1 opacity-60" />
              </Link>
            </Button>
          </div>

          {/* Powered by branding (logos list removed) */}
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

        {/* right column (mock app shot) */}
        <div className="relative">
          <div className="relative -translate-y-10 skew-x-6 overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03] shadow-md ring-1 ring-foreground/10">
            <img
              src="/bookhome.png"
              alt="App preview"
              className="h-full w-full object-cover object-left-top"
            />
          </div>
        </div>
      </div>

      {/* subtle noise / texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[url('https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/noise.png')] bg-repeat opacity-10" />
    </section>
  );
};

export { Hero78 };

