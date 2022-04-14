#!/usr/bin/env node
const prompt = require("prompt-sync")({ sigint: true });
const shell = require("shelljs");
const fs = require("fs");
const { exit } = require("process");
const githubURL = "http://github.com/tribeplatform/tribe-starter-app";
function cloneGit(name) {
  if (!shell.which("git")) {
    shell.echo("Sorry, this script requires git");
    shell.exit(1);
  }
  if (shell.exec(`git clone ${githubURL} ${name}`).code !== 0) {
    shell.echo("Error: Git clone failed. Please retry.");
    shell.exit(1);
  }
}

function initGit() {
  shell.rm("-rf", ".git");
  shell.exec("git init");
  shell.exec("git add -A");
  shell.exec(`git commit -m "Initial commit"`);
}

function modifyProject(name) {
  directory = shell.pwd().stdout;
  shell.cp("server/.env.example", "server/.env");
  shell.cp("client/.env.example", "client/.env");
  const pkgJson = require(`${directory}/package.json`);
  pkgJson.name = name;
  fs.writeFileSync(
    `${directory}/package.json`,
    JSON.stringify(pkgJson, null, 2)
  );
}

function main() {
  const name = prompt("Name:");
  let directory = prompt("Directory:");
  shell.cd(directory);

  cloneGit(name);

  shell.cd(name);

  modifyProject(name);

  initGit();
}

if (require.main === module) {
  main();
}
