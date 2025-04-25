# Smart Bill Splitter - Premium Edition

A fully-featured web application for splitting bills fairly and visually, built with HTML, CSS, and JavaScript. Includes dark/light themes, animations, localStorage, Chart.js visualizations, and receipt generation.

## Features
- Add/remove participants dynamically
- Add items with costs and assign to participants
- Include tip, tax, and custom fees
- Multiple split types: items-based, equal, percentage, fixed
- Track payments and calculate who owes whom
- Save/load splits using localStorage
- Generate and download receipt as .txt
- Visualize splits with Chart.js pie chart
- Responsive design with dark/light/auto themes
- Glassmorphism UI with animations

## How to Use
1. **Clone or Download**: Clone this repository or download the files.
2. **Host Locally**:
   - Open `index.html` in a modern browser (Chrome, Firefox, etc.).
   - No server required for basic usage.
3. **Deploy to GitHub Pages**:
   - Push the repository to GitHub.
   - Enable GitHub Pages in the repository settings (use the `main` branch).
   - Access the app at `https://<username>.github.io/smart-bill-splitter/`.
4. **Usage**:
   - Add participants by entering names.
   - Add items with costs and assign to participants.
   - Enter tip/tax percentages and custom fees.
   - Specify payments made by participants.
   - Configure split types per person.
   - Click "Calculate" to see results and chart.
   - Save splits, load previous splits, or download a receipt.

## Technologies
- HTML5
- CSS3 (with animations and themes)
- JavaScript (DOM manipulation, localStorage)
- Chart.js (for pie charts)

## Notes
- Fully offline, no backend required.
- Optimized for mobile and desktop.
- Chart.js is loaded via CDN.
- Favicon is a placeholder; replace `assets/favicon.ico` with a custom icon if desired.

## Example
- Alice orders pizza (₹500), Bob orders burger (₹300), Clara orders coffee (₹200).
- Tip: 10%, Tax: 5%, Delivery fee: ₹150.
- Alice paid ₹600.
- App calculates each person's share, shows who owes whom, and generates a visual chart.

## License
MIT License - feel free to use, modify, and distribute.