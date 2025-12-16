from flask import Flask, render_template, request, redirect, url_for, session, send_file
import pandas as pd
import os
import io
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Replace with a strong secret key in production

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return redirect(url_for('index'))
    
    file = request.files['file']
    
    if file.filename == '':
        return redirect(url_for('index'))
    
    if file and file.filename.endswith('.csv'):
        try:
            # Read CSV file
            df = pd.read_csv(file)
            
            # Check if DataFrame is empty
            if df.empty:
                return render_template('error.html', 
                    error_message="The uploaded CSV file is empty. Please upload a file with data.")
            
            # Store original DataFrame in session as JSON
            session['original_df'] = df.to_json(orient='records')
            session['original_columns'] = list(df.columns)
            
            # Find all duplicate rows (all occurrences, not just subsequent ones)
            duplicates = df[df.duplicated(keep=False)]
            
            # Store duplicates DataFrame in session
            session['duplicates_df'] = duplicates.to_json(orient='records')
            session['duplicate_count'] = len(duplicates)
            session['total_count'] = len(df)
            
            # Convert to HTML for display
            original_html = df.to_html(classes='table table-striped table-bordered', 
                                      table_id='original-table', escape=False)
            
            if duplicates.empty:
                duplicates_html = "<p>No duplicate rows found.</p>"
            else:
                duplicates_html = duplicates.to_html(classes='table table-striped table-bordered', 
                                                   table_id='duplicates-table', escape=False)
            
            return render_template('results.html', 
                                 original_data=original_html,
                                 duplicate_data=duplicates_html,
                                 duplicate_count=len(duplicates),
                                 total_count=len(df))
        
        except pd.errors.EmptyDataError:
            return render_template('error.html', 
                error_message="The uploaded CSV file appears to be empty or corrupted.")
        except pd.errors.ParserError as e:
            return render_template('error.html', 
                error_message=f"Error parsing CSV file: {str(e)}")
        except Exception as e:
            return render_template('error.html', 
                error_message=f"Error processing file: {str(e)}")
    
    return render_template('error.html', 
        error_message="Invalid file type. Please upload a CSV file.")

@app.route('/download')
def download_duplicates():
    if 'duplicates_df' not in session:
        return redirect(url_for('index'))
    
    try:
        # Reconstruct DataFrame from session JSON
        duplicates_json = session.get('duplicates_df')
        if not duplicates_json:
            return render_template('error.html', 
                error_message="No duplicate data available for download.")
        
        duplicates_df = pd.read_json(io.StringIO(duplicates_json), orient='records')
        
        # Create CSV in memory
        output = io.StringIO()
        duplicates_df.to_csv(output, index=False)
        output.seek(0)
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"duplicates_{timestamp}.csv"
        
        # Return file as download
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8-sig')),  # UTF-8 BOM for Excel compatibility
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )
    
    except Exception as e:
        return render_template('error.html', 
            error_message=f"Error generating download file: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True)

