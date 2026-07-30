import { create } from "zustand";

interface CollegeState {
    collegeCode: string;
    setCollegeCode: (collegeCode: string) => void;
}

export const useCollegeStore = create<CollegeState>((set) => ({
    collegeCode: "",
    setCollegeCode: (code: string) => {
        set({
            collegeCode: code
        })
    }
}))