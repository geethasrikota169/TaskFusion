const config = {
    // Vite uses import.meta.env instead of process.env
    "url": import.meta.env.VITE_BACKEND_URL || "http://localhost:8082"
}
export default config;