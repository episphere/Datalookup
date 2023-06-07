console.log(`${location.href+'index.js'} \nloaded ${Date()}`);

(async function(){
    rv = await import('./export.js')
})();