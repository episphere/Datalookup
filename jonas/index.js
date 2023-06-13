console.log(`${location.href+'index.js'} \nloaded ${Date()}`);

(async function(){
    rv = await import('./export.js')
    rv.UI() // open UI in a blank div added to the document body
    
})();