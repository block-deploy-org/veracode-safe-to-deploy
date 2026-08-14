import * as core from '@actions/core';
import * as github from '@actions/github';


async function run() {
   try {
        const token = core.getInput("github_token");
        const owner = core.getInput("repository_owner");
        const repo = core.getInput("repository_name");
    
        const branch = core.getInput("source_branch");
        const repository = core.getInput("repository");
        const artifacts_list = core.getInput("artifacts_list");

        const octokit = github.getOctokit(token);
         const branchObj = await octokit.request(`GET /repos/{owner}/{repo}/branches/{branch}`,{  owner,
            repo,
            branch,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
        });
        

        const sha = branchObj.data.commit?.sha;

        const commits = await octokit.request(`GET /repos/{owner}/{repo}/commits/{sha}/check-runs`,{  owner,
            repo,
            sha,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
        });
        const check_run_id = commits.data.check_runs?.[0]?.id;
        console.log(`Check Run ID: ${check_run_id}`);
        const checkRunResponse = await octokit.request(`GET /repos/{owner}/{repo}/check-runs/{check_run_id}`,
            {
                owner,
                repo,
                check_run_id,
                headers: {
                    'X-GitHub-Api-Version': '2026-03-10'
                }
            }
        );
        console.log(JSON.stringify(checkRunResponse));
        const checkRunObj = checkRunResponse.data;

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
            status: checkRunObj.status,
            conclusion: checkRunObj.conclusion,
            output: checkRunObj.output,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
        });
        console.log(JSON.stringify(checkRun));






        


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