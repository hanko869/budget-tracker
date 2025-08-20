-- Performance indexes to improve query latency for monthly views
-- Safe to run multiple times (IF NOT EXISTS)

BEGIN;

-- Expenditures: speed up monthly filters and ordering
CREATE INDEX IF NOT EXISTS idx_expenditures_date ON public.expenditures (date DESC);
CREATE INDEX IF NOT EXISTS idx_expenditures_created_at ON public.expenditures (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenditures_team_date ON public.expenditures (team_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenditures_member_date ON public.expenditures (member_id, date DESC);

-- Members: speed up lookups by team and ordering by name
CREATE INDEX IF NOT EXISTS idx_members_team_id ON public.members (team_id);
CREATE INDEX IF NOT EXISTS idx_members_name ON public.members (name);

COMMIT;


