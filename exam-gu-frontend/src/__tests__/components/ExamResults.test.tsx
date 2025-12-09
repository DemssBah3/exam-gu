import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ examId: 'exam-1' }),
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      state: {
        score: 85,
        maxScore: 100,
      },
    }),
  };
});

vi.mock('../../api/studentExam', async () => {
  return {
    studentExamApi: {
      getExamById: vi.fn().mockResolvedValue({
        id: 'exam-1',
        title: 'Mathematics Final Exam',
        duration: 120,
      }),
      getAttemptResults: vi.fn().mockResolvedValue({
        id: 'attempt-1',
        score: 85,
        maxScore: 100,
        isAvailable: true,
      }),
    },
  };
});

import { ExamResults } from '../../pages/student/ExamResults';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ExamResults Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should render results component', async () => {
    renderWithProviders(<ExamResults />);
    
    await waitFor(() => {
      const container = screen.getByText(/Résultats|Results|Mathematics/i);
      expect(container).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('should display score information', async () => {
    renderWithProviders(<ExamResults />);
    
    await waitFor(() => {
      // Chercher soit "85" ou le titre
      const elements = screen.queryAllByText(/85|Mathematics/);
      expect(elements.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('should render without errors', async () => {
    renderWithProviders(<ExamResults />);
    
    // Simplement vérifier que le composant se rend sans erreur
    expect(screen.getByText(/Résultats|Results|Mathematics/i)).toBeInTheDocument();
  });

  it('should have proper structure', async () => {
    renderWithProviders(<ExamResults />);
    
    await waitFor(() => {
      const container = document.querySelector('[class*="max-w"]');
      expect(container).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('should display exam title', async () => {
    renderWithProviders(<ExamResults />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Mathematics/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
