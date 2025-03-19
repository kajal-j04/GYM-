const fs = require("fs");
const PDFDocument = require("pdfkit");

const doc = new PDFDocument();
const pdfPath = "pdfs/test.pdf";

if (!fs.existsSync("pdfs")) {
    fs.mkdirSync("pdfs"); // Create 'pdfs' folder if not exists
}

const stream = fs.createWriteStream(pdfPath);
doc.pipe(stream);
doc.fontSize(20).text("This is a valid PDF file!", 100, 100);
doc.end();

stream.on("finish", () => {
    console.log(`✅ PDF Created: ${pdfPath}`);
});
