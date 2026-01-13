
import { useCallback } from 'react';

export interface VoiceCommandResult {
  isValid: boolean;
  originalText: string;
  detectedAction: 'EXPENSE' | 'INCOME' | 'LOG_ONLY';
  parsedData: {
    title: string;
    amount: number;
    quantity: number;
    unit: string;
    category: string;
    material: string;
  };
  feedbackMessage: string;
}

export const useSmartVoiceProcessor = () => {
  const processVoiceCommand = useCallback((text: string): VoiceCommandResult => {
    const cleanText = text.toLowerCase().trim();
    
    let amount = 0;
    let action: 'EXPENSE' | 'INCOME' | 'LOG_ONLY' = 'LOG_ONLY';
    let category = 'KHAC';
    let material = '';
    let quantity = 0;
    let unit = '';

    // --- 1. INTENT & ACTION DETECTION ---
    const expenseKeywords = /(mua|trả|tốn|hết|chi|mất|nợ)/;
    const incomeKeywords = /(bán|thu|được|lời|xuất)/;
    
    if (expenseKeywords.test(cleanText)) action = 'EXPENSE';
    else if (incomeKeywords.test(cleanText)) action = 'INCOME';

    // --- 2. CATEGORY & MATERIAL MAPPING ---
    // Fertilizer
    if (/(đạm|lân|kali|npk|phân|ure)/.test(cleanText)) {
      category = 'FERTILIZER';
      material = cleanText.match(/(đạm|lân|kali|npk|phân\s+\w+|ure)/)?.[0] || 'Phân bón';
      // Context heuristic: "Bón phân" (Log) vs "Mua phân" (Expense)
      if (!expenseKeywords.test(cleanText) && !incomeKeywords.test(cleanText)) {
         action = 'LOG_ONLY'; 
      }
    } 
    // Pesticide
    else if (/(sâu|rầy|nấm|thuốc|bệnh|cỏ)/.test(cleanText)) {
      category = 'PESTICIDE';
      material = cleanText.match(/(thuốc\s+\w+|trị\s+\w+|diệt\s+\w+)/)?.[0] || 'Thuốc BVTV';
    } 
    // Fuel
    else if (/(xăng|dầu|nhớt)/.test(cleanText)) {
      category = 'FUEL';
      material = 'Nhiên liệu';
    } 
    // Harvest
    else if (/(cà|nhân|tươi|xô|hái)/.test(cleanText) && (action === 'INCOME' || cleanText.includes('hái'))) {
      category = 'HARVEST';
      material = 'Cà phê';
      if (cleanText.includes('hái')) action = 'LOG_ONLY';
    } 
    // Care
    else if (/(tưới|nước|cắt|tỉa|làm cỏ)/.test(cleanText)) {
      category = 'CARE';
      material = cleanText.match(/(tưới|nước|cắt|tỉa|làm cỏ)/)?.[0] || 'Chăm sóc';
      action = 'LOG_ONLY';
    }

    // --- 3. MONEY PARSER (THE HARD PART) ---
    // Supports: "3 triệu 2", "1 củ", "500 k", "200 ngàn", "1 chai"
    
    const millionRegex = /(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|củ|chai)\s*(\d+)?/; 
    const thousandRegex = /(\d+(?:[.,]\d+)?)\s*(?:ngàn|nghìn|ka|k)(?!\s*triệu)/;
    
    const milMatch = cleanText.match(millionRegex);
    const thouMatch = cleanText.match(thousandRegex);
    
    if (milMatch) {
        const major = parseFloat(milMatch[1].replace(',', '.'));
        const minorRaw = milMatch[2];
        
        let minor = 0;
        if (minorRaw) {
             // Logic: "3 triệu 2" -> 3.200.000 vs "3 triệu 500" -> 3.500.000
             if (minorRaw.length === 1) minor = parseFloat(minorRaw) * 100000;
             else if (minorRaw.length === 3) minor = parseFloat(minorRaw) * 1000;
             else minor = parseFloat(minorRaw) * 10000; 
        } else if (cleanText.includes("rưỡi")) {
             minor = 500000;
        }

        amount = major * 1000000 + minor;
    } else if (thouMatch) {
        // Logic: "500k", "500 ngàn"
        const val = parseFloat(thouMatch[1].replace(',', '.'));
        amount = val * 1000;
    } else {
        // Fallback: Check for "hết 200000" (raw digits implying currency)
        const plainMoneyRegex = /(?:hết|giá|tiền)\s*(\d{3,}(?:[.,]\d+)?)/;
        const plainMatch = cleanText.match(plainMoneyRegex);
        if (plainMatch) {
            amount = parseFloat(plainMatch[1].replace(/\./g, '').replace(/,/g, '')); 
        }
    }

    // Post-Correction: If money detected but action is LOG_ONLY, force Expense/Income
    if (amount > 0 && action === 'LOG_ONLY') {
        if (category === 'HARVEST') action = 'INCOME';
        else action = 'EXPENSE';
    }

    // --- 4. QUANTITY PARSER ---
    // Supports: "10 bao", "50 kg", "1 tấn", "5 xe"
    const qtyRegex = /(\d+(?:[.,]\d+)?)\s*(bao|kg|tấn|tạ|yến|chai|lít|can|xe|công)/;
    const qtyMatch = cleanText.match(qtyRegex);
    if (qtyMatch) {
        quantity = parseFloat(qtyMatch[1].replace(',', '.'));
        unit = qtyMatch[2];
    }

    // --- 5. TITLE GENERATION ---
    let title = cleanText;
    if (material) {
        let verb = 'Ghi nhận';
        if (action === 'EXPENSE') verb = 'Mua';
        else if (action === 'INCOME') verb = 'Bán';
        else if (cleanText.includes('bón')) verb = 'Bón';
        else if (cleanText.includes('tưới')) verb = 'Tưới';
        
        title = `${verb} ${material}`;
        if (quantity > 0) title += ` (${quantity} ${unit})`;
        
        // Capitalize
        title = title.charAt(0).toUpperCase() + title.slice(1);
    } else {
        // Fallback cleanup
        title = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
    }

    // --- 6. VALIDATION & FEEDBACK ---
    const isValid = (amount > 0 || quantity > 0 || material !== '' || category !== 'KHAC');
    
    let feedbackMessage = '';
    if (isValid) {
        feedbackMessage = `Đã hiểu: ${title}`;
        if (amount > 0) {
            const formattedMoney = (amount/1000).toLocaleString('vi-VN') + 'k';
            feedbackMessage += `. ${action === 'INCOME' ? 'Thu' : 'Chi'} ${formattedMoney}.`;
        }
    } else {
        feedbackMessage = "Chưa rõ thông tin. Vui lòng nói rõ hành động và số lượng (VD: Mua 5 bao đạm).";
    }

    return {
        isValid,
        originalText: text,
        detectedAction: action,
        parsedData: {
            title,
            amount,
            quantity,
            unit,
            category,
            material
        },
        feedbackMessage
    };
  }, []);

  return { processVoiceCommand };
};
