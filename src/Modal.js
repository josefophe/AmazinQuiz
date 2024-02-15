import { useContext, useEffect, useState } from "react";
import { setDoc, setManyDocs  } from "@junobuild/core";
import { AuthContext } from "./Auth";
import { nanoid } from "nanoid";
// import { Field, Form, Formik } from 'formik';

export const Modal = () => {
  const [showModal, setShowModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [valid, setValid] = useState(false); // Define valid state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [progress, setProgress] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Check if quiz details are filled and user is authenticated
    const valid =
      quizTitle.trim() !== "" &&
      quizDescription.trim() !== "" &&
      quizQuestions.every((question) =>
        question.options.every((option) => option.trim() !== "") &&
        question.correctAnswerIndex !== null &&
        question.correctAnswerIndex >= 0 &&
        question.correctAnswerIndex < question.options.length
      ) &&
      user !== undefined &&
      user !== null;

    setValid(valid);
  }, [quizTitle, quizDescription, quizQuestions, user]);

  const reload = () => {
    let event = new Event("reload");
    window.dispatchEvent(event);
  };

  const addQuiz = async () => {
    // Demo purpose, handle edge cases appropriately in a real application
    if ([null, undefined].includes(user)) {
      return;
    }

    setProgress(true);

    try {
      const key = nanoid();

      await setDoc({
        collection: "quiz",
        doc: {
          key,
          data: {
            title: quizTitle,
            description: quizDescription,
            questions: quizQuestions,
            createdBy: user.key,
          },
        },
      });

      setShowModal(false);
      reload();
    } catch (err) {
      console.error(err);
    }

    setProgress(false);
  };

  // Function to add a new question to the quiz
  const addQuestion = () => {
    setQuizQuestions(() => [
      { question: "", options: ["", "", "", ""], correctAnswerIndex: null },
    ]);
  };

  // Function to update question text
  const updateQuestionText = (index, newText) => {
    setQuizQuestions((prevQuestions) =>
      prevQuestions.map((question, i) =>
        i === index ? { ...question, question: newText } : question
      )
    );
  };

  // Function to update option text
  const updateOptionText = (questionIndex, optionIndex, newText) => {
    setQuizQuestions((prevQuestions) =>
      prevQuestions.map((question, i) =>
        i === questionIndex
          ? {
              ...question,
              options: question.options.map((option, j) =>
                j === optionIndex ? newText : option
              ),
            }
          : question
      )
    );
  };

  // Function to update the correct answer index
  const updateCorrectAnswer = (questionIndex, correctAnswerIndex) => {
    setQuizQuestions((prevQuestions) =>
      prevQuestions.map((question, i) =>
        i === questionIndex ? { ...question, correctAnswerIndex } : question
      )
    );
  };

  return (
    <>
      {/* Button to open the quiz modal */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="rounded-md bg-indigo-600 px-3.5 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Add a quiz
      </button>

      {/* Quiz modal */}
      {showModal && (
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-3xl">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-black outline-none focus:outline-none">
              <div className="relative p-6 flex-auto">
                {/* Title input */}
                <input
                  type="text"
                  className="form-control block w-full px-3 py-1.5 text-base font-normal text-white bg-black bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-white focus:bg-black focus:border-indigo-600 focus:outline-none resize-none"
                  placeholder="Quiz Title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  disabled={progress}
                />

                {/* Description textarea */}
                <textarea
                  className="form-control block w-full px-3 py-1.5 text-base font-normal text-white bg-black bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-white focus:bg-black focus:border-indigo-600 focus:outline-none resize-none mt-4"
                  rows="5"
                  placeholder="Quiz Description"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  disabled={progress}
                ></textarea>

                {/* Questions and Options */}
                {quizQuestions.map((question, questionIndex) => (
                  <div key={questionIndex} className="mt-6">
                    {/* Question input */}
                    <input
                      type="text"
                      className="form-control block w-full px-3 py-1.5 text-base font-normal text-white bg-black bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-white focus:bg-black focus:border-indigo-600 focus:outline-none resize-none"
                      placeholder={`Question ${questionIndex + 1}`}
                      value={question.question}
                      onChange={(e) => updateQuestionText(questionIndex, e.target.value)}
                      disabled={progress}
                    />

                    {/* Options inputs */}
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="mt-3 flex items-center">
                        {/* Option input */}
                        <input
                          type="text"
                          className="form-control block w-full px-3 py-1.5 text-base font-normal text-white bg-black bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-white focus:bg-black focus:border-indigo-600 focus:outline-none resize-none"
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => updateOptionText(questionIndex, optionIndex, e.target.value)}
                          disabled={progress}
                        />

                        {/* Correct answer checkbox */}
                        <input
                          type="radio"
                          name={`correct-answer-${questionIndex}`}
                          checked={question.correctAnswerIndex === optionIndex}
                          onChange={() => updateCorrectAnswer(questionIndex, optionIndex)}
                          disabled={progress}
                        />
                      </div>
                    ))}
                  </div>
                ))}

                {/* Add Question button */}
                <button
                  className="mt-4 bg-indigo-600 text-white px-3 py-1.5 rounded"
                  onClick={addQuestion}
                  disabled={progress}
                >
                  Add Question
                </button>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end mt-6 p-6 border-t border-solid border-slate-200 rounded-b">
                {progress ? (
                  <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-indigo-600 rounded-full" role="status" aria-label="loading">
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  <>
                    {/* Close button */}
                    <button
                      className="background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>

                    {/* Submit button */}
                    <button
                      className="rounded-md bg-indigo-600 px-3.5 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-25 ml-4"
                      type="button"
                      onClick={addQuiz}
                      disabled={!quizTitle || !quizDescription || quizQuestions.some(q => q.question === '' || q.options.some(opt => opt === ''))}
                    >
                      Add Quiz
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// export default Modal;

