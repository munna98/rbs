import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWorkflowSettings } from '../features/settings/settingsSlice';
import type { WorkflowSettings } from '../features/settings/settingsSlice';

export const useWorkflowSettings = () => {
  const dispatch = useAppDispatch();
  const { workflowSettings: settings, loading } = useAppSelector(
    (state) => state.settings
  );

  useEffect(() => {
    // ✅ Load settings if not already loaded
    if (!settings) {
      dispatch(fetchWorkflowSettings());
    }
  }, [dispatch, settings]);

  const reload = () => {
    dispatch(fetchWorkflowSettings());
  };

  return { settings, loading, reload };
};

// Keep the export for backward compatibility
export type { WorkflowSettings };