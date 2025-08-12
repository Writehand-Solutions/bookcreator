import { Hero78 } from "@/components/hero78";
import Head from "next/head";

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>AI Book Builder - Powered by Productised AI</title>
        <meta
          name="description"
          content="Transform your ideas into books using advanced AI technology. Create, edit, and publish books effortlessly. Powered by Productised AI."
        />
      </Head>

      <Hero78 />
    </>
  );
}
