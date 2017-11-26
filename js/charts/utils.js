/*
    File with utils used to construct the reports
 */

//get any percentile from an array
function getPercentile(data, percentile) {
    data.sort(numSort);
    const index = (percentile/100) * data.length;
    let result;
    if (Math.floor(index) == index) {
        result = (data[(index-1)] + data[index])/2;
    }
    else {
        result = data[Math.floor(index)];
    }
    return result;
}

//because .sort() doesn't sort numbers correctly
function numSort(a,b) {
    return a - b;
}

/* Function to get boxplot values */
function getBoxValues(data) {
    const boxValues = {};
    boxValues.x = Math.random() * 100;
    boxValues.low    = Math.min.apply(Math,data);
    boxValues.q1     = getPercentile(data, 25);
    boxValues.median = getPercentile(data, 50);
    boxValues.q3     = getPercentile(data, 75);
    boxValues.high   = Math.max.apply(Math,data);
    return boxValues;
}