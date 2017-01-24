// Замена на свой идентификатор представления.
var VIEW_ID = '136130959';

// Запрос к API и вывод результатов на страницу.
function queryReports() {
  gapi.client.request({
    path: '/v4/reports:batchGet',
    root: 'https://analyticsreporting.googleapis.com/',
    method: 'POST',
    body: {
      reportRequests: [ {
          viewId: VIEW_ID,
          dateRanges: [ { startDate: '31daysAgo', endDate: 'yesterday' }],
          metrics: [
            { expression : 'ga:users' },
            { expression : 'ga:sessions' },
            { expression : 'ga:pageviews' },
            { expression : 'ga:pageviewsPerSession' },
            { expression : 'ga:avgSessionDuration' },
            { expression : 'ga:bounceRate' }
          ],
          dimensions: [ { name:'ga:date' } ],
          includeEmptyRows : true,
          hideTotals: true,
          hideValueRanges: true
        }
      ]
    }
  }).then(displayResults, console.error.bind(console));

  gapi.client.request({
    path: '/v4/reports:batchGet',
    root: 'https://analyticsreporting.googleapis.com/',
    method: 'POST',
    body: {
      reportRequests: [ {
          viewId: VIEW_ID,
          dateRanges: [ { startDate: '31daysAgo', endDate: 'yesterday' }],
          metrics: [
            { expression : 'ga:users' },
            { expression : 'ga:sessions' },
            { expression : 'ga:pageviews' },
            { expression : 'ga:pageviewsPerSession' },
            { expression : 'ga:avgSessionDuration' },
            { expression : 'ga:bounceRate' }
          ],
          dimensions: [ { name:'ga:date' } ],
          includeEmptyRows : true,
          hideTotals: true,
          hideValueRanges: true
        }
      ]
    }
  }).then(displayToTable, console.error.bind(console));
}

function displayResults(response) {
  var headerEntries = response.result.reports[0].columnHeader.metricHeader.metricHeaderEntries;
  var rows =  response.result.reports[0].data.rows;

  var googleAnalyticsDataList = rows.reduce(function(result, field, index) {
    var values = rows[index].metrics[0].values;
    result[rows[index].dimensions[0]] = headerEntries.reduce(function(result, field, index) {
      switch (field.name) {
        case 'ga:bounceRate':
          result[field.name] =  parseFloatToFixed(values[index]) + '%';
          break;
        case 'ga:pageviewsPerSession':
          result[field.name] =  parseFloatToFixed(values[index]);
          break;
        case 'ga:avgSessionDuration':
          result[field.name] =  values[index].toHHMMSS();;
          break;
        default:
          result[field.name] =  values[index];
      }
      return result;
    }, {});
    return result;
  }, {});
  
  var arrayOfDate = Object.keys(googleAnalyticsDataList);
  //console.log(arrayOfDate);
  retur
  //var formattedJson = JSON.stringify(response.result , null, 2);
  //document.getElementById('query-output').value = formattedJson;
}

function displayToTable(argument) {
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
/*// Any of the following formats may be used
var ctx = document.getElementById("myChart").getContext("2d");
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
            {
              label: 'Прямые переходы',
              fill: false,
              lineTension: 0.1,
              borderColor: '#5dd55d',
              showLine: true,
              data: [1, 2, 3]
            }
        ]
    }
});*/