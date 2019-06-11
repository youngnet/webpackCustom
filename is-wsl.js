const os = require("os");
const fs = require("fs");

const isWsl = () => {
    if (process.platform !== "linux") {
        return false;
    }

    if (os.release().includes("Microsoft")) {
        return true;
    }

    try {
        return fs.readFileSync("/proc/version", "utf8").includes("Microsoft");
    } catch (err) {
        return false;
    }
};

module.exports = isWsl();
