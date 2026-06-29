/**
 * File extension → score mapping.
 * Negative = temporary signal. Positive = keep signal.
 */
export const EXTENSION_SCORES = {
  // Installers — strong temporary
  '.msi': -45,
  '.dmg': -45,
  '.pkg': -40,
  '.deb': -25,
  '.rpm': -25,
  '.snap': -25,
  '.flatpak': -25,

  // Executables / portable apps — weak temporary (could be app itself, not installer)
  '.exe': -15,
  '.appimage': 5,

  // Torrents / incomplete — strong temporary
  '.torrent': -50,
  '.crdownload': -50,
  '.part': -50,

  // Archives — moderate temporary (could be anything)
  '.zip': -15,
  '.rar': -15,
  '.7z': -15,
  '.tar.gz': -15,
  '.tar.bz2': -15,
  '.tar.xz': -15,
  '.gz': -10,
  '.bz2': -10,

  // Documents — weak to moderate keep
  '.pdf': 10,
  '.docx': 15,
  '.doc': 15,
  '.xlsx': 15,
  '.xls': 15,
  '.pptx': 12,
  '.ppt': 12,
  '.odt': 15,
  '.ods': 15,
  '.odp': 12,
  '.txt': 5,
  '.rtf': 10,
  '.csv': 10,

  // Images — weak keep (screenshots vs intentional saves)
  '.jpg': 5,
  '.jpeg': 5,
  '.png': 5,
  '.gif': 3,
  '.svg': 8,
  '.webp': 5,
  '.bmp': 3,
  '.ico': -5,
  '.tiff': 10,
  '.raw': 15,

  // Audio/Video — weak keep
  '.mp3': 8,
  '.wav': 8,
  '.flac': 12,
  '.mp4': 8,
  '.mkv': 10,
  '.avi': 8,
  '.mov': 10,
  '.webm': 5,

  // Code / data — neutral to weak keep
  '.json': 5,
  '.xml': 5,
  '.sql': 10,
  '.db': 10,
  '.sqlite': 10,

  // Fonts — weak keep
  '.ttf': 8,
  '.otf': 8,
  '.woff': 5,
  '.woff2': 5,

  // Disk images — strong temporary
  '.iso': -40,
  '.img': -30,

  // Keys / certs — strong keep
  '.pem': 30,
  '.key': 30,
  '.crt': 30,
  '.p12': 30,
  '.pfx': 30,
};

/**
 * Get score for a file extension
 * @param {string} ext - lowercase extension with dot
 * @returns {{ score: number, reason: string }|null}
 */
export function scoreExtension(ext) {
  if (!ext) return null;
  const score = EXTENSION_SCORES[ext];
  if (score === undefined) return null;

  let category;
  if (score <= -30) category = 'Installer/temporary file type';
  else if (score <= -10) category = 'Archive file type';
  else if (score >= 25) category = 'Security/credential file type';
  else if (score >= 10) category = 'Document file type';
  else if (score > 0) category = 'Media file type';
  else category = 'File type signal';

  return { score, reason: `${category} (${ext})` };
}
