/*
  # Estrutura de tabelas para denúncias

  1. Novas Tabelas
    - `complaints` - Tabela principal de denúncias
      - `id` (uuid, chave primária)
      - `number` (texto, número da denúncia)
      - `category` (texto)
      - `characteristic` (texto)
      - `status` (texto)
      - `responsible_instance` (texto)
      - `responsible1` (texto)
      - `responsible2` (texto)
      - `received_date` (data)
      - `description` (texto)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `complaint_procedures` - Procedimentos realizados
      - `id` (uuid, chave primária)
      - `complaint_id` (uuid, referência a complaints)
      - `procedure_type` (texto)
      - `completed` (booleano)
      - `created_at` (timestamp)
    
    - `complaint_interviews` - Entrevistas realizadas
      - `id` (uuid, chave primária)
      - `complaint_id` (uuid, referência a complaints)
      - `interview_type` (texto)
      - `scheduled_date` (data)
      - `transcription` (texto)
      - `created_at` (timestamp)
    
    - `complaint_actions` - Plano de ação
      - `id` (uuid, chave primária)
      - `complaint_id` (uuid, referência a complaints)
      - `action_type` (texto)
      - `description` (texto)
      - `responsible` (texto)
      - `status` (texto)
      - `start_date` (data)
      - `end_date` (data)
      - `observation` (texto)
      - `created_at` (timestamp)
    
    - `complaint_conclusions` - Conclusões
      - `id` (uuid, chave primária)
      - `complaint_id` (uuid, referência a complaints)
      - `procedencia` (texto)
      - `closing_date` (data)
      - `justification` (texto)
      - `ceo_approval_status` (texto)
      - `ceo_approval_date` (data)
      - `ceo_comments` (texto)
      - `created_at` (timestamp)

  2. Índices
    - Índices para otimizar consultas comuns em relatórios
    
  3. Constraints
    - Chaves estrangeiras para garantir integridade referencial
    - Checks para validar valores em campos específicos
*/

-- Tabela principal de denúncias
CREATE TABLE complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  category text NOT NULL,
  characteristic text NOT NULL,
  status text NOT NULL CHECK (status IN ('nova', 'investigacao', 'concluida', 'arquivada')),
  responsible_instance text NOT NULL,
  responsible1 text NOT NULL,
  responsible2 text NOT NULL,
  received_date date NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de procedimentos
CREATE TABLE complaint_procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  procedure_type text NOT NULL CHECK (
    procedure_type IN (
      'Entrevista',
      'Análise Documentos',
      'Análise Áudio e vídeo',
      'Análise Acessos',
      'Análise Sistemas',
      'Perito'
    )
  ),
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tabela de entrevistas
CREATE TABLE complaint_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  interview_type text NOT NULL CHECK (
    interview_type IN ('Testemunha', 'Denunciado', 'Denunciante')
  ),
  scheduled_date date NOT NULL,
  transcription text,
  created_at timestamptz DEFAULT now()
);

-- Tabela de ações
CREATE TABLE complaint_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  description text NOT NULL,
  responsible text NOT NULL,
  status text NOT NULL CHECK (
    status IN ('Não iniciado', 'Em andamento', 'Concluído', 'Cancelado', 'Parado')
  ),
  start_date date NOT NULL,
  end_date date NOT NULL,
  observation text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT end_date_after_start_date CHECK (end_date >= start_date)
);

-- Tabela de conclusões
CREATE TABLE complaint_conclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  procedencia text NOT NULL CHECK (
    procedencia IN ('Improcedente', 'Procedente', 'Parcialmente procedente', 'Inconclusiva')
  ),
  closing_date date NOT NULL,
  justification text NOT NULL,
  ceo_approval_status text NOT NULL CHECK (
    ceo_approval_status IN ('pending', 'approved', 'rejected')
  ),
  ceo_approval_date date,
  ceo_comments text,
  created_at timestamptz DEFAULT now()
);

-- Índices para otimizar consultas comuns
CREATE INDEX complaints_status_idx ON complaints(status);
CREATE INDEX complaints_category_idx ON complaints(category);
CREATE INDEX complaints_received_date_idx ON complaints(received_date);
CREATE INDEX complaints_responsible1_idx ON complaints(responsible1);
CREATE INDEX complaint_actions_status_idx ON complaint_actions(status);
CREATE INDEX complaint_conclusions_procedencia_idx ON complaint_conclusions(procedencia);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Views para facilitar relatórios comuns

-- View de status geral das denúncias
CREATE VIEW complaint_status_summary AS
SELECT 
  status,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE DATE_PART('year', received_date) = DATE_PART('year', CURRENT_DATE)) as total_this_year,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400)::numeric(10,2) as avg_days_to_resolution
FROM complaints
GROUP BY status;

-- View de denúncias por categoria
CREATE VIEW complaints_by_category AS
SELECT 
  category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'concluida') as concluded,
  COUNT(*) FILTER (WHERE status = 'investigacao') as in_progress
FROM complaints
GROUP BY category;

-- View de ações pendentes
CREATE VIEW pending_actions AS
SELECT 
  c.number as complaint_number,
  c.category,
  a.action_type,
  a.description,
  a.responsible,
  a.status,
  a.start_date,
  a.end_date
FROM complaints c
JOIN complaint_actions a ON c.id = a.complaint_id
WHERE a.status IN ('Não iniciado', 'Em andamento')
ORDER BY a.end_date;