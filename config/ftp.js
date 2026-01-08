const ftp = require('basic-ftp');

class FTPClient {
  constructor() {
    this.config = {
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: parseInt(process.env.FTP_PORT) || 21,
      secure: false, // Set to true for FTPS
    };
    this.baseUrl = process.env.FTP_BASE_URL;
    this.uploadDir = process.env.FTP_UPLOAD_DIR || '/uploads/';
  }

  async connect() {
    const client = new ftp.Client();
    try {
      await client.access(this.config);
      return client;
    } catch (error) {
      console.error('FTP connection error:', error);
      throw error;
    }
  }

  async uploadFile(localPath, remotePath) {
    const client = await this.connect();
    try {
      // Ensure upload directory exists
      await client.ensureDir(this.uploadDir);
      
      // Upload file
      await client.uploadFrom(localPath, remotePath);
      
      // Generate public URL
      const publicUrl = `${this.baseUrl}${remotePath}`;
      
      return {
        success: true,
        url: publicUrl,
        path: remotePath,
      };
    } catch (error) {
      console.error('FTP upload error:', error);
      throw error;
    } finally {
      client.close();
    }
  }

  async deleteFile(remotePath) {
    const client = await this.connect();
    try {
      await client.remove(remotePath);
      return { success: true };
    } catch (error) {
      console.error('FTP delete error:', error);
      throw error;
    } finally {
      client.close();
    }
  }

  getPublicUrl(remotePath) {
    return `${this.baseUrl}${remotePath}`;
  }
}

module.exports = new FTPClient();
