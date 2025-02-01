//********************************** Student Details Section*******************************************
// document.addEventListener('contextmenu', function(event) {
//     event.preventDefault();
//     alert("Right-click is disabled on this page.");
// });
// document.onkeydown = function(e) {
//     if (e.keyCode == 123) { // F12 key
//         return false;
//     }
//     if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { // Ctrl+Shift+I
//         return false;
//     }
// };
document.addEventListener("DOMContentLoaded", function () {
    const userForm = document.getElementById("user-form");
    if (userForm) {
        userForm.addEventListener("submit", async function (event) {
            event.preventDefault();
        
            // Clear the sessionStorage before submitting the form data
            sessionStorage.clear(); // or sessionStorage.removeItem("yourKey") if you want to remove specific items
            
            // Collect form data
            const formData = {
                fullName: document.getElementById("full-name").value,
                collegeName: document.getElementById("college-name").value,
                registrationNumber: document.getElementById("reg-number").value,
                branch: document.getElementById("branch").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value
            };
        
            const studentDataUrl = "https://student-details-ff916-default-rtdb.firebaseio.com/users.json";
        
            try {
                // Check for duplicate values
                const getResponse = await fetch(studentDataUrl);
                if (!getResponse.ok) {
                    alert("Failed to check existing data. Please try again.");
                    return;
                }
                const existingData = await getResponse.json();
                const duplicates = Object.values(existingData || {}).find(
                    (record) =>
                        record.registrationNumber === formData.registrationNumber ||
                        record.email === formData.email
                );
        
                if (duplicates) {
                    alert("User already exists");
                    return;
                }
        
                // If no duplicates, make a POST request to store the data
                const postResponse = await fetch(studentDataUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                });
        
                if (postResponse.ok) {
                    alert("Form data submitted successfully!");
        
                    // Store the form data in sessionStorage
                    sessionStorage.setItem("userData", JSON.stringify(formData));
                    // Redirect to quiz page after successful submission
                    window.location.href = "quiz.html";  
                    document.getElementById("user-form").reset();
                } else {
                    alert("Failed to submit data. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please check your connection and try again.");
            }
        });
        
         
    } else {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function() {
    window.history.pushState(null, '', window.location.href);  
    };

//********************************************* User Header Section ***************************************
    const userData = sessionStorage.getItem("userData");
        if (userData) {
        const user = JSON.parse(userData);
        const userNameElement = document.getElementById('user-name');
        console.log(userNameElement)
        if (userNameElement) {
            userNameElement.innerText = `${user.fullName}`;
        } else {
            console.error("Element with ID 'user-name' not found.");
        }
        }

//********************************** Quiz questions Section*******************************************
    const quizContainer = document.getElementById('quiz');
    const submitBtn = document.getElementById('submitBtn');
    const resultDiv = document.getElementById('result');
    const timerDiv = document.getElementById('timer');
    let warnings = 0;
    let hasSubmitted = false;
    let questionsData = null;
    let crossCheck=null; 
    let crossCheckBtn=null;

// Function to fetch questions from Firebase
    async function fetchQuestions() {
    if (questionsData) return; // Prevent multiple fetches
    try {
        const response = await fetch('https://quiz-6691d-default-rtdb.firebaseio.com/questions.json');
        const data = await response.json();

        if (!data) {
            quizContainer.innerHTML = '<p>No questions available.</p>';
            return;
        }

        questionsData = data; // Store fetched data globally
        crossCheck=questionsData
        console.log("crossCheck",crossCheck)
        renderQuestions(); // Render questions after fetching
    } catch (error) {
        console.error('Error fetching questions:', error);
        quizContainer.innerHTML = '<p>Error loading questions. Please try again later.</p>';
    }
    }

// Function to render questions
function renderQuestions() {
    if (!questionsData) return;

    quizContainer.innerHTML = ''; // Clear the quiz container before rendering

    // Loop through the questions
    Object.keys(questionsData).forEach((key, index) => {
        const questionObj = questionsData[key];

        // Create the question container
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');

        // Add the question text
        const questionText = document.createElement('p');
        questionText.textContent = `${index + 1}. ${questionObj.question}`;
        questionDiv.appendChild(questionText);

        // Loop through the options
        questionObj.options.forEach((option, optIndex) => {
            const optionLabel = document.createElement('label');
            const optionInput = document.createElement('input');
            optionInput.type = 'radio';
            optionInput.name = `q${index + 1}`;
            optionInput.value = option;
            optionInput.id = `q${index + 1}_opt${optIndex}`;

            // Add correct answer tracking
            if (option === questionObj.correctAnswer) {
                optionInput.dataset.correct = 'true';
            }

            // Check if the user has already selected this option
            if (questionObj.userAnswer === option) {
                optionInput.checked = true; // Pre-select the user's selected option
            }

            // Add event listener to store the user's answer when they select an option
            optionInput.addEventListener('change', (e) => {
                questionsData[key].userAnswer = e.target.value; // Store selected option in the question data
            });

            // Link input and label for accessibility
            optionLabel.htmlFor = `q${index + 1}_opt${optIndex}`;
            optionLabel.appendChild(optionInput);
            optionLabel.appendChild(document.createTextNode(option));

            // Append the label to the question
            questionDiv.appendChild(optionLabel);
            questionDiv.appendChild(document.createElement('br'));
        });

        // Append the question container to the quiz container
        quizContainer.appendChild(questionDiv);
    });
}


//*************************** Submit Function ********************************
// Function to submit the quiz, calculate the score, and store in Firebase
    async function submitQuiz() {
    if (hasSubmitted) return;
    hasSubmitted = true;
    const questions = quizContainer.getElementsByClassName('question');
    let score = 0;
    let correctAnswers = 0; // To count the number of correct answers

    Object.keys(questionsData).forEach((key, index) => {
        const questionDiv = questions[index];
        const selectedOption = questionDiv.querySelector('input[type="radio"]:checked');
        console.log(selectedOption)
        const correctAnswer = questionsData[key].answer;

        if (selectedOption && selectedOption.value === correctAnswer) {
            score++;
            correctAnswers++; // Increase count of correct answers
        }
    });

    // Get user data from sessionStorage (assuming you stored the registration number or email)
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (!userData) {
        alert("User data not found.");
        return;
    }

    const { registrationNumber, email } = userData;

    const databaseUrl = "https://student-details-ff916-default-rtdb.firebaseio.com/users.json";

    try {
    const getResponse = await fetch(databaseUrl);
    const data = await getResponse.json();
    const user = Object.values(data).find(user => user.registrationNumber === registrationNumber || user.email === email);

    if (user) {
        // Check if the score already exists
        if (user.score) {
            alert("Score has already been uploaded for this user. You cannot upload it again.")
            quizContainer.innerHTML = '';
            document.querySelector('.neumorphic-container').style.margin = 'auto';
            document.querySelector('.neumorphic-result').style.setProperty('box-shadow', '4px 4px 8px #bebebe, -4px -4px 8px #ffffff', 'important');
            document.getElementById('user-header').style.display="none"
            submitBtn.style.display = 'none';
            timerDiv.style.display = 'none';
    if (resultDiv) {
        resultDiv.style.display = 'block';  
        resultDiv.innerHTML = `<h2>🎉 Congratulations!</h2><br><h1>Dear ${userData.fullName}</h1><br> <h3>Your efforts have paid off—check your results and celebrate! 🌟</h3><br> <h1>${correctAnswers} / ${Object.keys(questionsData).length}</h1><br><button id="crossCheckBtn">Cross-Check Answers</button>`;
        crossCheckBtn=document.getElementById('crossCheckBtn')
        console.log(crossCheckBtn)
        // checking the button
        if (crossCheckBtn) {
            crossCheckBtn.addEventListener('click',displayAnswers);
        } else {
        console.error('crossCheckBtn not found in the DOM');
        }
    } else {
        console.error('resultDiv is null.');
    }
            return;  
        }
        const userId = Object.keys(data).find(key => data[key] === user);
        const updatedUserData = {
            ...user,
            score: `${score}/${Object.keys(questionsData).length}` 
        };
            // update the user data with score
        const updateResponse = await fetch(`https://student-details-ff916-default-rtdb.firebaseio.com/users/${userId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUserData)
        });

        if (updateResponse.ok) {
            console.log("User score updated successfully.");
        } else {
            throw new Error("Error updating score: " + updateResponse.statusText);
        }
    } else {
        alert("User not found. Score will not be saved.");
    }
} catch (error) {
    console.error("Error:", error);
    alert("Failed to fetch or update user data.");
}
 
    quizContainer.style.display = 'none';
    document.getElementById('user-header').style.display="none"
    document.querySelector('.neumorphic-container').style.margin = 'auto';
    document.querySelector('.neumorphic-result').style.setProperty('box-shadow', '4px 4px 8px #bebebe, -4px -4px 8px #ffffff', 'important');
    submitBtn.style.display = 'none';
    timerDiv.style.display = 'none';

    if (resultDiv) {
        resultDiv.style.display = 'block';  
        resultDiv.innerHTML = `<h2>🎉 Congratulations!</h2><br><h1>Dear ${userData.fullName}</h1><br> <h3>Your efforts have paid off—check your results and celebrate! 🌟</h3><br> <h1>${correctAnswers} / ${Object.keys(questionsData).length}</h1><br><button id="crossCheckBtn">Cross-Check Answers</button>`;
        crossCheckBtn=document.getElementById('crossCheckBtn')
        if (crossCheckBtn) {
            crossCheckBtn.addEventListener('click',displayAnswers);
        } else {
        console.error('crossCheckBtn not found in the DOM');
        }
        
    } else {
        console.error('resultDiv is null.');
    }
    return
    }

// cross check the answers section
function displayAnswers() {
    console.log("Displaying answers...");

    // Debugging: Ensure data exists
    console.log("Questions Data:", questionsData);

    // Render questions if not already rendered
    renderQuestions();

    // Show quiz section for review
    document.getElementById('result').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    let userHeader = document.getElementById('user-header');
    userHeader.style.display = 'none';
    // userHeader.style.justifyContent = 'center';
    quizContainer.style.display = 'block';
    submitBtn.style.display = 'none';
    timerDiv.style.display = 'none';

    // Clear previous highlights
    const allQuestions = document.querySelectorAll('.question');
    if (allQuestions.length === 0) {
        console.error("No questions found in the DOM. Check renderQuestions().");
        return;
    }

     

    allQuestions.forEach((questionDiv, index) => {
        const labels = questionDiv.querySelectorAll('label');
        labels.forEach((label) => {
            label.classList.remove('correct', 'incorrect');
        });
    });

    // Loop through each question and validate selected options
    Object.keys(questionsData).forEach((key, index) => {
        const questionDiv = document.querySelectorAll('.question')[index];
        if (!questionDiv) {
            console.error(`Question div not found for question ${index + 1}`);
            return;
        }

        const selectedOption = questionsData[key]?.userAnswer; // Get the user's selected answer
        const correctAnswer = questionsData[key]?.answer;
        console.log("Question Data:",questionsData[key] );
        console.log(`Question ${index + 1}:`, questionsData[key]?.question);
        console.log("Selected Option:", selectedOption ? selectedOption : "None selected");
        console.log("Correct Answer:", correctAnswer);

        questionDiv.querySelectorAll('input[type="radio"]').forEach((radio) => {
            const label = radio.closest('label');
            if (!label) {
                console.error(`Label not found for a radio button in question ${index + 1}`);
                return;
            }
            const isCorrect = radio.value === correctAnswer;
            // Highlight the correct answer (green background)
            if ( isCorrect) {
                label.classList.add('correct');
            }

            // Highlight the user's selected answer (red background if incorrect)
            if (selectedOption && radio.value === selectedOption && !isCorrect) {
                label.classList.add('incorrect');
            }
        });

         

        // Disable all radio buttons after review
        questionDiv.querySelectorAll('input[type="radio"]').forEach((radioButton) => {
            radioButton.disabled = true;
        });
    });
 
}



//***************************** Automatic submit the Quiz using Time Limit ********************************
// Setting time for Quiz
    let remainingTime;
    let lastUpdateTime;
        async function getTimeFromFirebase() {
            try {
                const response = await fetch("https://additional-setups-default-rtdb.firebaseio.com/time.json");
                const data = await response.json();
        
                // Set the global time value in milliseconds
                const time = data.value; // Firebase time value
                const examDuration = time * 60 * 1000; // Convert minutes to milliseconds
                remainingTime = examDuration;
        
                // Function to format time into MM:SS
                function formatTime(ms) {
                    const minutes = Math.floor(ms / 60000);
                    const seconds = Math.floor((ms % 60000) / 1000);
                    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                }
                // Function to update the timer
                function updateTimer() {
                    const currentTime = Date.now();
                    const elapsedTime = currentTime - lastUpdateTime;
                    lastUpdateTime = currentTime;
        
                    remainingTime -= elapsedTime; // Adjust remaining time
        
                    if (remainingTime <= 0) {
                        timerDiv.textContent = "Time left: 00:00";
                        submitQuiz(); // Automatically submit the quiz
                        return; // Stop further execution
                    }
        
                    timerDiv.textContent = `Time left: ${formatTime(remainingTime)}`;
                    requestAnimationFrame(updateTimer);
                }
        
                // Initialize the timer
                lastUpdateTime = Date.now();
                requestAnimationFrame(updateTimer);
            } catch (error) {
                console.error("Error fetching time value:", error);
            }
        }
        getTimeFromFirebase();
        
// Tab switch warning handler
    function handleTabSwitch() {
    if (hasSubmitted) return;
    warnings++;
    if (warnings >= 4) {
        alert('You switched tabs too many times. The quiz is being submitted automatically.');
        submitQuiz(); // Automatically submit the quiz after 4 warnings
    } else {
        window.alert(`Warning: You have switched tabs ${warnings} time(s). After 4 warnings, the quiz will be submitted automatically.`);
    }
    }
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
        handleTabSwitch();  
        }
    });

//************************************* Cross Check Answers **************************************
    

// Fetch questions on page load
    fetchQuestions();

// Attach event listener to the submit button
    submitBtn.addEventListener('click', submitQuiz);
    }
    
});

//************************************* Cross Check Answers **************************************
 
    // if (!questionsData) {
    //     console.error('Questions data is not available.');
    //     return;
    // }

    // const questions = document.querySelectorAll('.question'); // Select all question containers

    // Object.keys(questionsData).forEach((key, index) => {
    //     const questionDiv = questions[index];
    //     if (!questionDiv) {
    //         console.error('Question div not found for index:', index);
    //         return;
    //     }

    //     const correctAnswer = crossCheck[key].answer; // Correct answer for the question
    //     const options = questionDiv.querySelectorAll('input[type="radio"]'); // All options for this question
    //     let selectedOption = null;

    //     // Reset all options to default styles
    //     options.forEach(option => {
    //         option.nextElementSibling.style.color = '#333';  // Default color
    //         option.nextElementSibling.style.fontWeight = 'normal';  // Default font weight
    //     });

    //     // Highlight the correct answer in green
    //     options.forEach(option => {
    //         if (option.value === correctAnswer) {
    //             option.nextElementSibling.style.color = 'green';  // Green color for correct answer
    //             option.nextElementSibling.style.fontWeight = 'bold';  // Bold font for correct answer
    //         }
    //     });

    //     // Check if the user selected the correct or incorrect answer
    //     options.forEach(option => {
    //         if (option.checked) {
    //             selectedOption = option; // Store the selected option
    //             if (option.value !== correctAnswer) {
    //                 option.nextElementSibling.style.color = 'red';  // Red color for incorrect answer
    //                 option.nextElementSibling.style.fontWeight = 'bold';  // Bold font for incorrect answer
    //             }
    //         }
    //     });

    //     // If no option was selected, mark the question with a border (optional)
    //     if (!selectedOption) {
    //         questionDiv.style.border = '2px solid red';  // Optional: Highlight unanswered questions
    //     }
    // });



 