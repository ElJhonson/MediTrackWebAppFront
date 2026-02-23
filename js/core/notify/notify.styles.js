export const TOAST_CONTAINER_ID = "app-toast-container";

let stylesMounted = false;

export function ensureToastStyles() {
    if (stylesMounted || typeof document === "undefined") return;

    const style = document.createElement("style");
    style.id = "app-toast-styles";
    style.textContent = `
        #${TOAST_CONTAINER_ID} {
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 0.65rem;
            max-width: min(92vw, 360px);
        }

        .app-toast {
            position: relative;
            border-radius: 14px;
            padding: 0.9rem 0.95rem;
            color: #0f172a;
            background: #ffffff;
            border: 1px solid #dbe5f2;
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.18);
            display: grid;
            grid-template-columns: auto 1fr;
            column-gap: 0.7rem;
            align-items: start;
            overflow: hidden;
            animation: toast-in 180ms ease-out;
        }

        .app-toast__icon {
            width: 1.35rem;
            height: 1.35rem;
            margin-top: 0.05rem;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.82rem;
            font-weight: 700;
            line-height: 1;
        }

        .app-toast__text {
            margin: 0;
            font-size: 0.93rem;
            font-weight: 500;
            line-height: 1.35;
            word-break: break-word;
        }

        .app-toast--error {
            border-color: #fecaca;
            background: linear-gradient(165deg, #fff7f7 0%, #fff 100%);
        }

        .app-toast--error .app-toast__icon {
            background: #fee2e2;
            color: #b91c1c;
        }

        .app-toast--success {
            border-color: #bbf7d0;
            background: linear-gradient(165deg, #f0fdf4 0%, #fff 100%);
        }

        .app-toast--success .app-toast__icon {
            background: #dcfce7;
            color: #15803d;
        }

        .app-toast--info {
            border-color: #bfdbfe;
            background: linear-gradient(165deg, #eff6ff 0%, #fff 100%);
        }

        .app-toast--info .app-toast__icon {
            background: #dbeafe;
            color: #1d4ed8;
        }

        .app-toast__bar {
            position: absolute;
            left: 0;
            bottom: 0;
            height: 3px;
            width: 100%;
            transform-origin: left center;
            animation: toast-bar linear forwards;
            opacity: 0.85;
        }

        .app-toast--error .app-toast__bar {
            background: #ef4444;
        }

        .app-toast--success .app-toast__bar {
            background: #22c55e;
        }

        .app-toast--info .app-toast__bar {
            background: #3b82f6;
        }

        @keyframes toast-in {
            from {
                opacity: 0;
                transform: translate3d(0, -10px, 0) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translate3d(0, 0, 0) scale(1);
            }
        }

        @keyframes toast-out {
            to {
                opacity: 0;
                transform: translate3d(0, -8px, 0) scale(0.98);
            }
        }

        @keyframes toast-bar {
            from {
                transform: scaleX(1);
            }
            to {
                transform: scaleX(0);
            }
        }

        @media (max-width: 640px) {
            #${TOAST_CONTAINER_ID} {
                top: 0.75rem;
                right: 0.75rem;
                left: 0.75rem;
                max-width: none;
            }
        }
    `;

    document.head.appendChild(style);
    stylesMounted = true;
}
