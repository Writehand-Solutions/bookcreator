import Link from "next/link";
import { Button } from "@/components/ui/button";

const Hero78 = () => {
  return (
    <section className="dark relative flex h-svh max-h-[1400px] w-svw overflow-hidden bg-[url('https://deifkwefumgah.cloudfront.net/shadcnblocks/block/full-width-backgrounds/pawel-czerwinski-IbHFznCKnqA-unsplash.jpg')] bg-cover bg-center bg-no-repeat font-sans after:absolute after:left-0 after:top-0 after:z-10 after:h-full after:w-full after:bg-black/20 after:content-[''] md:h-svh">
      <div className="relative z-30 m-auto flex max-w-[46.25rem] flex-col items-center justify-center gap-6 px-5">
        <h1 className="text-foreground text-center font-serif text-4xl leading-tight md:text-6xl xl:text-[4.4rem]">
          Create Amazing Books with AI
        </h1>
        <p className="text-foreground text-center text-base">
          Transform your ideas into professional books using advanced AI
          technology. Generate complete books in minutes and publish in multiple
          formats.
        </p>
        <Link href="/books">
          <Button className="h-fit w-fit rounded-full px-7 py-4 text-sm font-medium leading-tight">
            Create Books
          </Button>
        </Link>
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 h-full w-full bg-[url('https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/noise.png')] bg-repeat opacity-15" />
    </section>
  );
};

export { Hero78 };
