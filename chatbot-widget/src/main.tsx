import "./index.css";
import { initChatbot } from "./bootstrap";

declare global {
  interface Window {
    PSEBChatbotLoaded?: boolean;
  }
}

if (!window.PSEBChatbotLoaded) {
  window.PSEBChatbotLoaded = true;
  let projectId = "olympiad";
  let collegeCode = "999999";
  const script = document.currentScript as HTMLScriptElement | null;

  if (script) {
    projectId = script.dataset.projectId || projectId;
    collegeCode = script.dataset.collegeCode || collegeCode;

    initChatbot({
      projectId,
      collegeCode,
    });
  }
}

