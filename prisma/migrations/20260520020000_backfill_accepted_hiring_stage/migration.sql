-- Bestehende Matches: nach Annahme in Phase „Beworben“
UPDATE "MatchRequest" SET "hiringStage" = 'BEWORBEN' WHERE "status" = 'ACCEPTED' AND "hiringStage" = 'NONE';
