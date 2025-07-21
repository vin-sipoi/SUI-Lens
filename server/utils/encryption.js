const crypto = require('crypto');

const encrypt = (text, masterPassword) => {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(masterPassword, salt, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { content: encrypted.toString('hex'), iv: iv.toString('hex'), tag: tag.toString('hex'), salt: salt.toString('hex') };
};

const decrypt = (encryptedData, masterPassword) => {
  const { content, iv, tag, salt } = encryptedData;
  const key = crypto.scryptSync(masterPassword, Buffer.from(salt, 'hex'), 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  return decipher.update(content, 'hex', 'utf8') + decipher.final('utf8');
};

module.exports = { encrypt, decrypt };
