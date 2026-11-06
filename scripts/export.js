import {cpSync,mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const names={notes:'codenova-notes',expenses:'codenova-expense-tracker',events:'codenova-event-registration',showcase:'codenova-project-showcase'};
const files=['apps','client','server','scripts','tests','docs','.vscode','.gitignore','.env.example','package.json','package-lock.json','index.html','vite.config.js'];
for(const [module,name] of Object.entries(names)){
 const dest=join(root,'exports',name);mkdirSync(dest,{recursive:true});
 for(const file of files)if(existsSync(join(root,file)))cpSync(join(root,file),join(dest,file),{recursive:true});
 writeFileSync(join(dest,'app-config.json'),JSON.stringify({module},null,2)+'\n');
 writeFileSync(join(dest,'.env.example'),readFileSync(join(root,'.env.example'),'utf8').replace('APP_MODULE=all',`APP_MODULE=${module}`));
 writeFileSync(join(dest,'README.md'),readFileSync(join(root,'apps',module,'README.md'),'utf8')+'\n\n---\n\n# Shared runtime setup reference\n\n'+readFileSync(join(root,'README.md'),'utf8'));
 console.log(`Exported ${name}`);
}
