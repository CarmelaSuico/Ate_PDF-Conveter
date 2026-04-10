document.getElementById("previewBtn").addEventListener("click", previewPDF);
document.getElementById("downloadBtn").addEventListener("click", downloadPDF);

// Utility function to set text styles based on type
function setTextStyle(doc, type) {
    if (type === "label") {
        doc.setFont("times", "normal");
        doc.setTextColor(100, 100, 100);
    } else if (type === "value") {
        doc.setFont("times", "bold");
        doc.setTextColor(0, 0, 0);
    } else if (type === "totalLabel") {
        doc.setFont("times", "italic");
        doc.setTextColor(100, 100, 100);
    } else if (type === "totalValue") {
        doc.setFont("times", "bolditalic");
        doc.setTextColor(0, 0, 0);
    } else if (type === "title") {
        doc.setFontSize(20);
        doc.setFont("times", "bold");
        doc.setTextColor(0, 0, 0);
    }
}

//date format
function formatDate(dateString, formatType) {
    if (!dateString) return "---";
    const dateObj = new Date(dateString);
    
    if (formatType === 'numeric') {
        // Returns 05/04/2026
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    } else {
        // Returns 5 April 2026
        const options = { day: 'numeric', year: 'numeric', month: 'long' };
        return dateObj.toLocaleDateString('en-GB', options);
    }
}

function createPDF() {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "landscape",
        format: 'a4', 
        unit: "mm" 
    });

    // --- 1. DATA GATHERING ---
    const name = document.getElementById("name").value || "N/A";
    const date = document.getElementById("date").value;
    const address = document.getElementById("Address").value || "N/A";
    const fullDate = formatDate(date, 'full');
    const numericDate = formatDate(date, 'numeric');
    const idNumber = document.getElementById("idNumber").value || "N/A";
    const utr = document.getElementById("utr").value || "N/A";
    const monthlyPay = parseFloat(document.getElementById("monthlyPay").value) || 0;
    const materials = parseFloat(document.getElementById("materials").value) || 0;
    const vat = parseFloat(document.getElementById("vat").value) || 0;
    const deduction = parseFloat(document.getElementById("deduction").value) || 0;

    const totlalpayment = monthlyPay - materials - vat;
    const totaldeduction = deduction;

    // --- 2. MEASUREMENTS & MARGINS ---
    const margin = 12.7;//0.5 inch margin in mm
    const pageWidth = doc.internal.pageSize.getWidth();
    
    const boxWidth = 87;  
    const boxHeight = 70;
    const padding = 2; 
    const lineSpacing = 6;
    const gap = 5; 
    const tableY = margin + 30;
    const bgtableY = margin + 26;
    const tablemargin = tableY + padding + 3;

    // --- 3. BACKGROUND LAYER ---
    // This draws the blue "band" behind where the tables will sit
    doc.setFillColor(230, 240, 255); // Light Blue
    doc.rect(0, bgtableY - 10, pageWidth, 95, 'F');

    // --- 4. HEADER SECTION ---
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.text(name, margin, margin + 10);
    
    doc.setFont("times", "normal");
    doc.setTextColor(100, 100, 100); // Lighter grey for date
    doc.text(`Month Ending ${fullDate}`, margin + doc.getTextWidth(name) + 5, margin + 10);
    
    // Right-aligned Header Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("times", "bold");
    doc.text("1Ones Contraction Ltd", pageWidth - margin, margin + 5, { align: "right" });
    doc.setFont("times", "normal");
    doc.text(idNumber, pageWidth - margin, margin + 10, { align: "right" });

    //measurements for tables
    let t1X = margin;
    let t2X = margin + boxWidth + gap;
    let t3X = margin + (boxWidth * 2) + (gap * 2);

    // --- TABLE 1: UTR ---
    //Subcontractor Details Title
    setTextStyle(doc, "title");
    doc.setFontSize(15);
    doc.text("Subcontractor Details", margin, tableY - 3);

    doc.setFillColor(255, 255, 255);
    doc.setFontSize(12);

    //table1 UTR
    doc.setDrawColor(50, 50, 50);
    doc.rect(t1X, tableY, boxWidth, boxHeight, "FD"); // 'FD' = Fill White, Draw Black Border
    setTextStyle(doc, "label");
    doc.text("UTR", t1X + padding, tablemargin);
    setTextStyle(doc, "value");
    doc.text(`${utr}`, t1X + boxWidth - padding, tablemargin, { align: "right" });

    // --- TABLE 2: PAYMENTS ---
    //Payment Details Title
    setTextStyle(doc, "title");
    doc.setFontSize(15);
    doc.text("Payments", margin + boxWidth + gap, tableY - 3);

    //table2
    doc.setFillColor(255, 255, 255);
    doc.setFontSize(12);

    doc.rect(t2X, tableY, boxWidth, boxHeight, 'FD');
    let t2Y_Internal = tablemargin;

    // Top Items
    const rowPayments = [
        ["Monthly Pay", monthlyPay.toFixed(2)],
        ["Cost of materials", materials.toFixed(2)],
        ["VAT", vat.toFixed(2)]
    ];

    rowPayments.forEach(([label, value]) => {
        //label
        setTextStyle(doc, "label");
        doc.text(label, t2X + padding, t2Y_Internal);
        
        //value
        setTextStyle(doc, "value");
        doc.text(`£${value}`, t2X + boxWidth - padding, t2Y_Internal, { align: "right" });
        t2Y_Internal += lineSpacing;
    });

    // Bottom Total
    let t2BottomY = tableY + boxHeight - padding;
    setTextStyle(doc, "totalLabel");
    doc.text("Total", t2X + padding, t2BottomY);
    
    setTextStyle(doc, "totalValue");
    doc.text(`£${totlalpayment.toFixed(2)}`, t2X + boxWidth - padding, t2BottomY, { align: "right" });

    // --- TABLE 3: DEDUCTIONS ---
    //Deduction Details Title
    setTextStyle(doc, "title");
    doc.setFontSize(15);
    doc.text("Deductions", margin + (boxWidth * 2) + (gap * 2), tableY - 3);

    //table3
    doc.setFillColor(255, 255, 255);
    doc.setFontSize(12);
    doc.rect(t3X, tableY, boxWidth, boxHeight, 'FD');
    let t3Y_Internal = tablemargin;
    
    //labels
    setTextStyle(doc, "label");
    doc.text("CIS deduction", t3X + padding, t3Y_Internal);

    //values
    setTextStyle(doc, "value");
    doc.text(`£${deduction.toFixed(2)}`, t3X + boxWidth - padding, t3Y_Internal, { align: "right" });

    // Bottom Final Total
    let t3BottomY = tableY + boxHeight - padding;
    
    // label
    setTextStyle(doc, "totalLabel");
    doc.text("Total", t3X + padding, t3BottomY);
    
    // value
    setTextStyle(doc, "totalValue");
    doc.text(`£${totaldeduction.toFixed(2)}`, t3X + boxWidth - padding, t3BottomY, { align: "right" });

// --------------------------------------------------------RESULT----------------------------------------------------------------
    // --- ROW 2 CONFIGURATION ---
    // Start 10mm below the bottom of the first row
    const box2Width = 87;  
    const box2Height = 50;
    let row2Y = tableY + boxHeight + 25; 
    let row2TableMargin = row2Y + padding + 3;

    // --- TABLE 4 - This Month Total---
    //This Month Total Title
    setTextStyle(doc, "title");
    doc.setFontSize(15);
    doc.text("This Month", margin, row2Y - 3);

    //table4
    doc.setFillColor(255, 255, 255);
    doc.setFontSize(12);
    doc.rect(t1X, row2Y, box2Width, box2Height, "FD");
    setTextStyle(doc, "label");
    doc.text("CIS deductible pay", t1X + padding, row2TableMargin);
    setTextStyle(doc, "value");
    doc.text(`£${totlalpayment.toFixed(2)}`, t1X + box2Width - padding, row2TableMargin, { align: "right" });

    // --- TABLE 5 - year to date ---
    //Year to Date Title
    setTextStyle(doc, "title");
    doc.setFontSize(15);
    doc.text("Year to Date", margin + box2Width + gap, row2Y - 3);

    //table5
    doc.setFillColor(255, 255, 255);
    doc.setFontSize(12);
    doc.rect(t2X, row2Y, box2Width, box2Height, 'FD');
    let resultt2Y_Internal = row2Y + padding + 3;

    // Top Items
    const row2Payments = [
        ["CIS deductible pay", totlalpayment.toFixed(2)],
        ["CIS deduction", totaldeduction.toFixed(2)]
    ];

    row2Payments.forEach(([label, value]) => {
        //label
        setTextStyle(doc, "label");
        doc.text(label, t2X + padding, resultt2Y_Internal);
        
        //value
        setTextStyle(doc, "value");
        doc.text(`£${value}`, t2X + boxWidth - padding, resultt2Y_Internal, { align: "right" });
        resultt2Y_Internal += lineSpacing;
    });


    // --- TABLE 6 - TOTAL and DATE ---
    // Payment and Date Title
    setTextStyle(doc, "title");
    doc.setFontSize(15);
    doc.text("Payment", margin + (box2Width * 2) + (gap * 2), row2Y - 3);

    //table6
    const TOTALOFALL = totlalpayment - totaldeduction;
    doc.setFillColor(255, 255, 255);
    doc.rect(t3X, row2Y, box2Width, box2Height, "FD");

    // Calculate center coordinates
    const centerX = t3X + (box2Width / 2);
    const centerY = row2Y + (box2Height / 2);

    // Use align: "center" to ensure the text is perfectly balanced
    doc.setFont("times", "normal");
    doc.setFontSize(30);
    doc.text(`£${TOTALOFALL.toFixed(2)}`, centerX, centerY, { align: "center" });
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(`Paid ${numericDate}`, centerX, centerY + 6, { align: "center" });


//---------------------------------------------------------Information of the Contractor----------------------------------------------------------------
    // --- BOTTOM-LEFT FOOTER ---
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - margin; // 1 inch (or 0.5 inch) up from the bottom edge

    doc.setFontSize(12); // Making footer text slightly smaller
    doc.text(`Contractor's address: ${address}`, margin, footerY);

    return doc;
}

// 👁 PREVIEW
function previewPDF() {
    const doc = createPDF();
    const pdfUrl = doc.output("bloburl");
    document.getElementById("pdfPreview").src = pdfUrl;
}

// ⬇ DOWNLOAD
function downloadPDF() {
    const doc = createPDF();
    doc.save("Monthly Report.pdf");
}
