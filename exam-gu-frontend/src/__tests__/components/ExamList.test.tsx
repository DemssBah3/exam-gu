import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../api/studentExam', async () => {
  return {
    studentExamApi: {
      getAvailableExams: vi.fn().mockResolvedValue([
        {
          id: 'exam-1',
          title: 'Mathematics Final Exam',
          description: 'Final exam for mathematics course',
          duration: 120,
        },
      ]),
    },
  };
});

import { Exams as ExamList } from '../../pages/student/Exams';

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

describe('ExamList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should render page title', async () => {
    renderWithProviders(<ExamList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Mes Examens/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should render statistics section', async () => {
    renderWithProviders(<ExamList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Total Examens/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should render without crashing', async () => {
    renderWithProviders(<ExamList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Mes Examens|Chargement/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
