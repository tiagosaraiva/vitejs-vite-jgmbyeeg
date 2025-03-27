import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
}

export interface HistoryEntry {
  timestamp: string;
  user: string;
  field: string;
  oldValue: any;
  newValue: any;
  type: 'update' | 'create' | 'delete';
}

export type Procedure = 'Entrevista' | 'Análise Documentos' | 'Análise Áudio e vídeo' | 'Análise Acessos' | 'Análise Sistemas' | 'Perito';

export type InterviewType = 'Testemunha' | 'Denunciado' | 'Denunciante';

export type ActionType = 'Advertência' | 'Transferência' | 'Demissão' | 'Capacitação liderança' | 'Capacitação colaborador' | 'Comunicação interna' | 'Contratação colaborador' | 'Feedback' | 'Esclarecer dúvida' | 'Contratação ferramenta' | 'Política' | 'Processo/Procedimento' | 'Monitoraramento' | 'Repasse Gente e Gestão' | 'Outros';

export type ActionStatus = 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Cancelado' | 'Parado';

export type ProcedenciaType = 'Improcedente' | 'Procedente' | 'Parcialmente procedente' | 'Inconclusiva';

export type CEOApprovalStatus = 'pending' | 'approved' | 'rejected';

export type JudgmentType = 'Procedente' | 'Improcedente' | 'Inconclusivo' | 'Parcialmente procedente';

export interface AnalysisPoint {
  point: string;
  conclusion: string;
  judgment: JudgmentType;
}

export interface Interview {
  type: InterviewType;
  scheduledDate: string;
  transcription: string;
}

export interface Action {
  type: ActionType;
  description: string;
  responsible: string;
  status: ActionStatus;
  startDate: string;
  endDate: string;
  observation?: string;
  ceoApprovalStatus: CEOApprovalStatus;
  ceoApprovalDate?: string;
  ceoComments?: string;
}

export interface Conclusion {
  procedencia: ProcedenciaType;
  dataEncerramento: string;
  justification: string;
  observation?: string;
  ceoApprovalStatus: CEOApprovalStatus;
  ceoApprovalDate?: string;
  ceoComments?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'nova' | 'investigacao' | 'concluida' | 'arquivada';
  complaintNumber: string;
  category: string;
  characteristic: string;
  responsibleInstance: string;
  removedMember?: string;
  responsible1: string;
  responsible2: string;
  receivedDate: string;
  complaintAttachment?: string;
  evidenceAttachment?: string;
  procedures: Procedure[];
  analysisPoints: AnalysisPoint[];
  interviews: Interview[];
  actions: Action[];
  conclusion?: Conclusion;
  activeTab: 'info' | 'progress' | 'interviews' | 'actions' | 'conclusion' | 'history';
  history: HistoryEntry[];
  newAnalysisPoint?: string;
  newAnalysisConclusion?: string;
  newAnalysisJudgment?: JudgmentType;
  newInterview?: Partial<Interview>;
  newAction?: Partial<Action>;
}