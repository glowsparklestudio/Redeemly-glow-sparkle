import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public', 'Carousel images');

try {
  const files = fs.readdirSync(dir);
  console.log('Files:', files);
  
  files.forEach(file => {
    let newName = file;
    newName = newName.replace(/&/g, 'and');
    newName = newName.replace(/\s+/g, '_');
    newName = newName.toLowerCase();
    
    if (newName !== file) {
      fs.renameSync(path.join(dir, file), path.join(dir, newName));
      console.log(`Renamed ${file} to ${newName}`);
    }
  });
} catch (err) {
  console.error(err);
}
