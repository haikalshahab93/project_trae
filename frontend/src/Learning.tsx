import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Entry = {
  id: string;
  grade: string;
  topic: string;
  level: string;
  question: string;
  answer: string;
  hint: string;
  explanation: string;
};

type LearningPayload = { lastUpdated: string; entries: Entry[] };

type LearningProps = {
  apiBaseUrl?: string;
  authToken?: string;
  userToken?: string;
  user?: { id: string; username: string; name: string; grade: string } | null;
  initialGrade?: string;
  onRequireLogin?: () => void;
  onRequireUserLogin?: () => void;
  onUserLogout?: () => void;
};

type SessionMode = "practice" | "exam";

type ExamResult = {
  id: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  topic: string;
  level: string;
  isCorrect: boolean;
};

type FeedbackTone = "info" | "success" | "error";

type StudentProfile = {
  name: string;
  theme: "indigo" | "emerald" | "rose" | "amber";
};

type LearningHistoryItem = {
  id: string;
  ts: number;
  grade: string;
  topic: string;
  mode: SessionMode;
  score: number;
  stars: number;
  correct: number;
  total: number;
};

type Sticker = {
  id: string;
  title: string;
  earnedAt: number;
  source: string;
};

const emptyEntry: Entry = {
  id: "",
  grade: "",
  topic: "",
  level: "",
  question: "",
  answer: "",
  hint: "",
  explanation: "",
};

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function shuffleItems<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function parseNumberAnswer(value: string) {
  const parsed = Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumberAnswer(value: number, source: string) {
  if (source.includes(",") || !Number.isInteger(value)) {
    return value.toFixed(1).replace(".", ",");
  }
  return String(Math.round(value));
}

function buildAnswerOptions(entry: Entry) {
  const correctAnswer = entry.answer.trim();
  const options = new Set<string>([correctAnswer]);

  if (correctAnswer.includes(":")) {
    const [leftText, rightText] = correctAnswer.split(":");
    const left = Number(leftText);
    const right = Number(rightText);
    if (Number.isFinite(left) && Number.isFinite(right)) {
      [
        `${left + 1}:${right}`,
        `${Math.max(1, left - 1)}:${right}`,
        `${left}:${right + 1}`,
        `${left}:${Math.max(1, right - 1)}`,
      ].forEach((item) => options.add(item));
    }
  } else if (correctAnswer.includes("/")) {
    const [topText, bottomText] = correctAnswer.split("/");
    const top = Number(topText);
    const bottom = Number(bottomText);
    if (Number.isFinite(top) && Number.isFinite(bottom)) {
      [
        `${top + 1}/${bottom}`,
        `${Math.max(1, top - 1)}/${bottom}`,
        `${top}/${bottom + 1}`,
        `${top + 1}/${bottom + 1}`,
      ].forEach((item) => options.add(item));
    }
  } else {
    const numericAnswer = parseNumberAnswer(correctAnswer);
    if (numericAnswer !== null) {
      const offsets = correctAnswer.includes(",") ? [0.1, -0.1, 0.2, -0.2, 0.5] : [1, -1, 2, -2, 5, -5, 10];
      offsets
        .map((offset) => Math.max(0, numericAnswer + offset))
        .forEach((item) => options.add(formatNumberAnswer(item, correctAnswer)));
    }
  }

  let filler = 1;
  while (options.size < 4) {
    const numericAnswer = parseNumberAnswer(correctAnswer);
    if (numericAnswer !== null) {
      options.add(formatNumberAnswer(Math.max(0, numericAnswer + filler * 3), correctAnswer));
    } else {
      options.add(`${correctAnswer}${filler}`);
    }
    filler += 1;
  }

  const distractors = Array.from(options).filter((item) => normalizeText(item) !== normalizeText(correctAnswer));
  return shuffleItems([correctAnswer, ...shuffleItems(distractors).slice(0, 3)]);
}

export default function Learning({
  apiBaseUrl = "http://localhost:3001",
  authToken = "",
  userToken = "",
  user = null,
  initialGrade = "Kelas 1",
  onRequireLogin,
  onRequireUserLogin,
  onUserLogout,
}: LearningProps) {
  const [data, setData] = useState<LearningPayload>({ lastUpdated: "", entries: [] });
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState(initialGrade);
  const [topic, setTopic] = useState("Semua");
  const [practiceMode, setPracticeMode] = useState(false);
  const [sessionMode, setSessionMode] = useState<SessionMode>("practice");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>("info");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [sessionStats, setSessionStats] = useState({ correct: 0, attempted: 0 });
  const [sessionQueue, setSessionQueue] = useState<Entry[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [examFinished, setExamFinished] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState(0);
  const [examSessionId, setExamSessionId] = useState("");
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSearch, setEditorSearch] = useState("");
  const [editorGrade, setEditorGrade] = useState("Semua");
  const [editorTopic, setEditorTopic] = useState("Semua");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [newEntry, setNewEntry] = useState<Entry>(emptyEntry);
  const [remoteStats, setRemoteStats] = useState({ attemptCount: 0, examCount: 0, bestScore: 0, averageScore: 0 });
  const [leaderboard, setLeaderboard] = useState<
    Array<{ rank: number; userName: string; score: number; correct: number; total: number; stars: number; topic: string }>
  >([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [scoreSyncMessage, setScoreSyncMessage] = useState("");
  const resolvedApiBaseUrl = apiBaseUrl.replace(/\/$/, "");
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const raw = localStorage.getItem("math_profile");
      if (!raw) return { name: "", theme: "indigo" };
      const parsed = JSON.parse(raw) as Partial<StudentProfile>;
      const theme = parsed.theme;
      return {
        name: typeof parsed.name === "string" ? parsed.name : "",
        theme: theme === "emerald" || theme === "rose" || theme === "amber" || theme === "indigo" ? theme : "indigo",
      };
    } catch {
      return { name: "", theme: "indigo" };
    }
  });
  const [history, setHistory] = useState<LearningHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem("math_history");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as LearningHistoryItem[]) : [];
    } catch {
      return [];
    }
  });
  const [stickers, setStickers] = useState<Sticker[]>(() => {
    try {
      const raw = localStorage.getItem("math_stickers");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Sticker[]) : [];
    } catch {
      return [];
    }
  });
  const [mastery, setMastery] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem("math_mastery") || "{}";
      return JSON.parse(raw);
    } catch {
      return {};
    }
  });
  const masterySnapshot = useRef(mastery);
  const autoAdvanceRef = useRef<number | null>(null);

  useEffect(() => {
    fetch(`${resolvedApiBaseUrl}/api/learning`)
      .then((r) => r.json())
      .then((payload: LearningPayload) => setData(payload))
      .catch(() => {});
  }, [resolvedApiBaseUrl]);

  useEffect(() => {
    setGrade(initialGrade);
    setTopic("Semua");
    setPracticeMode(false);
    setSessionMode("practice");
    setSessionQueue([]);
    setExamResults([]);
    setExamFinished(false);
  }, [initialGrade]);

  useEffect(() => {
    if (!userToken) {
      setRemoteStats({ attemptCount: 0, examCount: 0, bestScore: 0, averageScore: 0 });
      return;
    }
    fetch(`${resolvedApiBaseUrl}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Gagal membaca profil user.");
        return payload;
      })
      .then((payload) => {
        setRemoteStats(payload.stats || { attemptCount: 0, examCount: 0, bestScore: 0, averageScore: 0 });
      })
      .catch(() => {
        setRemoteStats({ attemptCount: 0, examCount: 0, bestScore: 0, averageScore: 0 });
      });
  }, [resolvedApiBaseUrl, userToken]);

  useEffect(() => {
    const leaderboardGrade = grade === "Semua" ? "Kelas 1" : grade;
    setLeaderboardLoading(true);
    fetch(`${resolvedApiBaseUrl}/api/leaderboard?grade=${encodeURIComponent(leaderboardGrade)}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Gagal membaca leaderboard.");
        return payload;
      })
      .then((payload) => {
        setLeaderboard(Array.isArray(payload.entries) ? payload.entries : []);
      })
      .catch(() => {
        setLeaderboard([]);
      })
      .finally(() => {
        setLeaderboardLoading(false);
      });
  }, [grade, resolvedApiBaseUrl]);

  const grades = useMemo(() => {
    return ["Semua", ...Array.from(new Set(data.entries.map((entry) => entry.grade)))];
  }, [data.entries]);

  const topics = useMemo(() => {
    const entriesByGrade = grade === "Semua" ? data.entries : data.entries.filter((entry) => entry.grade === grade);
    return ["Semua", ...Array.from(new Set(entriesByGrade.map((entry) => entry.topic)))];
  }, [data.entries, grade]);

  const filtered = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    return data.entries.filter((entry) => {
      const matchesGrade = grade === "Semua" || entry.grade === grade;
      const matchesTopic = topic === "Semua" || entry.topic === topic;
      const matchesSearch =
        !searchText ||
        entry.grade.toLowerCase().includes(searchText) ||
        entry.topic.toLowerCase().includes(searchText) ||
        entry.level.toLowerCase().includes(searchText) ||
        entry.question.toLowerCase().includes(searchText) ||
        entry.answer.toLowerCase().includes(searchText) ||
        entry.hint.toLowerCase().includes(searchText) ||
        entry.explanation.toLowerCase().includes(searchText);
      return matchesGrade && matchesTopic && matchesSearch;
    });
  }, [data.entries, grade, topic, search]);

  const visibleEntries = useMemo(() => {
    return filtered.slice(0, 60);
  }, [filtered]);

  useEffect(() => {
    if (!practiceMode) {
      masterySnapshot.current = mastery;
    }
  }, [mastery, practiceMode]);

  const classSummary = useMemo(() => {
    return grades
      .filter((item) => item !== "Semua")
      .map((item) => {
        const entries = data.entries.filter((entry) => entry.grade === item);
        const completed = entries.filter((entry) => (mastery[entry.id] || 0) > 0).length;
        return { grade: item, total: entries.length, completed };
      });
  }, [data.entries, grades, mastery]);

  const editorGrades = useMemo(() => {
    return ["Semua", ...Array.from(new Set(data.entries.map((entry) => entry.grade)))];
  }, [data.entries]);

  const editorTopics = useMemo(() => {
    const entriesByGrade =
      editorGrade === "Semua" ? data.entries : data.entries.filter((entry) => entry.grade === editorGrade);
    return ["Semua", ...Array.from(new Set(entriesByGrade.map((entry) => entry.topic)))];
  }, [data.entries, editorGrade]);

  const editorFilteredEntries = useMemo(() => {
    const searchText = editorSearch.trim().toLowerCase();
    return data.entries.filter((entry) => {
      const matchesGrade = editorGrade === "Semua" || entry.grade === editorGrade;
      const matchesTopic = editorTopic === "Semua" || entry.topic === editorTopic;
      const matchesSearch =
        !searchText ||
        entry.id.toLowerCase().includes(searchText) ||
        entry.grade.toLowerCase().includes(searchText) ||
        entry.topic.toLowerCase().includes(searchText) ||
        entry.level.toLowerCase().includes(searchText) ||
        entry.question.toLowerCase().includes(searchText) ||
        entry.answer.toLowerCase().includes(searchText);
      return matchesGrade && matchesTopic && matchesSearch;
    });
  }, [data.entries, editorSearch, editorGrade, editorTopic]);

  const editorVisibleEntries = useMemo(() => {
    return editorFilteredEntries.slice(0, 80);
  }, [editorFilteredEntries]);

  const masteredCount = useMemo(() => {
    return data.entries.filter((entry) => (mastery[entry.id] || 0) > 0).length;
  }, [data.entries, mastery]);

  const progress = data.entries.length === 0 ? 0 : Math.round((masteredCount / data.entries.length) * 100);

  useEffect(() => {
    localStorage.setItem("math_mastery", JSON.stringify(mastery));
  }, [mastery]);

  useEffect(() => {
    localStorage.setItem("math_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("math_history", JSON.stringify(history.slice(0, 60)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("math_stickers", JSON.stringify(stickers.slice(0, 80)));
  }, [stickers]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedChoice("");
    setFeedback("");
  }, [grade, topic, search, practiceMode]);

  useEffect(() => {
    if (topic !== "Semua" && !topics.includes(topic)) {
      setTopic("Semua");
    }
  }, [topic, topics]);

  useEffect(() => {
    if (editorTopic !== "Semua" && !editorTopics.includes(editorTopic)) {
      setEditorTopic("Semua");
    }
  }, [editorTopic, editorTopics]);

  function markSolved(id: string) {
    setMastery((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function buildSessionQueue(mode: SessionMode) {
    const snapshot = masterySnapshot.current;
    const ordered = [...filtered].sort((a, b) => (snapshot[a.id] || 0) - (snapshot[b.id] || 0));
    if (mode === "exam") {
      return shuffleItems(ordered).slice(0, Math.min(10, ordered.length));
    }
    return ordered;
  }

  function startSession(mode: SessionMode) {
    if (!userToken) {
      setScoreSyncMessage("Silakan login dulu agar nilai bisa direkap dan masuk leaderboard.");
      onRequireUserLogin?.();
      return;
    }
    setScoreSyncMessage("");
    masterySnapshot.current = mastery;
    const nextQueue = buildSessionQueue(mode);
    setSessionMode(mode);
    setPracticeMode(true);
    setSessionQueue(nextQueue);
    setCurrentIndex(0);
    setSelectedChoice("");
    setFeedback("");
    setFeedbackTone("info");
    setSessionStats({ correct: 0, attempted: 0 });
    setExamResults([]);
    setExamFinished(false);
    setExamTimeLeft(mode === "exam" ? 20 : 0);
    setExamSessionId(
      mode === "exam" ? `exam_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` : ""
    );
  }

  function stopSession() {
    if (autoAdvanceRef.current) {
      window.clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    if (practiceMode && sessionMode === "practice" && sessionStats.attempted > 0) {
      const practiceScore = Math.round((sessionStats.correct / sessionStats.attempted) * 100);
      const practiceStars = Math.max(
        1,
        practiceScore >= 90 ? 5 : practiceScore >= 75 ? 4 : practiceScore >= 60 ? 3 : practiceScore >= 40 ? 2 : 1
      );
      const practiceHistoryItem: LearningHistoryItem = {
        id: `practice_${Date.now()}`,
        ts: Date.now(),
        grade,
        topic,
        mode: "practice",
        score: practiceScore,
        stars: practiceStars,
        correct: sessionStats.correct,
        total: sessionStats.attempted,
      };
      setHistory((prev) => [practiceHistoryItem, ...prev].slice(0, 60));
      void syncScore({
        mode: "practice",
        score: practiceScore,
        correct: sessionStats.correct,
        total: sessionStats.attempted,
        stars: practiceStars,
        grade,
        topic,
      });
    }
    setPracticeMode(false);
    setSessionMode("practice");
    setSessionQueue([]);
    setCurrentIndex(0);
    setSelectedChoice("");
    setFeedback("");
    setFeedbackTone("info");
    setExamResults([]);
    setExamFinished(false);
    setExamTimeLeft(0);
    setExamSessionId("");
  }

  function updateEntry(id: string, key: keyof Entry, value: string) {
    setData((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) => (entry.id === id ? { ...entry, [key]: value } : entry)),
    }));
  }

  function removeEntry(id: string) {
    setData((prev) => ({
      ...prev,
      entries: prev.entries.filter((entry) => entry.id !== id),
    }));
  }

  function duplicateEntry(entry: Entry) {
    const duplicated = {
      ...entry,
      id: `${entry.id}_copy_${Math.random().toString(36).slice(2, 6)}`,
    };
    setData((prev) => ({
      ...prev,
      entries: [...prev.entries, duplicated],
    }));
    setSaveMessage("Soal berhasil diduplikasi. Simpan untuk menyimpan ke backend.");
  }

  function addEntry() {
    if (!newEntry.grade.trim() || !newEntry.topic.trim() || !newEntry.question.trim() || !newEntry.answer.trim()) {
      setSaveMessage("Kelas, topik, pertanyaan, dan jawaban wajib diisi.");
      return;
    }

    const nextId = newEntry.id.trim() || `math_${Date.now()}`;
    setData((prev) => ({
      ...prev,
      entries: [...prev.entries, { ...newEntry, id: nextId }],
    }));
    setNewEntry(emptyEntry);
    setSaveMessage("Soal baru ditambahkan. Simpan untuk menyimpan ke backend.");
  }

  async function saveEntries() {
    if (!authToken) {
      onRequireLogin?.();
      return;
    }

    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch(`${resolvedApiBaseUrl}/api/learning`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ entries: data.entries }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setSaveMessage(payload?.error || "Gagal menyimpan materi hitung.");
        return;
      }

      setData(payload);
      setSaveMessage("Materi hitung berhasil disimpan.");
    } catch {
      setSaveMessage("Koneksi ke backend gagal.");
    } finally {
      setSaving(false);
    }
  }

  const syncScore = useCallback(
    async (payload: {
      mode: SessionMode;
      score: number;
      correct: number;
      total: number;
      stars: number;
      grade: string;
      topic: string;
    }) => {
      if (!userToken) return;
      try {
        const res = await fetch(`${resolvedApiBaseUrl}/api/users/scores`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (res.status === 401) {
          setScoreSyncMessage("Sesi login berakhir. Silakan login lagi.");
          onUserLogout?.();
          return;
        }
        if (!res.ok) {
          setScoreSyncMessage(body?.error || "Nilai belum berhasil direkap.");
          return;
        }
        setScoreSyncMessage("Nilai berhasil direkap ke leaderboard kelas.");
        fetch(`${resolvedApiBaseUrl}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        })
          .then(async (response) => {
            const nextBody = await response.json();
            if (!response.ok) throw new Error(nextBody?.error || "Gagal memuat rekap.");
            return nextBody;
          })
          .then((nextBody) => {
            setRemoteStats(nextBody.stats || { attemptCount: 0, examCount: 0, bestScore: 0, averageScore: 0 });
          })
          .catch(() => {});
        fetch(`${resolvedApiBaseUrl}/api/leaderboard?grade=${encodeURIComponent(payload.grade)}`)
          .then(async (response) => {
            const nextBody = await response.json();
            if (!response.ok) throw new Error(nextBody?.error || "Gagal memuat leaderboard.");
            return nextBody;
          })
          .then((nextBody) => {
            setLeaderboard(Array.isArray(nextBody.entries) ? nextBody.entries : []);
          })
          .catch(() => {});
      } catch {
        setScoreSyncMessage("Koneksi ke backend gagal saat menyimpan nilai.");
      }
    },
    [onUserLogout, resolvedApiBaseUrl, userToken]
  );

  const nextQuestion = useCallback(() => {
    if (sessionQueue.length === 0) return;
    if (autoAdvanceRef.current) {
      window.clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    if (sessionMode === "exam" && currentIndex === sessionQueue.length - 1) {
      setExamFinished(true);
      setSelectedChoice("");
      setFeedback("");
      setFeedbackTone("info");
      setExamTimeLeft(0);
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % sessionQueue.length);
    setSelectedChoice("");
    setFeedback("");
    setFeedbackTone("info");
    setExamTimeLeft(sessionMode === "exam" ? 20 : 0);
  }, [currentIndex, sessionMode, sessionQueue.length]);

  const currentQuestion = sessionQueue[currentIndex];
  const currentOptions = useMemo(() => {
    return currentQuestion ? buildAnswerOptions(currentQuestion) : [];
  }, [currentQuestion]);

  function playFeedbackSound(type: "success" | "error") {
    try {
      const AudioContextClass =
        window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const audio = new AudioContextClass();
      const gain = audio.createGain();
      gain.connect(audio.destination);
      gain.gain.value = 0.05;

      const first = audio.createOscillator();
      first.type = "sine";
      first.frequency.value = type === "success" ? 660 : 220;
      first.connect(gain);
      first.start();
      first.stop(audio.currentTime + 0.12);

      const second = audio.createOscillator();
      second.type = "sine";
      second.frequency.value = type === "success" ? 880 : 160;
      second.connect(gain);
      second.start(audio.currentTime + 0.14);
      second.stop(audio.currentTime + 0.3);

      setTimeout(() => {
        audio.close().catch(() => {});
      }, 400);
    } catch {
      return;
    }
  }

  function chooseAnswer(option: string) {
    if (!currentQuestion || selectedChoice) return;

    const isCorrect = normalizeText(option) === normalizeText(currentQuestion.answer);
    setSelectedChoice(option);
    if (sessionMode === "exam") {
      setExamResults((prev) => [
        ...prev,
        {
          id: currentQuestion.id,
          question: currentQuestion.question,
          selectedAnswer: option,
          correctAnswer: currentQuestion.answer,
          explanation: currentQuestion.explanation,
          topic: currentQuestion.topic,
          level: currentQuestion.level,
          isCorrect,
        },
      ]);
    }

    if (isCorrect) {
      markSolved(currentQuestion.id);
      setSessionStats((prev) => ({ correct: prev.correct + 1, attempted: prev.attempted + 1 }));
      setFeedbackTone("success");
      setFeedback(
        sessionMode === "exam" ? "Jawaban benar. Klik lanjut untuk menuju soal berikutnya." : "Jawaban benar. Hebat!"
      );
      playFeedbackSound("success");
      return;
    }

    setSessionStats((prev) => ({ ...prev, attempted: prev.attempted + 1 }));
    if (sessionMode === "practice") {
      setSessionQueue((prev) => {
        const hasQueuedRetry = prev.slice(currentIndex + 1).some((entry) => entry.id === currentQuestion.id);
        return hasQueuedRetry ? prev : [...prev, currentQuestion];
      });
    }
    setFeedbackTone("error");
    setFeedback(
      sessionMode === "practice"
        ? `Belum tepat. Jawaban yang benar adalah ${currentQuestion.answer}. ${currentQuestion.explanation} Soal ini akan muncul lagi nanti.`
        : `Belum tepat. Jawaban yang benar adalah ${currentQuestion.answer}. ${currentQuestion.explanation}`
    );
    playFeedbackSound("error");
  }

  const examCorrectCount = examResults.filter((item) => item.isCorrect).length;
  const examWrongResults = examResults.filter((item) => !item.isCorrect);
  const examScore = sessionQueue.length === 0 ? 0 : Math.round((examCorrectCount / sessionQueue.length) * 100);
  const examStars = Math.max(
    1,
    examScore >= 90 ? 5 : examScore >= 75 ? 4 : examScore >= 60 ? 3 : examScore >= 40 ? 2 : 1
  );
  const examStarsText = "★★★★★☆☆☆☆☆".slice(5 - examStars, 10 - examStars);
  const examReviewInsights = useMemo(() => {
    if (examWrongResults.length === 0) return [];
    return Object.entries(
      examWrongResults.reduce<Record<string, { count: number; level: string }>>((accumulator, item) => {
        const key = item.topic || "Campuran";
        const current = accumulator[key] || { count: 0, level: item.level };
        accumulator[key] = { count: current.count + 1, level: current.level || item.level };
        return accumulator;
      }, {})
    )
      .map(([topicName, meta]) => ({
        topicName,
        count: meta.count,
        level: meta.level,
      }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 3);
  }, [examWrongResults]);

  const examWrongReviewCards = useMemo(() => {
    return examWrongResults.map((item) => {
      const isTimeout = item.selectedAnswer === "Waktu habis";
      const reviewLabel = isTimeout ? "Perlu tambah tempo" : "Perlu rapikan konsep";
      const reviewTone = isTimeout ? "warning" : "focus";

      return {
        ...item,
        reviewLabel,
        reviewTone,
        reviewHint: isTimeout
          ? `Coba ulang ${item.topic} level ${item.level} dengan latihan singkat agar lebih cepat mengenali pola soal.`
          : `Ulangi ${item.topic} level ${item.level} dan fokus pada langkah hitung sebelum lanjut ke ujian berikutnya.`,
      };
    });
  }, [examWrongResults]);

  const latestExam = useMemo(() => {
    return history.find((item) => item.mode === "exam") || null;
  }, [history]);

  const historyInsights = useMemo(() => {
    if (history.length === 0) {
      return {
        streakDays: 0,
        dominantMode: "Latihan",
        focusTopic: "Campuran",
        recentAverage: 0,
        trendLabel: "Mulai belajar",
      };
    }

    const uniqueDayTimes = Array.from(
      new Set(
        history.map((item) => {
          const date = new Date(item.ts);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
      )
    ).sort((a, b) => b - a);

    let streakDays = 0;
    for (let index = 0; index < uniqueDayTimes.length; index += 1) {
      if (index === 0) {
        streakDays = 1;
        continue;
      }
      if (uniqueDayTimes[index - 1] - uniqueDayTimes[index] === 24 * 60 * 60 * 1000) {
        streakDays += 1;
        continue;
      }
      break;
    }

    const examCount = history.filter((item) => item.mode === "exam").length;
    const practiceCount = history.length - examCount;
    const dominantMode = examCount >= practiceCount ? "Ujian" : "Latihan";

    const topicCounts = history.reduce<Record<string, number>>((accumulator, item) => {
      const key = item.topic === "Semua" ? "Campuran" : item.topic;
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});
    const focusTopic =
      Object.entries(topicCounts).sort((left, right) => right[1] - left[1])[0]?.[0] || "Campuran";

    const recentEntries = history.slice(0, 3);
    const previousEntries = history.slice(3, 6);
    const recentAverage = Math.round(
      recentEntries.reduce((total, item) => total + item.score, 0) / Math.max(recentEntries.length, 1)
    );
    const previousAverage =
      previousEntries.length > 0
        ? Math.round(previousEntries.reduce((total, item) => total + item.score, 0) / previousEntries.length)
        : recentAverage;
    const delta = recentAverage - previousAverage;
    const trendLabel = delta >= 8 ? "Meningkat" : delta <= -8 ? "Turun" : "Stabil";

    return { streakDays, dominantMode, focusTopic, recentAverage, trendLabel };
  }, [history]);

  const historyTopicMomentum = useMemo(() => {
    if (history.length === 0) return [];

    const grouped = history.reduce<Record<string, LearningHistoryItem[]>>((accumulator, item) => {
      const key = item.topic === "Semua" ? "Campuran" : item.topic;
      accumulator[key] = [...(accumulator[key] || []), item];
      return accumulator;
    }, {});

    return Object.entries(grouped)
      .map(([topicName, items]) => {
        const latest = items[0];
        const previous = items[1];
        const averageScore = Math.round(items.reduce((total, item) => total + item.score, 0) / items.length);
        const delta = previous ? latest.score - previous.score : 0;
        const status = delta >= 8 ? "Naik cepat" : delta <= -8 ? "Perlu diulang" : "Stabil";
        const tone = delta >= 8 ? "up" : delta <= -8 ? "down" : "steady";

        return {
          topicName,
          averageScore,
          sessionCount: items.length,
          latestMode: latest.mode === "exam" ? "Ujian" : "Latihan",
          status,
          tone,
        };
      })
      .sort((left, right) => right.sessionCount - left.sessionCount || right.averageScore - left.averageScore)
      .slice(0, 3);
  }, [history]);

  const leaderboardInsights = useMemo(() => {
    const leader = leaderboard[0] || null;
    const userEntry = user
      ? leaderboard.find((item) => normalizeText(item.userName) === normalizeText(user.name)) || null
      : null;
    const nextTarget = userEntry
      ? leaderboard.find((item) => item.rank === Math.max(1, userEntry.rank - 1)) || leader
      : leader;

    return {
      leader,
      userEntry,
      nextTarget,
      gapToTarget:
        userEntry && nextTarget && nextTarget.rank < userEntry.rank ? Math.max(1, nextTarget.score - userEntry.score) : 0,
    };
  }, [leaderboard, user]);

  const examNextTarget = useMemo(() => {
    if (examScore >= 90) {
      return {
        title: "Naikkan tantangan",
        description:
          topic === "Semua"
            ? "Coba topik yang berbeda atau pindah ke kelas berikutnya agar kemampuan berhitung makin merata."
            : `Coba ulang topik ${topic} dengan ritme lebih cepat atau lanjut ke topik baru.`,
        focus: "Pertahankan akurasi tinggi",
      };
    }
    if (examScore >= 75) {
      return {
        title: "Kunci konsistensi",
        description: "Sedikit latihan ulang pada soal yang belum tepat akan membantu nilai masuk ke level berikutnya.",
        focus: `Perbaiki ${examWrongResults.length} soal yang masih salah`,
      };
    }
    if (examScore >= 60) {
      return {
        title: "Ulangi topik inti",
        description: "Fokus pada pembahasan dan kerjakan latihan singkat lagi sebelum mengulang ujian.",
        focus: topic === "Semua" ? "Pilih satu topik agar lebih fokus" : `Perdalam topik ${topic}`,
      };
    }
    return {
      title: "Bangun pondasi dulu",
      description: "Mulai dari mode latihan supaya anak bisa melihat pembahasan dan mengulang soal secara bertahap.",
      focus: "Utamakan pemahaman sebelum kecepatan",
    };
  }, [examScore, examWrongResults.length, topic]);

  const todayFocus = useMemo(() => {
    if (history.length === 0) {
      return {
        label: "Mulai sesi pertama",
        title: "Bangun rutinitas belajar",
        description: "Mulai dari latihan singkat agar progres, streak, dan insight belajar mulai terbentuk.",
      };
    }

    if (historyInsights.trendLabel === "Meningkat") {
      return {
        label: "Performa naik",
        title: "Pertahankan momentum hari ini",
        description: `Nilai terbaru rata-rata ${historyInsights.recentAverage}. Cocok untuk lanjut ujian atau menaikkan level topik.`,
      };
    }

    if (historyInsights.trendLabel === "Turun") {
      return {
        label: "Perlu penguatan",
        title: "Ambil latihan yang lebih fokus",
        description: `Ulangi ${historyInsights.focusTopic} dengan mode latihan supaya pemahaman kembali stabil.`,
      };
    }

    return {
      label: "Tempo stabil",
      title: "Rapikan akurasi sebelum lanjut",
      description: `Streak ${historyInsights.streakDays} hari sudah bagus. Sekarang fokus menjaga konsistensi di ${historyInsights.focusTopic}.`,
    };
  }, [history.length, historyInsights]);

  const displayedStickers = useMemo(() => stickers.slice(0, 10), [stickers]);

  const earnedThisExam = useMemo(() => {
    if (!examSessionId) return [];
    return stickers.filter((sticker) => sticker.source === examSessionId);
  }, [examSessionId, stickers]);

  const examCelebrationMoments = useMemo(() => {
    const items = [
      examScore >= 90 ? { label: "Bintang performa", value: "Top score" } : null,
      examWrongResults.length === 0 ? { label: "Akurasi", value: "Tanpa salah" } : null,
      earnedThisExam.length > 0 ? { label: "Reward", value: `+${earnedThisExam.length} stiker` } : null,
      historyInsights.streakDays >= 3 ? { label: "Streak", value: `${historyInsights.streakDays} hari` } : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    return items.slice(0, 4);
  }, [earnedThisExam.length, examScore, examWrongResults.length, historyInsights.streakDays]);

  const studyMission = useMemo(() => {
    return [
      { label: "Kelas aktif", value: grade === "Semua" ? "Semua kelas" : grade },
      { label: "Topik fokus", value: topic === "Semua" ? "Semua topik" : topic },
      { label: "Soal tersedia", value: `${filtered.length} soal` },
      { label: "Mode terbaik", value: user ? "Sinkron ke akun" : "Belajar lokal" },
    ];
  }, [filtered.length, grade, topic, user]);

  const hasActiveFilters = topic !== "Semua" || search.trim().length > 0;
  const searchKeyword = search.trim();
  const hasVisibleTruncation = filtered.length > visibleEntries.length;
  const emptyStateTitle = hasActiveFilters ? "Belum ada soal yang cocok" : "Bank soal masih kosong";
  const emptyStateDescription = hasActiveFilters
    ? `Coba ubah topik atau kata kunci${searchKeyword ? ` "${searchKeyword}"` : ""} supaya hasil pencarian lebih luas.`
    : "Tambahkan soal baru atau pilih kelas lain untuk mulai belajar.";

  useEffect(() => {
    const milestones: Array<{ value: number; title: string }> = [
      { value: 25, title: "Langkah Pertama" },
      { value: 50, title: "Setengah Jalan" },
      { value: 75, title: "Hampir Selesai" },
      { value: 100, title: "Master Hitung" },
    ];
    const reached = milestones.filter((item) => progress >= item.value);
    if (reached.length === 0) return;
    setStickers((prev) => {
      let next = prev;
      reached.forEach((item) => {
        const id = `milestone_${item.value}`;
        if (next.some((sticker) => sticker.id === id)) return;
        next = [
          { id, title: item.title, earnedAt: Date.now(), source: id },
          ...next,
        ];
      });
      return next;
    });
  }, [progress]);

  useEffect(() => {
    if (!practiceMode || sessionMode !== "exam" || !examFinished) return;
    if (!examSessionId) return;
    if (sessionQueue.length === 0) return;
    const item: LearningHistoryItem = {
      id: examSessionId,
      ts: Date.now(),
      grade,
      topic,
      mode: "exam",
      score: examScore,
      stars: examStars,
      correct: examCorrectCount,
      total: sessionQueue.length,
    };
    setHistory((prev) => {
      if (prev.some((row) => row.id === examSessionId)) return prev;
      return [item, ...prev].slice(0, 60);
    });
    void syncScore({
      mode: "exam",
      score: examScore,
      correct: examCorrectCount,
      total: sessionQueue.length,
      stars: examStars,
      grade,
      topic,
    });

    const earnedTitle =
      examScore === 100 ? "Nilai Sempurna" : examStars >= 5 ? "Bintang Emas" : examStars >= 4 ? "Hebat Sekali" : "";
    if (!earnedTitle) return;
    setStickers((prev) => {
      const id = `exam_${examSessionId}`;
      if (prev.some((sticker) => sticker.id === id)) return prev;
      return [{ id, title: earnedTitle, earnedAt: Date.now(), source: examSessionId }, ...prev].slice(0, 80);
    });
  }, [
    examCorrectCount,
    examFinished,
    examScore,
    examSessionId,
    examStars,
    grade,
    practiceMode,
    sessionMode,
    sessionQueue.length,
    syncScore,
    topic,
  ]);

  useEffect(() => {
    if (!practiceMode || sessionMode !== "exam" || examFinished || !currentQuestion) {
      setExamTimeLeft(0);
      return;
    }
    if (selectedChoice) return;

    const limitSeconds = 20;
    setExamTimeLeft(limitSeconds);
    const intervalId = window.setInterval(() => {
      setExamTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [practiceMode, sessionMode, examFinished, currentQuestion, selectedChoice]);

  useEffect(() => {
    if (!practiceMode || sessionMode !== "exam" || examFinished || !currentQuestion) return;
    if (examTimeLeft !== 0) return;
    if (selectedChoice) return;

    const timeoutChoice = "__timeout__";
    setSelectedChoice(timeoutChoice);
    setSessionStats((prev) => ({ ...prev, attempted: prev.attempted + 1 }));
    setExamResults((prev) => [
      ...prev,
      {
        id: currentQuestion.id,
        question: currentQuestion.question,
        selectedAnswer: "Waktu habis",
        correctAnswer: currentQuestion.answer,
        explanation: currentQuestion.explanation,
        topic: currentQuestion.topic,
        level: currentQuestion.level,
        isCorrect: false,
      },
    ]);
    setFeedbackTone("error");
    setFeedback(`Waktu habis. Jawaban yang benar adalah ${currentQuestion.answer}. ${currentQuestion.explanation}`);
    playFeedbackSound("error");

    autoAdvanceRef.current = window.setTimeout(() => {
      nextQuestion();
    }, 900);
  }, [practiceMode, sessionMode, examFinished, currentQuestion, examTimeLeft, selectedChoice, nextQuestion]);

  return (
    <div>
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="badge">Area Belajar</span>
            <h2>Belajar Hitung Berdasarkan Kelas</h2>
          </div>
          <p className="learning-lead">
            Pilih kelas, kerjakan soal, dan ulangi latihan agar anak makin cepat memahami penjumlahan, pengurangan,
            perkalian, pembagian, pecahan, desimal, hingga persen.
          </p>
        </div>
        <div className="learning-hero-banner">
          <div className="learning-hero-copy">
            <div className="small">Siap untuk sesi hari ini</div>
            <div className="learning-hero-title">
              {grade === "Semua" ? "Jelajahi semua kelas" : `Fokus belajar ${grade}`}
            </div>
            <div className="card-sub">
              {topic === "Semua"
                ? "Pilih topik yang ingin diasah, lalu mulai latihan atau ujian dengan rekap nilai otomatis."
                : `Topik ${topic} sedang dipilih supaya anak bisa belajar lebih fokus dan progres lebih mudah dipantau.`}
            </div>
          </div>
          <div className="learning-hero-pills">
            <span className="learning-hero-pill">Soal tersedia {filtered.length}</span>
            <span className="learning-hero-pill">{user ? "Sinkron ke akun siswa" : "Belajar lokal aktif"}</span>
            <span className="learning-hero-pill">
              {leaderboard.length > 0 ? `Skor puncak ${leaderboard[0].score}` : "Leaderboard siap diisi"}
            </span>
            <span className="learning-hero-pill">
              {history.length > 0 ? `Streak ${historyInsights.streakDays} hari` : "Mulai streak hari ini"}
            </span>
            <span className="learning-hero-pill">
              {history.length > 0 ? `Trend ${historyInsights.trendLabel}` : "Progres siap dibangun"}
            </span>
            <div className="learning-focus-card">
              <div className="small">{todayFocus.label}</div>
              <div className="learning-focus-title">{todayFocus.title}</div>
              <div className="card-sub">{todayFocus.description}</div>
            </div>
          </div>
        </div>
        <div className="learning-overview-grid">
          <div className="card learning-account-card">
            <div className="learning-card-top">
              <span className="badge">{user ? "User Aktif" : "Akun Siswa"}</span>
              <span className="topic-chip active">{user?.grade || "Belum Login"}</span>
            </div>
            <div className="card-title">{user ? user.name : "Login siswa untuk mulai mengerjakan soal"}</div>
            <div className="card-sub">
              {user
                ? `Username @${user.username}. Nilai latihan dan ujian akan otomatis direkap ke leaderboard kelas.`
                : "Register atau login lebih dulu supaya semua nilai tersimpan dan bisa dibandingkan per kelas."}
            </div>
            <div className="actions learning-actions">
              {!user ? (
                <button className="btn primary" onClick={() => onRequireUserLogin?.()}>
                  Login / Register Siswa
                </button>
              ) : (
                <button className="btn outline" onClick={() => onUserLogout?.()}>
                  Logout Siswa
                </button>
              )}
            </div>
            {scoreSyncMessage && <div className="learning-status">{scoreSyncMessage}</div>}
          </div>
          <div className="profile-card">
            <div className="profile-row">
              <div className={`profile-avatar theme-${profile.theme}`}>{(profile.name || "A").slice(0, 1).toUpperCase()}</div>
              <div className="profile-meta">
                <div className="small">Profil Anak</div>
                <input
                  className="profile-name-input"
                  value={profile.name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nama anak"
                />
                <div className="profile-theme-row">
                  {(["indigo", "emerald", "rose", "amber"] as const).map((item) => (
                    <button
                      key={item}
                      className={`theme-dot ${profile.theme === item ? "active" : ""} theme-${item}`}
                      onClick={() => setProfile((prev) => ({ ...prev, theme: item }))}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="small">Stiker</div>
                  <div className="card-title">{stickers.length}</div>
                </div>
                <div className="profile-stat">
                  <div className="small">Ujian Terakhir</div>
                  <div className="card-title">{latestExam ? latestExam.score : "-"}</div>
                </div>
                <div className="profile-stat">
                  <div className="small">Streak</div>
                  <div className="card-title">{history.length > 0 ? `${historyInsights.streakDays} hari` : "-"}</div>
                </div>
              </div>
            </div>
            <div className="sticker-row">
              {displayedStickers.length === 0 ? (
                <div className="small">Stiker akan muncul saat anak mencapai target atau menyelesaikan ujian.</div>
              ) : (
                displayedStickers.map((item) => (
                  <div key={item.id} className="sticker-badge">
                    {item.title}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="study-mission-grid">
          {studyMission.map((item) => (
            <div key={item.label} className="study-mission-card">
              <div className="small">{item.label}</div>
              <div className="card-title">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="stats-grid">
          <div className="stat-card emphasis">
            <div className="small">Total Soal</div>
            <div className="stat-value">{data.entries.length}</div>
          </div>
          <div className="stat-card">
            <div className="small">Sudah Dikerjakan</div>
            <div className="stat-value">{masteredCount}</div>
          </div>
          <div className="stat-card">
            <div className="small">Progress</div>
            <div className="stat-value">{progress}%</div>
          </div>
          <div className="stat-card">
            <div className="small">Kelas Aktif</div>
            <div className="stat-value">{grade === "Semua" ? grades.length - 1 : grade.replace("Kelas ", "")}</div>
          </div>
          <div className="stat-card">
            <div className="small">Rekap Percobaan</div>
            <div className="stat-value">{remoteStats.attemptCount}</div>
          </div>
          <div className="stat-card">
            <div className="small">Nilai Terbaik</div>
            <div className="stat-value">{remoteStats.bestScore}</div>
          </div>
          <div className="stat-card">
            <div className="small">Rata-rata Ujian</div>
            <div className="stat-value">{remoteStats.averageScore}</div>
          </div>
        </div>
        <div className="card leaderboard-panel">
          <div className="learning-card-top">
            <span className="badge">Leaderboard</span>
            <span className="topic-chip active">{grade === "Semua" ? "Kelas 1" : grade}</span>
          </div>
          <div className="card-sub">Peringkat diambil dari nilai ujian terbaik tiap siswa pada kelas yang dipilih.</div>
          <div className="leaderboard-summary-row">
            <div className="leaderboard-summary-card">
              <div className="small">Peserta</div>
              <div className="card-title">{leaderboard.length}</div>
            </div>
            <div className="leaderboard-summary-card">
              <div className="small">Nilai Tertinggi</div>
              <div className="card-title">{leaderboard[0]?.score ?? 0}</div>
            </div>
            <div className="leaderboard-summary-card">
              <div className="small">Topik</div>
              <div className="card-title">{topic === "Semua" ? "Semua topik" : topic}</div>
            </div>
          </div>
          <div className="leaderboard-insight-row">
            <div className="leaderboard-insight-card">
              <div className="small">Pemimpin kelas</div>
              <div className="card-title">{leaderboardInsights.leader?.userName ?? "Belum ada"}</div>
              <div className="card-sub">
                {leaderboardInsights.leader
                  ? `Skor ${leaderboardInsights.leader.score} • ${leaderboardInsights.leader.topic === "Semua" ? "Semua topik" : leaderboardInsights.leader.topic}`
                  : "Selesaikan ujian pertama untuk mengisi posisi teratas."}
              </div>
            </div>
            <div className="leaderboard-insight-card">
              <div className="small">Posisi kamu</div>
              <div className="card-title">
                {user
                  ? leaderboardInsights.userEntry
                    ? `#${leaderboardInsights.userEntry.rank}`
                    : "Belum masuk"
                  : "Login dulu"}
              </div>
              <div className="card-sub">
                {user
                  ? leaderboardInsights.userEntry
                    ? `Nilai terbaik ${leaderboardInsights.userEntry.score} di ${leaderboardInsights.userEntry.topic === "Semua" ? "semua topik" : leaderboardInsights.userEntry.topic}.`
                    : "Kerjakan ujian agar namamu muncul di leaderboard kelas."
                  : "Masuk sebagai siswa untuk melihat posisi pribadimu."}
              </div>
            </div>
            <div className="leaderboard-insight-card">
              <div className="small">Target berikutnya</div>
              <div className="card-title">
                {leaderboardInsights.userEntry?.rank === 1
                  ? "Pertahankan puncak"
                  : leaderboardInsights.nextTarget
                    ? `${leaderboardInsights.gapToTarget} poin lagi`
                    : "Mulai isi papan skor"}
              </div>
              <div className="card-sub">
                {leaderboardInsights.userEntry?.rank === 1
                  ? "Pertahankan akurasi supaya tetap di peringkat teratas."
                  : leaderboardInsights.nextTarget
                    ? `Kejar ${leaderboardInsights.nextTarget.userName} yang saat ini ada di peringkat ${leaderboardInsights.nextTarget.rank}.`
                    : "Belum ada target karena leaderboard masih kosong."}
              </div>
            </div>
          </div>
          {leaderboardLoading ? (
            <div className="small">Memuat leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="small">Belum ada nilai ujian untuk kelas ini.</div>
          ) : (
            <div className="history-grid leaderboard-grid">
              {leaderboard.map((item) => (
                <div
                  key={`${item.rank}-${item.userName}`}
                  className={`history-card leaderboard-card ${item.rank <= 3 ? "top-rank" : ""}`}
                >
                  <div className="leaderboard-rank">
                    <span className="leaderboard-rank-badge">
                      {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `#${item.rank}`}
                    </span>
                    <span className="small">
                      {user && normalizeText(item.userName) === normalizeText(user.name) ? "Kamu" : `Peringkat ${item.rank}`}
                    </span>
                  </div>
                  <div className="card-title">{item.userName}</div>
                  <div className="card-sub">
                    Nilai {item.score} • {item.correct}/{item.total} benar
                  </div>
                  <div className="small">{item.topic === "Semua" ? "Semua topik" : item.topic}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="class-summary-grid">
          {classSummary.map((item) => (
            <div key={item.grade} className="class-summary-card">
              <div className="small">{item.grade}</div>
              <div className="card-title">{item.total} soal</div>
              <div className="card-sub">{item.completed} sudah dipahami</div>
            </div>
          ))}
        </div>
        <div className="links">
          {grades.map((item) => (
            <button key={item} className={`btn ${grade === item ? "primary" : ""}`} onClick={() => setGrade(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="learning-control-panel">
          <div className="learning-control-head">
            <div>
              <div className="small">Kontrol belajar</div>
              <div className="card-title">Atur fokus materi dan mulai sesi dengan cepat</div>
            </div>
            <div className="learning-control-summary">
              <div className="learning-control-pill">Kelas {grade === "Semua" ? "semua" : grade}</div>
              <div className="learning-control-pill">{topic === "Semua" ? "Semua topik" : topic}</div>
              <div className="learning-control-pill">{filtered.length} hasil siap dipakai</div>
              <div className="learning-control-pill">{practiceMode ? "Sesi sedang aktif" : "Belum ada sesi aktif"}</div>
            </div>
          </div>
          <div className="topic-row learning-topic-row">
            {topics.filter((item) => item !== "Semua").map((item) => (
              <button
                key={item}
                className={`topic-chip ${topic === item ? "active" : ""}`}
                onClick={() => setTopic((prev) => (prev === item ? "Semua" : item))}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="form learning-control-form">
            <div className="grid">
              <label className="full">
                <span>Cari Materi</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kelas, topik, tipe soal, atau kata kunci..."
                />
              </label>
            </div>
          </div>
          <div className="learning-filter-meta">
            <div className="small">
              {hasActiveFilters
                ? `Filter aktif: ${topic === "Semua" ? "semua topik" : topic}${search.trim() ? ` • kata kunci "${search.trim()}"` : ""}`
                : "Belum ada filter tambahan. Semua materi pada kelas aktif siap ditampilkan."}
            </div>
            {hasActiveFilters && (
              <button
                className="btn outline btn-sm"
                onClick={() => {
                  setTopic("Semua");
                  setSearch("");
                }}
              >
                Reset Filter
              </button>
            )}
          </div>
          <div className="actions learning-actions learning-control-actions">
            {!practiceMode ? (
              <>
                <button className="btn" onClick={() => startSession("practice")} disabled={filtered.length === 0}>
                  Mulai Mode Latihan
                </button>
                <button className="btn primary" onClick={() => startSession("exam")} disabled={filtered.length === 0}>
                  Mulai Mode Ujian 10 Soal
                </button>
              </>
            ) : (
              <button className="btn" onClick={stopSession}>
                Tutup Sesi
              </button>
            )}
            <button className="btn outline" onClick={() => setMastery({})}>
              Reset Progress
            </button>
            <button className="btn outline" onClick={() => setSessionStats({ correct: 0, attempted: 0 })}>
              Reset Sesi
            </button>
            {!authToken ? (
              <button className="btn outline" onClick={() => onRequireLogin?.()}>
                Login Admin Soal
              </button>
            ) : (
              <button className="btn primary" onClick={() => setEditorOpen((prev) => !prev)}>
                {editorOpen ? "Tutup Editor Soal" : "Edit Bank Soal"}
              </button>
            )}
          </div>
        </div>
        {authToken && editorOpen && (
          <div className="learning-admin">
            <div className="learning-admin-header">
              <div>
                <h3>Editor Bank Soal</h3>
                <div className="small">Tambah, ubah, dan simpan soal hitung sesuai kelas.</div>
              </div>
              <button className="btn success" onClick={saveEntries} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Bank Soal"}
              </button>
            </div>
            {saveMessage && <div className="learning-status">{saveMessage}</div>}
            <div className="card learning-editor-card">
              <div className="grid">
                <label className="full">
                  <span>Cari di Editor</span>
                  <input
                    value={editorSearch}
                    onChange={(e) => setEditorSearch(e.target.value)}
                    placeholder="Cari ID, kelas, topik, pertanyaan, atau jawaban..."
                  />
                </label>
                <label>
                  <span>Filter Kelas</span>
                  <select value={editorGrade} onChange={(e) => setEditorGrade(e.target.value)}>
                    {editorGrades.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Filter Topik</span>
                  <select value={editorTopic} onChange={(e) => setEditorTopic(e.target.value)}>
                    {editorTopics.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="small">
                Menampilkan {editorVisibleEntries.length} dari {editorFilteredEntries.length} hasil filter, total {data.entries.length} soal.
              </div>
            </div>
            <div className="learning-admin-list">
              {editorVisibleEntries.map((entry) => (
                <div key={entry.id} className="card learning-editor-card">
                  <div className="grid">
                    <label>
                      <span>ID</span>
                      <input value={entry.id} onChange={(e) => updateEntry(entry.id, "id", e.target.value)} />
                    </label>
                    <label>
                      <span>Kelas</span>
                      <input value={entry.grade} onChange={(e) => updateEntry(entry.id, "grade", e.target.value)} />
                    </label>
                    <label>
                      <span>Topik</span>
                      <input value={entry.topic} onChange={(e) => updateEntry(entry.id, "topic", e.target.value)} />
                    </label>
                    <label>
                      <span>Level</span>
                      <input value={entry.level} onChange={(e) => updateEntry(entry.id, "level", e.target.value)} />
                    </label>
                    <label className="full">
                      <span>Pertanyaan</span>
                      <input
                        value={entry.question}
                        onChange={(e) => updateEntry(entry.id, "question", e.target.value)}
                      />
                    </label>
                    <label>
                      <span>Jawaban</span>
                      <input value={entry.answer} onChange={(e) => updateEntry(entry.id, "answer", e.target.value)} />
                    </label>
                    <label>
                      <span>Petunjuk</span>
                      <input value={entry.hint} onChange={(e) => updateEntry(entry.id, "hint", e.target.value)} />
                    </label>
                    <label className="full">
                      <span>Penjelasan</span>
                      <input
                        value={entry.explanation}
                        onChange={(e) => updateEntry(entry.id, "explanation", e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="actions learning-actions">
                    <button className="btn outline" onClick={() => duplicateEntry(entry)}>
                      Duplikat
                    </button>
                    <button className="btn" onClick={() => removeEntry(entry.id)}>
                      Hapus Soal
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="card learning-editor-card">
              <h3>Tambah Soal Baru</h3>
              <div className="grid">
                <label>
                  <span>ID</span>
                  <input value={newEntry.id} onChange={(e) => setNewEntry((prev) => ({ ...prev, id: e.target.value }))} />
                </label>
                <label>
                  <span>Kelas</span>
                  <input
                    value={newEntry.grade}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, grade: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Topik</span>
                  <input
                    value={newEntry.topic}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, topic: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Level</span>
                  <input
                    value={newEntry.level}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, level: e.target.value }))}
                  />
                </label>
                <label className="full">
                  <span>Pertanyaan</span>
                  <input
                    value={newEntry.question}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, question: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Jawaban</span>
                  <input
                    value={newEntry.answer}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, answer: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Petunjuk</span>
                  <input
                    value={newEntry.hint}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, hint: e.target.value }))}
                  />
                </label>
                <label className="full">
                  <span>Penjelasan</span>
                  <input
                    value={newEntry.explanation}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, explanation: e.target.value }))}
                  />
                </label>
              </div>
              <div className="actions">
                <button className="btn primary" onClick={addEntry}>
                  Tambah ke Bank Soal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {!practiceMode ? (
        <div className="container">
          <div className="practice-summary-card">
            <div>
              <div className="small">Kelas terpilih</div>
              <div className="card-title">{grade}</div>
            </div>
            <div>
              <div className="small">Topik terpilih</div>
              <div className="card-title">{topic === "Semua" ? "Semua Topik" : topic}</div>
            </div>
            <div>
              <div className="small">Akurasi sesi</div>
              <div className="card-title">
                {sessionStats.attempted === 0 ? "0%" : `${Math.round((sessionStats.correct / sessionStats.attempted) * 100)}%`}
              </div>
            </div>
            <div>
              <div className="small">Hasil ditemukan</div>
              <div className="card-title">{filtered.length} soal</div>
            </div>
            <div>
              <div className="small">Mode latihan</div>
              <div className="card-title">ABCD + suara + ujian</div>
            </div>
          </div>
          <div className="history-panel">
            <div className="history-panel-header">
              <div>
                <h3>Riwayat Belajar</h3>
                <div className="small">Hasil terbaru disimpan di browser untuk memantau perkembangan anak.</div>
              </div>
              {history.length > 0 && (
                <button className="btn outline btn-sm" onClick={() => setHistory([])}>
                  Hapus Riwayat
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="small">Belum ada riwayat. Mulai latihan atau ujian untuk menyimpan hasil belajar.</div>
            ) : (
              <>
                <div className="history-summary-row">
                  <div className="history-summary-card">
                    <div className="small">Total sesi</div>
                    <div className="card-title">{history.length}</div>
                  </div>
                  <div className="history-summary-card">
                    <div className="small">Nilai terbaik</div>
                    <div className="card-title">{Math.max(...history.map((item) => item.score))}</div>
                  </div>
                  <div className="history-summary-card">
                    <div className="small">Streak belajar</div>
                    <div className="card-title">{historyInsights.streakDays} hari</div>
                  </div>
                  <div className="history-summary-card">
                    <div className="small">Trend 3 sesi</div>
                    <div className="card-title">{historyInsights.trendLabel}</div>
                  </div>
                </div>
                <div className="history-insight-bar">
                  <div className="history-insight-item">
                    <span className="small">Topik aktif</span>
                    <span className="history-insight-value">{historyInsights.focusTopic}</span>
                  </div>
                  <div className="history-insight-item">
                    <span className="small">Mode dominan</span>
                    <span className="history-insight-value">{historyInsights.dominantMode}</span>
                  </div>
                  <div className="history-insight-item">
                    <span className="small">Rata-rata terbaru</span>
                    <span className="history-insight-value">{historyInsights.recentAverage}</span>
                  </div>
                </div>
                {historyTopicMomentum.length > 0 && (
                  <div className="history-topic-strip">
                    {historyTopicMomentum.map((item) => (
                      <div key={item.topicName} className="history-topic-card">
                        <div className="history-topic-top">
                          <div className="card-title">{item.topicName}</div>
                          <span className={`history-topic-chip ${item.tone}`}>{item.status}</span>
                        </div>
                        <div className="card-sub">
                          {item.sessionCount} sesi • mode terakhir {item.latestMode}
                        </div>
                        <div className="history-topic-score">Rata-rata {item.averageScore}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="history-grid">
                {history.slice(0, 6).map((item) => (
                  <div key={item.id} className={`history-card history-card-${item.mode}`}>
                    <div className="history-card-top">
                      <span className={`history-mode-chip ${item.mode === "exam" ? "exam" : "practice"}`}>
                        {item.mode === "exam" ? "Ujian" : "Latihan"}
                      </span>
                      <span className="small">{item.grade}</span>
                    </div>
                    <div className="card-title">{item.score}</div>
                    <div className="card-sub">
                      {item.topic === "Semua" ? "Semua topik" : item.topic} • {item.correct}/{item.total} benar
                    </div>
                    <div className="history-card-footer">
                      <span className="small">{new Date(item.ts).toLocaleDateString("id-ID")}</span>
                      <span className="small">{item.stars}★</span>
                    </div>
                  </div>
                ))}
                </div>
              </>
            )}
          </div>
          <div className="question-bank-panel">
            <div className="question-bank-head">
              <div>
                <h3>Bank Soal Belajar</h3>
                <div className="results-note">
                  {hasVisibleTruncation
                    ? `Menampilkan ${visibleEntries.length} soal pertama dari ${filtered.length} hasil agar halaman tetap ringan.`
                    : `Menampilkan ${visibleEntries.length} soal siap dipelajari untuk fokus ${topic === "Semua" ? "semua topik" : topic}.`}
                </div>
              </div>
              <div className="question-bank-summary">
                <div className="question-bank-pill">Kelas {grade === "Semua" ? "semua" : grade}</div>
                <div className="question-bank-pill">{topic === "Semua" ? "Semua topik" : topic}</div>
                <div className="question-bank-pill">Skor terselesaikan {masteredCount}</div>
              </div>
            </div>
            {visibleEntries.length === 0 ? (
              <div className="question-empty-state">
                <div className="question-empty-badge">0 hasil</div>
                <div className="question-empty-title">{emptyStateTitle}</div>
                <div className="card-sub">{emptyStateDescription}</div>
                {hasActiveFilters && (
                  <div className="actions learning-actions center">
                    <button
                      className="btn outline"
                      onClick={() => {
                        setTopic("Semua");
                        setSearch("");
                      }}
                    >
                      Reset Filter Soal
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="cards question-bank-grid">
                {visibleEntries.map((entry) => (
                  <div key={entry.id} className="card learning-card math-card question-bank-card">
                    <div className="learning-card-top">
                      <span className="badge">{entry.grade}</span>
                      <span className="topic-chip active">{entry.topic}</span>
                      <span className="small level-chip">{entry.level}</span>
                    </div>
                    <div className="question-bank-card-body">
                      <div className="card-title">{entry.question}</div>
                      <div className="card-sub">{entry.hint || "Kerjakan pelan-pelan dan periksa kembali hasilnya."}</div>
                    </div>
                    {revealedAnswers[entry.id] && (
                      <div className="math-answer-box">
                        <div className="math-answer-value">Jawaban: {entry.answer}</div>
                        <div className="card-sub">{entry.explanation}</div>
                      </div>
                    )}
                    <div className="question-bank-footer">
                      <div className="small question-bank-score">Skor {mastery[entry.id] || 0}</div>
                      <div className="actions learning-actions">
                        <button
                          className="btn"
                          onClick={() =>
                            setRevealedAnswers((prev) => ({
                              ...prev,
                              [entry.id]: !prev[entry.id],
                            }))
                          }
                        >
                          {revealedAnswers[entry.id] ? "Sembunyikan Jawaban" : "Lihat Jawaban"}
                        </button>
                        <button className="btn success" onClick={() => markSolved(entry.id)}>
                          Sudah Bisa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="container">
          {examFinished ? (
            <div className="card learning-drill math-drill">
              <div className="result-topbar">
                <div className="session-mode-badge">Mode Ujian</div>
                <div className="result-chip-row">
                  <span className="result-chip">{grade === "Semua" ? "Semua kelas" : grade}</span>
                  <span className="result-chip">{topic === "Semua" ? "Semua topik" : topic}</span>
                  <span className="result-chip">Akurasi {examScore}%</span>
                </div>
              </div>
              <h3>Hasil Ujian</h3>
              <div className="practice-summary-card">
                <div>
                  <div className="small">Nilai</div>
                  <div className="card-title">{examScore}</div>
                </div>
                <div>
                  <div className="small">Bintang</div>
                  <div className="card-title stars">{examStarsText.slice(0, 5)}</div>
                </div>
                <div>
                  <div className="small">Benar</div>
                  <div className="card-title">
                    {examCorrectCount} / {sessionQueue.length}
                  </div>
                </div>
                <div>
                  <div className="small">Perlu diulang</div>
                  <div className="card-title">{examWrongResults.length} soal</div>
                </div>
              </div>
              <div className="result-hero-panel">
                <div className="result-hero-copy">
                  <div className="small">Ringkasan performa</div>
                  <div className="result-hero-title">
                    {examScore >= 90
                      ? "Performa sangat kuat"
                      : examScore >= 75
                        ? "Performa sudah bagus"
                        : examScore >= 60
                          ? "Performa terus berkembang"
                          : "Masih perlu latihan lagi"}
                  </div>
                  <div className="card-sub">
                    {examWrongResults.length === 0
                      ? "Semua soal berhasil diselesaikan dengan tepat. Pertahankan ritme belajar ini."
                      : "Gunakan pembahasan soal yang belum tepat untuk mengulang topik yang masih menantang."}
                  </div>
                </div>
                <div className="result-hero-stats">
                  <div className="result-hero-stat">
                    <div className="small">Benar</div>
                    <div className="card-title">{examCorrectCount}</div>
                  </div>
                  <div className="result-hero-stat">
                    <div className="small">Salah</div>
                    <div className="card-title">{examWrongResults.length}</div>
                  </div>
                  <div className="result-hero-stat">
                    <div className="small">Stiker Baru</div>
                    <div className="card-title">{earnedThisExam.length}</div>
                  </div>
                </div>
              </div>
              <div className="result-highlight">
                <div className="result-highlight-label">Pencapaian</div>
                <div className="result-highlight-value">
                  {examScore >= 90
                    ? "Luar biasa"
                    : examScore >= 75
                      ? "Bagus sekali"
                      : examScore >= 60
                        ? "Terus semangat"
                        : "Ayo coba lagi"}
                </div>
              </div>
              {examCelebrationMoments.length > 0 && (
                <div className="result-celebration-row">
                  {examCelebrationMoments.map((item) => (
                    <div key={`${item.label}-${item.value}`} className="result-celebration-chip">
                      <span className="small">{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="result-next-panel">
                <div className="small">Target berikutnya</div>
                <div className="result-next-title">{examNextTarget.title}</div>
                <div className="card-sub">{examNextTarget.description}</div>
                <div className="result-next-focus">{examNextTarget.focus}</div>
              </div>
              {examReviewInsights.length > 0 && (
                <div className="result-review-panel">
                  <div className="small">Topik yang perlu diulang</div>
                  <div className="result-review-grid">
                    {examReviewInsights.map((item) => (
                      <div key={item.topicName} className="result-review-item">
                        <div className="card-title">{item.topicName}</div>
                        <div className="card-sub">
                          {item.count} soal • level {item.level}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {earnedThisExam.length > 0 && (
                <div className="earned-stickers-panel">
                  <div className="small">Stiker baru didapat</div>
                  <div className="sticker-row center">
                    {earnedThisExam.map((item) => (
                      <div key={item.id} className="sticker-badge big">
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="exam-result-card">
                <div className="small results-note">
                  {examWrongResults.length === 0
                    ? "Hebat, semua soal terjawab benar."
                    : "Review soal yang belum tepat supaya anak bisa mengulang topik yang masih sulit."}
                </div>
                {examWrongReviewCards.length > 0 &&
                  examWrongReviewCards.map((item) => (
                    <div key={`${item.id}-${item.selectedAnswer}`} className="exam-result-item">
                      <div className="exam-result-item-top">
                        <div className="result-chip-row review">
                          <span className="result-chip">{item.topic}</span>
                          <span className="result-chip">{item.level}</span>
                        </div>
                        <span className={`review-priority-chip ${item.reviewTone}`}>{item.reviewLabel}</span>
                      </div>
                      <div className="card-title">{item.question}</div>
                      <div className="card-sub">Jawaban dipilih: {item.selectedAnswer}</div>
                      <div className="math-answer-value">Jawaban benar: {item.correctAnswer}</div>
                      <div className="card-sub">{item.explanation}</div>
                      <div className="review-hint">{item.reviewHint}</div>
                    </div>
                  ))}
              </div>
              <div className="actions learning-actions center">
                <button className="btn primary" onClick={() => startSession("exam")}>
                  Ulangi Ujian
                </button>
                <button className="btn outline" onClick={stopSession}>
                  Kembali ke Belajar
                </button>
              </div>
            </div>
          ) : currentQuestion ? (
            <div
              key={`${currentQuestion.id}-${currentIndex}`}
              className={`card learning-drill math-drill session-card session-card-${selectedChoice ? feedbackTone : "idle"}`}
            >
              <div className="session-topbar">
                <div className="session-pill">{sessionMode === "exam" ? "Mode Ujian" : "Mode Latihan"}</div>
                <div className="session-pill soft">
                  {sessionMode === "exam" ? `${sessionQueue.length} soal ujian` : `${sessionQueue.length} soal latihan`}
                </div>
              </div>
              <div className="session-progress-panel">
                <div className="session-progress-head">
                  <div>
                    <div className="small">Sesi aktif</div>
                    <div className="session-progress-title">
                      {sessionMode === "exam"
                        ? `Kerjakan soal ${currentIndex + 1} dari ${sessionQueue.length}`
                        : `Lanjut latihan soal ${currentIndex + 1}`}
                    </div>
                  </div>
                  <div className="session-progress-meta">
                    <span className="session-progress-pill">
                      Benar {sessionStats.correct}/{Math.max(sessionStats.attempted, 1)}
                    </span>
                    <span className="session-progress-pill">
                      {sessionMode === "exam" ? "Target cepat dan tepat" : "Target paham dan konsisten"}
                    </span>
                  </div>
                </div>
                <div className="session-progress-track">
                  <div
                    className={`session-progress-fill ${selectedChoice ? "settled" : "pulse"}`}
                    style={{ width: `${Math.max(((currentIndex + 1) / Math.max(sessionQueue.length, 1)) * 100, 8)}%` }}
                  />
                </div>
              </div>
              <div className="session-stats-row">
                <div className="session-stat-box">
                  <div className="small">Posisi</div>
                  <div className="card-title">
                    {currentIndex + 1} / {sessionQueue.length}
                  </div>
                </div>
                <div className="session-stat-box">
                  <div className="small">Skor Soal</div>
                  <div className="card-title">{mastery[currentQuestion.id] || 0}</div>
                </div>
                <div className="session-stat-box">
                  <div className="small">Akurasi</div>
                  <div className="card-title">
                    {sessionStats.attempted === 0 ? "0%" : `${Math.round((sessionStats.correct / sessionStats.attempted) * 100)}%`}
                  </div>
                </div>
              </div>
              <div className="small">
                {sessionMode === "exam" ? "Fokus pada kecepatan dan ketelitian." : "Kerjakan tenang, soal salah akan muncul lagi untuk penguatan."}
              </div>
              {sessionMode === "exam" && (
                <div className={`exam-timer ${examTimeLeft <= 5 ? "danger" : examTimeLeft <= 10 ? "warning" : "safe"}`}>
                  <div className="small">Waktu: {examTimeLeft}s</div>
                  <div className="timer-bar">
                    <div className="timer-bar-fill" style={{ width: `${(examTimeLeft / 20) * 100}%` }} />
                  </div>
                </div>
              )}
              <div className="small">
                Benar {sessionStats.correct} dari {sessionStats.attempted} percobaan
              </div>
              <div className="learning-card-top practice-meta">
                <span className="badge">{currentQuestion.grade}</span>
                <span className="topic-chip active">{currentQuestion.topic}</span>
                <span className="small level-chip">{currentQuestion.level}</span>
              </div>
              <div className="question-stage">
                <div className={`drill-id ${selectedChoice ? "answered" : "live"}`}>{currentQuestion.question}</div>
              </div>
              <div className="card-sub">{currentQuestion.hint}</div>
              <div className="small practice-instruction">
                {sessionMode === "exam"
                  ? "Pilih jawaban A, B, C, atau D lalu klik lanjut."
                  : "Pilih jawaban A, B, C, atau D. Soal yang salah akan muncul lagi nanti."}
              </div>
              <div className="option-grid">
                {currentOptions.map((option, index) => {
                  const optionLetter = ["A", "B", "C", "D"][index] || String(index + 1);
                  const isCorrect = normalizeText(option) === normalizeText(currentQuestion.answer);
                  const isSelected = option === selectedChoice;
                  const state =
                    !selectedChoice ? "" : isCorrect ? "correct" : isSelected ? "wrong" : "neutral";

                  return (
                    <button
                      key={`${currentQuestion.id}-${option}`}
                      className={`option-button ${state} ${isSelected ? "selected" : ""}`}
                      onClick={() => chooseAnswer(option)}
                      disabled={Boolean(selectedChoice)}
                    >
                      <span className="option-letter">{optionLetter}</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
              {feedback && <div className={`learning-status status-${feedbackTone} feedback-banner`}>{feedback}</div>}
              <div className="actions learning-actions center">
                <button
                  className="btn outline"
                  onClick={() => {
                    setFeedbackTone("info");
                    setFeedback(`Jawaban: ${currentQuestion.answer}. ${currentQuestion.explanation}`);
                  }}
                >
                  Lihat Pembahasan
                </button>
                <button className="btn primary action-next-button" onClick={nextQuestion} disabled={!selectedChoice}>
                  {sessionMode === "exam" && currentIndex === sessionQueue.length - 1 ? "Selesai Ujian" : "Soal Berikutnya"}
                </button>
              </div>
            </div>
          ) : (
            <div className="small">Belum ada soal untuk filter yang dipilih.</div>
          )}
        </div>
      )}
    </div>
  );
}
