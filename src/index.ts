import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    // const vid = core.getInput('vid');
    // const vkey = core.getInput('vkey');
    const decisionMode = core.getInput('decision_mode');
    const sourceRepoName = core.getInput('source_repository');
    const [owner, repo] = sourceRepoName.split('/');
    const token = core.getInput('token');
    const octokit = github.getOctokit(token);
    console.log(owner, repo, token, JSON.stringify(octokit));


    

    core.info(`Fetched Veracode config from ${owner}/${repo}`);
    
  } catch (error) {
    core.setFailed(`Action failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

run();