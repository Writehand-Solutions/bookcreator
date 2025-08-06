import Head from "next/head";
import { Hero78 } from "@/components/Hero78";

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
