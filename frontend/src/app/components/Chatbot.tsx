"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { fetchGeminiChat } from "../api/api";
import ReactMarkdown from "react-markdown";
import { X, Send, Bot } from "lucide-react";
import { Message } from "@/Message";
import { useSearchParams } from "next/navigation";
import remarkGfm from "remark-gfm";

type ChatbotProps = {
    projectId: string;
};

function ChatbotContent(props: ChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const { projectId } = props;

    const searchParams = useSearchParams();

    const collegeCode = searchParams.get("college_code") || "9999999";

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
        <>
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
                    <div className=" rounded-full border border-[#dbe4ed] bg-white px-4 py-2 text-sm font-medium text-[#28598f] shadow-[0_4px_20px_rgba(15,42,70,0.12)] animate-[fadeIn_0.3s_ease-out] ">
                        Need Help?
                    </div>

                    <button
                        onClick={() => setIsOpen(true)}
                        aria-label="Open AI Assistant"
                        className="group flex h-16 w-16 items-center justify-center rounded-full bg-[#28598f] text-white shadow-[0_8px_30px_rgba(15,42,70,0.28)] ring-4 ring-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#214d7e] hover:shadow-[0_12px_35px_rgba(15,42,70,0.38)] active:scale-95 cursor-pointer "
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-110 " >
                            <Bot
                                size={26}
                                strokeWidth={1.8}
                            />
                        </div>
                    </button>
                </div>
            )}

            {isOpen && (
                <div className=" fixed bottom-6 right-6 z-50 flex h-[600px] w-[calc(100vw-32px)] max-w-[430px] flex-col overflow-hidden rounded-2xl border border-[#d8e0e8] bg-white shadow-[0_20px_60px_rgba(15,42,70,0.22)] ">
                    <div className=" flex shrink-0 items-center justify-between bg-[#28598f] px-5 py-4 text-white " >
                        <div className="flex items-center gap-3">
                            <div className=" flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 " >
                                <Bot
                                    size={23}
                                    strokeWidth={2}
                                />
                            </div>

                            <div>
                                <h2 className="text-[15px] font-semibold tracking-wide">
                                    PSEB AI Assistant
                                </h2>

                                <div className="mt-0.5 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#8ee6b0]" />

                                    <span className="text-[11px] text-white/75">
                                        Online • Ready to help
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chatbot"
                            className=" flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white cursor-pointer "
                        >
                            <X size={21} />
                        </button>
                    </div>

                    <div
                        ref={chatContainerRef}
                        className=" flex-1 min-h-0 overflow-y-auto bg-[#f7f9fb] px-4 py-5 scroll-smooth "
                    >
                        {messages.length === 0 && !loading && (
                            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                <div className=" mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f0f8] text-[#28598f] " >
                                    <Bot size={28} />
                                </div>

                                <h3 className="text-[16px] font-semibold text-[#1f2937]">
                                    Hello! How can I help you?
                                </h3>

                                <p className="mt-2 max-w-[280px] text-[13px] leading-5 text-[#6b7280]">
                                    Ask me anything about your school,
                                    exams, registration or other
                                    available information.
                                </p>

                                <div className="mt-5 rounded-full border border-[#d5e0eb] bg-white px-4 py-2 text-xs text-[#55708c] shadow-sm">
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
                                                <div className=" max-w-[82%] rounded-2xl rounded-br-md bg-[#28598f] px-4 py-2.5 text-[14px] leading-5 text-white shadow-sm " >
                                                    {item.content}
                                                </div>
                                            </div>
                                        )}

                                        {item.role === "assistant" && (
                                            <div className="flex justify-start">
                                                <div className="max-w-[90%] bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm text-gray-800 leading-6 overflow-hidden">

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

                                    <div className="rounded-2xl rounded-bl-md border border-[#e1e7ed] bg-white px-4 py-3 shadow-sm" >
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

                    <div className=" shrink-0 border-t border-[#e2e7ec] bg-white p-3 " >
                        <div className="flex items-center gap-2 rounded-xl border border-[#d4dce5] bg-[#fafbfc] p-1.5 transition focus-within:border-[#28598f] focus-within:ring-2 focus-within:ring-[#28598f]/10">
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
                                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[14px] text-[#263442] outline-none placeholder:text-[#9aa6b2] "
                            />

                            <button
                                disabled={
                                    loading ||
                                    !question.trim()
                                }
                                onClick={handleSendQuestion}
                                aria-label="Send message"
                                className=" flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#28598f] text-white transition-all hover:bg-[#214d7e] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 "
                            >
                                <Send
                                    size={17}
                                    strokeWidth={2}
                                />
                            </button>
                        </div>

                        <p className="mt-2 text-center text-[10px] text-[#9aa6b2]">
                            AI Assistant may occasionally make mistakes
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

export default function Chatbot(props: ChatbotProps) {
    return (
        <Suspense fallback={null}>
            <ChatbotContent {...props} />
        </Suspense>
    );
}

