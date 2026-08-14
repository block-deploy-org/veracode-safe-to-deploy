import * as core from '@actions/core';
import * as github from '@actions/github';


async function run() {
   try {
        const token = core.getInput("github_token");
        const owner = core.getInput("repository_owner");
        const repo = core.getInput("repository_name");
    
        const headSha = core.getInput("head_sha");
        const repository = core.getInput("repository");
        const artifacts_list = core.getInput("artifacts_list");

        
        const octokit = github.getOctokit(token);
        const commits = await octokit.request(`GET /repos/{owner}/{repo}/commits/{headSha}`);
        const check_run_id = commits.check_runs?.[0]?.id;
        console.log(`Check Run ID: ${check_run_id}`);
        const checkRunObj = await octokit.request(`GET /repos/{owner}/{repo}/check-runs/{check_run_id}`);
        console.log(`Check Run Object: ${JSON.stringify(checkRunObj)}`);

        checkRunObj.status = "completed";
        checkRunObj.conclusion = "success";
        checkRunObj.output = {
            title: "Veracode Safe to Deploy Check",
            summary: `Artifacts List: ${artifacts_list}`,
            text: `Repository: ${repository}\nArtifacts List: ${artifacts_list}`
        };

        const checkRun = await octokit.request(`PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}`, {
            owner,
            repo,
            check_run_id,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            },
            ...checkRunObj
        });






        


        // const response = await octokit.request('GET /repos/{owner}/{repo}/check-runs/{check_run_id}', {
        //     owner,
        //     repo,
        //     check_run_id,
        //     headers: {
        //         'X-GitHub-Api-Version': '2026-03-10'
        // }
        // });

        

        core.setOutput("check_run_id", checkRun.id);
        core.setOutput("check_run_url", checkRun.html_url);

        core.info(`Check Run created successfully`);
        core.info(`ID: ${checkRun.id}`);
        core.info(`URL: ${checkRun.html_url}`);
    } catch (error: any) {
        core.setFailed("Error in Pipeline: " + error.message);
    }
}

run();