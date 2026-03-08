// ─── Shared DTOs (Data Transfer Objects) ────────────────────────────────────
// These mirror the Prisma models as they are returned from API routes.
// Import from here everywhere instead of using `any`.

export interface ExerciseDTO {
  id: string
  name: string
  muscleGroup: string | null
  equipment: string | null
  isCustom: boolean
  notes: string | null
  userId: string | null
}

export interface TemplateExerciseDTO {
  id: string
  exerciseId: string
  order: number
  targetSets: number | null
  repRange: string | null
  notes: string | null
  exercise: Pick<ExerciseDTO, 'id' | 'name' | 'muscleGroup'>
}

export interface TemplateDTO {
  id: string
  name: string
  order: number
  userId: string | null
  exercises: TemplateExerciseDTO[]
}

export interface SetEntryDTO {
  id: string
  workoutExerciseId: string
  setIndex: number
  weight: number
  reps: number
  rpe: number | null
  isWarmup: boolean
  note: string | null
  createdAt: string
}

export interface WorkoutExerciseDTO {
  id: string
  exerciseId: string
  sessionId: string
  order: number
  exercise: Pick<ExerciseDTO, 'id' | 'name' | 'muscleGroup'>
  sets: SetEntryDTO[]
}

export interface WorkoutSessionDTO {
  id: string
  startedAt: string
  endedAt: string | null
  templateId: string | null
  notes: string | null
  userId: string | null
  template: Pick<TemplateDTO, 'id' | 'name'> | null
  exercises: WorkoutExerciseDTO[]
}

// ─── PR (Personal Record) ────────────────────────────────────────────────────

export interface PRResult {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  /** weight × reps */
  volume: number
  achievedAt: string
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface DayVolumeDTO {
  /** ISO date string e.g. "2026-03-04" */
  date: string
  /** German short day label e.g. "Mo" */
  label: string
  volume: number
  sessionCount: number
}

export interface WeeklyStatsDTO {
  sessionsCount: number
  totalVolume: number
  totalSets: number
  days: DayVolumeDTO[]
}

// ─── Offline sync queue ──────────────────────────────────────────────────────

export interface SyncOperation {
  id: string
  url: string
  method: string
  body: unknown
  timestamp: number
}
