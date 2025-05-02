import { createSuddenDeathStrategy } from './suddenDeath';

describe('Sudden Death Strategy', () => {
  let strategy;
  let lastAnswerRef;

  beforeEach(() => {
    lastAnswerRef = { current: true };
    strategy = createSuddenDeathStrategy({ lastAnswerRef });
  });

  test('should have correct initial properties', () => {
    expect(strategy.id).toBe('suddenDeath');
    expect(strategy.name).toBe('Sudden Death');
    expect(strategy.description).toBe('1 question, 30 seconds to answer');
    expect(strategy.timerMode).toBe('perQuestion');
    expect(strategy.timePerQuestion).toBe(30);
    expect(strategy.totalGameTime).toBeNull();
    expect(strategy.maxRounds).toBe(Infinity);
    expect(strategy.maxAIAttempts).toBe(3);
  });

  test('should calculate score correctly', () => {
    const score = strategy.calculateScore({
      isCorrect: true,
      timeLeft: 20,
      AIAttempts: 1,
      round: 2,
      totalTime: 30,
    });

    expect(score).toBeGreaterThan(0);
  });

  test('should return 0 score for incorrect answer', () => {
    const score = strategy.calculateScore({
      isCorrect: false,
      timeLeft: 20,
      AIAttempts: 1,
      round: 2,
      totalTime: 30,
    });

    expect(score).toBe(0);
  });

  test('should continue if the answer is correct', () => {
    const shouldContinue = strategy.shouldContinue({ isCorrect: true });
    expect(shouldContinue).toBe(true);
    expect(lastAnswerRef.current).toBe(true);
  });

  test('should not continue if the answer is incorrect', () => {
    const shouldContinue = strategy.shouldContinue({ isCorrect: false });
    expect(shouldContinue).toBe(false);
    expect(lastAnswerRef.current).toBe(false);
  });

  test('should end if last answer was incorrect', () => {
    lastAnswerRef.current = false;
    const hasEnded = strategy.hasEnded();
    expect(hasEnded).toBe(true);
  });

  test('should not end if last answer was correct', () => {
    lastAnswerRef.current = true;
    const hasEnded = strategy.hasEnded();
    expect(hasEnded).toBe(false);
  });

  test('should return correct initial state', () => {
    const initialState = strategy.getInitialState();
    expect(initialState).toEqual({
      round: 1,
      timeLeft: 30,
      score: 0,
    });
  });

  test('should return correct next state', () => {
    const nextState = strategy.getNextState({ current: { round: 1, timeLeft: 10 } });
    expect(nextState).toEqual({
      round: 2,
      timeLeft: 30,
    });
  });
});