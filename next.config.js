/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    reactCompiler: true,
    ppr: "incremental",
  },
};

export default config;
