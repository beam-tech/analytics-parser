// Замена на свой идентификатор представления.
var VIEW_ID = '136130959';

/* Секунды превращает в строку в формате HH:MM:SS */
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

function convertDate(date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString();
  var dd  = date.getDate().toString();

  var mmChars = mm.split('');
  var ddChars = dd.split('');

  return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
}

Date.prototype.addDays = function(days) {
   var dat = new Date(this.valueOf())
   dat.setDate(dat.getDate() + days);
   return dat;
}

function getDates(startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(currentDate)
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

/* Ищет в строке вещественное число и округляет его до 2х знаков*/
function parseFloatToFixed(value) {
  return parseFloat(value).toFixed(2);
}

var dateArray = [];
var dateRange = getDates(new Date(new Date().setMonth(new Date().getMonth() - 1)) , new Date());
for (i = 0; i < dateRange.length; i ++ ) {
  var date = convertDate(dateRange[i]);
  //dateArray.push({ startDate: date, endDate: date });
  dateArray.push(date);
}

//console.log(dateArray[0]);

// Запрос к API и вывод результатов на страницу.
function queryReports() {
  gapi.client.request({
    path: '/v4/reports:batchGet',
    root: 'https://analyticsreporting.googleapis.com/',
    method: 'POST',
    body: {
      reportRequests: [
        {
          viewId: VIEW_ID,
          dateRanges: [
            { startDate: 'yesterday', endDate: 'today' }
          ],
          metrics: [
            {expression : 'ga:users'},
            {expression : 'ga:sessions'},
            {expression : 'ga:pageviews'},
            {expression : 'ga:pageviewsPerSession'},
            {expression : 'ga:avgSessionDuration'},
            {expression : 'ga:bounceRate'}
          ],
          dimensions: [
            { name : 'ga:day'}
          ]
        }
      ]
    }
  }).then(getGaData, console.error.bind(console))
    //.then(ass);
}

function getGaData(response) {
  console.log(response.result);
  var values        =  response.result.reports[0].data.totals[0].values;
  var headerEntries = response.result.reports[0].columnHeader.metricHeader.metricHeaderEntries;

  var gaData = headerEntries.reduce(function(result, field, index) {
    result[field.name] =  values[index];
    return result;
  }, {});

  gaData['ga:bounceRate']          = parseFloatToFixed(gaData['ga:bounceRate']) + '%';
  gaData['ga:pageviewsPerSession'] = parseFloatToFixed(gaData['ga:pageviewsPerSession']);
  gaData['ga:avgSessionDuration']  = gaData['ga:avgSessionDuration'].toHHMMSS();
  
  //return gaData;
  var formattedJson = JSON.stringify(response.result, null, 2);
  document.getElementById('query-output').value = formattedJson;
}


function ass(ass) {
  // Any of the following formats may be used
  var ctx = document.getElementById("myChart").getContext("2d");
  var ctx = document.getElementById("myChart");
  var myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: dateArray,
          datasets: [
              {
                label: 'Cеансы',
                fill: false,
                lineTension: 0.1,
                borderColor: '#5dd55d',
                showLine: true,
                data: [ass['ga:sessions']]
              }
          ]
      }
  });
}









