import ReactDOM from "react-dom/client";
import App from "../App";
import widgetCss from "../index.css?inline";
import botCss from "../components/botAiIcon.css?inline";
import chatbotCss from "../components/Chatbot.css?inline";

declare global {
  interface Window {
    PSEBChatbotLoaded?: boolean;
  }
}

export interface ChatbotConfig {
  projectId: string;
  collegeCode: string;
}

let root: ReactDOM.Root | null = null;

export function initChatbot(config: ChatbotConfig) {
  let host = document.getElementById("pseb-chatbot-root");

  if (!host) {
    host = document.createElement("div");
    host.id = "pseb-chatbot-root";

    Object.assign(host.style, {
      position: "fixed",
      right: "0",
      bottom: "0",
      zIndex: "999999",
      width: "auto",
      height: "auto",
    });

    document.body.appendChild(host);
  }

  const shadowRoot =
    host.shadowRoot ?? host.attachShadow({ mode: "open" });

  // ===========================
  // Soft + Strong Reset (Final)
  // ===========================
  // Single Inject: Reset + Widget Styles together
  if (!shadowRoot.querySelector("#pseb-widget-styles")) {
    const styleTag = document.createElement("style");
    styleTag.id = "pseb-widget-styles";

    // Scoped CSS Reset + Main CSS
    styleTag.textContent = `
      :host {
        all: initial !important;
        display: block !important;
        position: fixed !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 9999999 !important;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
        color: #111827 !important;
      }

      :host *, :host *::before, :host *::after {
        box-sizing: border-box !important;
      }

      #react-root, .pseb-chatbot-widget {
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
        color: #111827 !important;
      }

      ${widgetCss}
      ${botCss}
      ${chatbotCss}
    `;

    shadowRoot.appendChild(styleTag);
  }

  // React Root
  let reactRoot = shadowRoot.getElementById("react-root");

  if (!reactRoot) {
    reactRoot = document.createElement("div");
    reactRoot.id = "react-root";
    reactRoot.className = "pseb-chatbot-widget";
    shadowRoot.appendChild(reactRoot);
  }

  if (!root) {
    root = ReactDOM.createRoot(reactRoot);
  }

  root.render(
    <App
      projectId={config.projectId}
      collegeCode={config.collegeCode}
    />
  );
}