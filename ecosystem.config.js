module.exports = {
  apps: [
    {
      name: 'smart-police-backend',
      script: 'npm',
      args: 'start',
      cwd: './backend',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
