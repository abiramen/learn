module.exports = {
  apps: [{
    name: "learn",
    script: "./bin/www",
    watch: ["classes.json", "public"],
    // Delay between restart
    watch_delay: 1000,
    ignore_watch : ["node_modules", "feedback"],
    watch_options: {
      "followSymlinks": false
    }
  }]
}
