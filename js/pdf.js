function downloadReceipt() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const results = document.getElementById('result-cards').innerHTML;

    doc.setFontSize(16);
    doc.text('Smart Bill Splitter Receipt', 10, 10);
    doc.setFontSize(12);
    doc.fromHTML(results, 10, 20, { width: 180 });
    doc.save('bill_split_receipt.pdf');
}