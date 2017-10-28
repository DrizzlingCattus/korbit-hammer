module.exports = {
	/**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
	apps: [
		{
			name: "btc_krw",
			script: "./src/index.js",
			args: "btc_krw",
			watch: ["src"],
			ignore_watch: ["node_modules", "log", "data", "research", "spec", "korbit_sphere"]
		},

		{
			name: "etc_krw",
			script: "./src/index.js",
			args: "etc_krw",
			watch: ["src"],
			ignore_watch: ["node_modules", "log", "data", "research", "spec", "korbit_sphere"]
		},

		{
			name: "eth_krw",
			script: "./src/index.js",
			args: "eth_krw",
			watch: ["src"],
			ignore_watch: ["node_modules", "log", "data", "research", "spec", "korbit_sphere"]
		},

		{
			name: "xrp_krw",
			script: "./src/index.js",
			args: "xrp_krw",
			watch: ["src"],
			ignore_watch: ["node_modules", "log", "data", "research", "spec", "korbit_sphere"]
		}
	],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
    /*
  deploy : {
    production : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    },
    dev : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/development',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
      env  : {
        NODE_ENV: 'dev'
      }
    }
  }
    */
};
