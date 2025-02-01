// ************************ Question Management Section  ***************************
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
const questionManage = 'https://quiz-6691d-default-rtdb.firebaseio.com/questions.json';
const quizContainer = document.getElementById('quizContainer');

// Function to fetch and display questions
async function fetchQuestions() {
    try {
        const response = await fetch(questionManage);
        const data = await response.json();
        if (!data) {
            quizContainer.innerHTML = '<p>No questions available.</p>';
            return;
        }
        quizContainer.innerHTML = '';

        const uniqueQuestions = new Set(); // To track unique question texts
        let questionIndex = 0;

        // Iterate through the questions
        Object.keys(data).forEach(async (key) => {
            const question = data[key];

            // If the question is a duplicate, delete it
            if (uniqueQuestions.has(question.question)) {
                await deleteQuestion(key); // Call the delete function for the duplicate question
                return;
            }

            // Add the question text to the Set
            uniqueQuestions.add(question.question);

            // Create question card for unique questions
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question');

            questionDiv.innerHTML = `
                <p><strong>${++questionIndex}. ${question.question}</strong></p>
                <ul>
                    ${question.options.map(opt => `<li>${opt}</li>`).join('')}
                </ul>
                <p><strong>Answer:</strong> ${question.answer}</p>
                <div class="actions">
                    <button class="edit-btn" onclick="editQuestion('${key}')">Edit</button>
                    <button class="delete-btn" onclick="deleteQuestion('${key}')">Delete</button>
                </div>
            `;
            quizContainer.appendChild(questionDiv);
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        quizContainer.innerHTML = '<p>Error loading questions. Please try again later.</p>';
    }
}

// Function to delete a question from Firebase
async function deleteQuestion(key) {
    try {
        const deleteUrl = `${questionManage}/${key}.json`;
        const response = await fetch(deleteUrl, { method: 'DELETE' });

        if (response.ok) {
            console.log(`Question with key ${key} deleted successfully.`);
        } else {
            console.error(`Failed to delete question with key ${key}:`, response.statusText);
        }
    } catch (error) {
        console.error('Error deleting question:', error);
    }
}


// Function to delete a question
async function deleteQuestion(key) {
    const questionDelete = `https://quiz-6691d-default-rtdb.firebaseio.com/questions/${key}.json`;
    try {
        const response = await fetch(questionDelete, { method: 'DELETE' });
        if (response.ok) {
            alert('Question deleted successfully.');
            fetchQuestions(); // Refresh questions
        } else {
            alert('Failed to delete the question.');
        }
    } catch (error) {
        console.error('Error deleting question:', error);
    }
}

// Function to edit a question
async function editQuestion(key) {
    const questionEdit = `https://quiz-6691d-default-rtdb.firebaseio.com/questions/${key}.json`;
    const response = await fetch(questionEdit);
    const questionData = await response.json();
    if (!questionData) {
        alert('Failed to fetch question details.');
        return;
    }
    // For form  editing
    quizContainer.innerHTML = `
        <h2>Edit Question</h2>
        <form id="editForm">
            <input type="text" id="editQuestion" value="${questionData.question}" required>
            ${questionData.options
                .map(
                    (opt, i) =>
                        `<input type="text" id="editOption${i + 1}" value="${opt}" required>`
                )
                .join('')}
            <input type="text" id="editAnswer" value="${questionData.answer}" required>
            <button type="submit">Save Changes</button>
        </form>
    `;
    // Save changes
    document.getElementById('editForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const updatedQuestion = {
            question: document.getElementById('editQuestion').value,
            options: [
                document.getElementById('editOption1').value,
                document.getElementById('editOption2').value,
                document.getElementById('editOption3').value,
                document.getElementById('editOption4').value,
            ],
            answer: document.getElementById('editAnswer').value,
        };
        try {
            const response = await fetch(questionEdit, {
                method: 'PUT',
                body: JSON.stringify(updatedQuestion),
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                alert('Question updated successfully.');
                fetchQuestions(); // Refresh questions
            } else {
                alert('Failed to update the question.');
            }
        } catch (error) {
            console.error('Error updating question:', error);
        }
    });
}
fetchQuestions();// Fetch questions 


// ************************ Wanted Section Display Section ***************************

document.addEventListener("DOMContentLoaded", function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => section.style.display = 'none'); // Hide all sections
    document.querySelector('#export').style.display = 'block'; // Show only the score section by default
});
//Display the targeted section only
const links = document.querySelectorAll('a');
links.forEach(link => {
    link.addEventListener('click', function() {
        const targetSection = document.querySelector(link.getAttribute('href'));
        const sections = document.querySelectorAll('section');
        // Hide all sections first
        sections.forEach(section => section.style.display = 'none');
        // Display the targeted section
        targetSection.style.display = 'block';
    });
});

// ************************ Dynamic Data Upload By FORM Section  ***************************

document.getElementById("quizForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const question = document.getElementById("question").value;
    const option1 = document.getElementById("option1").value;
    const option2 = document.getElementById("option2").value;
    const option3 = document.getElementById("option3").value;
    const option4 = document.getElementById("option4").value;
    const answer = document.getElementById("answer").value;
    const resultMessage = document.getElementById("resultMessage");

    if (!question || !option1 || !option2 || !option3 || !option4 || !answer) {
        resultMessage.style.color = "red";
        resultMessage.textContent = "Please fill in all fields!";
        return;
    }

    const questionData = { question, options: [option1, option2, option3, option4], answer };

    try {
        const response = await fetch("https://quiz-6691d-default-rtdb.firebaseio.com/questions.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(questionData),
        });

        if (response.ok) {
            resultMessage.style.color = "green";
            resultMessage.textContent = "Successfully submitted!";
            document.getElementById("quizForm").reset();
        } else {
            resultMessage.style.color = "red";
            resultMessage.textContent = "Submission failed. Please try again.";
        }
    } catch (error) {
        resultMessage.style.color = "red";
        resultMessage.textContent = "An error occurred. Please try again.";
        console.error("Error submitting question:", error);
    }
});

// ************************ Questions importing Section  ***************************

const importToFirebase = "https://quiz-6691d-default-rtdb.firebaseio.com/questions.json";

// Function to import Excel file and send data to Firebase
function importExcel() {
  const fileInput = document.getElementById('excelFile');
  const status = document.getElementById('importStatus');

  if (!fileInput.files.length) {
    alert("Please select an Excel file first!");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Preprocess the parsed data
    const formattedData = jsonData.map((row) => ({
      question: row.Question || !(""),
      options: [
        row.Option1 || !(""),
        row.Option2 || !(""),
        row.Option3 || !(""),
        row.Option4 || !("")
      ],
      answer: row.Answer || !("")
    }));

    console.log("Formatted Data for Firebase:", formattedData);

    // Send the formatted data to Firebase
    uploadToFirebase(formattedData);
  };

  reader.onerror = (error) => {
    console.error("Error reading file:", error);
    status.textContent = "Error reading file!";
    status.style.color="red"
  };

  reader.readAsArrayBuffer(file);
}

// Function to upload processed data to Firebase
async function uploadToFirebase(data) {
  const status = document.getElementById('importStatus');
  try {
    for (const questionData of data) {
      const response = await fetch(importToFirebase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        console.error("Failed response:", response.statusText);
        status.textContent = "Failed to upload some data to Firebase.";
        status.style.color="red"
        return;
      }
    }

    status.textContent = "Data successfully uploaded to Firebase!";
    status.style.color="green"
    console.log("Upload successful!");
    fetchQuestions(); // Fetch and display updated data
  } catch (error) {
    status.textContent = "Error uploading data to Firebase.";
    console.error("Error uploading:", error);
  }
}


//*********************************** Score Section ***************************************
document.addEventListener('DOMContentLoaded', () => {
    const scoreTableBody = document.querySelector('.score-section tbody');
    const clearAllBtn = document.getElementById('clearScores');
    const exportExcelBtn = document.getElementById('exportData');   
    const databaseUrl = "https://student-details-ff916-default-rtdb.firebaseio.com/users.json";

    async function fetchScores() {
        try {
            const response = await fetch(databaseUrl);
            const data = await response.json();
    
            if (data) {
                // Sort by score in descending order
                const sortedScores = Object.keys(data)
                    .map(key => ({ id: key, ...data[key] })) // Add Firebase key as 'id'
                    .sort((a, b) => b.score - a.score); // Sort by score in descending order
    
                // Clear existing table rows
                scoreTableBody.innerHTML = '';
    
                // Loop through sorted data and display it in the table
                sortedScores.forEach(user => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${user.fullName || 'N/A'}</td>
                        <td>${user.collegeName || 'N/A'}</td>
                        <td>${user.registrationNumber || 'N/A'}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td>${user.branch || 'N/A'}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td>${user.score ? `${user.score}` : 'N/A'}</td>  
                          
                    `;
    
                    scoreTableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    
// Function to clear all data from the database
async function clearAllData() {
    try {
        const response = await fetch(databaseUrl, { method: 'DELETE' });

        if (response.ok) {
            alert('All data cleared successfully!');
            fetchScores(); // Reload the table after clearing
        } else {
            console.error('Failed to clear data:', response.statusText);
            alert('Failed to clear data. Please try again.');
        }
    } catch (error) {
        console.error('Error clearing all data:', error);
        alert('An error occurred while clearing data. Check the console for details.');
    }
}

// Function to export data to Excel excluding the "Actions" column
function exportToExcel() {
    const table = document.querySelector('.score-section');
    const rows = Array.from(table.rows);

    if (rows.length === 0) {
        alert('No data to export!');
        return;
    }

    // Prepare data for the Excel file, excluding the last column (Actions)
    const data = rows.map(row => {
        const cells = Array.from(row.cells);
        return cells.slice(0, -1).map(cell => cell.textContent); // Exclude the last cell
    });

    // Convert the data to a workbook and add a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scores');

    // Create and download the Excel file
    XLSX.writeFile(workbook, 'scores.xlsx');
}

// Event Listeners
if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllData);
}
if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', exportToExcel);
}

    // Initial fetch and display of scores
    fetchScores();
});

//******************************* Additional SetUp Section***********************************
document.getElementById('timeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const timeValue = document.getElementById('timeInput').value;
    if (!/^\d+$/.test(timeValue)) {
        alert("Please enter a valid number!");
        return;
    }
    try {
        const response = await fetch('https://additional-setups-default-rtdb.firebaseio.com/time.json', {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: parseInt(timeValue) }),
        });
        if (response.ok) {
            alert("Time value updated successfully!");
            document.getElementById('timeInput').value = '';
        } else {
            throw new Error(`Failed to update time. Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error updating time value:", error);
        alert("Error updating time value.");
    }
});

    // QR Code Section
    var qrcode;

    function generateQRCode() {
            var link = document.getElementById('linkInput').value;

            if (link) {
                document.getElementById('qrCodeContainer').innerHTML = '';

                qrcode = new QRCode(document.getElementById("qrCodeContainer"), {
                    text: link,
                    width: 200,
                    height: 200,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

                // Show the download button
                document.getElementById('downloadButton').style.display = 'block';
            } else {
                alert('Please enter a valid URL.');
            }
    }

    function downloadQRCode() {
            var qrCodeImage = document.querySelector('#qrCodeContainer img');
            qrCodeImage.style.backgroundColor="lightgray";
            qrCodeImage.style.padding="1rem";
            if (qrCodeImage) {
                // Create a temporary link element
                var link = document.createElement('a');
                link.href = qrCodeImage.src;
                link.download = 'qr_code.png'; // Set the download file name
                link.click(); // Trigger the download
            }
    }

