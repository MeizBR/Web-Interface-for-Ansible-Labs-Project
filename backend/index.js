const express = require('express');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const TERRAFORM_DIR = '/home/ubuntu/Ansible-labs-with-Terraform';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

// Example route to test the server
app.get('/api/', (req, res) => {
  res.send('Express server is running!');
});

app.get('/api/print-tf-logs', (req, res) => {
  const fs = require("fs");
  const logFile = `${TERRAFORM_DIR}/terraform_logs.txt`;

  fs.readFile(logFile, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Parse the log into a structured payload
    const response = {
      master: {},
      clients: [],
      raw: data
    };

    data.split("\n").forEach(line => {
      if (line.includes("Master Instance Name:"))
        response.master.name = line.split(":")[1].trim();

      if (line.includes("Master Public IP:"))
        response.master.public_ip = line.split(":")[1].trim();

      if (line.includes("- client-"))
        response.clients.push(line.replace("- ", "").trim());

      if (line.includes("Random Password:"))
        response.master.random_password = line.split(":")[1].trim();
    });

    res.json(response);
  });
});

// Launch infrastructure
app.post('/api/launch', (req, res) => {
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
app.post('/api/destroy', (req, res) => {
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
app.post('/api/upload-tfstate-to-s3', (req, res) => {
  const cmd = 'aws s3 cp terraform.tfstate s3://ansible-labs/terraform.tfstate';

  exec(cmd, { cwd: TERRAFORM_DIR, maxBuffer: 1024 * 500 }, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).send({ error: err.message, stderr });
    }
    res.send({ output: stdout });
  });
});

app.listen(5000, () => console.log('Backend API running on port 5000'));
