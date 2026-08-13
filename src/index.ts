import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import * as Checks from './namespaces/Checks';

async function run() {
  // try {
  //   // const vid = core.getInput('vid');
  //   // const vkey = core.getInput('vkey');
  //   const decisionMode = core.getInput('decision_mode');
  //   const sourceRepoName = core.getInput('source_repository');
  //   const [owner, repo] = sourceRepoName.split('/');
  //   const token = core.getInput('token');
    
  
   
   
    


    

  //   core.info(`Fetched Veracode config from ${owner}/${repo}`);
    
  // } catch (error) {
  //   core.setFailed(`Action failed: ${error instanceof Error ? error.message : String(error)}`);
  // }
  console.log("Hello world! This is a test of the GitHub Action.");
}

run();