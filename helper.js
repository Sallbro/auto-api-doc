
// extract params
function extractParams(path) {
    const params = [];
    const regex = /{(\w+)}/g;
    let match;
    while ((match = regex.exec(path)) !== null) {
        params.push({
            name: match[1],
            in: "path",
            required: true,
            schema: { type: "string" }
        });
    }
    return params;
}

// format path
function formatPath(path) {
    return path.replace(/:(\w+)/g, "{$1}");
}

module.exports={extractParams,formatPath}

