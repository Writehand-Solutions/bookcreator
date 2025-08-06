import { Hero78 } from "@/components/hero78";
import Head from "next/head";

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>BookCreator AI - Create Amazing Books with AI</title>
        <meta
          name="description"
          content="Transform your ideas into professional books using advanced AI technology. Create, edit, and publish books effortlessly."
        />
      </Head>

      <Hero78 />
    </>
  );
}
