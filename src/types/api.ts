export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type LogEntryType = "journal" | "micro_note" | "check_in";

export interface CreateLogEntryRequest {
  type: LogEntryType;
  content: string;
  mood?: number | null;
  energy?: number | null;
  loggedAt?: string | null;
  goalIds?: string[];
  tagValueIds?: string[];
}

export interface UpdateLogEntryRequest {
  content: string;
  mood?: number | null;
  energy?: number | null;
  loggedAt?: string | null;
  goalIds?: string[];
  tagValueIds?: string[];
}

export interface GoalInfo {
  id: string;
  title: string;
  isDefault: boolean;
}

export interface LogEntryResponse {
  id: string;
  userId: string;
  goals: GoalInfo[];
  type: LogEntryType;
  content: string;
  mood: number | null;
  energy: number | null;
  tags: TagResponse[];
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface PersonaResponse {
  id: string;
  userId: string;
  displayName: string | null;
  age: number | null;
  bio: string | null;
  strengths: string | null;
  weaknesses: string | null;
  interests: string | null;
  context: string | null;
  updatedAt: string;
}

export interface UpdatePersonaRequest {
  displayName?: string | null;
  age?: number | null;
  bio?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
  interests?: string | null;
  context?: string | null;
}

export interface ApiError {
  error?: string;
  errors?: Record<string, string>;
}

// --- Categories & Values ---

export interface ValueResponse {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  values: ValueResponse[];
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
}

export interface CreateValueRequest {
  name: string;
  description?: string | null;
}

// --- Goals ---

export type GoalStatus = "active" | "completed" | "paused" | "abandoned";

export interface GoalCategoryInfo {
  id: string;
  name: string;
  color: string | null;
}

export interface GoalResponse {
  id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  isDefault: boolean;
  categories: GoalCategoryInfo[];
  startDate: string | null;
  targetDate: string | null;
  templateType: string | null;
  templateData: Record<string, string> | null;
  entryCount: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  title: string;
  description?: string | null;
  categoryIds?: string[] | null;
  startDate?: string | null;
  targetDate?: string | null;
  templateType?: string | null;
  templateData?: Record<string, string> | null;
}

export interface UpdateGoalRequest {
  title?: string | null;
  description?: string | null;
  categoryIds?: string[] | null;
  startDate?: string | null;
  targetDate?: string | null;
  templateType?: string | null;
  templateData?: Record<string, string> | null;
}

export interface UpdateCategoryRequest {
  name?: string | null;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
}

export interface UpdateValueRequest {
  name?: string | null;
  description?: string | null;
}

export interface UpdateGoalStatusRequest {
  status: GoalStatus;
}

// --- Entry Tags ---

export interface TagResponse {
  id: string;
  name: string;
  categoryName: string;
  categoryColor: string | null;
}

// --- Dashboard ---

export interface DashboardResponse {
  period: PeriodInfo;
  entryStats: EntryStats;
  moodTrend: MetricTrend;
  energyTrend: MetricTrend;
  goalSummary: GoalSummary;
  streak: StreakInfo;
  topValues: TopValueInfo[];
}

export interface PeriodInfo {
  from: string;
  to: string;
  days: number;
}

export interface EntryStats {
  total: number;
  byType: Record<string, number>;
  byDay: DayCount[];
}

export interface DayCount {
  date: string;
  count: number;
}

export interface MetricTrend {
  average: number;
  daily: DayAverage[];
}

export interface DayAverage {
  date: string;
  average: number;
}

export interface GoalSummary {
  active: number;
  completed: number;
  paused: number;
  items: GoalItemInfo[];
}

export interface GoalItemInfo {
  id: string;
  title: string;
  status: string;
}

export interface StreakInfo {
  current: number;
  longest: number;
}

export interface TopValueInfo {
  id: string;
  name: string;
  categoryName: string;
  categoryColor: string | null;
  count: number;
}

// --- AI Insights ---

export interface AnalyzeRequest {
  query: string;
  type?: string;
}

export interface InsightResponse {
  id: string;
  type: string;
  query: string;
  content: string;
  contextSummary: string | null;
  model: string;
  tokensUsed: number | null;
  createdAt: string;
}

export interface PrebuiltPromptResponse {
  id: string;
  label: string;
  query: string;
  type: string;
}

// --- AI Settings ---

export interface AiSettingsResponse {
  id: string;
  tone: string;
  strictness: number;
  focusAreas: string[];
  ignoreAreas: string[];
  customInstructions: string | null;
  language: string;
  updatedAt: string;
}

export interface UpdateAiSettingsRequest {
  tone?: string;
  strictness?: number;
  focusAreas?: string[];
  ignoreAreas?: string[];
  customInstructions?: string | null;
  language?: string;
}
