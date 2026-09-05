export type LoggedSet = { w: number; r: number; rir?: number | null };

export type HistoryExercise = {
  id: string;
  name: string;
  sets: LoggedSet[];
};

export type HistorySession = {
  id: string;
  date: string;
  day: string;
  vol: number;
  sets: number;
  reps: number;
  mins: number;
  notes?: string;
  readiness?: {
    sleep: number;
    energy: number;
    soreness: number;
    time: number;
    score: number;
  } | null;
  exercises: HistoryExercise[];
};

export type Exercise = {
  id: string;
  name: string;
  category: "power" | "strength" | "hypertrophy" | "mobility";
  sets: number;
  reps: string;
  rest: number;
  initialLoad: number;
  increment: number;
  cue: string;
  swap: string;
};

export type WorkoutDay = {
  id: "A" | "B" | "C";
  name: string;
  focus: string;
  duration: number;
  warmup: string[];
  exercises: Exercise[];
};

export const PROFILE = {
  name: "Atrin",
  age: 24,
  sex: "Male",
  heightCm: 178,
  weightKg: 74,
  bodyFat: 19.3,
  bmi: 23.6,
  muscleMassKg: 56.5,
  skeletalMuscleKg: 32.1,
  fatMassKg: 14.3,
  fatFreeMassKg: 59.7,
  bodyWater: 59.3,
  proteinMassKg: 11.9,
  boneMassKg: 3.2,
  visceralFatRating: 6,
  restingHeartRate: 64,
  bmrKcal: 1660,
  bodyAge: 20,
  experience: "Intermediate",
  goal: "Strength + athletic performance",
  priority: "Arms, with balanced whole-body development",
  schedule: "3 nights/week · up to 90 minutes · usually 9 p.m.",
  equipment:
    "Dumbbells, barbell, cables, rows, chest machines and basic machines",
  constraints:
    "Low sleep duration, limited flexibility; reverse lunges and RDLs feel difficult",
  preferences: "Bench press, lat pulldown and lateral raises",
};

export const HISTORY: HistorySession[] = [
  {
    id: "s0803",
    date: "2026-08-03",
    day: "C",
    vol: 4588,
    sets: 23,
    reps: 249,
    mins: 98,
    exercises: [],
  },
  {
    id: "s0805",
    date: "2026-08-05",
    day: "A",
    vol: 2995,
    sets: 15,
    reps: 113,
    mins: 62,
    notes: "Felt drained and skipped abs.",
    exercises: [
      {
        id: "bench",
        name: "Bench Press",
        sets: [
          { w: 57.5, r: 6 },
          { w: 57.5, r: 7 },
          { w: 57.5, r: 5 },
        ],
      },
    ],
  },
  {
    id: "s0808",
    date: "2026-08-08",
    day: "B",
    vol: 3560,
    sets: 16,
    reps: 119,
    mins: 58,
    notes: "Short on time.",
    readiness: { sleep: 3, energy: 3, soreness: 1, time: 60, score: 73 },
    exercises: [
      {
        id: "dbrow",
        name: "Dumbbell Row",
        sets: [
          { w: 12.5, r: 15, rir: 3 },
          { w: 15, r: 10, rir: 2 },
          { w: 17.5, r: 10, rir: 1 },
          { w: 20, r: 6, rir: 0 },
        ],
      },
      {
        id: "lat",
        name: "Lat Pulldown",
        sets: [
          { w: 50, r: 8, rir: 2 },
          { w: 60, r: 5, rir: 0 },
          { w: 60, r: 4, rir: 0.5 },
          { w: 60, r: 5, rir: 0 },
        ],
      },
      {
        id: "row",
        name: "Seated Cable Row",
        sets: [
          { w: 50, r: 8, rir: 2 },
          { w: 50, r: 10, rir: 1 },
          { w: 50, r: 9, rir: 1 },
        ],
      },
      {
        id: "ez",
        name: "EZ-Bar Curl",
        sets: [
          { w: 15, r: 7, rir: 2 },
          { w: 15, r: 5, rir: 1 },
          { w: 15, r: 4, rir: 0 },
        ],
      },
      {
        id: "hammer",
        name: "Hammer Curl",
        sets: [
          { w: 7.5, r: 5, rir: 2 },
          { w: 7.5, r: 8, rir: 1 },
        ],
      },
    ],
  },
  {
    id: "s0815",
    date: "2026-08-15",
    day: "C",
    vol: 7660,
    sets: 22,
    reps: 220,
    mins: 106,
    notes: "Inner leg hurt during reverse lunges.",
    readiness: { sleep: 5, energy: 5, soreness: 1, time: 90, score: 100 },
    exercises: [
      {
        id: "goblet",
        name: "Goblet Squat",
        sets: [
          { w: 15, r: 11, rir: 4 },
          { w: 15, r: 12, rir: 2 },
          { w: 17.5, r: 8, rir: 2 },
          { w: 17.5, r: 11, rir: 1 },
        ],
      },
      {
        id: "rdl",
        name: "Romanian Deadlift",
        sets: [
          { w: 10, r: 10, rir: 4 },
          { w: 12.5, r: 10, rir: 2 },
          { w: 12.5, r: 10, rir: 2 },
          { w: 12.5, r: 11, rir: 2 },
        ],
      },
      {
        id: "lunge",
        name: "DB Reverse Lunge",
        sets: [
          { w: 10, r: 6, rir: 2 },
          { w: 10, r: 8, rir: 1 },
          { w: 10, r: 4, rir: 1 },
        ],
      },
      {
        id: "legcurl",
        name: "Leg Curl",
        sets: [
          { w: 40, r: 7, rir: 2 },
          { w: 40, r: 9, rir: 0 },
          { w: 40, r: 8, rir: 0 },
        ],
      },
      {
        id: "legpress",
        name: "Leg Press",
        sets: [
          { w: 100, r: 10, rir: 2 },
          { w: 115, r: 10, rir: 3 },
          { w: 115, r: 10, rir: 1 },
        ],
      },
    ],
  },
  {
    id: "s0816",
    date: "2026-08-16",
    day: "A",
    vol: 2330,
    sets: 23,
    reps: 330,
    mins: 76,
    readiness: { sleep: 4, energy: 4, soreness: 2, time: 90, score: 80 },
    exercises: [
      {
        id: "bench",
        name: "Dumbbell Bench Press",
        sets: [
          { w: 35, r: 10, rir: 2 },
          { w: 35, r: 10, rir: 2 },
          { w: 35, r: 6, rir: 2 },
          { w: 35, r: 4, rir: 1 },
        ],
      },
      {
        id: "ohp",
        name: "Dumbbell Shoulder Press",
        sets: [
          { w: 12.5, r: 4, rir: 1 },
          { w: 12.5, r: 6, rir: 2 },
          { w: 12.5, r: 5, rir: 1 },
          { w: 12.5, r: 6, rir: 2 },
        ],
      },
      {
        id: "incline",
        name: "Incline DB Press",
        sets: [
          { w: 12.5, r: 8, rir: 2 },
          { w: 12.5, r: 8, rir: 1 },
          { w: 12.5, r: 6, rir: 1 },
        ],
      },
      {
        id: "lateral",
        name: "Lateral Raise",
        sets: [
          { w: 7.5, r: 7, rir: 2 },
          { w: 7.5, r: 7, rir: 2 },
          { w: 7.5, r: 7, rir: 1 },
        ],
      },
      {
        id: "pushdown",
        name: "Triceps Pushdown",
        sets: [
          { w: 22.5, r: 10, rir: 2 },
          { w: 22.5, r: 10, rir: 2 },
          { w: 22.5, r: 6, rir: 1 },
        ],
      },
    ],
  },
  {
    id: "s0819",
    date: "2026-08-19",
    day: "B",
    vol: 3460,
    sets: 17,
    reps: 120,
    mins: 55,
    notes: "Low food and energy; skipped face pulls and abs.",
    readiness: { sleep: 3, energy: 3, soreness: 1, time: 90, score: 73 },
    exercises: [
      {
        id: "lat",
        name: "Lat Pulldown",
        sets: [
          { w: 60, r: 4, rir: 1 },
          { w: 60, r: 6, rir: 1 },
          { w: 60, r: 7, rir: 1 },
          { w: 60, r: 6, rir: 1 },
        ],
      },
      {
        id: "dbrow",
        name: "Dumbbell Row",
        sets: [
          { w: 15, r: 10, rir: 3 },
          { w: 15, r: 10, rir: 2 },
          { w: 15, r: 10, rir: 1 },
        ],
      },
      {
        id: "row",
        name: "Seated Cable Row",
        sets: [
          { w: 50, r: 6, rir: 4 },
          { w: 50, r: 7, rir: 2 },
          { w: 50, r: 7, rir: 1 },
        ],
      },
      {
        id: "ez",
        name: "EZ-Bar Curl",
        sets: [
          { w: 15, r: 7, rir: 2 },
          { w: 15, r: 5, rir: 1 },
          { w: 15, r: 5, rir: 1 },
        ],
      },
    ],
  },
  {
    id: "s0822",
    date: "2026-08-22",
    day: "C",
    vol: 7180,
    sets: 23,
    reps: 221,
    mins: 95,
    readiness: { sleep: 4, energy: 5, soreness: 1, time: 90, score: 93 },
    exercises: [
      {
        id: "goblet",
        name: "Goblet Squat",
        sets: [
          { w: 17.5, r: 8, rir: 5 },
          { w: 17.5, r: 10, rir: 3 },
          { w: 17.5, r: 10, rir: 3 },
          { w: 17.5, r: 10, rir: 2 },
        ],
      },
      {
        id: "rdl",
        name: "Romanian Deadlift",
        sets: [
          { w: 10, r: 10, rir: 2 },
          { w: 10, r: 10, rir: 3 },
          { w: 10, r: 10, rir: 3 },
          { w: 10, r: 12, rir: 3 },
        ],
      },
      {
        id: "legcurl",
        name: "Leg Curl",
        sets: [
          { w: 40, r: 11, rir: 2 },
          { w: 40, r: 11, rir: 2 },
          { w: 50, r: 8, rir: 2 },
        ],
      },
      {
        id: "legpress",
        name: "Leg Press",
        sets: [
          { w: 130, r: 3, rir: 2 },
          { w: 130, r: 6, rir: 2 },
          { w: 130, r: 7, rir: 0 },
        ],
      },
    ],
  },
  {
    id: "s0824",
    date: "2026-08-24",
    day: "A",
    vol: 2233,
    sets: 17,
    reps: 118,
    mins: 89,
    readiness: { sleep: 4, energy: 4, soreness: 2, time: 75, score: 80 },
    exercises: [
      {
        id: "bench",
        name: "Barbell Bench Press",
        sets: [
          { w: 35, r: 7, rir: 3 },
          { w: 35, r: 7, rir: 2 },
          { w: 37.5, r: 6, rir: 1 },
          { w: 37.5, r: 4, rir: 1 },
        ],
      },
      {
        id: "ohp",
        name: "Dumbbell Shoulder Press",
        sets: [
          { w: 15, r: 5, rir: 2 },
          { w: 15, r: 5, rir: 0 },
          { w: 15, r: 5, rir: 1 },
          { w: 15, r: 6, rir: 1 },
        ],
      },
      {
        id: "incline",
        name: "Incline DB Press",
        sets: [
          { w: 12.5, r: 7, rir: 1 },
          { w: 12.5, r: 7, rir: 1 },
          { w: 12.5, r: 9, rir: 1 },
        ],
      },
      {
        id: "lateral",
        name: "Lateral Raise",
        sets: [
          { w: 7.5, r: 9, rir: 2 },
          { w: 7.5, r: 9, rir: 2 },
          { w: 7.5, r: 10, rir: 2 },
        ],
      },
      {
        id: "pushdown",
        name: "Triceps Pushdown",
        sets: [
          { w: 22.5, r: 10, rir: 2 },
          { w: 27.5, r: 6, rir: 0 },
          { w: 27.5, r: 6 },
        ],
      },
    ],
  },
  {
    id: "s0826",
    date: "2026-08-26",
    day: "B",
    vol: 4373,
    sets: 20,
    reps: 128,
    mins: 94,
    readiness: { sleep: 4, energy: 4, soreness: 1, time: 90, score: 87 },
    exercises: [
      {
        id: "dbrow",
        name: "Dumbbell Row",
        sets: [
          { w: 17.5, r: 10, rir: 2 },
          { w: 17.5, r: 11, rir: 2 },
          { w: 17.5, r: 12, rir: 0 },
        ],
      },
      {
        id: "row",
        name: "Seated Cable Row",
        sets: [
          { w: 50, r: 12, rir: 2 },
          { w: 60, r: 8, rir: 1 },
          { w: 60, r: 6, rir: 0 },
        ],
      },
      {
        id: "reversepec",
        name: "Reverse Pec Deck",
        sets: [
          { w: 30, r: 10, rir: 2 },
          { w: 30, r: 10, rir: 2 },
          { w: 30, r: 10, rir: 2 },
        ],
      },
      {
        id: "ez",
        name: "EZ-Bar Curl",
        sets: [
          { w: 20, r: 5, rir: 1 },
          { w: 20, r: 4, rir: 1 },
          { w: 20, r: 4, rir: 0 },
        ],
      },
      {
        id: "lat",
        name: "Lat Pulldown",
        sets: [
          { w: 70, r: 5, rir: 2 },
          { w: 70, r: 6, rir: 0 },
          { w: 70, r: 5, rir: 0 },
        ],
      },
    ],
  },
  {
    id: "s0829",
    date: "2026-08-29",
    day: "C",
    vol: 2565,
    sets: 13,
    reps: 132,
    mins: 82,
    readiness: { sleep: 3, energy: 4, soreness: 2, time: 90, score: 73 },
    exercises: [
      {
        id: "goblet",
        name: "Goblet Squat",
        sets: [
          { w: 17.5, r: 10, rir: 4 },
          { w: 17.5, r: 8, rir: 4 },
          { w: 17.5, r: 10, rir: 3 },
        ],
      },
      {
        id: "rdl",
        name: "Romanian Deadlift",
        sets: [
          { w: 10, r: 10, rir: 2 },
          { w: 10, r: 12, rir: 2 },
          { w: 10, r: 12, rir: 2 },
        ],
      },
      {
        id: "lunge",
        name: "DB Reverse Lunge",
        sets: [
          { w: 10, r: 8, rir: 2 },
          { w: 10, r: 8, rir: 2 },
        ],
      },
      {
        id: "legcurl",
        name: "Leg Curl",
        sets: [
          { w: 50, r: 8, rir: 2 },
          { w: 50, r: 9, rir: 1 },
          { w: 50, r: 7, rir: 0 },
        ],
      },
    ],
  },
  {
    id: "s0831",
    date: "2026-08-31",
    day: "A",
    vol: 2025,
    sets: 14,
    reps: 106,
    mins: 58,
    readiness: { sleep: 3, energy: 3, soreness: 2, time: 90, score: 67 },
    exercises: [
      {
        id: "bench",
        name: "Barbell Bench Press",
        sets: [
          { w: 35, r: 8, rir: 2 },
          { w: 37.5, r: 6, rir: 1 },
          { w: 37.5, r: 6, rir: 1 },
          { w: 40, r: 6, rir: 0 },
        ],
      },
      {
        id: "ohp",
        name: "Dumbbell Shoulder Press",
        sets: [
          { w: 12.5, r: 6, rir: 2 },
          { w: 12.5, r: 7, rir: 1 },
          { w: 15, r: 7, rir: 1 },
        ],
      },
      {
        id: "incline",
        name: "Incline DB Press",
        sets: [
          { w: 15, r: 6, rir: 2 },
          { w: 15, r: 7, rir: 1 },
        ],
      },
      {
        id: "lateral",
        name: "Lateral Raise",
        sets: [
          { w: 7.5, r: 10, rir: 2 },
          { w: 7.5, r: 10, rir: 2 },
          { w: 7.5, r: 11, rir: 1 },
        ],
      },
      {
        id: "pushdown",
        name: "Triceps Pushdown",
        sets: [
          { w: 22.5, r: 8, rir: 2 },
          { w: 22.5, r: 8, rir: 2 },
        ],
      },
    ],
  },
];

export const PROGRAM: WorkoutDay[] = [
  {
    id: "A",
    name: "Pause strength",
    focus: "Paused bench · legs · arm strength",
    duration: 82,
    warmup: [
      "5 min easy row or bike",
      "Shoulder CARs × 5/side",
      "Bodyweight squat × 10",
      "2–3 bench ramp sets",
    ],
    exercises: [
      {
        id: "a-jump",
        name: "Box Jump",
        category: "power",
        sets: 3,
        reps: "3",
        rest: 75,
        initialLoad: 0,
        increment: 0,
        cue: "Stop each set while jumps are crisp.",
        swap: "Fast bodyweight squat",
      },
      {
        id: "a-bench",
        name: "Paused Barbell Bench Press",
        category: "strength",
        sets: 5,
        reps: "4-5",
        rest: 180,
        initialLoad: 35,
        increment: 2.5,
        cue: "Pause for one second on the chest; keep 2 reps in reserve in week 6.",
        swap: "Chest Press Machine",
      },
      {
        id: "a-row",
        name: "Seated Cable Row",
        category: "strength",
        sets: 4,
        reps: "6-8",
        rest: 150,
        initialLoad: 55,
        increment: 5,
        cue: "Drive elbows back without leaning.",
        swap: "Chest-Supported DB Row",
      },
      {
        id: "a-leg",
        name: "Leg Press",
        category: "strength",
        sets: 3,
        reps: "6-8",
        rest: 150,
        initialLoad: 120,
        increment: 5,
        cue: "Controlled depth; keep hips planted.",
        swap: "Goblet Squat",
      },
      {
        id: "a-ohp",
        name: "Dumbbell Shoulder Press",
        category: "hypertrophy",
        sets: 3,
        reps: "6-8",
        rest: 120,
        initialLoad: 12.5,
        increment: 2.5,
        cue: "Use a neutral grip if shoulders prefer it.",
        swap: "Machine Shoulder Press",
      },
      {
        id: "a-curl",
        name: "Cable Curl",
        category: "hypertrophy",
        sets: 3,
        reps: "8-12",
        rest: 90,
        initialLoad: 17.5,
        increment: 2.5,
        cue: "Keep upper arms quiet.",
        swap: "EZ-Bar Curl",
      },
      {
        id: "a-tri",
        name: "Overhead Cable Triceps Extension",
        category: "hypertrophy",
        sets: 3,
        reps: "8-12",
        rest: 90,
        initialLoad: 17.5,
        increment: 2.5,
        cue: "Keep ribs down and let the elbows flex fully.",
        swap: "Triceps Pushdown",
      },
    ],
  },
  {
    id: "B",
    name: "Pull + speed",
    focus: "Vertical pull strength · controlled squat · arms",
    duration: 86,
    warmup: [
      "5 min incline walk",
      "Dead hang × 20 sec",
      "Hip 90/90 switches × 8",
      "2 lat-pulldown ramp sets",
    ],
    exercises: [
      {
        id: "b-jump",
        name: "Countermovement Jump",
        category: "power",
        sets: 3,
        reps: "3",
        rest: 75,
        initialLoad: 0,
        increment: 0,
        cue: "Full reset between reps; land softly.",
        swap: "Fast bodyweight squat",
      },
      {
        id: "b-lat",
        name: "Neutral-Grip Lat Pulldown",
        category: "strength",
        sets: 4,
        reps: "5-7",
        rest: 180,
        initialLoad: 60,
        increment: 5,
        cue: "Chest tall; stop before technique breaks.",
        swap: "Assisted Pull-Up",
      },
      {
        id: "b-goblet",
        name: "Tempo Goblet Squat",
        category: "strength",
        sets: 3,
        reps: "6-8",
        rest: 150,
        initialLoad: 17.5,
        increment: 2.5,
        cue: "Lower for three seconds; use a comfortable, pain-free depth.",
        swap: "Leg Press",
      },
      {
        id: "b-incline",
        name: "Incline DB Press",
        category: "hypertrophy",
        sets: 3,
        reps: "8-10",
        rest: 120,
        initialLoad: 15,
        increment: 2.5,
        cue: "Keep shoulder blades set.",
        swap: "Incline Chest Machine",
      },
      {
        id: "b-dbrow",
        name: "Single-Arm Cable Row",
        category: "hypertrophy",
        sets: 3,
        reps: "8-12",
        rest: 120,
        initialLoad: 25,
        increment: 2.5,
        cue: "Reach long, then drive the elbow back without rotating.",
        swap: "Seated Cable Row",
      },
      {
        id: "b-lateral",
        name: "Cable Lateral Raise",
        category: "hypertrophy",
        sets: 3,
        reps: "12-15",
        rest: 75,
        initialLoad: 7.5,
        increment: 1,
        cue: "Lead with elbows; stop near shoulder height.",
        swap: "Dumbbell Lateral Raise",
      },
      {
        id: "b-hammer",
        name: "Hammer Curl",
        category: "hypertrophy",
        sets: 3,
        reps: "8-12",
        rest: 75,
        initialLoad: 7.5,
        increment: 2.5,
        cue: "No shoulder roll.",
        swap: "Rope Hammer Curl",
      },
      {
        id: "b-tri",
        name: "Overhead Cable Triceps Extension",
        category: "hypertrophy",
        sets: 3,
        reps: "8-12",
        rest: 75,
        initialLoad: 17.5,
        increment: 2.5,
        cue: "Keep ribs down and elbows pointed forward.",
        swap: "Triceps Pushdown",
      },
    ],
  },
  {
    id: "C",
    name: "Volume + arms",
    focus: "Close-grip press · glutes · arm volume",
    duration: 84,
    warmup: [
      "5 min easy cycle",
      "Ankle rocks × 10/side",
      "Glute bridge × 12",
      "2 bench ramp sets",
    ],
    exercises: [
      {
        id: "c-broad",
        name: "Standing Broad Jump",
        category: "power",
        sets: 4,
        reps: "2",
        rest: 75,
        initialLoad: 0,
        increment: 0,
        cue: "Jump far only while landing is quiet and balanced.",
        swap: "Low box jump",
      },
      {
        id: "c-bench",
        name: "Close-Grip Bench Press",
        category: "strength",
        sets: 4,
        reps: "6-8",
        rest: 150,
        initialLoad: 32.5,
        increment: 2.5,
        cue: "Smooth volume work; keep 2 reps in reserve.",
        swap: "Chest Press Machine",
      },
      {
        id: "c-hip",
        name: "Hip Thrust",
        category: "strength",
        sets: 4,
        reps: "8-10",
        rest: 150,
        initialLoad: 25,
        increment: 5,
        cue: "Finish through glutes, not the low back.",
        swap: "Cable Pull-Through",
      },
      {
        id: "c-lat",
        name: "Chest-Supported DB Row",
        category: "hypertrophy",
        sets: 3,
        reps: "8-10",
        rest: 120,
        initialLoad: 17.5,
        increment: 2.5,
        cue: "Pause briefly at the top; keep the torso supported.",
        swap: "Lat Pulldown",
      },
      {
        id: "c-legcurl",
        name: "Leg Curl",
        category: "hypertrophy",
        sets: 3,
        reps: "10-12",
        rest: 105,
        initialLoad: 45,
        increment: 5,
        cue: "Control the lowering for 2 seconds.",
        swap: "Glute Bridge",
      },
      {
        id: "c-chest",
        name: "Chest Press Machine",
        category: "hypertrophy",
        sets: 2,
        reps: "10-12",
        rest: 105,
        initialLoad: 35,
        increment: 5,
        cue: "Stop short of shoulder discomfort.",
        swap: "Cable Fly",
      },
      {
        id: "c-lateral",
        name: "Cable Lateral Raise",
        category: "hypertrophy",
        sets: 3,
        reps: "12-15",
        rest: 75,
        initialLoad: 7.5,
        increment: 1,
        cue: "Controlled reps; no swinging.",
        swap: "Dumbbell Lateral Raise",
      },
      {
        id: "c-curl",
        name: "Preacher Curl",
        category: "hypertrophy",
        sets: 3,
        reps: "10-12",
        rest: 90,
        initialLoad: 17.5,
        increment: 2.5,
        cue: "Keep 1–2 reps in reserve.",
        swap: "Cable Curl",
      },
      {
        id: "c-tri",
        name: "Triceps Pushdown",
        category: "hypertrophy",
        sets: 3,
        reps: "10-12",
        rest: 90,
        initialLoad: 22.5,
        increment: 2.5,
        cue: "Full extension without shoulder drift.",
        swap: "Single-Arm Cable Pushdown",
      },
    ],
  },
];

export const SCIENCE_LINKS = [
  {
    label: "2026 ACSM position stand",
    href: "https://pubmed.ncbi.nlm.nih.gov/41843416/",
  },
  {
    label: "Resistance prescription meta-analysis",
    href: "https://pubmed.ncbi.nlm.nih.gov/37414459/",
  },
  {
    label: "Proximity-to-failure meta-analysis",
    href: "https://pubmed.ncbi.nlm.nih.gov/36334240/",
  },
  {
    label: "2026 volume and frequency dose-response",
    href: "https://pubmed.ncbi.nlm.nih.gov/41343037/",
  },
];
