const shell = require("shelljs");
const fs = require("fs");

const TEST_FOLDER_NAME = "test";

test("Creates the project", (done) => {
  shell.exec("node index.js --name test");
  const exists = fs.existsSync(`./${TEST_FOLDER_NAME}`);
  expect(exists).toBeTruthy();
  shell.rm("-rf", `${TEST_FOLDER_NAME}`);
  done();
});
