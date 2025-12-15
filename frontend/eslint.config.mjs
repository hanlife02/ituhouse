import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

const config = [
  { ignores: [".next/**"] },
  ...nextCoreWebVitals,
]

export default config
