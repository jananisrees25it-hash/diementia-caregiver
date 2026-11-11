// Rule-Based Cognitive Adaptation Engine & Encouragement Generator

export const evaluateCognitivePerformance = ({
  score,
  correct,
  incorrect,
  timeSeconds,
  currentDifficulty = 'easy'
}) => {
  const total = (correct || 0) + (incorrect || 0);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;

  let nextDifficulty = currentDifficulty;
  let feedbackMessage = '';
  let aiReasoning = '';

  // Positive encouraging messages
  const greatJobMessages = [
    "Fantastic work! Your memory and focus were spot-on!",
    "Great job! Exercising your brain keeps your day energized!",
    "Wonderful effort! You are making steady, confident progress!",
    "Superb! Your recall was quick and accurate today!"
  ];

  const supportiveMessages = [
    "Great effort! Practicing each day is what truly matters.",
    "Well done! Let's take a deep breath and try another round when you are ready.",
    "Nice try! Brain exercises are all about gentle practice and having fun.",
    "Good job! Each puzzle helps keep your mind active and alert."
  ];

  if (accuracy >= 85 && timeSeconds <= 45) {
    feedbackMessage = greatJobMessages[Math.floor(Math.random() * greatJobMessages.length)];
    if (currentDifficulty === 'easy') {
      nextDifficulty = 'medium';
      aiReasoning = 'High accuracy and swift response! AI has raised the next difficulty to Medium.';
    } else if (currentDifficulty === 'medium') {
      nextDifficulty = 'hard';
      aiReasoning = 'Outstanding focus! AI has advanced the next challenge to Hard level.';
    } else {
      aiReasoning = 'Mastery demonstrated at Hard difficulty! Keep up this wonderful streak.';
    }
  } else if (accuracy < 60 || timeSeconds > 90) {
    feedbackMessage = supportiveMessages[Math.floor(Math.random() * supportiveMessages.length)];
    if (currentDifficulty === 'hard') {
      nextDifficulty = 'medium';
      aiReasoning = 'Adjusted to Medium difficulty to provide a smoother, more relaxing pace.';
    } else if (currentDifficulty === 'medium') {
      nextDifficulty = 'easy';
      aiReasoning = 'Adjusted to Easy difficulty to build confidence and enjoy comfortable recall.';
    } else {
      aiReasoning = 'Take your time and enjoy each step! Remember, there is no hurry.';
    }
  } else {
    feedbackMessage = "Good job! Steady and balanced practice.";
    aiReasoning = 'Consistent balanced performance. Maintaining current difficulty for steady practice.';
  }

  return {
    accuracy,
    nextDifficulty,
    feedbackMessage,
    aiReasoning,
    timestamp: new Date().toISOString()
  };
};

export const MEDICAL_DISCLAIMER = "Notice: This application is a cognitive practice and routine support tool designed to promote daily engagement and structured habits. It is NOT a medical diagnostic device or treatment system.";
