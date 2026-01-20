import { isAuthenticated } from "./auth.js";

export function protectPage() {
    if (!isAuthenticated()) {
        window.location.href = "/index.html";
    }
}
