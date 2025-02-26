const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add Monaco Editor webpack plugin
      webpackConfig.plugins.push(new MonacoWebpackPlugin({
        languages: [
          'javascript',
          'typescript',
          'html',
          'css',
          'json',
          'xml',
          'yaml',
          'markdown',
          'python',
          'java',
          'cpp',
          'csharp',
          'go',
          'rust',
          'sql',
          'shell',
          'ini'
        ]
      }));

      return webpackConfig;
    }
  },
  devServer: {
    // Use modern setupMiddlewares instead of deprecated options
    setupMiddlewares: (middlewares, devServer) => {
      // Insert your custom middleware logic here
      return middlewares;
    }
  }
}; 