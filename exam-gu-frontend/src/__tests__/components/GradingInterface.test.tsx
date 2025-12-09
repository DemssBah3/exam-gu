import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mocks EN PREMIER
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ examId: 'exam-123' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../api/teacherExam', () => ({
  teacherExamApi: {
    getExamAttempts: vi.fn(() => Promise.resolve([
      {
        id: 'attempt-1',
        status: 'SUBMITTED',
        student: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@uqac.ca',
        },
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        answerCount: 2,
        totalQuestions: 3,
      },
      {
        id: 'attempt-2',
        status: 'GRADED',
        student: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@uqac.ca',
        },
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        gradedAt: new Date().toISOString(),
        score: 85,
        answerCount: 3,
      },
    ])),
  },
}));

import { GradeAttempts } from '../../pages/teacher/GradeAttempts';

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

describe('GradeAttempts Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should render grading interface', async () => {
    renderWithProviders(<GradeAttempts />);
    
    await waitFor(() => {
      expect(screen.getByText('Correction des Tentatives')).toBeInTheDocument();
    });
  });

  it('should display total attempts count', async () => {
    renderWithProviders(<GradeAttempts />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Tentatives')).toBeInTheDocument();
    });
  });

  it('should display submitted student name', async () => {
    renderWithProviders(<GradeAttempts />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display submitted student email', async () => {
    renderWithProviders(<GradeAttempts />);
    
    await waitFor(() => {
      expect(screen.getByText('john@uqac.ca')).toBeInTheDocument();
    });
  });

  it('should display graded student name', async () => {
    renderWithProviders(<GradeAttempts />);
    
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should display graded student score', async () => {
    renderWithProviders(<GradeAttempts />);
    
    await waitFor(() => {
      expect(screen.getByText('85 points')).toBeInTheDocument();
    });
  });

  it('should display Corriger button for submitted attempts', async () => {
    renderWithProviders(<GradeAttempts />);
    
    await waitFor(() => {
      const correctionButtons = screen.getAllByText('Corriger');
      expect(correctionButtons.length).toBeGreaterThan(0);
    });
  });

  it('should display Voir button for graded attempts', async () => {
    renderWithProviders(<GradeAttempts />);
    
    await waitFor(() => {
      const viewButtons = screen.getAllByText('Voir');
      expect(viewButtons.length).toBeGreaterThan(0);
    });
  });
});
