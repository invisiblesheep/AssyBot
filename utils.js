const emoji = require('node-emoji');

const renderFoodColumn = (value) => {
  const num = Math.floor(value / 10);
  // console.log(num);
  let column = '';
  for (let i = 0; i < num; i += 1) {
    column = column.concat(':hamburger:');
    // console.log(column);
  }
  // console.log(column);
  for (let i = 0; i < 10 - num; i += 1) {
    column = column.concat(':x:');
    // console.log(column);
  }
  return column;
};

const renderSleepColumn = (value) => {
  const num = Math.floor(value / 10);
  // console.log(num);
  let column = '';
  for (let i = 0; i < num; i += 1) {
    column = column.concat(':zzz:');
    // console.log(column);
  }
  // console.log(column);
  for (let i = 0; i < 10 - num; i += 1) {
    column = column.concat(':x:');
    // console.log(column);
  }
  return column;
};

const renderFilthColumn = (value) => {
  const num = Math.floor(value / 10);
  // console.log(num);
  let column = '';
  for (let i = 0; i < num; i += 1) {
    column = column.concat(':hankey:');
    // console.log(column);
  }
  // console.log(column);
  for (let i = 0; i < 10 - num; i += 1) {
    column = column.concat(':slightly_smiling_face:');
    // console.log(column);
  }
  return column;
};

const renderVitutusColumn = (value) => {
  const num = Math.floor(value / 10);
  // console.log(num);
  let column = '';
  for (let i = 0; i < num; i += 1) {
    column = column.concat(':rage:');
    // console.log(column);
  }
  // console.log(column);
  for (let i = 0; i < 10 - num; i += 1) {
    column = column.concat(':slightly_smiling_face:');
    // console.log(column);
  }
  return column;
};

const renderEsColumn = (value) => {
  const num = Math.min(value, 10);
  let column = '';
  for (let i = 0; i < num; i += 1) {
    column = column.concat(':battery:');
  }
  return column;
};

const renderMassyColumn = (value) => {
  const num = Math.min(value, 10);
  let column = '';
  for (let i = 0; i < num; i += 1) {
    column = column.concat(':popcorn:');
  }
  return column;
};

const renderColumn = (value) => {
  const num = Math.floor(value / 10);
  let column = '';
  for (let i = 0; i < num; i += 1) {
    column = column.concat('=');
  }
  column = column.concat('|');
  for (let i = 0; i < 10 - num; i += 1) {
    column = column.concat('=');
  }
  return `[${column}]`;
};

const renderColumns = async (
  food,
  sleep,
  es,
  frustration,
  lanpower,
  massy,
  filth,
) => {
  const foodColumn = renderFoodColumn(food >= 100 ? 100 : food);
  const sleepColumn = renderSleepColumn(sleep >= 100 ? 100 : sleep);
  const esColumn = renderEsColumn(es > 10 ? 10 : es);
  const frustrationColumn = renderVitutusColumn(
    frustration >= 100 ? 100 : frustration,
  );
  const lanpowerColumn = renderColumn(lanpower >= 100 ? 100 : lanpower);
  const massyColumn = renderMassyColumn(massy > 10 ? 10 : massy);
  const filthColumn = renderFilthColumn(filth >= 100 ? 100 : filth);
  const columns = `\nFood:  ${foodColumn} ${food}%\nSleep ${sleepColumn} ${sleep}%\n
  Filth:    ${filthColumn} ${filth}%\nES:    ${esColumn} ${es}\nMässy:   ${massyColumn} ${massy}\n
  Fuck:  ${frustrationColumn} ${frustration}%\nLP:   ${lanpowerColumn} ${lanpower}%`;
  return emoji.emojify(columns);
};

module.exports = {
  renderColumns,
};
