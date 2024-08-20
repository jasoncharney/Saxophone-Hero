const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Setup readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to recursively filter JSON object
const filterNotes = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        return null;
    }

    if (Array.isArray(obj)) {
        return obj.map(filterNotes).filter(item => item !== null);
    }

    let filteredObj = {};

    for (const key in obj) {
        if (key === 'notes') {
            filteredObj[key] = obj[key];
        } else {
            const filteredChild = filterNotes(obj[key]);
            if (filteredChild && Object.keys(filteredChild).length > 0) {
                filteredObj[key] = filteredChild;
            }
        }
    }

    return Object.keys(filteredObj).length > 0 ? filteredObj : null;
};

// Prompt user for the path of the JSON file
rl.question('Enter the path of the JSON file: ', (filePath) => {
    // Ensure the file path is absolute
    const absolutePath = path.resolve(filePath);

    // Read the JSON file
    fs.readFile(absolutePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err.message);
            rl.close();
            return;
        }

        try {
            // Parse the JSON data
            const jsonData = JSON.parse(data);

            // Filter the JSON object to keep only the "notes" keys
            const filteredData = filterNotes(jsonData);

            // Write the filtered data to a new file
            const newFilePath = path.join(path.dirname(absolutePath), 'filtered_' + path.basename(absolutePath));
            fs.writeFile(newFilePath, JSON.stringify(filteredData, null, 2), (err) => {
                if (err) {
                    console.error('Error writing the file:', err.message);
                } else {
                    console.log(`Filtered JSON saved to ${newFilePath}`);
                }
                rl.close();
            });
        } catch (parseErr) {
            console.error('Error parsing the JSON:', parseErr.message);
            rl.close();
        }
    });
});
