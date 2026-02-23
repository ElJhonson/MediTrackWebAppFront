import { showToast } from "./notify.core.js";

export function notifyError(message, timeout) {
    showToast(message, "error", timeout ?? 4300);
}

export function notifySuccess(message, timeout) {
    showToast(message, "success", timeout ?? 2800);
}

export function notifyInfo(message, timeout) {
    showToast(message, "info", timeout ?? 3200);
}
