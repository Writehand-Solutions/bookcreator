const Block = {
    start: ()=>{
        document.querySelectorAll('.is-block').forEach(block=>{
            if(!block.hasAttribute('data--t')) {
                block.setAttribute('data--t', block.style.top);
            }
            if(!block.hasAttribute('data--l')) {
                block.setAttribute('data--l', block.style.left);
            }
            if(!block.hasAttribute('data--b')) {
                block.setAttribute('data--b', block.style.bottom);
            }
            if(!block.hasAttribute('data--r')) {
                block.setAttribute('data--r', block.style.right);
            }
            if(!block.hasAttribute('data--w')) {
                block.setAttribute('data--w', block.style.width);
            }
            if(!block.hasAttribute('data--h')) {
                block.setAttribute('data--h', block.style.height);
            }
            block.removeAttribute('data-prev'); // reset => initial call before resize()
            block.removeAttribute('data-fluid');
            block.removeAttribute('data-fluid-val');
            block.classList.remove('fluid');
            block.style.transition = '';
        });
    },
    apply: (block, breakpoint, initial) => {
        if(breakpoint) {
            if(block.getAttribute('data-prev')!==breakpoint+'') {

                if(!initial) block.style.transition = 'all 0.35s ease'; 

                if(breakpoint!==10000) {
                    // console.log('Apply: ' + breakpoint);
                    block.setAttribute('data-breakpoint', breakpoint)
                    if(block.hasAttribute('data--t-'+breakpoint)) {
                        let top = block.getAttribute('data--t-'+breakpoint);
                        block.style.top = top;
                    }
                    if(block.hasAttribute('data--l-'+breakpoint)) {
                        let left = block.getAttribute('data--l-'+breakpoint);
                        block.style.left = left;
                    }
                    if(block.hasAttribute('data--b-'+breakpoint)) {
                        let bottom = block.getAttribute('data--b-'+breakpoint);
                        block.style.bottom = bottom;
                    }
                    if(block.hasAttribute('data--r-'+breakpoint)) {
                        let right = block.getAttribute('data--r-'+breakpoint);
                        block.style.right = right;
                    }
                    if(block.hasAttribute('data--w-'+breakpoint)) {
                        let width = block.getAttribute('data--w-'+breakpoint);
                        block.style.width = width;
                    }
                    if(block.hasAttribute('data--h-'+breakpoint)) {
                        let height = block.getAttribute('data--h-'+breakpoint);
                        block.style.height = height;
                    }
                    if(block.hasAttribute('data--transform-'+breakpoint)) {
                        let transform = block.getAttribute('data--transform-'+breakpoint);
                        block.style.transform = transform; 
                        block.setAttribute('data--transform-val', breakpoint); 
                    }
                } else {
                    // console.log('Apply: Normal');
                    block.removeAttribute('data-breakpoint')
                    if(block.hasAttribute('data--t')) {
                        let top = block.getAttribute('data--t');
                        block.style.top = top;
                    }
                    if(block.hasAttribute('data--l')) {
                        let left = block.getAttribute('data--l');
                        block.style.left = left;
                    }
                    if(block.hasAttribute('data--b')) {
                        let bottom = block.getAttribute('data--b');
                        block.style.bottom = bottom;
                    }
                    if(block.hasAttribute('data--r')) {
                        let right = block.getAttribute('data--r');
                        block.style.right = right;
                    }
                    if(block.hasAttribute('data--w')) {
                        let width = block.getAttribute('data--w');
                        block.style.width = width;
                    }
                    if(block.hasAttribute('data--h')) {
                        let height = block.getAttribute('data--h');
                        block.style.height = height;
                    }
                    if(block.hasAttribute('data--transform')) {
                        let transform = block.getAttribute('data--transform');
                        block.style.transform = transform; 
                        block.setAttribute('data--transform-val', ''); 
                    }
                }
                block.setAttribute('data-prev', breakpoint);

                setTimeout(()=>{
                    if(!initial) block.style.transition = '';
                }, 400)
            }
        } 
    },
    applyFluid: (block, val) => {
        block.classList.toggle('fluid', val === 'yes');
        block.setAttribute('data-fluid', val);
    },
    resize: (initial) => {
        // document.body.removeAttribute('data-breakpoint');

        const viewportWidth = window.innerWidth;

        // box height
        document.querySelectorAll('.is-box').forEach(box=>{
            let dataBreakpoints = [];
            const attributes = box.attributes;
            for (let i = 0; i < attributes.length; i++) {
                const attributeName = attributes[i].name;
                let match = attributeName.match(/^data--h-(\d+)$/);
                if (match) {
                    const number = parseInt(match[1], 10);
                    dataBreakpoints.push(number);
                }
            }
            dataBreakpoints = [...new Set(dataBreakpoints)];
            dataBreakpoints.sort((a, b) => b - a);

            for (let i = 0; i < dataBreakpoints.length; i++) {
                const currentBreakpoint = dataBreakpoints[i];
                if (i === 0) {
                    if(viewportWidth>currentBreakpoint) {
                        let h = box.getAttribute('data--h');
                        if(h) box.style.height = h;
                        else box.style.height = '';
                    }
                } else {
                    const previousBreakpoint = dataBreakpoints[i - 1];
                    if(previousBreakpoint>=viewportWidth && viewportWidth>currentBreakpoint) {
                        let h = box.getAttribute('data--h-'+previousBreakpoint);
                        if(h) box.style.height = h;
                    }
                }
            }
            if (dataBreakpoints.length > 0) {
                const lowestValue = dataBreakpoints[dataBreakpoints.length - 1];
                if(lowestValue>=viewportWidth) {
                    const lowestValue = dataBreakpoints[dataBreakpoints.length - 1];
                    let h = box.getAttribute('data--h-'+lowestValue);
                    if(h) box.style.height = h;
                }
            }
        });
        
        document.querySelectorAll('.is-block').forEach(block=>{

            // fluid
            if(!block.classList.contains('locked')) {
                if((block.offsetWidth + 60 > viewportWidth) && !block.classList.contains('fluid')) {
                    block.setAttribute('data-fluid-val', block.offsetWidth)
                    Block.applyFluid(block, 'yes');
                } 
                let bf = block.getAttribute('data-fluid-val');
                if(bf) {
                    if ((parseInt(bf) + 60 <= viewportWidth) && block.classList.contains('fluid')){
                        Block.applyFluid(block, 'no');
                    }
                }
            }

            // For each block, get all its breakpoints
            let dataBreakpoints = [];
            const attributes = block.attributes;
            for (let i = 0; i < attributes.length; i++) {
                const attributeName = attributes[i].name;
                let match = attributeName.match(/^data--t-(\d+)$/);
                if (match) {
                    const number = parseInt(match[1], 10);
                    dataBreakpoints.push(number);
                }
                match = attributeName.match(/^data--w-(\d+)$/);
                if (match) {
                    const number = parseInt(match[1], 10);
                    dataBreakpoints.push(number);
                }
                match = attributeName.match(/^data--transform-(\d+)$/);
                if (match) {
                    const number = parseInt(match[1], 10);
                    dataBreakpoints.push(number);
                }
            }
            dataBreakpoints = [...new Set(dataBreakpoints)]; // remove duplicates
            dataBreakpoints.sort((a, b) => b - a);

            // Go through each range
            for (let i = 0; i < dataBreakpoints.length; i++) {
                const currentBreakpoint = dataBreakpoints[i];
                if (i === 0) {
                    if(viewportWidth>currentBreakpoint) {
                        // console.log(block)
                        // console.log(`range > ${currentBreakpoint}`);
                        Block.apply(block, 10000, initial);
                    }
                } else {
                    const previousBreakpoint = dataBreakpoints[i - 1];
                    if(previousBreakpoint>=viewportWidth && viewportWidth>currentBreakpoint) {
                        // console.log(block)
                        // console.log(`${previousBreakpoint} >= range > ${currentBreakpoint}`);
                        Block.apply(block, previousBreakpoint, initial);
                    }
                }
            }
            if (dataBreakpoints.length > 0) {
                const lowestValue = dataBreakpoints[dataBreakpoints.length - 1];
                if(lowestValue>=viewportWidth) {
                    // console.log(block)
                    // console.log(`${lowestValue} >= range`);
                    Block.apply(block, lowestValue, initial);
                }
            }
        });
    },
    render: ()=>{
        Block.start();
        Block.resize(true); //true=initial
    },
    renderPageCss:(selector) => {
        var container = document.querySelector(selector);
        container.classList.add('is-page');
        var box = container.querySelector('[data-pagesize]');
        var s = box.getAttribute('data-pagesize');
        var styleElm = document.querySelector('#__css_pagesize');
        if(styleElm) styleElm.remove();
        if(s) {
            var arr = s.split(',');
            w = arr[0].trim();
            h = arr[1].trim();
            if(arr.length===3) {
                // web
                css = `
                <style id="__css_pagesize">
                .is-page {
                    position: relative;
                    display: flex;
                    align-items: center;
                    flex-direction: column;
                }
                .is-page {
                    ${(w==='100%' || w==='100vw') && (h==='100%' || h==='100vh')? '' : 'margin-top: 150px;'}
                }
                .is-box {
                    width: 100%;
                    max-width: ${w};
                    height: ${h};
                    margin: 0 auto;
                }
                ${(w==='100%' || w==='100vw') && (h==='100%' || h==='100vh')? `
                @media print { 
                    .is-page {
                        margin-top: 0;
                        margin-bottom: 0;
                        gap: 0;
                    }
                    .is-box {
                        width: 1920px;
                        height: 1024px
                    } 
                }
                @page {
                    size:1920px 1024px; 
                    margin: 0; 
                }
                ` : `
                @media print { 
                    .is-page {
                        margin-top: 0;
                        margin-bottom: 0;
                        gap: 0;
                    }
                    .is-box {
                        width: ${w};
                        height: ${h};
                    } 
                    .hide-on-print {
                        display: none !important;
                    }
                }
                @page {
                    size:${w} ${h};; 
                    margin: 0; 
                }
                `}
                
                </style>
                `;
            } else {
                // print
                document.body.classList.add('print');
                
                css = `
                <style id="__css_pagesize">
                .is-page {
                    margin-top:150px;
                    gap: 45px;

                    position: relative;
                    display: flex;
                    align-items: center;
                    flex-direction: column;
                }
                .is-box {
                    width: ${w};
                    height: ${h};
                }
                @media print { 
                    .is-page {
                        margin-top: 0;
                        margin-bottom: 0;
                        gap: 0;
                    }
                    .is-box {
                        width: ${w}; 
                        height: ${h};
                    } 
                    .hide-on-print {
                        display: none !important;
                    }
                }
                @page {
                    size:${w} ${h};
                    margin: 0; 
                }
                </style>
                `;
            }
            document.head.insertAdjacentHTML('beforeend', css)

            container.style.opacity = '';
        } 
    }
}
window.Block = Block;

// const resize = () => {
//     Block.resize();
// }
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};
const resize = debounce(() => {
    Block.resize();
}, 0);


window.addEventListener('resize', resize);
Block.render();