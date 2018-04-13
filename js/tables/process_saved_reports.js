/**
 * This function processes the response from the Platform by getting the
 * returned values for saved reports and building a format to give to the table.
 * @param savedReports
 */
const processSavedReports = (savedReports) => {
  console.log(savedReports);

  const savedReportsDataArray = [];
  const savedReportsData = {};

  const headerMap = {
      "Name": "name",
      "Description": "description",
      "Timestamp": "timestamp",
      "Username": "username"
  };

  let savedReportsHeaders = ["", "Name", "Username", "Description", "Timestamp"];

  /* Set column mapping from the headers */
  let savedReportsColumnMapping = [
      {
          data: "active",
          render(data, type, row) {
              if (type === "display") {
                  return "<input type='checkbox' class='editor-active'>";
              }
              return data;
          },
          className: "dt-body-center"
      },
  ];

  savedReportsHeaders.map((x) => {
      if (x !== "") {
          savedReportsColumnMapping.push({"data": headerMap[x], "title":x});
      }
  });

  for (const report of savedReports) {
    let dataObject = {
        "active": 0
    };

    for (const key in report) {
      dataObject[key] = report[key];
    }

    savedReportsDataArray.push(dataObject);

  }

  savedReportsData.headers = savedReportsHeaders;
  savedReportsData.columnMapping = savedReportsColumnMapping;
  savedReportsData.data = savedReportsDataArray;


  $("#savedProjects").off("redraw").on("redraw", () => {
     $("#saved_reports_table").DataTable().draw();
  });

  return savedReportsData;

};