// regex to extract modex from CSG3 nicknames (numbers at the end of the string)
export const modex_regex = /\d{2,3}$/gm;

// comparator to sort qual reports by number of people unqual'd
export const qual_report_comparator = (a, b) => {
  if (a.count > b.count) {
    return -1;
  } else if (a.count < b.count) {
    return 1;
  }
  return 0;
};