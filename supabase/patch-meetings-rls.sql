-- Allow team members to insert meetings for their own clients
CREATE POLICY "meetings: insert"
  ON public.meetings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = meetings.client_id
      AND (
        clients.assigned_to = auth.uid()
        OR (SELECT manager_id FROM users WHERE id = clients.assigned_to) = auth.uid()
        OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_manager'
      )
    )
  );

-- Allow updates too (for editing meetings)
CREATE POLICY "meetings: update"
  ON public.meetings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = meetings.client_id
      AND (
        clients.assigned_to = auth.uid()
        OR (SELECT manager_id FROM users WHERE id = clients.assigned_to) = auth.uid()
        OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_manager'
      )
    )
  );
