# CSV Duplicate Finder

A Flask web application that allows users to upload a CSV file, process it to identify duplicate rows based on all columns, and download a CSV file containing only the duplicate rows.

## Features

- ✅ Upload CSV files of any structure
- ✅ Identify all duplicate rows (not just subsequent occurrences)
- ✅ Display original data and duplicate rows in a user-friendly interface
- ✅ Download duplicate rows as a new CSV file
- ✅ Beautiful, modern UI with Bootstrap
- ✅ Responsive design for all devices
- ✅ DataTables integration for easy data browsing and searching

## Technologies Used

- **Backend:** Flask (Python web framework)
- **Data Processing:** Pandas (DataFrame operations)
- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5
- **Data Tables:** DataTables.js

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd csv-duplicate-finder
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Run the Flask application:**
   ```bash
   python app.py
   ```

2. **Open your web browser and navigate to:**
   ```
   http://localhost:5000
   ```

3. **Upload a CSV file:**
   - Click "Choose File" and select your CSV file
   - Click "Analyze CSV File"

4. **View results:**
   - The application will display statistics (total rows, duplicate rows, unique percentage)
   - View the original data table
   - View the duplicate rows table

5. **Download duplicates:**
   - If duplicates are found, click "Download Duplicates CSV" to download a CSV file containing only the duplicate rows

## How It Works

- The application uses Pandas to read the CSV file into a DataFrame
- Duplicate rows are identified using `df.duplicated(keep=False)`, which marks **all** occurrences of duplicate rows, not just the subsequent ones
- Data is stored in Flask sessions as JSON for cross-request access
- The download functionality generates a CSV file with UTF-8 BOM encoding for Excel compatibility

## File Structure

```
csv-duplicate-finder/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   ├── index.html        # Upload page
│   ├── results.html      # Results display page
│   └── error.html        # Error page
└── uploads/              # Uploaded files directory (created automatically)
```

## Error Handling

The application handles various error scenarios:
- Empty CSV files
- Corrupted CSV files
- Invalid file types
- Parsing errors
- Missing data for download

## Notes

- The application stores data in Flask sessions, so the download link remains available after viewing results
- Files are processed in memory; large files may require additional memory
- The secret key in `app.py` should be changed for production use

## License

This project is part of the portfolio showcase.

