import * as core from '@actions/core';
import * as github from '@actions/github';


async function run() {
   try {
        const token = core.getInput("github_token");
        const owner = core.getInput("repository_owner");
        const repo = core.getInput("repository_name");
        const name = core.getInput("check_run_name");
        const headSha = core.getInput("head_sha");
        const repository = core.getInput("repository");
        const artifact_name = core.getInput("artifact_name");
        const runId = core.getInput("run_id");

        const detailsUrl = `https://github.com/${repository}/actions/runs/${runId}`;

        const octokit = github.getOctokit(token);
        const response = await octokit.rest.checks.create({
            owner,
            repo,
            name,
            head_sha: headSha,
            details_url: detailsUrl
        });

        const checkRun = response.data;

        core.setOutput("check_run_id", checkRun.id);
        core.setOutput("check_run_url", checkRun.html_url);

        core.info(`Check Run created successfully`);
        core.info(`ID: ${checkRun.id}`);
        core.info(`URL: ${checkRun.html_url}`);
    } catch (error: any) {
        core.setFailed(`Failed to create check run: ${error.message}`);
    }
  console.log("Hello world! This is a test of the GitHub Action.");
}

run();