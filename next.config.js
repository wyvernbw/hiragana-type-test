/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    reactCompiler: true,
    ppr: "incremental",
    dynamicIO: true,
  },
};

export default config;
