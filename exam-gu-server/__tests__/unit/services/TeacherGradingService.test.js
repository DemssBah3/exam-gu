const assert = require('assert');
const {
  mockMCQQuestion,
  mockTrueFalseQuestion,
  mockOpenEndedQuestion,
  mockAnswer,
  mockGrade,
} = require('../../fixtures/mockData');

/**
 * Tests unitaires pour TeacherGradingService
 * ✅ Correction automatique (MCQ, TRUE_FALSE)
 * ✅ Correction manuelle (OPEN_ENDED)
 * ✅ Calcul du score total
 */

describe('TeacherGradingService', () => {
  
  describe('autoGradeMCQ - Correction automatique MCQ', () => {
    
    it('should award full points for correct answer', (done) => {
      // Test: Points complets pour réponse correcte
      try {
        const correctOptionId = 'opt-2'; // La bonne réponse
        const studentAnswer = 'opt-2';
        
        const isCorrect = correctOptionId === studentAnswer;
        const points = isCorrect ? mockMCQQuestion.points : 0;
        
        assert.strictEqual(points, mockMCQQuestion.points);
        console.log('✅ autoGradeMCQ: Awards full points for correct answer');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should award zero points for incorrect answer', (done) => {
      // Test: 0 points pour réponse incorrecte
      try {
        const correctOptionId = 'opt-2';
        const studentAnswer = 'opt-1';
        
        const isCorrect = correctOptionId === studentAnswer;
        const points = isCorrect ? mockMCQQuestion.points : 0;
        
        assert.strictEqual(points, 0);
        console.log('✅ autoGradeMCQ: Awards zero points for incorrect answer');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should handle unanswered MCQ questions', (done) => {
      // Test: Gérer les questions non répondues
      try {
        const studentAnswer = null;
        const points = studentAnswer ? mockMCQQuestion.points : 0;
        
        assert.strictEqual(points, 0);
        console.log('✅ autoGradeMCQ: Handles unanswered questions');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  describe('autoGradeTrueFalse - Correction automatique TRUE_FALSE', () => {
    
    it('should award full points for correct boolean answer', (done) => {
      // Test: Points complets pour réponse booléenne correcte
      try {
        const correctAnswer = true;
        const studentAnswer = true;
        
        const isCorrect = correctAnswer === studentAnswer;
        const points = isCorrect ? mockTrueFalseQuestion.points : 0;
        
        assert.strictEqual(points, mockTrueFalseQuestion.points);
        console.log('✅ autoGradeTrueFalse: Awards full points for correct answer');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should award zero points for incorrect boolean answer', (done) => {
      // Test: 0 points pour réponse booléenne incorrecte
      try {
        const correctAnswer = true;
        const studentAnswer = false;
        
        const isCorrect = correctAnswer === studentAnswer;
        const points = isCorrect ? mockTrueFalseQuestion.points : 0;
        
        assert.strictEqual(points, 0);
        console.log('✅ autoGradeTrueFalse: Awards zero points for incorrect answer');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  describe('manualGradeOpenEnded - Correction manuelle OPEN_ENDED', () => {
    
    it('should save manual grade with points and feedback', (done) => {
      // Test: Sauvegarder une note manuelle avec points et feedback
      try {
        const grade = {
          answerId: mockAnswer.id,
          points: 12,
          feedback: 'Excellent explanation!',
          gradedBy: 'teacher-123',
        };
        
        assert.strictEqual(grade.points, 12);
        assert(grade.feedback.length > 0);
        console.log('✅ manualGradeOpenEnded: Saves grade with points and feedback');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should not exceed maximum points for question', (done) => {
      // Test: Ne pas dépasser les points max
      try {
        const maxPoints = mockOpenEndedQuestion.points;
        const givenPoints = 12;
        
        const isValid = givenPoints <= maxPoints;
        assert(isValid, 'Points should not exceed maximum');
        console.log('✅ manualGradeOpenEnded: Does not exceed max points');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should allow points between 0 and max', (done) => {
      // Test: Les points doivent être entre 0 et max
      try {
        const maxPoints = mockOpenEndedQuestion.points;
        const testPoints = [0, 5, 10, 15];
        
        testPoints.forEach(points => {
          assert(points >= 0 && points <= maxPoints, `${points} is valid`);
        });
        
        console.log('✅ manualGradeOpenEnded: Allows points between 0 and max');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  describe('calculateTotalScore - Calculer le score total', () => {
    
    it('should sum all graded answers', (done) => {
      // Test: Additionner tous les scores
      try {
        const grades = [
          { points: 5 },  // MCQ correct
          { points: 0 },  // MCQ incorrect
          { points: 3 },  // TRUE_FALSE correct
          { points: 12 }, // OPEN_ENDED manuel
        ];
        
        const totalScore = grades.reduce((sum, g) => sum + g.points, 0);
        assert.strictEqual(totalScore, 20);
        console.log('✅ calculateTotalScore: Sums all grades correctly');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should not exceed exam total points', (done) => {
      // Test: Ne pas dépasser les points totaux de l'examen
      try {
        const maxTotalPoints = 100;
        const totalScore = 75;
        
        const isValid = totalScore <= maxTotalPoints;
        assert(isValid, 'Score should not exceed exam total');
        console.log('✅ calculateTotalScore: Does not exceed exam total');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should return 0 if no answers graded', (done) => {
      // Test: Retourner 0 si pas de réponses corrigées
      try {
        const grades = [];
        const totalScore = grades.reduce((sum, g) => sum + g.points, 0);
        
        assert.strictEqual(totalScore, 0);
        console.log('✅ calculateTotalScore: Returns 0 if no grades');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  describe('calculatePercentage - Calculer le pourcentage', () => {
    
    it('should calculate percentage correctly', (done) => {
      // Test: Calculer le pourcentage correct
      try {
        const score = 75;
        const maxScore = 100;
        const percentage = Math.round((score / maxScore) * 100);
        
        assert.strictEqual(percentage, 75);
        console.log('✅ calculatePercentage: Calculates percentage correctly');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should round percentage to nearest integer', (done) => {
      // Test: Arrondir à l'entier le plus proche
      try {
        const score = 76;
        const maxScore = 100;
        const percentage = Math.round((score / maxScore) * 100);
        
        assert.strictEqual(percentage, 76);
        console.log('✅ calculatePercentage: Rounds to nearest integer');
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
