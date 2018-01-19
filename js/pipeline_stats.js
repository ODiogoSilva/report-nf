const parseTrace = (reportInfo, traceArray) => {

    let infoObj = {};

    for (const el of traceArray){
        // Check if element if array or string
        let trace_str;
        if (el.constructor === Array){
            trace_str = el[0];
        } else {
            trace_str = el;
        }

        const tempStr = trace_str.split(";");
        const headers = tempStr[0].split(" ");
        const vals = tempStr[1].split(" ");
        const timeRun = tempStr[2];

        for (let i = 0; i < headers.length; i++){
            if (infoObj.hasOwnProperty(headers[i])){
                infoObj[headers[i]].push(parseInt(vals[i]));
            } else {
                infoObj[headers[i]] = [parseInt(vals[i])];
            }
        }
        if (infoObj.hasOwnProperty("time")){
            infoObj["time"].push(parseInt(timeRun));
        } else {
            infoObj["time"] = [parseInt(timeRun)];
        }
    }

    return infoObj;

};


const getPipelineInfo = (dataJson) => {

    let pipelineMap = new Map();

    for (const el of dataJson.filteredJson) {
        if (el.report_json.trace){
            const traceArray = el.report_json.trace;
            const pid = `${el.project_id}.${el.sample_name}`;

            // Add sample to Map object if first time
            if (!pipelineMap.has(pid)){
                pipelineMap.set(pid, {});
            }

            // Parse trace array
            const infoObj = parseTrace(el, traceArray);
            pipelineMap.get(pid)[el.report_json.task] = infoObj;
        }
    }

    // Get the total times for all process (and sub processes)
    for (const info of pipelineMap.values()){
        for (const task of Object.keys(info)){
            info[task].time = info[task].time.reduce((a, b) => a + b, 0)
        }
    }

    pipelineInfo = pipelineMap;
};


const getSampleRuntime = (sampleId) => {

    let runtime = 0;

    const sampleInfo = pipelineInfo.get(sampleId);

    if (!sampleInfo){
        return undefined;
    }

    for (const el of Object.keys(sampleInfo)) {
        runtime += sampleInfo[el].time
    }

    return runtime / 1000 / 60;

};