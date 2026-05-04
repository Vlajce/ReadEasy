export type ExerciseType =
  | "fill_blank"
  | "multiple_choice_translation"
  | "multiple_choice_fill_blank";

export type ExerciseMode = "smart_mix" | "new_only" | "learning_only" | "all";

export interface FillBlankExercise {
  entryId: string;
  type: "fill_blank";
  sentence: string;
  answer: string;
}

export interface MultipleChoiceTranslationExercise {
  entryId: string;
  type: "multiple_choice_translation";
  word: string;
  options: string[];
  answer: string;
}

export interface MultipleChoiceFillBlankExercise {
  entryId: string;
  type: "multiple_choice_fill_blank";
  sentence: string;
  options: string[];
  answer: string;
}

export type Exercise =
  | FillBlankExercise
  | MultipleChoiceTranslationExercise
  | MultipleChoiceFillBlankExercise;

export interface GenerateExercisesParams {
  language: string;
  count: number;
  types: ExerciseType[];
  mode: ExerciseMode;
}

export interface ExerciseResult {
  entryId: string;
  correct: boolean;
}

export interface SubmitExercisesInput {
  results: ExerciseResult[];
}

export interface SessionResult {
  exercise: Exercise;
  userAnswer: string;
  correct: boolean;
}
