var neo4j = require('neo4j-driver').v1;

var globalConfig = require('config');
console.log('config', globalConfig);
var authToken = neo4j.auth.basic(globalConfig.get("neo4j.username"), globalConfig.get("neo4j.password"));
var knownHosts = globalConfig.get("neo4j.knownHosts");
var driver;
if (knownHosts == '' || knownHosts == null || knownHosts == undefined) {
    driver = neo4j.driver(globalConfig.get("neo4j.url"), authToken);
} else {
    driver = neo4j.driver(globalConfig.get("neo4j.url"), authToken, knownHosts);
}

//参数code表示退出码
process.on("exit", function (code) {
    console.log("process exit", code);
    driver.close();
});

module.exports = driver;
