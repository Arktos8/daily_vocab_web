"use client";

import { useState, useEffect, useCallback } from 'react';
import { Word, Difficulty } from '@/types';

export default function Home() {
    const [currentWord, setCurrentWord] = useState<Word | null>(null);
    const [sentence, setSentence] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [feedbackColor, setFeedbackColor] = useState<string>('text-gray-700');
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const getRandomWord = useCallback(async () => {
        const response = await fetch('/api/word');
        const res = await response.json();
        setCurrentWord(res.word); 
        setSentence('');
        setScore(0);
        setFeedbackColor('text-gray-700');
        setIsSubmitted(false);
    }, []);

    useEffect(() => {
        getRandomWord();
    }, [getRandomWord]);

    const handleSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSentence(e.target.value);
        if (isSubmitted) {
            setScore(0);
            setFeedbackColor('text-gray-700');
            setIsSubmitted(false);
        }
    };

const handleSubmitSentence = async () => {
  if (!currentWord) return;

  try {
    const response = await fetch("http://127.0.0.1:8000/api/validate-sentence", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        word_id: (currentWord as any).id ?? 1,
        sentence: sentence,
      }),
    });

    if (!response.ok) {
      console.error("Validate API error", response.status);
      alert("Error validating sentence (status " + response.status + ")");
      return;
    }

    const data = await response.json();
    console.log("validate result", data); // ดูใน Console ได้

    setScore(data.score);

    if (data.score >= 80) setFeedbackColor("text-success");
    else if (data.score >= 60) setFeedbackColor("text-warning");
    else setFeedbackColor("text-danger");

    const history = JSON.parse(localStorage.getItem("wordHistory") || "[]");
    history.push({
      word: currentWord.word,
      sentence: sentence,
      score: data.score,
      difficulty: currentWord.difficulty,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("wordHistory", JSON.stringify(history));

    setIsSubmitted(true);
  } catch (err) {
    console.error("Fetch error", err);
    alert("Error validating sentence (network error)");
  }
};



    const handleNextWord = () => {
        getRandomWord();
    };

    const getDifficultyColor = (difficulty: Difficulty) => {
        switch (difficulty) {
            case "Beginner": return "bg-green-200 text-green-800";
            case "Intermediate": return "bg-yellow-200 text-yellow-800";
            case "Advanced": return "bg-red-200 text-red-800";
            default: return "bg-gray-200 text-gray-800";
        }
    };

    if (!currentWord) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-gray-800">
                Word Challenge
            </h1>

            <div className="bg-white p-8 rounded-2xl shadow-xl mb-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">{currentWord.word}</h2>
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(currentWord.difficulty)}`}>
                        {currentWord.difficulty}
                    </span>
                </div>

                <p className="text-lg md:text-xl text-gray-700 mb-6">{currentWord.meaning}</p>

                <textarea
                    className="w-full p-4 border border-gray-300 rounded-lg mb-6 text-lg"
                    rows={4}
                    placeholder="Type your sentence..."
                    value={sentence}
                    onChange={handleSentenceChange}
                    disabled={isSubmitted}
                />

                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <p className="text-2xl font-bold">
                        Score: <span className={feedbackColor}>{score.toFixed(1)}</span>
                    </p>

                    {!isSubmitted ? (
                        <button
                            onClick={handleSubmitSentence}
                            className="px-6 py-3 bg-primary text-white rounded-lg"
                            disabled={!sentence.trim()}
                        >
                            Submit Sentence
                        </button>
                    ) : (
                        <button
                            onClick={handleNextWord}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                        >
                            Next Word
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
