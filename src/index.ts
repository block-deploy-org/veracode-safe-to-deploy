import * as core from '@actions/core';
import * as github from '@actions/github';


async function run() {
   try {
        const token = core.getInput("github_token");
        const owner = core.getInput("repository_owner");
        const repo = core.getInput("repository_name");
        const decision_mode = core.getInput("decision_mode");
        const branch = core.getInput("source_branch");
        const repository = core.getInput("repository");
        const artifacts_list = core.getInput("artifacts_list");
        const pull_number = core.getInput("pull_request");
        const octokit = github.getOctokit(token);
        console.log(JSON.stringify(pull_number));
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
        const checkRunResponse: any = await octokit.request(`GET /repos/{owner}/{repo}/check-runs/{check_run_id}`,
            {
                owner,
                repo,
                check_run_id,
                headers: {
                    'X-GitHub-Api-Version': '2026-03-10'
                }
            }
        );

        const requestBody = {
            "type": "hello",
            "target": "target",
            "scope": [
                {
                "businessApplicationId": "",
                "businessApplicationVersion": "",
                "assetSnapshotIds": artifacts_list.split(",")
                }
            ]
        };
        const checkRunObj = checkRunResponse.data;

        const response = await fetch("https://moocher-uproot-cobbler.ngrok-free.dev/decisions/evaluate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody)
        });
        
        const responseBody = await response.json();
        if(responseBody.verdict === "SAFE" ) {
            checkRunObj.output = {
                title: "Veracode : Safe to Deploy !",
                summary: `Artifacts List: ${artifacts_list}`,
                text: `Repository: ${repository}\nArtifacts List: ${artifacts_list}`,
                images: [
                    {
                         alt: "Safe to Deploy",
                        caption: "Veracode Safe to Deploy",
                        image_url: 'https://www.veracode.com/wp-content/uploads/2025/01/VER-Symbol-Full-Reversed.svg'
                    }
                ]
            };
            core.info("Veracode Deply Decision: Allow");
        }else if(responseBody.verdict === "UNSAFE" && decision_mode === "observer") {
            checkRunObj.output = {
                title: "Warning! Unsafe to Deploy, Pipeline is in Observer Mode",
                summary: `Artifacts List: ${artifacts_list}`,
                text: `Repository: ${repository}\nArtifacts List: ${artifacts_list}`
            };
            core.info("Veracode Deply Decision: Observer Mode: Allow");
        }else{
            checkRunObj.output = {
                title: "Blocking Deplyment! Unsafe to Deploy",
                summary: `Artifacts List: ${artifacts_list}`,
                text: `Repository: ${repository}\nArtifacts List: ${artifacts_list}`
            };
            core.setFailed("Veracode Deploy Decision: Deny");
        }

        const comments = await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments', {
            owner, 
            repo,
            pull_number,
            body: '<h1>Great stuff!</h1>',
            commit_id: sha,
            path: 'README.md',
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
            });

        JSON.stringify(comments);

        
        
        const checkRun = await octokit.request(`PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}`, {
            owner,
            repo,
            check_run_id,
            output: checkRunObj.output,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
        });
        
        core.setOutput("status", responseBody.verdict);
        core.setOutput("summary", `Repository: ${repository}\nArtifacts List: ${artifacts_list}`);

        
    
    } catch (error: any) {
        core.setFailed("Error in Pipeline: " + error.message);
    }
}

run();