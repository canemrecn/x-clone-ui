import type { Config } from "tailwindcss";

export default {
  // Specify the paths to all of the template files in your project.
  // Tailwind will scan these files for class names.
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Extend the default Tailwind theme with custom values.
    extend: {
      // Custom screen breakpoints for responsive design.
      screens: {
        xsm: '500px',
        sm: '600px',
        md: '690px',
        lg: '988px',
        xl: '1078px',
        xxl: '1265px',
      },
      // Custom colors to use in your project.
      colors: {
        textGray: "#71767b",
        textGrayLight: "#e7e9ea",
        borderGray: "#2f3336",
        inputGray: "#202327",
        iconBlue: "#1d9bf0",
        iconGreen: "#00ba7c",
        iconPink: "#f91880",
      },
    },
  },
  // Plugins array, currently empty. You can add Tailwind plugins here.
  plugins: [],
} satisfies Config;
