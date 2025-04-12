const fs = require("fs");  // ✅ Add this line
const path = require("path");

const pdfPath = path.join(__dirname, "pdfs", "test.pdf");

console.log("📂 Checking PDF Path:", pdfPath);

if (!fs.existsSync(pdfPath)) {
    console.error("❌ File does NOT exist:", pdfPath);
} else {
    console.log("✅ File EXISTS:", pdfPath);
}
