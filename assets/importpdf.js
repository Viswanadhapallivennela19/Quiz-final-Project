

// Function to import PDF file and send data to Firebase
function importPDF() {
    const fileInput = document.getElementById('pdf');
    const status = document.getElementById('importStatus');
  
    if (!fileInput.files.length) {
      alert("Please select a PDF file first!");
      return;
    }
  
    const file = fileInput.files[0];
    const reader = new FileReader();
  
    reader.onload = async (event) => {
      const pdfData = new Uint8Array(event.target.result);
      
      try {
        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        const numPages = pdfDoc.numPages;
        let textContent = "";
        
        // Loop through each page of the PDF and extract text
        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map(item => item.str).join(" ") + " ";
        }
  
        // Process the extracted text (simple example, adjust based on PDF format)
        const formattedData = processPDFData(textContent);
  
        // Send the formatted data to Firebase
        uploadToFirebase(formattedData);
      } catch (error) {
        console.error("Error processing PDF:", error);
        status.textContent = "Error processing PDF!";
        status.style.color = "red";
      }
    };
  
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      status.textContent = "Error reading file!";
      status.style.color = "red";
    };
  
    reader.readAsArrayBuffer(file);
  }
  
  // Function to process the extracted text from PDF
  function processPDFData(textContent) {
      const lines = textContent.split("\n");
      const formattedData = [];
  
      let question = "";
      let options = [];
      let answer = "";
  
      // Iterate through the lines to extract questions, options, and answers
      for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
  
          // Check if the line contains the question and options on the same line
          const questionMatch = line.match(/^(\d+)\s+(.*)\s+•\s*Options:\s*(.*)$/);
          if (questionMatch) {
              // If there's an existing question, push it to the formattedData
              if (question) {
                  formattedData.push({
                      question: question,
                      options: {
                          "0": options[0] || "",
                          "1": options[1] || "",
                          "2": options[2] || "",
                          "3": options[3] || ""
                      }
                  });
              }
  
              // Extract question and options
              question = questionMatch[2].trim();  // Question text
              options = questionMatch[3].split(',').map(opt => opt.trim());  // Extract options
          }
  
          // If a line contains the "Answer:" text, process it as an answer
          const answerMatch = line.match(/Answer:\s*(.*)$/);
          if (answerMatch) {
              answer = answerMatch[1].trim();
          }
  
          // Handle the case where options and answer are on separate lines
          if (line.length === 0 && options.length > 0 && !answer) {
              // Assuming the last option is the answer
              answer = options.pop();
          }
      }
  
      // Push the last question
      if (question) {
          formattedData.push({
              question: question,
              options: {
                  "0": options[0] || "",
                  "1": options[1] || "",
                  "2": options[2] || "",
                  "3": options[3] || ""
              }
          });
      }
  
      console.log("Formatted Data for Firebase:", formattedData);
      return formattedData;
  }
  
    
  
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
            status.style.color = "red";
            return;
          }
        }
    
        status.textContent = "Data successfully uploaded to Firebase!";
        status.style.color = "green";
        console.log("Upload successful!");
      } catch (error) {
        status.textContent = "Error uploading data to Firebase.";
        console.error("Error uploading:", error);
      }
    }