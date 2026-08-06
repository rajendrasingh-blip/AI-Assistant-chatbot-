import Chatbot from "./components/Chatbot";

interface AppProps {
  projectId: string;
  collegeCode: string;
}

export default function App({
  projectId,
  collegeCode,
}: AppProps) {
  return (
    <Chatbot
      projectId={projectId}
      collegeCode={collegeCode}
    />
  );
}