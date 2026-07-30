import mongoose, { Schema } from "mongoose";

interface ChatHistoryType extends Document {
    projectId: string;
    sessionId: string;
    role: "user" | "assistant" | "system";
    message: string;
    toolName: string;
    createdAt: Date;
}

const ChatHistorySchema = new Schema<ChatHistoryType>({
    projectId: {
        type: String,
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ["user", "assistant", "system"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    toolName: {
        type: String,
        default: null
    }
},
    {
        timestamps: {
            createdAt: true,
            updatedAt: false
        }
    }
);


export default mongoose.model<ChatHistoryType>("ChatHistory", ChatHistorySchema);