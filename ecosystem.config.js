module.exports = {
	apps: [
		{
			script: 'dist/main.js',
			watch: '.',
			// Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
			args: 'one two',
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'production'
			}
		}
	],

	deploy: {
		production: {
			user: 'node',
			host: '0.0.0.1',
			ref: 'origin/master',
			repo: 'GIT_REPOSITORY',
			path: 'DESTINATION_PATH',
			'pre-deploy-local': '',
			'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
			'pre-setup': ''
		}
	}
};
