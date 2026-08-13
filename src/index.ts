import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    const vid = core.getInput('vid', { required: true });
    const vkey = core.getInput('vkey', { required: true });
    const decisionMode = core.getInput('decision_mode', { required: true });
    const sourceRepoName = core.getInput('source_repository', { required: true });
    const [owner, repo] = sourceRepoName.split('/');

    const token = core.getInput('token', { required: true });
    const octokit = github.getOctokit(token);

    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: 'values/prod-values.yml',
    });

    core.info(`Fetched Veracode config from ${owner}/${repo}`);
    console.log(response);
  } catch (error) {
    core.setFailed(`Action failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

run();