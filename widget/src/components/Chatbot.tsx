import { Suspense, useEffect, useState, useRef } from "react";
import { fetchGeminiChat } from "../api/api";
import ReactMarkdown from "react-markdown";
import { X, Send, Bot } from "lucide-react";
import remarkGfm from "remark-gfm";

type Props = {
    collegeCode: string;
    projectId: string;
}

type Message = {
    role: string,
    content: string
}

function ChatbotContent(props: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const { projectId, collegeCode } = props;


    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop =
                        chatContainerRef.current.scrollHeight;
                }
            }, 100);
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, isOpen]);

    useEffect(() => {
        window.parent.postMessage(
            {
                type: isOpen ? "CHATBOT_OPEN" : "CHATBOT_CLOSE",
            },
            "*"
        );
    }, [isOpen]);

    const handleSendQuestion = async () => {
        if (!question.trim() || loading) return;

        // College code URL se nahi mila
        if (!collegeCode) {
            console.error("College code is missing");
            return;
        }

        const updatedMessages: Message[] = [
            ...messages,
            {
                role: "user",
                content: question.trim(),
            },
        ];
        const currentQuery = {
            role: "user",
            content: question.trim(),
        }
        setMessages(updatedMessages);
        setQuestion("");
        setLoading(true);

        try {
            const answer = await fetchGeminiChat(
                currentQuery,
                collegeCode,
                projectId
            );

            if (answer?.data) {
                setMessages([
                    ...updatedMessages,
                    {
                        role: "assistant",
                        content: answer.data,
                    },
                ]);
            }
        } catch (error) {
            console.error("Failed to fetch answer:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuestion = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setQuestion(e.target.value);
    };

    return (
        <div className="pseb-chatbot-widget">
            {!isOpen && (
                <div className="relative w-[80px] h-[90px]">
                    {/* <div className=" rounded-full border border-[#dbe4ed] bg-white px-4 py-2 text-[14px] font-medium text-[#28598f] shadow-[0_4px_20px_rgba(15,42,70,0.12)] animate-[fadeIn_0.3s_ease-out] ">
                        Need Help?
                    </div> */}

                    <button
                        onClick={() => setIsOpen(true)}
                        aria-label="Open AI Assistant"
                        className="group flex h-[72px] w-[72px] items-center justify-center bg-transparent transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer"
                    >
                        <div className="ai-bot">
                            <div className="bot-head">
                                <div className="bot-eye left">
                                    <span></span>
                                </div>

                                <div className="bot-eye right">
                                    <span></span>
                                </div>

                                <div className="bot-mouth"></div>
                            </div>
                            <div className="help-bubble">
                                Need Help?
                            </div>
                            <div className="bot-body">
                                <div className="bot-arm left"></div>
                                <div className="bot-arm right"></div>

                                <div className="bot-leg left"></div>
                                <div className="bot-leg right"></div>
                            </div>

                            <div className="bot-shadow"></div>
                        </div>
                    </button>
                </div>
            )}

            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[calc(100vw-32px)] max-w-[430px] flex-col overflow-hidden rounded-2xl border border-[#d8e0e8] bg-white shadow-[0_20px_60px_rgba(15,42,70,0.22)]">
                    <div className="cb-header flex shrink-0 items-center justify-between" >
                        <div className="flex items-center gap-3">
                            <div className="cb-header-icon flex items-center justify-center" >
                                <Bot
                                    size={23}
                                    strokeWidth={2}
                                />
                            </div>

                            <div>
                                <h2 className="cb-title">
                                    PSEB AI Assistant
                                </h2>

                                <div className="mt-0.5 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#8ee6b0]" />

                                    <span className="cb-status-text">
                                        Online • Ready to help
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chatbot"
                            className="cb-close-btn flex items-center justify-center cursor-pointer"
                        >
                            <X size={21} />
                        </button>
                    </div>

                    <div
                        ref={chatContainerRef}
                        className="cb-body flex-1 min-h-0 overflow-y-auto scroll-smooth"
                    >
                        {messages.length === 0 && !loading && (
                            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                <div className="cb-welcome-icon flex items-center justify-center" >
                                    <Bot size={28} />
                                </div>

                                <h3 className="cb-welcome-title">
                                    Hello! How can I help you?
                                </h3>

                                <p className="cb-welcome-text">
                                    Ask me anything about your school,
                                    exams, registration or other
                                    available information.
                                </p>

                                <div className="cb-welcome-chip">
                                    Type your question below
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            {messages.map(
                                (item: Message, idx: number) => (
                                    <div key={idx}>
                                        {item.role === "user" && (
                                            <div className="flex justify-end">
                                                <div className="cb-user-message" >
                                                    {item.content}
                                                </div>
                                            </div>
                                        )}

                                        {item.role === "assistant" && (
                                            <div className="cb-bot-message cb-markdown">

                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({ children }) => (
                                                            <p className="mb-3 leading-6 last:mb-0">
                                                                {children}
                                                            </p>
                                                        ),

                                                        strong: ({ children }) => (
                                                            <strong className="font-semibold text-gray-900">
                                                                {children}
                                                            </strong>
                                                        ),

                                                        ul: ({ children }) => (
                                                            <ul className="list-disc pl-5 mb-3 space-y-1">
                                                                {children}
                                                            </ul>
                                                        ),

                                                        ol: ({ children }) => (
                                                            <ol className="list-decimal pl-5 mb-3 space-y-1">
                                                                {children}
                                                            </ol>
                                                        ),

                                                        li: ({ children }) => (
                                                            <li className="leading-6">
                                                                {children}
                                                            </li>
                                                        ),

                                                        h1: ({ children }) => (
                                                            <h1 className="text-xl font-bold text-gray-900 mb-3">
                                                                {children}
                                                            </h1>
                                                        ),

                                                        h2: ({ children }) => (
                                                            <h2 className="text-lg font-bold text-gray-900 mb-3">
                                                                {children}
                                                            </h2>
                                                        ),

                                                        h3: ({ children }) => (
                                                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                                                                {children}
                                                            </h3>
                                                        ),

                                                        table: ({ children }) => (
                                                            <div className="w-full overflow-x-auto mb-4">
                                                                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                                                    {children}
                                                                </table>
                                                            </div>
                                                        ),

                                                        thead: ({ children }) => (
                                                            <thead className="bg-gray-100">
                                                                {children}
                                                            </thead>
                                                        ),

                                                        tbody: ({ children }) => (
                                                            <tbody>
                                                                {children}
                                                            </tbody>
                                                        ),

                                                        tr: ({ children }) => (
                                                            <tr className="border-b border-gray-200">
                                                                {children}
                                                            </tr>
                                                        ),

                                                        th: ({ children }) => (
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-900 whitespace-nowrap">
                                                                {children}
                                                            </th>
                                                        ),

                                                        td: ({ children }) => (
                                                            <td className="border border-gray-300 px-3 py-2 text-gray-700">
                                                                {children}
                                                            </td>
                                                        ),

                                                        br: () => <br />,
                                                    }}
                                                >
                                                    {item.content}
                                                </ReactMarkdown>

                                            </div>
                                        )}
                                    </div>
                                )
                            )}

                            {loading && (
                                <div className="flex items-start gap-2.5">
                                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e4edf6] text-[#28598f]" >
                                        <Bot size={16} />
                                    </div>

                                    <div className="cb-loading" >
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#28598f]" />

                                            <span
                                                className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#28598f]"
                                                style={{
                                                    animationDelay: "150ms",
                                                }}
                                            />

                                            <span
                                                className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#28598f]"
                                                style={{
                                                    animationDelay: "300ms",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="cb-footer shrink-0" >
                        <div className="cb-input-wrapper flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={question}
                                onChange={handleQuestion}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        !e.shiftKey
                                    ) {
                                        e.preventDefault();
                                        handleSendQuestion();
                                    }
                                }}
                                className="cb-input min-w-0 flex-1"
                            />

                            <button
                                disabled={
                                    loading ||
                                    !question.trim()
                                }
                                onClick={handleSendQuestion}
                                aria-label="Send message"
                                className="cb-send-btn flex shrink-0 items-center justify-center"
                            >
                                <Send
                                    size={17}
                                    strokeWidth={2}
                                />
                            </button>
                        </div>

                        <p className="cb-footer-note">
                            AI Assistant may occasionally make mistakes
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Chatbot(props: Props) {
    return (
        <Suspense fallback={null}>
            <ChatbotContent {...props} />
        </Suspense>
    );
}

