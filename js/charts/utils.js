/*globals data */

/*
    File with utils used to construct the reports
 */

//because .sort() doesn't sort numbers correctly
function numSort(a,b) {
    return a - b;
}

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

/**
 * Sorts array of arrays
 * @param a
 * @param b
 * @returns {number}
 * @constructor
 */
const Comparator = (a, b) => {
    if (a[1] < b[1]) {return -1;}
    if (a[1] > b[1]) {return 1;}
    return 0;
};

/* Function to get boxplot values */
function getBoxValues(data, sample) {
    const boxValues = [];
    boxValues.push(sample);
    boxValues.push(Math.min.apply(Math,data));
    boxValues.push(getPercentile(data, 25));
    boxValues.push(getPercentile(data, 50));
    boxValues.push(getPercentile(data, 75));
    boxValues.push(Math.max.apply(Math,data));
    return boxValues;
}