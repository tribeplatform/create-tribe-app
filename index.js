#!/usr/bin/env node
const prompt = require("prompt-sync")({ sigint: true });
const shell = require("shelljs");
const githubURL = "http://github.com/tribeplatform/tribe-starter-app";
function main() {
  const name = prompt("Name:");
  const directory = prompt("Directory:");

  if (!shell.which("git")) {
    shell.echo("Sorry, this script requires git");
    shell.exit(1);
  }

  shell.cd(directory);
  if (shell.exec(`git clone ${githubURL} ${name}`).code !== 0) {
    shell.echo("Error: Git clone failed. Please retry.");
    shell.exit(1);
  }

  shell.cd(name);

  shell.rm("-rf", ".git");

  shell.exec("git init");
  shell.exec("git add -A");
  shell.exec(`git commit -m "Initial commit"`);
}

if (require.main === module) {
  main();
}
