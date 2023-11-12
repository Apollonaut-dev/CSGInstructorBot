export const modex_regex = /\d{2,3}$/gm;

export const qual_report_comparator = (a, b) => {
  if (a.count > b.count) {
    return -1;
  } else if (a.count < b.count) {
    return 1;
  }
  return 0;
};