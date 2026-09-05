"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Cloud,
  Download,
  Dumbbell,
  FileUp,
  Flame,
  Gauge,
  History as HistoryIcon,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  MoonStar,
  Pause,
  Play,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  StopCircle,
  Target,
  TimerReset,
  TrendingUp,
  UserRound,
  Utensils,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HISTORY,
  PROFILE,
  PROGRAM,
  SCIENCE_LINKS,
  type Exercise,
  type HistorySession,
  type LoggedSet,
} from "./data";

type NavKey = "overview" | "train" | "progress" | "coach" | "profile";
type WorkoutSet = LoggedSet & { done: boolean };
type WorkoutState = Record<string, WorkoutSet[]>;
type ChatMessage = { role: "coach" | "user"; text: string };
type Viewer = { id: string; email: string; displayName: string; isOwner: boolean };

const NAV = [
  { value: "overview" as NavKey, label: "Overview", icon: LayoutDashboard },
  { value: "train" as NavKey, label: "Train", icon: Dumbbell },
  { value: "progress" as NavKey, label: "Progress", icon: BarChart3 },
  { value: "coach" as NavKey, label: "AI Coach", icon: MessageSquareText },
  { value: "profile" as NavKey, label: "Profile", icon: UserRound },
];

const aliases: Record<string, string[]> = {
  "Paused Barbell Bench Press": ["Barbell Bench Press", "Bench Press"],
  "Close-Grip Bench Press": ["Barbell Bench Press", "Bench Press"],
  "Barbell Bench Press": [
    "Barbell Bench Press",
    "Bench Press",
    "Dumbbell Bench Press",
  ],
  "Chest-Supported DB Row": ["Chest-Supported DB Row", "Dumbbell Row"],
  "Single-Arm Cable Row": ["Seated Cable Row", "Dumbbell Row"],
  "Lat Pulldown": ["Lat Pulldown"],
  "Neutral-Grip Lat Pulldown": ["Lat Pulldown"],
  "Seated Cable Row": ["Seated Cable Row"],
  "Goblet Squat": ["Goblet Squat"],
  "Tempo Goblet Squat": ["Goblet Squat"],
  "Leg Press": ["Leg Press"],
  "Leg Curl": ["Leg Curl"],
  "Dumbbell Shoulder Press": ["Dumbbell Shoulder Press"],
  "Incline DB Press": ["Incline DB Press"],
  "Lateral Raise": ["Lateral Raise"],
  "Cable Lateral Raise": ["Lateral Raise"],
  "EZ-Bar Curl": ["EZ-Bar Curl"],
  "Cable Curl": ["EZ-Bar Curl", "Cable Curl"],
  "Preacher Curl": ["EZ-Bar Curl", "Cable Curl", "Preacher Curl"],
  "Hammer Curl": ["Hammer Curl"],
  "Triceps Pushdown": ["Triceps Pushdown"],
  "Overhead Cable Triceps Extension": [
    "Overhead Cable Triceps Extension",
    "Triceps Pushdown",
  ],
  "Hip Thrust": ["Hip Thrust"],
};

function range(reps: string) {
  const values = reps.match(/\d+/g)?.map(Number) || [1];
  return { low: values[0], high: values[1] || values[0] };
}

function validSets(sets: LoggedSet[]) {
  return sets.filter(
    (set) =>
      Number.isFinite(set.w) &&
      Number.isFinite(set.r) &&
      set.w >= 0 &&
      set.w <= 500 &&
      set.r > 0 &&
      set.r <= 100,
  );
}

function lastPerformance(name: string, sessions: HistorySession[]) {
  const names = aliases[name] || [name];
  for (const session of [...sessions].sort((a, b) =>
    b.date.localeCompare(a.date),
  )) {
    const found = session.exercises?.find((ex) =>
      names.some(
        (candidate) =>
          ex.name.toLowerCase().includes(candidate.toLowerCase()) ||
          candidate.toLowerCase().includes(ex.name.toLowerCase()),
      ),
    );
    const sets = found ? validSets(found.sets) : [];
    if (sets.length) return { session, sets };
  }
  return null;
}

function suggestion(
  exercise: Exercise,
  sessions: HistorySession[],
  blockWeek: number,
) {
  const previous = lastPerformance(exercise.name, sessions);
  if (!previous || exercise.initialLoad === 0)
    return {
      load: exercise.initialLoad,
      note: exercise.initialLoad === 0 ? "Quality first" : "Starting target",
      previous: null,
    };
  if (blockWeek === 6 && !previous.session.id.startsWith("block2-")) {
    return {
      load: exercise.initialLoad,
      note: "Week 6 recalibration",
      previous,
    };
  }
  const { low, high } = range(exercise.reps);
  const workSets = previous.sets.slice(-exercise.sets);
  const avgReps =
    workSets.reduce((sum, set) => sum + set.r, 0) / workSets.length;
  const rirValues = workSets
    .map((set) => set.rir)
    .filter((value): value is number => typeof value === "number");
  const avgRir = rirValues.length
    ? rirValues.reduce((a, b) => a + b, 0) / rirValues.length
    : 1.5;
  const load =
    workSets.map((set) => set.w).sort((a, b) => b - a)[
      Math.min(1, workSets.length - 1)
    ] ?? exercise.initialLoad;
  if (blockWeek >= 10)
    return {
      load: Math.max(
        exercise.increment,
        Math.round((load * 0.9) / exercise.increment) * exercise.increment,
      ),
      note: "Week 10 fatigue drop",
      previous,
    };
  if (avgReps >= high && avgRir >= 1)
    return {
      load: load + exercise.increment,
      note: `Add ${exercise.increment} kg`,
      previous,
    };
  if (avgReps < low || avgRir < 0.75)
    return {
      load: Math.max(exercise.increment, load - exercise.increment),
      note: "Small reset for clean reps",
      previous,
    };
  return { load, note: "Keep load; add a rep", previous };
}

function readinessLabel(score: number) {
  if (score >= 82) return { label: "Ready to push", tone: "good" };
  if (score >= 66) return { label: "Train, hold reserve", tone: "watch" };
  return { label: "Reduce one set", tone: "low" };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

function SectionTitle({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <span className="kicker">{kicker}</span>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default function CoachApp({ viewer }: { viewer: Viewer }) {
  const [tab, setTab] = useState<NavKey>("overview");
  const [dayIndex, setDayIndex] = useState(1);
  const [sessions, setSessions] = useState<HistorySession[]>(
    viewer.isOwner ? HISTORY : [],
  );
  const [sleep, setSleep] = useState(5.5);
  const [energy, setEnergy] = useState(3);
  const [soreness, setSoreness] = useState(2);
  const [apiKey, setApiKey] = useState("");
  const [workout, setWorkout] = useState<WorkoutState>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [rest, setRest] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [notes, setNotes] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "coach",
      text: "Your five-week base block is complete. Block 2 changes the exercise angles and rep emphasis without discarding the lifts you are progressing on. Week 6 is a recalibration week: leave 2–3 reps in reserve, then build through weeks 7–9 before a lower-fatigue review in week 10.",
    },
  ]);
  const [message, setMessage] = useState("");
  const [coachBusy, setCoachBusy] = useState(false);
  const [syncReady, setSyncReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "loading" | "saved" | "saving" | "error"
  >("loading");
  const fileRef = useRef<HTMLInputElement>(null);

  const day = PROGRAM[dayIndex];
  const blockTwoSessions = sessions.filter((session) =>
    session.id.startsWith("block2-"),
  ).length;
  const blockWeek = Math.min(10, 6 + Math.floor(blockTwoSessions / 3));
  const readiness = Math.round(
    Math.min(100, Math.max(35, 48 + sleep * 5 + energy * 7 - soreness * 4)),
  );
  const ready = readinessLabel(readiness);
  const completedSets = Object.values(workout)
    .flat()
    .filter((set) => set.done).length;
  const totalSets = day.exercises.reduce((sum, ex) => sum + ex.sets, 0);

  useEffect(() => {
    let active = true;
    fetch("/api/state")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Sync unavailable");
        if (active && payload.state) {
          if (Array.isArray(payload.state.sessions)) setSessions(payload.state.sessions);
          if (Array.isArray(payload.state.chat)) setChat(payload.state.chat);
          if (typeof payload.state.dayIndex === "number") setDayIndex(payload.state.dayIndex);
        }
        if (active) {
          setSyncReady(true);
          setSaveStatus("saved");
        }
      })
      .catch(() => {
        if (active) {
          setSyncReady(true);
          setSaveStatus("error");
          toast.error("Cloud sync is temporarily unavailable. Keep this tab open.");
        }
      });
    try {
      const deviceKey = localStorage.getItem(`atrin-coach-api-${viewer.id}`);
      if (deviceKey) setApiKey(deviceKey);
    } catch {
      // API-key storage is an optional device preference.
    }
    return () => {
      active = false;
    };
  }, [viewer.id]);

  useEffect(() => {
    if (!syncReady) return;
    setSaveStatus("saving");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessions, chat: chat.slice(-30), dayIndex }),
        });
        if (!response.ok) throw new Error("Save failed");
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [sessions, chat, dayIndex, syncReady]);

  useEffect(() => {
    try {
      localStorage.setItem(`atrin-coach-api-${viewer.id}`, apiKey);
    } catch {
      // The key remains usable for the current session.
    }
  }, [apiKey, viewer.id]);

  useEffect(() => {
    if (!restRunning || rest <= 0) return;
    const timer = window.setInterval(
      () =>
        setRest((value) => {
          if (value <= 1) {
            setRestRunning(false);
            toast.success("Rest complete — next set is ready.");
            return 0;
          }
          return value - 1;
        }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [restRunning, rest]);

  const trendData = useMemo(
    () =>
      sessions.map((session) => ({
        date: formatDate(session.date),
        volume: Math.round(session.vol),
        minutes: session.mins,
        readiness: session.readiness?.score ?? null,
      })),
    [sessions],
  );

  const benchTrend = useMemo(
    () =>
      sessions
        .flatMap((session) => session.exercises || [])
        .filter((exercise) => exercise.name.includes("Bench Press"))
        .map((exercise, index) => {
          const best = validSets(exercise.sets).reduce(
            (top, set) => Math.max(top, set.w * (1 + set.r / 30)),
            0,
          );
          return { session: index + 1, e1rm: Math.round(best * 10) / 10 };
        }),
    [sessions],
  );

  function beginWorkout(index = dayIndex) {
    const selected = PROGRAM[index];
    const next: WorkoutState = {};
    selected.exercises.forEach((exercise) => {
      const target = suggestion(exercise, sessions, blockWeek).load;
      next[exercise.id] = Array.from({ length: exercise.sets }, () => ({
        w: target,
        r: range(exercise.reps).low,
        rir: 2,
        done: false,
      }));
    });
    setDayIndex(index);
    setWorkout(next);
    setStartedAt(Date.now());
    setTab("train");
    toast.success(`${selected.id} · ${selected.name} is ready.`);
  }

  function updateSet(
    exerciseId: string,
    index: number,
    field: "w" | "r" | "rir",
    value: number,
  ) {
    setWorkout((current) => ({
      ...current,
      [exerciseId]: (current[exerciseId] || []).map((set, i) =>
        i === index ? { ...set, [field]: value } : set,
      ),
    }));
  }

  function completeSet(exercise: Exercise, index: number) {
    setWorkout((current) => ({
      ...current,
      [exercise.id]: (current[exercise.id] || []).map((set, i) =>
        i === index ? { ...set, done: !set.done } : set,
      ),
    }));
    if (!workout[exercise.id]?.[index]?.done && exercise.rest) {
      setRest(exercise.rest);
      setRestRunning(true);
    }
  }

  function finishWorkout() {
    const exercises = day.exercises
      .map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: (workout[exercise.id] || [])
          .filter((set) => set.done)
          .map(({ w, r, rir }) => ({ w, r, rir })),
      }))
      .filter((exercise) => exercise.sets.length);
    if (!exercises.length) {
      toast.error("Complete at least one set first.");
      return;
    }
    const allSets = exercises.flatMap((exercise) => exercise.sets);
    const now = new Date();
    const session: HistorySession = {
      id: `block2-${now.toISOString()}-${day.id}`,
      date: now.toISOString().slice(0, 10),
      day: day.id,
      vol: Math.round(allSets.reduce((sum, set) => sum + set.w * set.r, 0)),
      sets: allSets.length,
      reps: allSets.reduce((sum, set) => sum + set.r, 0),
      mins: Math.max(
        1,
        Math.round((Date.now() - (startedAt || Date.now())) / 60000),
      ),
      notes,
      readiness: {
        sleep: Math.max(1, Math.round(sleep / 2)),
        energy,
        soreness,
        time: 90,
        score: readiness,
      },
      exercises,
    };
    setSessions((current) => [...current, session]);
    setWorkout({});
    setStartedAt(null);
    setNotes("");
    setDayIndex((dayIndex + 1) % PROGRAM.length);
    setTab("overview");
    toast.success("Workout saved. Next targets updated.");
  }

  async function importHistory(file?: File) {
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text()) as {
        sessions?: Record<string, unknown>[];
      };
      const incoming = Array.isArray(raw.sessions) ? raw.sessions : [];
      if (!incoming.length) throw new Error("No sessions found");
      const clean: HistorySession[] = incoming.map((session, sessionIndex) => {
        const date = String(session.date || new Date().toISOString().slice(0, 10));
        const day = String(session.day || "A").toUpperCase();
        const exercises = Array.isArray(session.exercises)
          ? session.exercises
              .filter(
                (exercise): exercise is Record<string, unknown> =>
                  typeof exercise === "object" && exercise !== null,
              )
              .map((exercise, exerciseIndex) => {
                const rawSets = Array.isArray(exercise.sets)
                  ? exercise.sets
                      .filter(
                        (set): set is Record<string, unknown> =>
                          typeof set === "object" && set !== null,
                      )
                      .map((set) => ({
                        w: Number(set.w),
                        r: Number(set.r),
                        rir:
                          set.rir === null || set.rir === undefined
                            ? null
                            : Number(set.rir),
                      }))
                  : [];
                return {
                  id: String(exercise.id || `imported-exercise-${exerciseIndex}`),
                  name: String(exercise.name || "Imported exercise"),
                  sets: validSets(rawSets),
                };
              })
          : [];
        return {
          id: String(session.id || `${date}-${day}-${sessionIndex}`),
          date,
          day,
          vol: Number(session.vol) || 0,
          sets: Number(session.sets) || 0,
          reps: Number(session.reps) || 0,
          mins: Number(session.mins) || 0,
          notes: typeof session.notes === "string" ? session.notes : "",
          readiness: null,
          exercises,
        };
      });
      const merged = new Map(
        [...sessions, ...clean].map((session) => [session.id, session]),
      );
      setSessions(
        [...merged.values()].sort((a, b) => a.date.localeCompare(b.date)),
      );
      toast.success(
        `${clean.length} sessions imported. Invalid set values were ignored.`,
      );
    } catch {
      toast.error("That file is not a compatible workout-history JSON export.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 3,
            exportedAt: new Date().toISOString(),
            profile: PROFILE,
            sessions,
            program: PROGRAM,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "atrin-performance-coach-export.json";
    link.click();
    URL.revokeObjectURL(href);
  }

  async function askCoach(prompt = message) {
    const question = prompt.trim();
    if (!question || coachBusy) return;
    setChat((current) => [...current, { role: "user", text: question }]);
    setMessage("");
    setCoachBusy(true);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-key": apiKey } : {}),
        },
        body: JSON.stringify({
          message: question,
          context: {
            profile: PROFILE,
            readiness: {
              sleepHours: sleep,
              energy,
              soreness,
              score: readiness,
            },
          currentDay: day,
          trainingBlock: `Block 2, week ${blockWeek}; week 6 recalibration, weeks 7–9 build, week 10 performance review and fatigue reduction`,
          sessions: sessions.slice(-8),
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Coach unavailable");
      setChat((current) => [...current, { role: "coach", text: data.text }]);
    } catch (error) {
      setChat((current) => [
        ...current,
        {
          role: "coach",
          text: `I couldn’t connect to Gemini: ${error instanceof Error ? error.message : "unknown error"}. Add or verify your API key in Coach settings.`,
        },
      ]);
    }
    setCoachBusy(false);
  }

  return (
    <main className="app-shell">
      <Toaster position="top-center" richColors />
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as NavKey)}
        className="app-tabs"
      >
        <aside className="sidebar">
          <div className="brand-lockup">
            <div className="brand-mark">
              <Zap />
            </div>
            <div>
              <strong>ATRIN</strong>
              <span>Performance Coach</span>
            </div>
          </div>
          <TabsList orientation="vertical" variant="line" className="side-nav">
            {NAV.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                <item.icon />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="sidebar-foot">
            <Cloud />
            <div>
              <span>Account sync</span>
              <strong>
                {saveStatus === "saved"
                  ? "Saved"
                  : saveStatus === "saving"
                    ? "Saving…"
                    : saveStatus === "loading"
                      ? "Loading…"
                      : "Retrying later"}
              </strong>
            </div>
          </div>
        </aside>

        <div className="main-column">
          <header className="topbar">
            <div>
              <span className="kicker">
                {new Intl.DateTimeFormat("en", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                }).format(new Date())}
              </span>
              <h1>
                Good evening, {viewer.isOwner ? "Atrin" : viewer.displayName.split(" ")[0]}.
              </h1>
            </div>
            <div className="top-actions">
              <div className="account-chip">
                <UserRound />
                <span>{viewer.email}</span>
                <a href="/signout-with-chatgpt?return_to=/" target="_top" aria-label="Sign out">
                  <LogOut />
                </a>
              </div>
              {rest > 0 && (
                <div className="rest-chip">
                  <TimerReset />
                  <strong>
                    {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}
                  </strong>
                  <button
                    onClick={() => setRestRunning(!restRunning)}
                    aria-label={
                      restRunning ? "Pause rest timer" : "Resume rest timer"
                    }
                  >
                    {restRunning ? <Pause /> : <Play />}
                  </button>
                </div>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings2 /> Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Training data</DialogTitle>
                    <DialogDescription>
                      Your history is private to {viewer.email} and syncs across devices.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="dialog-actions">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="application/json"
                      hidden
                      onChange={(event) =>
                        importHistory(event.target.files?.[0])
                      }
                    />
                    <Button onClick={() => fileRef.current?.click()}>
                      <FileUp /> Import JSON
                    </Button>
                    <Button variant="outline" onClick={exportData}>
                      <Download /> Export backup
                    </Button>
                  </div>
                  <p className="fine-print">
                    <ShieldCheck /> The bundled app uses summarized workout
                    data, not your raw chat export. If your GitHub repository is
                    public, keep personal exports out of it.
                  </p>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <TabsContent value="overview" className="page-content">
            <section className="hero-strip">
              <div className="hero-copy">
                <span className="kicker light">
                  Block 2 · Week {blockWeek} · Day {day.id}
                </span>
                <h2>{day.name}</h2>
                <p>
                  {day.focus}. Built from your recent performance and today’s
                  readiness.
                </p>
                <div className="hero-meta">
                  <span>
                    <Clock3 /> {day.duration} min
                  </span>
                  <span>
                    <Dumbbell /> {day.exercises.length} movements
                  </span>
                  <span>
                    <Target /> 1–3 RIR
                  </span>
                </div>
              </div>
              <Button className="hero-button" onClick={() => beginWorkout()}>
                <Play /> Start workout <ChevronRight />
              </Button>
            </section>

            <section className="readiness-grid">
              <div className="readiness-score">
                <div
                  className={`score-ring ${ready.tone}`}
              >
                  <span>{readiness}</span>
                  <small>/ 100</small>
                </div>
                <div>
                  <span className="kicker">Readiness</span>
                  <h3>{ready.label}</h3>
                  <p>
                    {sleep < 6
                      ? "Low sleep: keep main lifts, trim one accessory set if warm-ups feel slow."
                      : "Normal plan. Add load only when reps stay crisp."}
                  </p>
                </div>
              </div>
              <div className="readiness-controls">
                <label>
                  <span>
                    Sleep <b>{sleep.toFixed(1)} h</b>
                  </span>
                  <Slider
                    min={3}
                    max={9}
                    step={0.5}
                    value={[sleep]}
                    onValueChange={(value) => setSleep(value[0])}
                  />
                </label>
                <label>
                  <span>
                    Energy <b>{energy}/5</b>
                  </span>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[energy]}
                    onValueChange={(value) => setEnergy(value[0])}
                  />
                </label>
                <label>
                  <span>
                    Soreness <b>{soreness}/5</b>
                  </span>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[soreness]}
                    onValueChange={(value) => setSoreness(value[0])}
                  />
                </label>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="panel span-2">
                <SectionTitle
                  kicker="Adaptive targets"
                  title="What to do next"
                  action={
                    <button
                      className="text-button"
                      onClick={() => setTab("train")}
                    >
                      See full session <ArrowUpRight />
                    </button>
                  }
                />
                <div className="target-list">
                  {day.exercises.slice(1, 5).map((exercise, index) => {
                    const next = suggestion(exercise, sessions, blockWeek);
                    return (
                      <button
                        key={exercise.id}
                        onClick={() => beginWorkout()}
                        className="target-row"
                      >
                        <span className="target-index">0{index + 1}</span>
                        <span>
                          <strong>{exercise.name}</strong>
                          <small>
                            {exercise.sets} × {exercise.reps} · {exercise.rest}s
                            rest
                          </small>
                        </span>
                        <span className="target-load">
                          <strong>
                            {next.load ? `${next.load} kg` : "BW"}
                          </strong>
                          <small>{next.note}</small>
                        </span>
                        <ChevronRight />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="panel coach-card">
                <div className="panel-icon orange">
                  <Bot />
                </div>
                <span className="kicker">Coach note</span>
                <h3>Your strength is moving. Recovery is not.</h3>
                <p>
                  You reached 40 × 6 on bench, but your last readiness was 67.
                  Tonight, earn the increase through clean warm-ups.
                </p>
                <Button variant="outline" onClick={() => setTab("coach")}>
                  Ask Gemini <ArrowUpRight />
                </Button>
              </div>
              <div className="panel nutrition-card">
                <div className="panel-icon blue">
                  <Utensils />
                </div>
                <span className="kicker">Simple nutrition floor</span>
                <h3>120–160 g protein</h3>
                <p>
                  Use 3–4 protein feedings. Before a 9 p.m. session, choose a
                  familiar carb + protein meal 60–120 minutes before training.
                </p>
                <small>
                  Creatine: 3–5 g daily. Consistency matters more than timing.
                </small>
              </div>
              <div className="panel span-2 chart-panel">
                <SectionTitle
                  kicker="Training load"
                  title="Volume by session"
                />
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid stroke="#d9e0eb" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: "#edf2fa" }}
                        contentStyle={{
                          border: "1px solid #ccd5e3",
                          borderRadius: 10,
                        }}
                      />
                      <Bar
                        dataKey="volume"
                        fill="#1d56d8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="train" className="page-content">
            <SectionTitle
              kicker="Live session"
              title={`Day ${day.id} · ${day.name}`}
              action={
                <div className="day-switcher">
                  {PROGRAM.map((item, index) => (
                    <button
                      key={item.id}
                      className={index === dayIndex ? "active" : ""}
                      onClick={() => {
                        setDayIndex(index);
                        setWorkout({});
                        setStartedAt(null);
                      }}
                    >
                      {item.id}
                    </button>
                  ))}
                </div>
              }
            />
            {!startedAt ? (
              <section className="start-panel">
                <div>
                  <Activity />
                  <span className="kicker">Session plan</span>
                  <h2>{day.focus}</h2>
                  <p>{day.warmup.join(" · ")}</p>
                </div>
                <Button onClick={() => beginWorkout()}>
                  <Play /> Begin & load targets
                </Button>
              </section>
            ) : (
              <>
                <div className="session-progress">
                  <div>
                    <strong>
                      {completedSets} / {totalSets} sets
                    </strong>
                    <span>
                      {Math.round((completedSets / totalSets) * 100)}% complete
                    </span>
                  </div>
                  <Progress value={(completedSets / totalSets) * 100} />
                </div>
                <div className="exercise-stack">
                  {day.exercises.map((exercise, exerciseIndex) => {
                    const next = suggestion(exercise, sessions, blockWeek);
                    const sets = workout[exercise.id] || [];
                    return (
                      <article className="exercise-card" key={exercise.id}>
                        <header>
                          <div className="exercise-number">
                            {String(exerciseIndex + 1).padStart(2, "0")}
                          </div>
                          <div>
                            <span className={`type-label ${exercise.category}`}>
                              {exercise.category}
                            </span>
                            <h3>{exercise.name}</h3>
                            <p>{exercise.cue}</p>
                          </div>
                          <div className="exercise-target">
                            <strong>
                              {exercise.sets} × {exercise.reps}
                            </strong>
                            <span>{exercise.rest}s rest</span>
                          </div>
                        </header>
                        {next.previous && (
                          <div className="previous-line">
                            <HistoryIcon /> Last:{" "}
                            {formatDate(next.previous.session.date)} ·{" "}
                            {next.previous.sets
                              .map((set) => `${set.w}×${set.r}`)
                              .join(" / ")}
                            <span>Today: {next.load} kg</span>
                          </div>
                        )}
                        <div className="set-table">
                          <div className="set-head">
                            <span>Set</span>
                            <span>kg</span>
                            <span>reps</span>
                            <span>RIR</span>
                            <span>done</span>
                          </div>
                          {sets.map((set, index) => (
                            <div
                              className={`set-row ${set.done ? "done" : ""}`}
                              key={index}
                            >
                              <strong>{index + 1}</strong>
                              <Input
                                aria-label={`${exercise.name} set ${index + 1} weight`}
                                type="number"
                                step=".5"
                                value={set.w}
                                onChange={(event) =>
                                  updateSet(
                                    exercise.id,
                                    index,
                                    "w",
                                    Number(event.target.value),
                                  )
                                }
                              />
                              <Input
                                aria-label={`${exercise.name} set ${index + 1} reps`}
                                type="number"
                                value={set.r}
                                onChange={(event) =>
                                  updateSet(
                                    exercise.id,
                                    index,
                                    "r",
                                    Number(event.target.value),
                                  )
                                }
                              />
                              <Input
                                aria-label={`${exercise.name} set ${index + 1} reps in reserve`}
                                type="number"
                                min="0"
                                max="5"
                                value={set.rir ?? 2}
                                onChange={(event) =>
                                  updateSet(
                                    exercise.id,
                                    index,
                                    "rir",
                                    Number(event.target.value),
                                  )
                                }
                              />
                              <button
                                className="check-set"
                                onClick={() => completeSet(exercise, index)}
                                aria-label={`${set.done ? "Undo" : "Complete"} ${exercise.name} set ${index + 1}`}
                              >
                                <Check />
                              </button>
                            </div>
                          ))}
                        </div>
                        <footer>
                          <span>
                            Alternative: <b>{exercise.swap}</b>
                          </span>
                          <button
                            onClick={() =>
                              toast.info(
                                `Use ${exercise.swap} today and keep the same effort target.`,
                              )
                            }
                          >
                            Swap exercise
                          </button>
                        </footer>
                      </article>
                    );
                  })}
                </div>
                <div className="finish-panel">
                  <div>
                    <label htmlFor="session-notes">Session notes</label>
                    <Textarea
                      id="session-notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Technique, pain, energy, equipment changes…"
                    />
                  </div>
                  <Button onClick={finishWorkout}>
                    <StopCircle /> Finish & update targets
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="progress" className="page-content">
            <SectionTitle
              kicker={`${sessions.length} account sessions · Block 2, week ${blockWeek}`}
              title="Progress that changes the plan"
              action={
                <Button variant="outline" onClick={exportData}>
                  <Download /> Export
                </Button>
              }
            />
            <section className="metric-row">
              <Metric
                label="Body weight"
                value="74.0 kg"
                note="73.0 kg on Aug 8"
              />
              <Metric
                label="Bench estimate"
                value="≈ 48 kg"
                note="Recent barbell set: 40 × 6"
              />
              <Metric
                label="Best lat pulldown"
                value="70 × 6"
                note="Last set reached 0 RIR"
              />
              <Metric
                label="Average session"
                value={`${Math.round(sessions.reduce((s, x) => s + x.mins, 0) / Math.max(1, sessions.length))} min`}
                note={`${Math.round(sessions.reduce((s, x) => s + x.sets, 0) / Math.max(1, sessions.length))} working sets`}
              />
            </section>
            <section className="progress-grid">
              <div className="panel chart-panel">
                <SectionTitle kicker="Bench trend" title="Estimated 1RM" />
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={benchTrend}>
                      <CartesianGrid stroke="#d9e0eb" vertical={false} />
                      <XAxis
                        dataKey="session"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={["dataMin - 5", "dataMax + 5"]}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          border: "1px solid #ccd5e3",
                          borderRadius: 10,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="e1rm"
                        stroke="#f26a2e"
                        strokeWidth={3}
                        dot={{ fill: "#f26a2e", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="panel insight-panel">
                <span className="kicker">Data quality</span>
                <h3>
                  <CircleAlert /> One anomaly removed
                </h3>
                <p>
                  Your prior export listed an RDL set as 12.5 kg × 410 reps. It
                  is excluded from PRs and progression so it cannot distort
                  coaching.
                </p>
                <div className="insight-rule">
                  <strong>Current rule</strong>
                  <span>
                    Sets above 100 reps or 500 kg are ignored automatically.
                  </span>
                </div>
              </div>
            </section>
            <section className="panel history-panel">
              <SectionTitle kicker="History" title="Recent sessions" />
              <div className="history-table">
                <div className="history-head">
                  <span>Date</span>
                  <span>Day</span>
                  <span>Volume</span>
                  <span>Time</span>
                  <span>Ready</span>
                </div>
                {[...sessions]
                  .reverse()
                  .slice(0, 8)
                  .map((session) => (
                    <div className="history-row" key={session.id}>
                      <strong>{formatDate(session.date)}</strong>
                      <span>Day {session.day}</span>
                      <span>{session.vol.toLocaleString()} kg</span>
                      <span>{session.mins} min</span>
                      <span>{session.readiness?.score ?? "—"}</span>
                    </div>
                  ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="coach" className="page-content coach-page">
            <SectionTitle
              kicker="Gemini 3.8 Flash"
              title="Your training room"
              action={
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <KeyRound /> Connection
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect Gemini</DialogTitle>
                      <DialogDescription>
                        Paste a Google AI Studio key. It is saved only in this
                        browser and sent to this app’s coach endpoint.
                      </DialogDescription>
                    </DialogHeader>
                    <label className="field-label">
                      Gemini API key
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(event) => setApiKey(event.target.value)}
                        placeholder="AIza…"
                      />
                    </label>
                    <p className="fine-print">
                      <ShieldCheck /> For a public deployment, use the
                      server-side GEMINI_API_KEY environment variable instead of
                      a browser key.
                    </p>
                  </DialogContent>
                </Dialog>
              }
            />
            <div className="quick-prompts">
              {[
                "Review my last workout",
                "Adapt tonight for low sleep",
                "Fix my lunge and RDL problem",
                "Build a simple eating plan",
              ].map((prompt) => (
                <button key={prompt} onClick={() => askCoach(prompt)}>
                  <Sparkles />
                  {prompt}
                </button>
              ))}
            </div>
            <section className="chat-panel">
              <div className="chat-log">
                {chat.map((item, index) => (
                  <div key={index} className={`message ${item.role}`}>
                    <div>{item.role === "coach" ? <Bot /> : <UserRound />}</div>
                    <p>{item.text}</p>
                  </div>
                ))}
                {coachBusy && (
                  <div className="message coach">
                    <div>
                      <Bot />
                    </div>
                    <p className="typing">
                      Thinking from your training data<span>…</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="composer">
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      askCoach();
                    }
                  }}
                  placeholder="Ask about tonight’s load, pain-free swaps, recovery or food…"
                />
                <Button
                  onClick={() => askCoach()}
                  disabled={!message.trim() || coachBusy}
                  aria-label="Send to coach"
                >
                  <Send />
                </Button>
              </div>
            </section>
            <p className="coach-safety">
              <ShieldCheck /> AI coaching supports training decisions, not
              medical diagnosis. Stop sharp or worsening pain.
            </p>
          </TabsContent>

          <TabsContent value="profile" className="page-content">
            <SectionTitle
              kicker="Personal baseline"
              title="Built around your body and life"
            />
            <section className="profile-hero">
              <div className="profile-monogram">AA</div>
              <div>
                <h2>Atrin Ashnaei</h2>
                <p>
                  {PROFILE.age} · {PROFILE.sex} · {PROFILE.heightCm} cm ·{" "}
                  {PROFILE.experience}
                </p>
                <div className="goal-line">
                  <Target /> {PROFILE.goal}
                </div>
              </div>
              <div className="profile-score">
                <span>Body score</span>
                <strong>82</strong>
                <small>Scale estimate</small>
              </div>
            </section>
            <section className="body-grid">
              <Metric label="Weight" value="74.0 kg" />
              <Metric label="Body fat" value="19.3%" />
              <Metric label="Muscle mass" value="56.5 kg" />
              <Metric label="Skeletal muscle" value="32.1 kg" />
              <Metric label="Fat-free mass" value="59.7 kg" />
              <Metric label="Body water" value="59.3%" />
              <Metric label="Resting heart rate" value="64 bpm" />
              <Metric label="BMR estimate" value="1,660 kcal" />
            </section>
            <section className="profile-grid">
              <div className="panel">
                <div className="panel-icon blue">
                  <Dumbbell />
                </div>
                <span className="kicker">Training fit</span>
                <h3>3-day full-body, arm-priority</h3>
                <p>
                  A full-body structure gives your main movements more practice
                  than a once-weekly push/pull/legs split. Direct arm work is
                  spread across all three nights.
                </p>
              </div>
              <div className="panel">
                <div className="panel-icon orange">
                  <MoonStar />
                </div>
                <span className="kicker">Biggest opportunity</span>
                <h3>Protect sleep after 9 p.m. training</h3>
                <p>
                  Keep late caffeine low, finish with a brief cool-down, and aim
                  to add sleep time before adding more weekly sets.
                </p>
              </div>
              <div className="panel">
                <div className="panel-icon navy">
                  <Gauge />
                </div>
                <span className="kicker">Movement plan</span>
                <h3>Build capacity before complexity</h3>
                <p>
                  Reverse lunges and RDLs are not required. The plan uses leg
                  press, goblet squat, hip thrust and leg curl while you improve
                  mobility and hinge skill.
                </p>
              </div>
            </section>
            <section className="panel science-panel">
              <SectionTitle
                kicker="Evidence layer"
                title="Why the program behaves this way"
              />
              <div className="science-grid">
                <div>
                  <TrendingUp />
                  <strong>Progressive, not reckless</strong>
                  <span>
                    Load rises only after the rep range is owned with reserve.
                  </span>
                </div>
                <div>
                  <Flame />
                  <strong>Productive effort</strong>
                  <span>Most sets finish 1–3 reps shy of failure.</span>
                </div>
                <div>
                  <Clock3 />
                  <strong>Rest for performance</strong>
                  <span>
                    2–3 minutes on strength work; shorter rests on accessories.
                  </span>
                </div>
              </div>
              <div className="source-links">
                {SCIENCE_LINKS.map((source) => (
                  <a
                    key={source.href}
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {source.label}
                    <ArrowUpRight />
                  </a>
                ))}
              </div>
            </section>
          </TabsContent>
        </div>

        <TabsList className="mobile-nav">
          {NAV.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              <item.icon />
              <span>{item.label.replace("AI ", "")}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </main>
  );
}
