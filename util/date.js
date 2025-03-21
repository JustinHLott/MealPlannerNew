export function getFormattedDate(date) {
  // Ensure the string follows the YYYY-MM-DD or M-D-YYYY format
  const regex = /^(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})$/;
  //console.log("date getFormattedDate date:",date);
  const date1 = (new Date(date)).toISOString().slice(0, 10);
  //console.log("DATE before test:",date1);
  if (!regex.test(date1)) {
    //console.log("DATE fail test:",new Date().toISOString().slice(0, 10));
    return new Date().toISOString().slice(0, 10);
  }else{
    let date3 = new Date(date);
    //console.log("DATE date3 passed:",date3);
    let date2 = new Date(getDateMinusDays(date3,0));
    date2 = date2.toISOString().slice(0, 10);
    return date2
  }
  
}

export function isValidDate(date){
    return date instanceof Date && !isNaN(date);
  };

export function getDateMinusDays(date1, days) {
  const date = new Date(date1);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
}
