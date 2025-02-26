const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const os = require('os');
const http = require('http');
const https = require('https');
const logger = require('./logger');

// Constants
const STEAMCMD_DIR = path.join(__dirname, '../../data/steamcmd');
const SERVERS_DIR = path.join(__dirname, '../../data/servers');

const steamCmdManager = {
  // Check if SteamCMD is installed
  checkSteamCmdInstallation: async () => {
    try {
      const platform = os.platform();
      const steamCmdPath = path.join(STEAMCMD_DIR, platform === 'win32' ? 'steamcmd.exe' : 'steamcmd.sh');
      return fs.existsSync(steamCmdPath);
    } catch (err) {
      logger.error('Error checking SteamCMD installation:', err);
      throw err;
    }
  },

  // Install SteamCMD
  installSteamCmd: async () => {
    try {
      await fs.ensureDir(STEAMCMD_DIR);
      const platform = os.platform();
      const steamCmdPath = path.join(STEAMCMD_DIR, platform === 'win32' ? 'steamcmd.exe' : 'steamcmd.sh');
      
      logger.info(`Installing SteamCMD for ${platform}...`);
      
      if (platform === 'win32') {
        // Windows installation
        const downloadUrl = 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip';
        const zipPath = path.join(STEAMCMD_DIR, 'steamcmd.zip');
        
        // Download steamcmd.zip
        await new Promise((resolve, reject) => {
          const file = fs.createWriteStream(zipPath);
          
          const request = downloadUrl.startsWith('https') 
            ? https.get(downloadUrl, response => {
                response.pipe(file);
                file.on('finish', () => {
                  file.close();
                  resolve();
                });
              })
            : http.get(downloadUrl, response => {
                response.pipe(file);
                file.on('finish', () => {
                  file.close();
                  resolve();
                });
              });
          
          request.on('error', err => {
            fs.unlink(zipPath, () => {}); // Delete the file async
            reject(err);
          });
          
          file.on('error', err => {
            fs.unlink(zipPath, () => {}); // Delete the file async
            reject(err);
          });
        });
        
        // Extract the zip file
        // For simplicity, we'll use a child process to extract it
        await new Promise((resolve, reject) => {
          const process = spawn('powershell', ['-Command', `Expand-Archive -Path "${zipPath}" -DestinationPath "${STEAMCMD_DIR}" -Force`]);
          
          process.on('close', code => {
            if (code === 0) {
              fs.unlink(zipPath, () => {}); // Clean up the zip file
              resolve();
            } else {
              reject(new Error(`Failed to extract SteamCMD with exit code ${code}`));
            }
          });
          
          process.on('error', reject);
        });
      } else {
        // Linux/Mac installation
        await new Promise((resolve, reject) => {
          // Download and extract in one step using curl and tar
          const process = spawn('bash', [
            '-c',
            `curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf - -C "${STEAMCMD_DIR}"`
          ]);
          
          process.on('close', code => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Failed to install SteamCMD with exit code ${code}`));
            }
          });
          
          process.on('error', reject);
        });
        
        // Make the script executable
        await fs.chmod(steamCmdPath, 0o755);
      }
      
      // Verify installation
      const installed = await fs.pathExists(steamCmdPath);
      if (!installed) {
        throw new Error('SteamCMD installation failed');
      }
      
      logger.info('SteamCMD installed successfully');
      return true;
    } catch (err) {
      logger.error('Error installing SteamCMD:', err);
      throw err;
    }
  },

  // Install/update a server
  installServer: async (serverId, appId) => {
    try {
      const serverPath = path.join(SERVERS_DIR, serverId);
      
      // Ensure server directory exists
      await fs.ensureDir(serverPath);
      
      // Ensure SteamCMD is installed
      const steamCmdInstalled = await steamCmdManager.checkSteamCmdInstallation();
      if (!steamCmdInstalled) {
        await steamCmdManager.installSteamCmd();
      }
      
      const platform = os.platform();
      const steamCmdPath = path.join(STEAMCMD_DIR, platform === 'win32' ? 'steamcmd.exe' : 'steamcmd.sh');
      
      // Prepare SteamCMD arguments
      const args = [
        '+login anonymous',
        `+force_install_dir "${serverPath}"`,
        `+app_update ${appId} validate`,
        '+quit'
      ];
      
      const io = global.io;
      let progress = 0;
      
      // Emit initial progress
      if (io) {
        io.emit('server-install-progress', {
          serverId,
          progress,
          task: 'Starting installation...'
        });
      }
      
      // Run SteamCMD
      return new Promise((resolve, reject) => {
        const steamCmd = spawn(steamCmdPath, args, {
          shell: true
        });
        
        let output = '';
        
        steamCmd.stdout.on('data', (data) => {
          const text = data.toString();
          output += text;
          
          // Update progress based on output
          if (text.includes('Update state')) {
            progress = Math.min(90, progress + 5);
          } else if (text.includes('Success!')) {
            progress = 100;
          } else if (text.includes('downloading')) {
            progress = Math.min(80, progress + 1);
          }
          
          // Extract current task from output
          let task = 'Downloading server files...';
          if (text.includes('Validating installation')) {
            task = 'Validating installation...';
          } else if (text.includes('Success!')) {
            task = 'Installation completed successfully';
          }
          
          // Emit progress update
          if (io) {
            io.emit('server-install-progress', {
              serverId,
              progress,
              task
            });
          }
          
          logger.info(`[SteamCMD][${serverId}] ${text.trim()}`);
        });
        
        steamCmd.stderr.on('data', (data) => {
          const text = data.toString();
          output += text;
          logger.error(`[SteamCMD][${serverId}] ${text.trim()}`);
        });
        
        steamCmd.on('close', (code) => {
          if (code === 0) {
            logger.info(`Server installation/update completed for ${serverId}`);
            
            // Final progress update
            if (io) {
              io.emit('server-install-progress', {
                serverId,
                progress: 100,
                task: 'Installation completed successfully'
              });
            }
            
            resolve({ success: true, output });
          } else {
            const error = new Error(`SteamCMD exited with code ${code}`);
            logger.error(error.message);
            
            // Emit failure
            if (io) {
              io.emit('server-install-progress', {
                serverId,
                progress: progress,
                task: `Installation failed with code ${code}`,
                error: true
              });
            }
            
            reject({ success: false, error: error.message, output });
          }
        });
        
        steamCmd.on('error', (err) => {
          logger.error('Failed to start SteamCMD:', err);
          
          // Emit error
          if (io) {
            io.emit('server-install-progress', {
              serverId,
              progress: 0,
              task: `Failed to start SteamCMD: ${err.message}`,
              error: true
            });
          }
          
          reject({ success: false, error: err.message, output });
        });
      });
    } catch (err) {
      logger.error('Error installing server:', err);
      throw err;
    }
  }
};

module.exports = steamCmdManager;