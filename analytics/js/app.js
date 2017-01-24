// Замена на свой идентификатор представления.
var VIEW_ID = '136130959';

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
            {
              startDate: '31daysAgo',
              endDate: 'yesterday'
            }
          ],
          metrics: [
            { expression : 'ga:users'},
            { expression : 'ga:sessions'},
            { expression : 'ga:pageviews'},
            { expression : 'ga:pageviewsPerSession'},
            { expression : 'ga:avgSessionDuration'},
            { expression : 'ga:bounceRate'}
          ],
          dimensions: [
            { name:'ga:date' }
          ],
          includeEmptyRows : true,
          hideTotals: true,
          hideValueRanges: true
        }
      ]
    }
  }).then(getDataByDays, console.error.bind(console))
    .then(drawGraphicByDays);

  gapi.client.request({
    path: '/v4/reports:batchGet',
    root: 'https://analyticsreporting.googleapis.com/',
    method: 'POST',
    body: {
      reportRequests: [
        {
          viewId: VIEW_ID,
          dateRanges: [
            {
              startDate: '31daysAgo',
              endDate: 'yesterday'
            }
          ],
          metrics: [
            { expression : 'ga:users'},
            { expression : 'ga:sessions'},
            { expression : 'ga:pageviews'},
            { expression : 'ga:pageviewsPerSession'},
            { expression : 'ga:avgSessionDuration'},
            { expression : 'ga:bounceRate'}
          ],
          includeEmptyRows : true,
          hideTotals: true,
          hideValueRanges: true
        }
      ]
    }
  }).then(getDataByMonth, console.error.bind(console))
    .then(drawToTableByMonth);
}

function getDataByDays(response) {
  //console.log(response.result);
  var headerEntries = response.result.reports[0].columnHeader.metricHeader.metricHeaderEntries;
  var rows =  response.result.reports[0].data.rows;

  var googleAnalyticsData = rows.reduce(function(result, field, index) {
    var values = rows[index].metrics[0].values;
    result[rows[index].dimensions[0]] = headerEntries.reduce(function(result, field, index) {
      switch (field.name) {
        case 'ga:bounceRate':
          result[field.name] =  parseFloatToFixed(values[index]);// + '%';
          break;
        case 'ga:pageviewsPerSession':
          result[field.name] =  parseFloatToFixed(values[index]);
          break;
        case 'ga:avgSessionDuration':
          result[field.name] =  values[index];//.toHHMMSS();;
          break;
        default:
          result[field.name] =  values[index];
      }
      return result;
    }, {});
    return result;
  }, {});
  
  return googleAnalyticsData;
}

function getDataByMonth(response) {
  //console.log(response.result);
  var values        =  response.result.reports[0].data.rows[0].metrics[0].values;
  var headerEntries = response.result.reports[0].columnHeader.metricHeader.metricHeaderEntries;

  var gaData = headerEntries.reduce(function(result, field, index) {
    result[field.name] =  values[index];
    return result;
  }, {});

  gaData['ga:bounceRate']          = parseFloatToFixed(gaData['ga:bounceRate']) + '%';
  gaData['ga:pageviewsPerSession'] = parseFloatToFixed(gaData['ga:pageviewsPerSession']);
  gaData['ga:avgSessionDuration']  = gaData['ga:avgSessionDuration'].toHHMMSS();
  
  return gaData;
}

function drawGraphicByDays(data) {
  /* массив из дат*/
  var arrayOfDate = Object.keys(data);
  var ctxChartOfNumbers = document.getElementById("ChartOfNumbers").getContext("2d");
  var ctxChartOfNumbers = document.getElementById("ChartOfNumbers");

  var ctxChartOfPercent = document.getElementById("ChartOfPercent").getContext("2d");
  var ctxChartOfPercent = document.getElementById("ChartOfPercent");

  var ctxChartOfTimeLine = document.getElementById("ChartOfTimeLine").getContext("2d");
  var ctxChartOfTimeLine = document.getElementById("ChartOfTimeLine");

  var arrayOfSessions = arrayOfDate.reduce(function(array, date) {
    array.push(data[date]['ga:sessions']);
    return array;
  }, []);

  var arrayOfUsers = arrayOfDate.reduce(function(array, date) {
    array.push(data[date]['ga:users']);
    return array;
  }, []);

  var arrayOfPageViews = arrayOfDate.reduce(function(array, date) {
    array.push(data[date]['ga:pageviews']);
    return array;
  }, []);

  var arrayOfPageViewsPerSession = arrayOfDate.reduce(function(array, date) {
    array.push(data[date]['ga:pageviewsPerSession']);
    return array;
  }, []);

  var arrayOfAvgSessionDuration = arrayOfDate.reduce(function(array, date) {
    array.push(data[date]['ga:avgSessionDuration']);
    return array;
  }, []);

  var arrayOfBounceRate = arrayOfDate.reduce(function(array, date) {
    array.push(data[date]['ga:bounceRate']);
    return array;
  }, []);

  //console.log(arrayOfAvgSessionDuration);

  var ChartOfNumbers = new Chart(ctxChartOfNumbers, {
      type: 'line',
      data: {
          labels: arrayOfDate,
          datasets: [
              {
                label: 'Сеансы',
                lineDashType: "dash",
                fill: false,
                lineTension: 0.1,
                borderColor: '#1f17a3',
                showLine: true,
                borderDash: [10, 10],
                data: arrayOfSessions
              }, {
                label: 'Пользователи',
                fill: false,
                lineTension: 0.1,
                borderColor: '#2eb8d5',
                showLine: true,
                data: arrayOfUsers
              }, {
                label: 'Просмотры страниц',
                fill: false,
                lineTension: 0.1,
                borderColor: '#ff005a',
                showLine: true,
                borderDash: [3, 12, 3, 12],
                data: arrayOfPageViews
              }, {
                label: 'Страниц/сеанс',
                fill: false,
                lineTension: 0.1,
                borderColor: '#d628e1',
                showLine: true,
                borderDash: [3, 12, 12, 12],
                data: arrayOfPageViewsPerSession
              }, 
          ],
      }
  });

  var ChartOfPercent = new Chart(ctxChartOfPercent, {
      type: 'line',
      data: {
          labels: arrayOfDate,
          datasets: [
              {
                label: 'Показатель отказов',
                fill: false,
                lineTension: 0.1,
                borderColor: '#5dd55d',
                showLine: true,
                data: arrayOfBounceRate
              }
          ]
      }
  });

  var ChartOfTimeLine = new Chart(ctxChartOfTimeLine, {
      type: 'line',
      data: {
          labels: arrayOfDate,
          datasets: [
              {
                label: 'Сред. длительность сеанса',
                fill: false,
                lineTension: 0.1,
                borderColor: '#ff0000',
                showLine: true,
                data: arrayOfAvgSessionDuration
              }
          ]
      }
  });

}

function drawToTableByMonth(data) {
  console.log(data);
}
