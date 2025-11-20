const { spawn } = require('child_process');

function runTerraformDocker(commandArgs) {
  return new Promise((resolve, reject) => {
    let output = '';

    const terraform = spawn('docker', commandArgs);

    terraform.stdout.on('data', (data) => {
      output += data.toString();
    });

    terraform.stderr.on('data', (data) => {
      output += data.toString();
    });

    terraform.on('error', (err) => reject(err));

    terraform.on('close', (code) => {
      resolve({ code, output });
    });
  });
}

module.exports = { runTerraformDocker };
