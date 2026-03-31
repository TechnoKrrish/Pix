import { convertToShree0708 } from './shreelipiConverter';

export type FontEncoding = 'unicode' | 'krutidev' | 'shreelipi' | 'legacy';

export const detectFontEncoding = (fontName: string): FontEncoding => {
  if (!fontName) return 'unicode';
  const lowerName = fontName.toLowerCase();
  
  if (lowerName.includes('kruti') || lowerName.includes('k10') || lowerName.includes('devlys')) {
    return 'krutidev';
  }
  if (lowerName.includes('shree') || lowerName.includes('sri')) {
    return 'shreelipi';
  }
  if (lowerName.includes('chanakya') || lowerName.includes('walkman')) {
    return 'legacy';
  }
  
  return 'unicode';
};

export const convertToLegacy = (text: string, encoding: FontEncoding): string => {
  if (!text) return text;
  
  if (encoding === 'krutidev' || encoding === 'legacy') {
    return convertUnicodeToKrutiDev(text);
  }
  
  if (encoding === 'shreelipi') {
    return convertUnicodeToShreeLipi(text);
  }
  
  return text;
};

export const convertUnicodeToKrutiDev = (unicode_substring: string): string => {
    let array_one = [
        "‘",   "’",   "“",   "”",   "(",    ")",   "{",    "}",   "=", "।",  "?",  "-",  "µ", "॰", ",", ".", "् ", 
        "०",  "१",  "२",  "३",     "४",   "५",  "६",   "७",   "८",   "९", "x", 
        "फ़्",  "क़",  "ख़",  "ग़",  "ज़",  "ड़",  "ढ़",   "फ़",  "य़",  "ऱ",  "ऩ",  
        "त्त", "त्त्", "क्त",  "दृ",  "कृ",
        "ह्न",  "ह्य",  "हृ",  "ह्",  "द्द",  "क्ष्", "क्ष", "त्र्", "त्र","ज्ञ",
        "छ्य",  "ट्य",  "ठ्य",  "ड्य",  "ढ्य", "श", "श्",
        "ऑ",   "औ",  "ओ",  "आ",   "अ",  "ई",  "इ",  "उ",   "ऊ",  "ऐ",  "ए", "ऋ",
        "क्",  "क",  "क्क",  "ख्",   "ख",    "ग्",   "ग",  "घ्",  "घ",    "ङ",
        "चै",   "च्",   "च",   "छ",  "ज्", "ज",   "झ्",  "झ",   "ञ",
        "ट्ट",   "ट्ठ",   "ट",   "ठ",   "ड्ड",   "ड्ढ",  "ड",   "ढ",  "ण्", "ण",  
        "त्",  "त",  "थ्",  "थ",  "द्ध",  "द", "ध्", "ध",  "न्",  "न",  
        "प्",  "प",  "फ्", "फ",  "ब्",  "ब", "भ्",  "भ",  "म्",  "म",
        "य्",  "य",  "र",  "ल्", "ल",  "ळ",  "व्",  "व", 
        "श्", "श",  "ष्", "ष",  "स्", "स",   "ह",     
        "ऑ",   "ॉ",  "ो",   "ौ",   "ा",   "ी",   "ु",   "ू",   "ृ",   "े",   "ै",
        "ं",   "ँ",   "ः",   "ॅ",    "ऽ",  "् ", "्"
    ];

    let array_two = [
        "^", "*",  "Þ", "ß", "¼", "½", "¿", "À", "¾", "A", "\\", "&", "&", "&#2352;", ",", ".", "Z ",
        "0",  "1",  "2",  "3",     "4",   "5",  "6",   "7",   "8",   "9", "x", 
        "¶",   "d", "[k", "x", "t", "M+", "<+", "Q", ";", "j", "u",
        "Ù",   "Ùk", "Dr",    "–",   "—",       
        "à",   "á",   "â",   "ã",   "ºz",  "I",   "Ik",  "«",   "«k",  "K",
        "Nî",  "Vî",  "Bî",  "Mî",  "<î", "|", "|",
        "v‚", "vkS", "vks", "vk",  "v",   "bZ",  "b",  "m",  "Å",   "S",   "e",   "_",
        "D",   "d",   "ô",     "[",    "[k",   "X",   "x",  "?",   "?k",   "³", 
        "pS",   "P",    "p",  "N",   "T",    "t",   "O",   ">",   "¥",
        "V~V", "V~B", "V",   "B",   "M~M", "M~<", "M",   "<",  ".",   ".k",   
        "R",   "r",   "F",   "Fk",  "¼",    "o",  "è",   "èk",  "U",   "u",   
        "I",   "i",   "¶",   "Q",   "C",   "c",  "H",   "Hk",  "E",   "e",
        "¸",   ";",   "j",   "Y",   "y",   "y",  "O",   "o",
        "\'",  "\'k",  "\"",  "\"k", "L",   "l",   "g",      
        "v‚",  "‚",   "ks",   "kS",  "k",   "h",   "q",   "w",   "`",   "s",   "S",
        "a",   "¡",   "%",   "W",   "·",   "~ ", "~"
    ];

    let modified_substring = unicode_substring;

    // Handle 'ि' (chhoti ee ki matra)
    let position_of_f = modified_substring.indexOf("ि");
    while (position_of_f != -1) {
        let character_left_to_f = modified_substring.charAt(position_of_f - 1);
        modified_substring = modified_substring.replace(character_left_to_f + "ि", "f" + character_left_to_f);
        position_of_f = modified_substring.indexOf("ि", position_of_f + 1);
    }

    // Handle 'र्' (half r)
    let position_of_half_r = modified_substring.indexOf("र्");
    while (position_of_half_r != -1) {
        let character_right_to_half_r = modified_substring.charAt(position_of_half_r + 2);
        if (character_right_to_half_r != "") {
            modified_substring = modified_substring.replace("र्" + character_right_to_half_r, character_right_to_half_r + "Z");
        }
        position_of_half_r = modified_substring.indexOf("र्", position_of_half_r + 1);
    }

    for (let input_symbol_idx = 0; input_symbol_idx < array_one.length; input_symbol_idx++) {
        let idx = 0;
        while (idx != -1) {
            modified_substring = modified_substring.replace(array_one[input_symbol_idx], array_two[input_symbol_idx]);
            idx = modified_substring.indexOf(array_one[input_symbol_idx]);
        }
    }

    return modified_substring;
}

export const convertUnicodeToShreeLipi = (unicodeText: string): string => {
    try {
        let modified_substring = unicodeText;

        // Handle 'ि' (chhoti ee ki matra) - move it before the consonant
        let position_of_f = modified_substring.indexOf("ि");
        while (position_of_f != -1) {
            let character_left_to_f = modified_substring.charAt(position_of_f - 1);
            modified_substring = modified_substring.replace(character_left_to_f + "ि", "ि" + character_left_to_f);
            position_of_f = modified_substring.indexOf("ि", position_of_f + 1);
        }

        // Handle 'र्' (half r / reph) - move it after the consonant
        let position_of_half_r = modified_substring.indexOf("र्");
        while (position_of_half_r != -1) {
            let character_right_to_half_r = modified_substring.charAt(position_of_half_r + 2);
            if (character_right_to_half_r != "") {
                modified_substring = modified_substring.replace("र्" + character_right_to_half_r, character_right_to_half_r + "र्");
            }
            position_of_half_r = modified_substring.indexOf("र्", position_of_half_r + 1);
        }

        return convertToShree0708(modified_substring);
    } catch (e) {
        console.error("Failed to convert to Shree Lipi", e);
        return unicodeText;
    }
};
