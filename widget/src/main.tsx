import "./index.css";
import { initChatbot } from "./bootstrap";

declare global {
  interface Window {
    PSEBChatbotLoaded?: boolean;
  }
}

if (!window.PSEBChatbotLoaded) {
  window.PSEBChatbotLoaded = true;

  const script = document.currentScript as HTMLScriptElement | null;

  if (script) {
    const projectId = script.dataset.projectId || "";
    const collegeCode = script.dataset.collegeCode || "";

    initChatbot({
      projectId,
      collegeCode,
    });
  }
  initChatbot({
    projectId: "olympiad",
    collegeCode: "9999999",
  });
}

