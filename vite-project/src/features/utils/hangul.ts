export const getChosung = (str: string) => {
  const cho = [
    "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
    "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
  ];
  
  return str
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0) - 44032;
      if (code > -1 && code < 11172) return cho[Math.floor(code / 588)];
      return char; 
    })
    .join("");
};