import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function SurveyPrediabetes() {
  const navigate = useNavigate();

  // Questions and options definition
  const questions = [
    {
      question: "1. How old are you?",
      options: [
        { label: "Under 40 years (0 points)", value: 0 },
        { label: "40-49 years (1 point)", value: 1 },
        { label: "50-59 years (2 points)", value: 2 },
        { label: "60 years or older (3 points)", value: 3 },
      ],
    },
    {
      question: "2. What is your gender?",
      options: [
        { label: "Woman (0 points)", value: 0 },
        { label: "Man (1 point)", value: 1 },
      ],
    },
    {
      question: "3. Has your mother, father, brother, or sister been diagnosed with diabetes?",
      options: [
        { label: "No (0 points)", value: 0 },
        { label: "Yes (1 point)", value: 1 },
      ],
    },
    {
      question: "4. Do you have a mother, father, sister, or brother with diabetes?",
      options: [
        { label: "No (0 points)", value: 0 },
        { label: "Yes (1 point)", value: 1 },
      ],
    },
    {
      question: "5. Have you ever been diagnosed with high blood pressure?",
      options: [
        { label: "No (0 points)", value: 0 },
        { label: "Yes (1 point)", value: 1 },
      ],
    },
    {
      question: "6. Are you physically active?",
      options: [
        { label: "Yes (0 points)", value: 0 },
        { label: "No (1 point)", value: 1 },
      ],
    },
  ];

  // Height and weight chart
  const heightWeightChart = [
    { height: "4'10\"", weight1: "119-142", weight2: "143-190", weight3: "191+" },
    { height: "4'11\"", weight1: "124-147", weight2: "148-197", weight3: "198+" },
    { height: "5'0\"", weight1: "128-152", weight2: "153-203", weight3: "204+" },
    { height: "5'1\"", weight1: "132-157", weight2: "158-210", weight3: "211+" },
    { height: "5'2\"", weight1: "136-163", weight2: "164-217", weight3: "218+" },
    { height: "5'3\"", weight1: "141-168", weight2: "169-224", weight3: "225+" },
    { height: "5'4\"", weight1: "145-173", weight2: "174-231", weight3: "232+" },
    { height: "5'5\"", weight1: "150-179", weight2: "180-239", weight3: "240+" },
    { height: "5'6\"", weight1: "155-185", weight2: "186-246", weight3: "247+" },
    { height: "5'7\"", weight1: "159-190", weight2: "191-254", weight3: "255+" },
    { height: "5'8\"", weight1: "164-196", weight2: "197-261", weight3: "262+" },
    { height: "5'9\"", weight1: "169-202", weight2: "203-269", weight3: "270+" },
    { height: "5'10\"", weight1: "174-208", weight2: "209-277", weight3: "278+" },
    { height: "5'11\"", weight1: "179-214", weight2: "215-285", weight3: "286+" },
    { height: "6'0\"", weight1: "184-220", weight2: "221-293", weight3: "294+" },
    { height: "6'1\"", weight1: "189-226", weight2: "227-301", weight3: "302+" },
    { height: "6'2\"", weight1: "194-232", weight2: "233-310", weight3: "311+" },
    { height: "6'3\"", weight1: "200-239", weight2: "240-318", weight3: "319+" },
    { height: "6'4\"", weight1: "205-245", weight2: "246-327", weight3: "328+" },
  ];

  // State management
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [weightScore, setWeightScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate weight score based on height and weight
  useEffect(() => {
    if (height && weight) {
      const weightNum = parseFloat(weight);
      const selectedHeight = heightWeightChart.find(h => h.height === height);
      
      if (selectedHeight) {
        const weight1Range = selectedHeight.weight1.split('-').map(w => parseInt(w));
        const weight2Range = selectedHeight.weight2.split('-').map(w => parseInt(w));
        const weight3Min = parseInt(selectedHeight.weight3);
        
        if (weightNum < weight1Range[0]) {
          setWeightScore(0); // Less than 1 point column
        } else if (weightNum >= weight1Range[0] && weightNum <= weight1Range[1]) {
          setWeightScore(1); // 1 point
        } else if (weightNum >= weight2Range[0] && weightNum <= weight2Range[1]) {
          setWeightScore(2); // 2 points
        } else if (weightNum >= weight3Min) {
          setWeightScore(3); // 3 points
        }
      }
    }
  }, [height, weight]);

  // Result determination
  function getResultLabel(score: number) {
    if (score < 6) {
      return "Low Risk";
    } else if (score < 12) {
      return "Moderate Risk";
    } else {
      return "High Risk";
    }
  }

  function getResultDescription(score: number) {
    if (score < 6) {
      return "Your risk of prediabetes is low. Please continue to maintain a healthy lifestyle.";
    } else if (score < 12) {
      return "Your risk of prediabetes is moderate. Please pay attention to your diet and exercise, and consider regular health check-ups.";
    } else {
      return "Your risk of prediabetes is high. Please consult a doctor promptly for relevant examinations and interventions.";
    }
  }

  // Submit handling
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    // Calculate total score locally
    let total = 0;
    for (let i = 0; i < answers.length; i++) {
      total += answers[i] !== null ? answers[i] : 0;
    }
    total += weightScore;
    
    // Set local state for UI
    setScore(total);
    setSubmitted(true);
    
    // Only attempt to save to database if user is logged in
    try {
      setIsLoading(true);
      
      // Prepare data for API
      const surveyData = {
        age_score: answers[0] || 0,
        gender_score: answers[1] || 0,
        family_history_score: answers[2] || 0,
        family_history_score2: answers[3] || 0,
        high_blood_pressure_score: answers[4] || 0,
        physical_activity_score: answers[5] || 0,
        weight_score: weightScore,
        height: height,
        weight: parseFloat(weight) || 0
      };
      
      // Send data to backend API
      const response = await api.post('/api/survey/prediabetes', surveyData);
      console.log('Survey saved successfully:', response.data);
      
    } catch (err: any) {
      console.error('Error saving survey:', err);
      setError(err.response?.data?.detail || "Failed to save survey results");
    } finally {
      setIsLoading(false);
    }
  }

  // Option change handling
  function handleChange(idx: number, value: number) {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  }

  function handleReset() {
    setAnswers(Array(questions.length).fill(null));
    setHeight("");
    setWeight("");
    setWeightScore(0);
    setSubmitted(false);
    setScore(0);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-8 relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 p-2 rounded bg-gray-100 hover:bg-gray-200 transition"
        aria-label="Return to previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <h1 className="text-2xl font-bold mb-6 text-center">Prediabetes Risk Assessment Questionnaire</h1>
      
      <div className="flex flex-col gap-6">
        {/* Questionnaire and Chart - side by side */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Questionnaire */}
          <div className="w-full md:w-7/12">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="border rounded overflow-hidden">
                    <div className="bg-[#FFE0B2] text-black p-2 rounded-t" style={{backgroundColor: '#FFE0B2'}}>
                      {q.question}
                    </div>
                    <div className="p-3">
                      {q.options.map((opt, oidx) => (
                        <div key={oidx} className="mb-2">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name={`q${idx}`}
                              value={opt.value}
                              checked={answers[idx] === opt.value}
                              onChange={() => handleChange(idx, opt.value)}
                              className="form-radio"
                              disabled={submitted}
                            />
                            <span className="ml-2">{opt.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Weight category question */}
                <div className="border rounded overflow-hidden">
                  <div className="bg-[#FFE0B2] text-black p-2 rounded-t" style={{backgroundColor: '#FFE0B2'}}>
                    7. What is your weight category?
                  </div>
                  <div className="p-3 bg-white">
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div>
                        <label className="block mb-1">Height</label>
                        <select 
                          value={height} 
                          onChange={(e) => setHeight(e.target.value)}
                          className="border rounded p-2 w-full"
                          disabled={submitted}
                        >
                          <option value="">Select your height</option>
                          {heightWeightChart.map((h, idx) => (
                            <option key={idx} value={h.height}>{h.height}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">Weight (lbs.)</label>
                        <input 
                          type="number" 
                          value={weight} 
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="Enter your weight"
                          className="border rounded p-2 w-full"
                          disabled={submitted}
                        />
                      </div>
                    </div>
                    {height && weight && (
                      <div className="mt-3 text-sm text-gray-600">
                        {weightScore === 0 && "You weigh less than the 1 Point column (0 points)"}
                        {weightScore === 1 && "1 Point"}
                        {weightScore === 2 && "2 Points"}
                        {weightScore === 3 && "3 Points"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {/* Height and Weight Chart */}
          <div className="w-full md:w-5/12">
            <div className="border border-white rounded overflow-hidden">
              <table className="w-full text-center">
                <thead>
                  <tr>
                    <th className="p-2 border border-white text-white" style={{backgroundColor: '#FF9466'}} colSpan={1}>Height</th>
                    <th className="p-2 border border-white text-white" style={{backgroundColor: '#FF9466'}} colSpan={3}>Weight (lbs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {heightWeightChart.map((row, idx) => (
                    <tr key={idx} style={{backgroundColor: '#FFF3E0'}}>
                      <td className="p-2 border border-white font-bold">{row.height}</td>
                      <td className="p-2 border border-white">{row.weight1}</td>
                      <td className="p-2 border border-white">{row.weight2}</td>
                      <td className="p-2 border border-white">{row.weight3}</td>
                    </tr>
                  ))}
                  <tr style={{backgroundColor: '#FFE0B2'}}>
                    <td className="p-2 border border-white font-bold"></td>
                    <td className="p-2 border border-white font-bold">1 Point</td>
                    <td className="p-2 border border-white font-bold">2 Points</td>
                    <td className="p-2 border border-white font-bold">3 Points</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-left italic">
              Adapted from Bang et al., Ann Intern Med 151:775-783, 2009. Original algorithm was validated without gestational diabetes as part of the model.
            </div>
          </div>
        </div>

        {/* Submit Button and Assessment Results - centered */}
        <div className="w-full flex flex-col items-center">
          <div className="mt-2 flex justify-center items-center">
            {!submitted ? (
              <button
                type="submit"
                onClick={handleSubmit}
                className="py-2 px-6 bg-[#FF7A45] text-white font-semibold rounded hover:bg-[#E56835] transition"
                disabled={answers.some((a) => a === null) || !height || !weight || isLoading}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            ) : (
              <button
                type="button"
                className="py-2 px-6 bg-gray-200 rounded hover:bg-gray-300 transition"
                onClick={handleReset}
              >
                Reassess
              </button>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-500 italic">
            Note: If you have previously completed this assessment, submitting a new assessment will replace your previous results.
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-3 p-2 text-red-500">
              {error}
            </div>
          )}

          {/* Assessment Results - shown only after submission */}
          {submitted && (
            <div className="mt-6 p-4 border rounded text-center max-w-lg">
              <div className="text-xl font-semibold mb-4 text-center">
                Assessment Result: <span className="text-[#FF7A45]">{getResultLabel(score)}</span>
              </div>
              <div className="mb-4 text-center">{getResultDescription(score)}</div>
              <div className="text-black text-center text-lg">Your Total Score: <span className="font-bold text-[#FF7A45] text-xl">{score}</span></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <div className="font-bold mb-1 text-black">If you scored 5 or higher:</div>
        <div>
            You are at increased risk for having prediabetes and are at high risk for type 2 diabetes. However, only your doctor can tell for sure if you
            have type 2 diabetes or prediabetes, a condition in which blood sugar levels are higher than normal but not high enough yet to be diagnosed
            as type 2 diabetes. Talk to your doctor to see if additional testing is needed.
        </div>
        <div>
            If you are African American, Hispanic/Latino American, American Indian/Alaska Native, Asian American, or Pacific Islander, you are at higher
            risk for prediabetes and type 2 diabetes. Also, if you are Asian American, you are at increased risk for type 2 diabetes at a lower weight (about
            15 pounds lower than weights in the 1 Point column). <strong>Talk to your doctor to see if you should have your blood sugar tested.</strong>
        </div>
      </div>
      <div className="mt-8 text-sm text-gray-500">
      <div className="font-bold mb-1 text-black">You can reduce your risk for type 2 diabetes:</div>
        <div>
        Find out how you can reverse prediabetes and prevent or delay type 2 diabetes through a CDC-recognized lifestyle change program at https://www.cdc.gov/diabetes/prevention/lifestyle-program.
        </div>
      </div>
    </div>
  );
}