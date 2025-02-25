const { generateOpenAPISpec } = require("./openApiGen");
const { setupSwaggerUI } = require("./setupUi");
const { writeOpenAPIFiles } = require("./docGen");
const { generateCodeFromOpenAPI } = require("./codeGen");


module.exports = {
    generateOpenAPISpec,
    setupSwaggerUI,
    writeOpenAPIFiles,
    generateCodeFromOpenAPI
}