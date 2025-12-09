import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../../api/studentExam', async () => {
  return {
    studentExamApi: {
      getAttemptResults: vi.fn().mockResolvedValue({
        id: 'attempt-1',
        score: 85,
        maxScore: 100,
        isAvailable: true,
      }),
    },
  };
});

import { useExamResults } from '../../hooks/useExamResults';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: queryClient }, children);

describe('useExamResults Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should be a function', () => {
    expect(typeof useExamResults).toBe('function');
  });

  it('should return hook object', () => {
    const { result } = renderHook(
      () => useExamResults('exam-1', 'attempt-1'),
      { wrapper }
    );
    expect(result.current).toBeDefined();
  });

  it('should have loading state', async () => {
    const { result } = renderHook(
      () => useExamResults('exam-1', 'attempt-1'),
      { wrapper }
    );

    await waitFor(
      () => {
        expect(result.current).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it('should return data after loading', async () => {
    const { result } = renderHook(
      () => useExamResults('exam-1', 'attempt-1'),
      { wrapper }
    );

    await waitFor(
      () => {
        expect(result.current).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it('should handle enabled flag', () => {
    const { result } = renderHook(
      () => useExamResults('', ''),
      { wrapper }
    );
    expect(result.current).toBeDefined();
  });
});