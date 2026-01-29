import { isAuthenticated } from "../core/auth.js";

export function protectPage() {
    if (!isAuthenticated()) {
        window.location.href = "/index.html";
    }
}
