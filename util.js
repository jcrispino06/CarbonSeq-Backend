// Parse header from req into a dictionary
export function parseHTTPHeader(header){
    const headerMap = new Map();
    let fieldName = true;
    let headerName;
    header.forEach(element => {
        if (fieldName){
            headerName = element;
        } else {
            headerMap.set(headerName, element);
        }
        fieldName = !fieldName;
    });
    return headerMap;
}