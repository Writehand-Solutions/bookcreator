/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
        backgroundImage: {
            "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            "gradient-conic":
            "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        },
        },
    },
    plugins: [],
    blocklist: [ /* Prevent conflicts with the built-in size-x classes from the builder */
        'size-12',
        'size-14',
        'size-16',
        'size-20',
        'size-24',
        'size-28',
        'size-32',
        'size-36',
        'size-40',
        'size-44',
        'size-48',
        'size-52',
        'size-56',
        'size-60',
        'size-64',
        'size-72',
        'size-80',
        'size-96'
    ],
};
