const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const TERRAFORM_DIR = path.join(__dirname, './Ansible-labs-with-Terraform');
const envFile = path.join(__dirname, '.env');

const { runTerraformDocker } = require('./utils/terraform.js')

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

async function initializeTerraform() {
  console.log("🔧 Initializing Terraform...");

  const dockerArgs = [
    'run', '--rm', '-i',
    '--env-file', envFile,
    '-v', `${TERRAFORM_DIR}:/app`,
    'meiezbr/terraform-project:latest',
    'init'
  ];

  const result = await runTerraformDocker(dockerArgs);

  if (result.code !== 0) {
    console.error("❌ Terraform init failed:\n", result.output);
  } else {
    console.log("✅ Terraform initialized successfully");
  }
}

// Example route to test the server
app.get('/api/', (req, res) => {
  res.send('Express server is running!');
});

// Fetch terraform logs
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

  // Build the docker command as an array for spawn()
  const dockerArgs = [
    'run',
    '--rm',
    '-i', // use -i, NOT -t (TTY breaks piping)
    '--env-file', envFile,
    '-v', `${TERRAFORM_DIR}:/app`,
    'meiezbr/terraform-project:latest',
    'apply',
    '--auto-approve'
  ];

  const terraform = spawn('docker', dockerArgs);

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
  });
});


// Destroy infrastructure
app.post('/api/destroy', (req, res) => {
  let output = '';

  // Build the docker command as an array for spawn()
  const dockerArgs = [
    'run',
    '--rm',
    '-i', // use -i, NOT -t (TTY breaks piping)
    '--env-file', envFile,
    '-v', `${TERRAFORM_DIR}:/app`,
    'meiezbr/terraform-project:latest',
    'destroy',
    '--auto-approve'
  ];

  const terraform = spawn('docker', dockerArgs);

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

app.listen(5000, async () => {
  console.log(`🚀 Backend server running on port 5000`);

  await initializeTerraform();  // run on startup
});
