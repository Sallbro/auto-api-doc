
const fs = require("fs");
const yaml = require("js-yaml");

// generate docs
function writeOpenAPIFiles(openapiSpec, outputDir = "./docs") {
    // Ensure the directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write JSON file
    const jsonFilePath = `${outputDir}/openapi.json`;
    fs.writeFileSync(jsonFilePath, JSON.stringify(openapiSpec, null, 2));
    console.log(`✅ OpenAPI JSON saved: ${jsonFilePath}`);

    // Write YAML file
    const yamlFilePath = `${outputDir}/openapi.yaml`;
    fs.writeFileSync(yamlFilePath, yaml.dump(openapiSpec));
    console.log(`✅ OpenAPI YAML saved: ${yamlFilePath}`);
}

module.exports = {
    writeOpenAPIFiles,
};
