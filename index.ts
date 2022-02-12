import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import * as io from '@actions/io'
import * as ioUtil from '@actions/io/lib/io-util'

const DEFAULT_DEPLOY_BRANCH = 'master'

async function run(): Promise<void> {
  try {
    const accessToken = core.getInput('access-token')
    if (!accessToken) {
      core.setFailed(
        'No personal access token found. Please provide one by setting the `access-token` input for this action.',
      )
      return
    }

    let deployBranch = core.getInput('deploy-branch')
    if (!deployBranch) deployBranch = DEFAULT_DEPLOY_BRANCH

    const deployRepo = core.getInput('deploy-repo')
    const isSameRepo = !deployRepo || deployRepo === github.context.repo.repo

    if (isSameRepo && github.context.ref === `refs/heads/${deployBranch}`) {
      console.log(`Triggered by branch used to deploy: ${github.context.ref}.`)
      console.log('Nothing to deploy.')
      return
    }

    const workingDir = core.getInput('working-dir') || '.'
    const publicDir = core.getInput('public-dir') || `${workingDir}/public`
    const pkgManager = (await ioUtil.exists(`${workingDir}/yarn.lock`)) ? 'yarn' : 'npm'
    console.log(`Installing your site's dependencies using ${pkgManager}.`)
    await exec.exec(`${pkgManager} install`, [], { cwd: workingDir })
    console.log('Finished installing dependencies.')

    let gatsbyArgs = core.getInput('gatsby-args').split(/\s+/).filter(Boolean)
    if (gatsbyArgs.length > 0) {
      gatsbyArgs = ['--', ...gatsbyArgs]
    }

    console.log('Ready to build your Gatsby site!')
    console.log(`Building with: ${pkgManager} run build ${gatsbyArgs.join(' ')}`)
    await exec.exec(`${pkgManager} run build`, gatsbyArgs, { cwd: workingDir })
    console.log('Finished building your site.')

    const cnameExists = await ioUtil.exists(`${workingDir}/CNAME`)
    if (cnameExists) {
      console.log('Copying CNAME over.')
      await io.cp(`${workingDir}/CNAME`, `${publicDir}/CNAME`, { force: true })
      console.log('Finished copying CNAME.')
    }

    const skipPublish = (core.getInput('skip-publish') || 'false').toUpperCase()
    if (skipPublish === 'TRUE') {
      console.log('Building completed successfully - skipping publish')
      return
    }

    const repo = `${github.context.repo.owner}/${deployRepo || github.context.repo.repo}`
    const repoURL = `https://${accessToken}@github.com/${repo}.git`
    console.log(`Deploying to repo: ${repo} and branch: ${deployBranch}`)
    
    await exec.exec(`git init`, [], { cwd: publicDir })

    const gitUserName = core.getInput('git-config-name') || github.context.actor
    const gitEmail = core.getInput('git-config-email') || `${github.context.actor}@users.noreply.github.com`

    await exec.exec(`git config user.name`, [gitUserName], {
      cwd: publicDir,
    })
    await exec.exec(`git config user.email`, [gitEmail], {
      cwd: publicDir,
    })

    await exec.exec(`git add`, ['.'], { cwd: publicDir })

    const commitMessageInput =
      core.getInput('commit-message') || `deployed via Simon Gatsby Action ${github.context.sha}`
    await exec.exec(`git commit`, ['-m', commitMessageInput], {
      cwd: publicDir,
    })

    await exec.exec(`git push`, ['-f', repoURL, `master:${deployBranch}`], {
      cwd: publicDir,
    })
    console.log('Finished deploying your site.')

  } catch (err: any) {
    core.setFailed(err.message)
  }
}

// Don't auto-execute in the test environment
if (process.env['NODE_ENV'] !== 'test') {
  run()
}

export default run
