import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
        <Head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css" />
            <link rel="stylesheet" href="assets/minimalist-blocks/content.css" />
            <link rel="stylesheet" href="contentbuilder/contentbuilder.css" />
        </Head>
        <body>
            <Main />
            <NextScript />
        </body>
    </Html>
  );
}
