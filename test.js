const express = require('express');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const TERRAFORM_DIR = '/home/ubuntu/Ansible-labs-with-Terraform';

// Example route to test the server
app.get('/', (req, res) => {
  res.send('Express server is running!');
});

// Test API endpoint
app.post('/test', (req, res) => {
  const cmd = 'cat terraform.tfstate';

  exec(cmd, { cwd: TERRAFORM_DIR, maxBuffer: 1024 * 500 }, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).send({ error: err.message, stderr });
    }
    res.send({ output: stdout });
  });
});

// Launch infrastructure
app.post('/launch', (req, res) => {
  let output = '';

  const terraform = spawn('bash', ['-c', 'terraform init && terraform apply -auto-approve'], { cwd: TERRAFORM_DIR });

  terraform.stdout.on('data', (data) => {
    output += data.toString();
  });

  terraform.stderr.on('data', (data) => {
    output += data.toString();
  });

  terraform.on('error', (err) => {
    return res.status(500).send({ status: 'failed', error: err.message, output });
  });

  terraform.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).send({ status: 'failed', output });
    }

    // Now run S3 upload
    const cmd = 'aws s3 cp terraform.tfstate s3://ansible-labs/terraform.tfstate';
    exec(cmd, { cwd: TERRAFORM_DIR, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        return res.status(500).send({ status: 'failed', error: err.message, stderr, output });
      }

      output += `\nS3 Upload Output:\n${stdout}\n${stderr}`;
      return res.send({ status: 'finished', output });
    });
  });
});


// Destroy infrastructure
app.post('/destroy', (req, res) => {
  const terraform = spawn('bash', ['-c', 'terraform destroy -auto-approve'], { cwd: TERRAFORM_DIR });

  let output = '';

  terraform.stdout.on('data', (data) => {
    output += data.toString();
  });

  terraform.stderr.on('data', (data) => {
    output += data.toString();
  });

  terraform.on('close', (code) => {
    res.send({
      status: code === 0 ? 'finished' : 'failed',
      output
    });
  });

  terraform.on('error', (err) => {
    res.status(500).send({ error: err.message });
  });
});

// Upload terraform.tfstate to S3
app.post('/upload-tfstate-to-s3', (req, res) => {
  const cmd = 'aws s3 cp terraform.tfstate s3://ansible-labs/terraform.tfstate';

  exec(cmd, { cwd: TERRAFORM_DIR, maxBuffer: 1024 * 500 }, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).send({ error: err.message, stderr });
    }
    res.send({ output: stdout });
  });
});

app.listen(3000, () => console.log('Backend API running on port 3000'));
