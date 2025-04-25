# Smart Bill Splitter

A web application for splitting bills among multiple people.

## Features
- Add group members and items
- Support for tip, tax, and custom fees
- Multiple split types (equal, by items, custom, fixed)
- Dark/light mode with auto-switching
- Settlement logic
- LocalStorage for bill history
- PDF receipts
- Pie chart visualization

## Setup
1. Clone the repository:
```bash
git clone https://github.com/your-username/smart-bill-splitter.git
```
2. Open `index.html` in a browser or deploy to GitHub Pages.

## Deployment to GitHub Pages
1. Create a GitHub repository named `smart-bill-splitter`.
2. Ensure all files are in the correct folders as shown in the project structure.
3. Push the project files:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```
4. Go to repository Settings > Pages.
5. Set Source to `Deploy from a branch`, select `main` branch, and `/ (root)` folder.
6. Save and wait for the deployment URL (e.g., `https://your-username.github.io/smart-bill-splitter/`).

## Downloading Files
- Each file (`index.html`, `css/styles.css`, `js/app.js`, etc.) can be downloaded individually using the canvas feature in the AI interface.
- Save each file in the appropriate folder as shown in the project structure.

## Troubleshooting
If CSS or JS isn't loading:
1. **Check Browser Console**:
   - Open the deployed site (e.g., `https://your-username.github.io/smart-bill-splitter/`).
   - Press F12, go to the Console tab, and look for errors like "404 Not Found" for `css/styles.css` or `js/app.js`.
2. **Verify File Paths**:
   - Ensure `index.html` references `/smart-bill-splitter/css/styles.css`, `/smart-bill-splitter/js/app.js`, etc.
   - Check that files exist in the repository under `css/`, `js/`, and `assets/`.
3. **Confirm Files in Repository**:
   - Run:
     ```bash
     git status
     git add .
     git commit -m "Add missing files"
     git push origin main
     ```
   - Verify on GitHub that all files are present.
4. **Clear Browser Cache**:
   - Open the site in incognito mode or clear cache (Ctrl+Shift+R).
5. **Test Locally**:
   - Clone the repository:
     ```bash
     git clone https://github.com/your-username/smart-bill-splitter.git
     ```
   - Open `index.html` in a browser to confirm CSS and JS work.
6. **Check GitHub Pages Settings**:
   - Ensure Pages is set to deploy from the `main` branch, `/ (root)` folder.

## Usage
1. Add group members.
2. Add items for each member.
3. Specify extra charges.
4. Mark who paid.
5. Choose a split type.
6. Click "Split Bill".
7. Download the receipt or view history.

## License
MIT License