import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../api";

// Unit Toggle Component
const UnitToggle = ({ metric, onToggle }) => {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggle(true, e);
          }}
          className={`px-4 py-1 rounded-md transition-colors ${
            metric ? "bg-white shadow-sm text-orange-500" : "text-gray-500"
          }`}
        >
          Metric
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggle(false, e);
          }}
          className={`px-4 py-1 rounded-md transition-colors ${
            !metric ? "bg-white shadow-sm text-orange-500" : "text-gray-500"
          }`}
        >
          Imperial
        </button>
      </div>
    </div>
  );
};

// Measurement Input Component
const MeasurementInput = ({ value, onChange, label, min, max, step = 1 }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const newValue = Math.min(
                Math.max(Number(e.target.value), min),
                max
              );
              onChange(newValue);
            }}
            className="w-16 p-1 text-center border border-gray-200 rounded-md"
            min={min}
            max={max}
            step={step}
          />
        </div>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
      />
    </div>
  );
};

// Height Input Component
const HeightInput = ({ value, onChange }) => {
  const [isMetric, setIsMetric] = useState(true);
  const [localMetricValue, setLocalMetricValue] = useState(value);
  const [feet, setFeet] = useState(Math.floor(value / 2.54 / 12));
  const [inches, setInches] = useState(Math.round((value / 2.54) % 12));

  const handleUnitToggle = (newIsMetric, e) => {
    e.preventDefault();
    setIsMetric(newIsMetric);

    if (newIsMetric) {
      const cm = Math.round((feet * 12 + inches) * 2.54);
      setLocalMetricValue(cm);
      onChange(cm);
    } else {
      const totalInches = localMetricValue / 2.54;
      const newFeet = Math.floor(totalInches / 12);
      const newInches = Math.round(totalInches % 12);
      setFeet(newFeet);
      setInches(newInches);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <UnitToggle metric={isMetric} onToggle={handleUnitToggle} />

      {isMetric ? (
        <div className="bg-white rounded-xl p-6">
          <MeasurementInput
            value={localMetricValue}
            onChange={(v) => {
              setLocalMetricValue(v);
              onChange(v);
            }}
            label="Height (cm)"
            min={140}
            max={250}
            step={1}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 space-y-4">
          <MeasurementInput
            value={feet}
            onChange={(v) => {
              setFeet(v);
              const cm = Math.round((v * 12 + inches) * 2.54);
              setLocalMetricValue(cm);
              onChange(cm);
            }}
            label="Feet"
            min={4}
            max={7}
            step={1}
          />
          <MeasurementInput
            value={inches}
            onChange={(v) => {
              setInches(v);
              const cm = Math.round((feet * 12 + v) * 2.54);
              setLocalMetricValue(cm);
              onChange(cm);
            }}
            label="Inches"
            min={0}
            max={11}
            step={1}
          />
        </div>
      )}
    </div>
  );
};

// Weight Input Component
const WeightInput = ({ value, onChange }) => {
  const [isMetric, setIsMetric] = useState(true);
  const [localValue, setLocalValue] = useState(value);

  const handleUnitToggle = (newIsMetric, e) => {
    e.preventDefault();
    setIsMetric(newIsMetric);

    if (newIsMetric) {
      const kg = Math.round(localValue / 2.20462);
      setLocalValue(kg);
      onChange(kg);
    } else {
      const lbs = Math.round(localValue * 2.20462);
      setLocalValue(lbs);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <UnitToggle metric={isMetric} onToggle={handleUnitToggle} />

      <div className="bg-white rounded-xl p-6">
        <MeasurementInput
          value={localValue}
          onChange={(v) => {
            setLocalValue(v);
            onChange(isMetric ? v : Math.round(v / 2.20462));
          }}
          label={isMetric ? "Weight (kg)" : "Weight (lbs)"}
          min={isMetric ? 40 : 88}
          max={isMetric ? 180 : 397}
          step={1}
        />
      </div>
    </div>
  );
};

// Main Survey Component
const Survey = () => {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTotalQuestions();
    fetchCurrentQuestion();
  }, [navigate]);

  const fetchTotalQuestions = async () => {
    try {
      const res = await api.get("/api/survey/total");
      setTotalQuestions(res.data.total);
    } catch (err) {
      console.error("Error fetching total questions:", err);
    }
  };

  const fetchCurrentQuestion = async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await api.get("/api/survey/current");
      setQuestion(res.data);
      // Set default value based on question type
      if (
        res.data.question_type === "carousel" &&
        res.data.options?.length > 0
      ) {
        if (res.data.step === 3) {
          // Height
          setAnswer("170"); // Default height in cm
        } else if (res.data.step === 4) {
          // Weight
          setAnswer("70"); // Default weight in kg
        } else {
          setAnswer(res.data.options[0]);
        }
      } else if (res.data.question_type === "multiselect") {
        setAnswer(["None"]); // Default to "None" for multiselect
      } else {
        setAnswer("");
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (
        detail === "Survey already completed. Go to dashboard." ||
        detail === "No more questions. Survey completed."
      ) {
        navigate("/dashboard");
      } else {
        setError(detail || "Error fetching question.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate that at least one option is selected for multiselect
    if (
      question?.question_type === "multiselect" &&
      (!answer || answer.length === 0)
    ) {
      setError("Please select at least one option");
      return;
    }

    try {
      const res = await api.post("/api/survey/answer", { answer });
      if (res.data.message === "Survey completed") {
        navigate("/dashboard");
      } else {
        fetchCurrentQuestion();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Error submitting answer");
    }
  };

  const handleGoBack = async (e) => {
    e.preventDefault();
    setError("");

    if (question?.step === 1) {
      // Already at the first question
      return;
    }

    try {
      // Assuming a POST endpoint to go back
      await api.post("/api/survey/previous");
      fetchCurrentQuestion(); // Fetch the previous question data
    } catch (err) {
      setError(err.response?.data?.detail || "Error going back");
    }
  };

  const renderInput = () => {
    switch (question.question_type) {
      case "dropdown":
        return (
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "calendar":
        return (
          <input
            type="date"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        );

      case "carousel":
        if (question.step === 3) {
          // Height question
          return (
            <HeightInput
              value={Number(answer) || 170}
              onChange={(value) => setAnswer(value.toString())}
            />
          );
        } else if (question.step === 4) {
          // Weight question
          return (
            <WeightInput
              value={Number(answer) || 70}
              onChange={(value) => setAnswer(value.toString())}
            />
          );
        }

        // Default carousel for other questions
        return (
          <div className="flex items-center justify-between space-x-4">
            <button
              type="button"
              onClick={() => {
                const currentIndex = question.options.indexOf(answer);
                if (currentIndex > 0) {
                  setAnswer(question.options[currentIndex - 1]);
                }
              }}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1 text-center text-xl font-semibold">
              {answer}
            </div>
            <button
              type="button"
              onClick={() => {
                const currentIndex = question.options.indexOf(answer);
                if (currentIndex < question.options.length - 1) {
                  setAnswer(question.options[currentIndex + 1]);
                }
              }}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        );

      case "multiselect":
        const selectedOptions = Array.isArray(answer) ? answer : [];
        return (
          <div className="grid grid-cols-2 gap-3">
            {question.options?.map((option) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    if (option === "None") {
                      setAnswer(["None"]);
                    } else {
                      const newSelected = isSelected
                        ? selectedOptions.filter(
                            (item) => item !== option && item !== "None"
                          )
                        : [
                            ...selectedOptions.filter(
                              (item) => item !== "None"
                            ),
                            option,
                          ];
                      setAnswer(newSelected.length ? newSelected : ["None"]);
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        );

      case "select":
        return (
          <div className="grid grid-cols-2 gap-3">
            {question.options?.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAnswer(option)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  answer === option
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 hover:border-orange-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Type your answer..."
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">
                Step {question?.step} of {totalQuestions}
              </div>
              <div className="text-sm font-medium text-gray-500">
                {Math.round(question?.progress || 0)}% Complete
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${question?.progress || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            {/* Million Character */}
            <div className="flex justify-center mb-6">
              <div className="w-64 h-64 relative">
                <img
                  src="/picture/Stamp.png"
                  alt="Million"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Million's Dialogue */}
            <div className="text-center mb-8">
              <p className="text-gray-600 italic">
                {question?.million_dialogue || "Let's get to know you better!"}
              </p>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-center mb-2">
                {question?.question_text}
              </h2>
              {question?.description && (
                <p className="text-sm text-gray-500 text-center">
                  {question.description}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {question && renderInput()}

              <div className="flex justify-between items-center mt-8">
                {question?.step > 1 ? (
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <div /> // Placeholder to keep alignment
                )}
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;
