exports.ChangeLng = (lang, messVN, messEN, messMM) => {
    if (lang === 'VN') return messVN; 
    if (lang === 'MM') return messMM;
    return messEN;
};


