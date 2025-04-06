import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of the problem state slice
interface ProblemState {
	sequence: string | null;
	isCorrect: boolean | null;
	loading: boolean;
	error: string | null;
}

const initialState: ProblemState = {
	sequence: null,
	isCorrect: null,
	loading: false,
	error: null,
};

const problemSlice = createSlice({
	name: "problem",
	initialState,
	reducers: {
		// Set the sequence for the puzzle
		setSequence: (state, action: PayloadAction<string>) => {
			state.sequence = action.payload;
			state.isCorrect = null; // Reset correctness when new sequence is set
		},

		// Set whether the submission is correct or not
		setIsCorrect: (state, action: PayloadAction<boolean>) => {
			state.isCorrect = action.payload;
		},

		// Reset the problem state
		resetProblem: (state) => {
			state.sequence = null;
			state.isCorrect = null;
		},

		// Loading and error states (optional but useful)
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},

		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
});

export const { setSequence, setIsCorrect, resetProblem, setLoading, setError } =
	problemSlice.actions;

export default problemSlice.reducer;
