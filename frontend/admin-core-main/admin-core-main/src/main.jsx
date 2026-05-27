import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(<App />);
console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL)
